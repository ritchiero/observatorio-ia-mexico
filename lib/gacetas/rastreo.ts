// Orquestador del rastreo determinista de gacetas.
//
// Recorre una ventana de días hacia atrás y consulta, por cada día, el Anexo VII
// de Diputados y la sesión del Senado. Los días sin sesión devuelven 404 (Diputados)
// o una página sin asuntos (Senado): se cuentan como "consultados" y se siguen.
// Todo el I/O entra por `fetchTexto`, así el orquestador se prueba sin red.

import { parseAnexoVII, urlAnexoVII, urlIndiceDia, urlAnexoIIDesdeIndice, partesAnexoII, parseParteAnexoII, iso, type HallazgoGaceta } from './diputados.ts';
import { esMuroAntiBots, rastrearSesionSenado, urlSesionSenado } from './senado.ts';
import { parseTextoPdfAnexoII } from './pdf.ts';
import { claveTitulo } from './keywords.ts';

export interface EstadisticasFuente {
  diasConsultados: number;
  sesionesConDatos: number;
  asuntosLeidos: number;
  partesLeidas?: number;      // Diputados: partes HTML del Anexo II leídas
  partesPdfOmitidas?: number;   // PDF no leídos: pesados (probable escaneo) o sin lector configurado
  partesPdfLeidas?: number;     // PDF con capa de texto leídos
  partesPdfSinTexto?: number;   // PDF descargados que resultaron escaneos sin texto
  pdfSinSeparar?: number;       // PDF con varios asuntos que no se pudieron separar (sólo se evaluó el título) // Diputados: partes en PDF que no se leen
  candidatos?: number;
  cuerposDescargados?: number;
  cuerposBloqueados?: number;  // Senado: documentos que devolvieron el muro anti-bots
  sinEvaluar?: number;         // Senado: candidatos cuyo cuerpo no se pudo abrir (sólo se evaluó el título)
  sesionesBloqueadas?: number; // Senado: días en que la propia gaceta devolvió el muro
  fallosLectura?: number;      // páginas que no se pudieron leer tras reintentar (timeout o red); cada una queda en `errores`
  diasSinRevisar?: number;     // días que no se alcanzaron a revisar por el presupuesto de tiempo
  relevantes: number;
  errores: string[];
}

export interface ResultadoRastreo {
  tiempoAgotado: boolean;      // se alcanzó deadlineMs antes de terminar la ventana
  ventana: { desde: string; hasta: string; dias: number };
  diputados: EstadisticasFuente;
  senado: EstadisticasFuente;
  hallazgos: HallazgoGaceta[];
}

export type FetchTexto = (url: string) => Promise<{ status: number; texto: string } | null>;
/** Descarga binaria con tope: si el servidor anuncia más de maxBytes, devuelve bytes=null y el tamaño. */
export type FetchBinario = (url: string, maxBytes: number) => Promise<{ status: number; bytes: Uint8Array | null; tamano: number } | null>;
export interface OpcionesRastreo {
  fetchBinario?: FetchBinario;
  extraerTextoPdf?: (bytes: Uint8Array) => Promise<{ texto: string; paginas: number }>;
  maxPdfBytes?: number;   // default 2.5 MB: los PDF con texto pesan 0.3–1.6 MB; los escaneos 10–28 MB
  deadlineMs?: number;    // instante (epoch ms) a partir del cual no se empieza trabajo nuevo; lo que falte se reporta
  reintentos?: number;    // reintentos por página cuando la red/timeout falla (default 1)
  concurrenciaPartes?: number; // partes del Anexo II en paralelo (default 3): el servidor de la Gaceta llega a tardar >60 s por parte
}

function nuevaStat(): EstadisticasFuente {
  return { diasConsultados: 0, sesionesConDatos: 0, asuntosLeidos: 0, partesLeidas: 0, partesPdfOmitidas: 0, partesPdfLeidas: 0, partesPdfSinTexto: 0, pdfSinSeparar: 0, candidatos: 0, cuerposDescargados: 0, cuerposBloqueados: 0, sinEvaluar: 0, sesionesBloqueadas: 0, fallosLectura: 0, diasSinRevisar: 0, relevantes: 0, errores: [] };
}

export function fechasVentana(hoy: Date, dias: number): Date[] {
  const out: Date[] = [];
  for (let i = 0; i < dias; i++) {
    const d = new Date(Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate() - i));
    out.push(d);
  }
  return out;
}

export async function rastrearGacetas(fetchTexto: FetchTexto, hoy = new Date(), dias = 14, maxCuerposPorSesion = 120, op: OpcionesRastreo = {}): Promise<ResultadoRastreo> {
  const maxPdf = op.maxPdfBytes ?? 2_500_000;
  const fechas = fechasVentana(hoy, dias);
  const diputados = nuevaStat();
  const senado = nuevaStat();
  const hallazgos: HallazgoGaceta[] = [];
  const vistos = new Set<string>();

  const agregar = (h: HallazgoGaceta) => {
    const k = `${h.camara}|${claveTitulo(h.titulo)}`;
    if (vistos.has(k)) return;
    vistos.add(k);
    hallazgos.push(h);
  };

  const deadline = op.deadlineMs ?? Number.POSITIVE_INFINITY;
  const reintentos = op.reintentos ?? 1;
  const concurrencia = Math.max(1, op.concurrenciaPartes ?? 3);
  let tiempoAgotado = false;
  const sinTiempo = () => Date.now() > deadline;

  // Lectura con reintento; el fallo definitivo se CUENTA y se nombra (antes se
  // descartaba en silencio: así se perdió la sesión del 8-sep-2026 con la Gaceta lenta).
  const leer = async (stat: EstadisticasFuente, f: string, url: string) => {
    for (let intento = 0; intento <= reintentos; intento++) {
      const r = await fetchTexto(url);
      if (r) return r;
      if (sinTiempo()) break;
    }
    stat.fallosLectura = (stat.fallosLectura ?? 0) + 1;
    stat.errores.push(`${f}: no se pudo leer ${url} (tiempo agotado o error de red, ${reintentos + 1} intentos)`);
    return null;
  };

  for (let i = 0; i < fechas.length; i++) {
    const fecha = fechas[i];
    const f = iso(fecha);
    if (sinTiempo()) {
      tiempoAgotado = true;
      diputados.diasSinRevisar = (diputados.diasSinRevisar ?? 0) + (fechas.length - i);
      senado.diasSinRevisar = (senado.diasSinRevisar ?? 0) + (fechas.length - i);
      break;
    }

    // Diputados — Anexo VII (turnadas) + Anexo II (registradas, con o sin turno)
    diputados.diasConsultados++;
    try {
      let huboSesion = false;
      const url7 = urlAnexoVII(fecha);
      const r7 = await leer(diputados, f, url7);
      if (r7 && r7.status === 200 && r7.texto.length > 1500) {
        const { entradas, hallazgos: hs } = parseAnexoVII(r7.texto, f, url7);
        if (entradas > 0) huboSesion = true;
        diputados.asuntosLeidos += entradas;
        diputados.relevantes += hs.length;
        hs.forEach(agregar);   // primero: traen turno
      }
      const rIdx = await leer(diputados, f, urlIndiceDia(fecha));
      const urlII = rIdx && rIdx.status === 200 ? urlAnexoIIDesdeIndice(rIdx.texto) : null;
      if (urlII) {
        const rII = await leer(diputados, f, urlII);
        if (rII && rII.status === 200) {
          const partes = partesAnexoII(rII.texto);
          for (const up of partes.pdf) {
            if (sinTiempo()) { tiempoAgotado = true; diputados.errores.push(`${f}: sin tiempo para ${up}`); continue; }
            if (!op.fetchBinario || !op.extraerTextoPdf) { diputados.partesPdfOmitidas = (diputados.partesPdfOmitidas ?? 0) + 1; continue; }
            const rb = await op.fetchBinario(up, maxPdf);
            if (!rb) { diputados.fallosLectura = (diputados.fallosLectura ?? 0) + 1; diputados.errores.push(`${f}: no se pudo leer ${up} (tiempo agotado o error de red)`); continue; }
            if (rb.status !== 200 || !rb.bytes) { diputados.partesPdfOmitidas = (diputados.partesPdfOmitidas ?? 0) + 1; continue; }
            const { texto, paginas } = await op.extraerTextoPdf(rb.bytes);
            const res = parseTextoPdfAnexoII(texto, paginas, f, up);
            if (res.sinCapaTexto) { diputados.partesPdfSinTexto = (diputados.partesPdfSinTexto ?? 0) + 1; continue; }
            diputados.partesPdfLeidas = (diputados.partesPdfLeidas ?? 0) + 1;
            if (res.separacion === 'ninguna' && res.bloques > 1) diputados.pdfSinSeparar = (diputados.pdfSinSeparar ?? 0) + 1;
            if (res.bloques > 0) huboSesion = true;
            diputados.asuntosLeidos += res.bloques;
            diputados.relevantes += res.hallazgos.length;
            res.hallazgos.forEach(agregar);
          }
          // Partes HTML en lotes concurrentes: el servidor de la Gaceta llega a tardar más de un minuto por parte.
          for (let j = 0; j < partes.html.length; j += concurrencia) {
            if (sinTiempo()) { tiempoAgotado = true; diputados.errores.push(`${f}: sin tiempo para ${partes.html.length - j} parte(s) del Anexo II`); break; }
            const lote = partes.html.slice(j, j + concurrencia);
            const leidas = await Promise.all(lote.map(async (up) => ({ up, rp: await leer(diputados, f, up) })));
            for (const { up, rp } of leidas) {
              if (!rp || rp.status !== 200) continue;
              const { bloques, hallazgos: hs } = parseParteAnexoII(rp.texto, f, up);
              diputados.partesLeidas = (diputados.partesLeidas ?? 0) + 1;
              if (bloques > 0) huboSesion = true;
              diputados.asuntosLeidos += bloques;
              diputados.relevantes += hs.length;
              hs.forEach(agregar);   // se deduplican contra las del Anexo VII por título
            }
          }
        }
      }
      if (huboSesion) diputados.sesionesConDatos++;
    } catch (e) {
      diputados.errores.push(`${f}: ${e instanceof Error ? e.message : String(e)}`);
    }

    // Senado — sesión del día
    senado.diasConsultados++;
    try {
      const url = urlSesionSenado(fecha);
      const r = await leer(senado, f, url);
      if (r && r.status === 200 && esMuroAntiBots(r.texto)) {
        senado.sesionesBloqueadas = (senado.sesionesBloqueadas ?? 0) + 1;
        senado.errores.push(`${f}: la gaceta del Senado devolvió el muro anti-bots (Incapsula); sesión no evaluada`);
      } else if (r && r.status === 200) {
        const res = await rastrearSesionSenado(r.texto, f, 'senado', {
          maxDescargas: maxCuerposPorSesion,
          fetchTexto: async (u) => { if (sinTiempo()) return null; const x = await fetchTexto(u); return x && x.status === 200 ? x.texto : null; },
        });
        if (res.asuntos > 0) senado.sesionesConDatos++;
        senado.asuntosLeidos += res.asuntos;
        senado.candidatos = (senado.candidatos ?? 0) + res.candidatos;
        senado.cuerposDescargados = (senado.cuerposDescargados ?? 0) + res.descargados;
        senado.cuerposBloqueados = (senado.cuerposBloqueados ?? 0) + res.bloqueados;
        senado.sinEvaluar = (senado.sinEvaluar ?? 0) + res.sinEvaluar;
        senado.relevantes += res.hallazgos.length;
        res.hallazgos.forEach(agregar);
      }
    } catch (e) {
      senado.errores.push(`${f}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return {
    tiempoAgotado,
    ventana: { desde: iso(fechas[fechas.length - 1]), hasta: iso(fechas[0]), dias },
    diputados,
    senado,
    hallazgos,
  };
}

/** Resumen legible para la bitácora pública: dice qué se leyó, no sólo qué se halló. */
export function resumenRastreo(r: ResultadoRastreo, nuevas: number, yaRegistradas: number): string {
  const d = r.diputados, s = r.senado;
  return (
    `Gacetas revisadas del ${r.ventana.desde} al ${r.ventana.hasta}: ` +
    `Diputados ${d.sesionesConDatos} sesión(es), ${d.asuntosLeidos} asuntos leídos (Anexo II: ${d.partesLeidas ?? 0} partes en HTML${(d.partesPdfLeidas ?? 0) ? ` y ${d.partesPdfLeidas} en PDF` : ''}${(d.partesPdfOmitidas ?? 0) ? `; ${d.partesPdfOmitidas} PDF pesados sin leer, probablemente escaneos` : ''}${(d.partesPdfSinTexto ?? 0) ? `; ${d.partesPdfSinTexto} PDF escaneados sin texto` : ''}${(d.pdfSinSeparar ?? 0) ? `; ${d.pdfSinSeparar} PDF con varios asuntos sin separar, sólo título evaluado` : ''}), ${d.relevantes} de IA; ` +
    `Senado ${s.sesionesConDatos} sesión(es), ${s.asuntosLeidos} asuntos leídos, ${s.cuerposDescargados ?? 0} documentos abiertos${(s.sinEvaluar ?? 0) ? ` (${s.sinEvaluar} candidatos sin abrir por la protección anti-bots del Senado; de ésos sólo se evaluó el título)` : ''}${(s.sesionesBloqueadas ?? 0) ? `; ${s.sesionesBloqueadas} día(s) en que la gaceta misma quedó bloqueada` : ''}, ${s.relevantes} de IA. ` +
    `Nuevas en el corpus: ${nuevas}; ya registradas: ${yaRegistradas}.` +
    ((d.fallosLectura ?? 0) + (s.fallosLectura ?? 0) ? ` ${(d.fallosLectura ?? 0) + (s.fallosLectura ?? 0)} página(s) no se pudieron leer por tiempo agotado o error de red (se reintentarán en la siguiente corrida).` : '') +
    (r.tiempoAgotado ? ` Presupuesto de tiempo agotado: ${d.diasSinRevisar ?? 0} día(s) de la ventana sin revisar.` : '')
  );
}
