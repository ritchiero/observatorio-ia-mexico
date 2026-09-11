import { NextResponse } from 'next/server';
import { Timestamp } from 'firebase-admin/firestore';
import { getAdminDb } from '@/lib/firebase-admin';
import { requireCron } from '@/lib/auth';
import { extractText, getDocumentProxy } from 'unpdf';
import { rastrearGacetas, resumenRastreo, type FetchTexto, type FetchBinario } from '@/lib/gacetas/rastreo';
import { claveTitulo, tematicasDe, tipoDe, partidoDe } from '@/lib/gacetas/keywords';
import type { HallazgoGaceta } from '@/lib/gacetas/diputados';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

// Agente de legislación — versión DETERMINISTA (8-sep-2026).
//
// Antes dependía por completo de una búsqueda web con Claude: cuando la API se
// quedó sin crédito (4-sep-2026) el agente murió, y antes de eso su stub de
// scraping devolvía []. Ahora la detección lee las gacetas oficiales de
// Diputados (Anexo VII + Anexo II en HTML y PDF con texto) y del Senado (sesión +
// documento) sin ningún modelo.
// Claude no participa en la detección; si algún día se quiere enriquecer
// descripciones, se hace aparte y su fallo no puede tumbar el cron.

const VENTANA_DIAS = Number(process.env.GACETAS_VENTANA_DIAS || 14);
// 8-sep-2026: el servidor de la Gaceta tardó 72 s en servir una parte de 555 KB; con
// 15 s la sesión del día se perdía en silencio. 45 s por página + reintento, y un
// presupuesto global que deja margen a las escrituras antes del maxDuration (300 s).
const TIMEOUT_MS = Number(process.env.GACETAS_TIMEOUT_MS || 45_000);
const TIMEOUT_PDF_MS = Number(process.env.GACETAS_TIMEOUT_PDF_MS || 90_000);
const PRESUPUESTO_MS = Number(process.env.GACETAS_PRESUPUESTO_MS || 230_000);

const fetchTexto: FetchTexto = async (url) => {
  try {
    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ObservatorioIAMexico/1.0; +https://www.observatorio-ia-mexico.com)' },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: 'no-store',
    });
    const buf = await r.arrayBuffer();
    // La Gaceta de Diputados viene en ISO-8859-1; el Senado en UTF-8.
    const ct = r.headers.get('content-type') || '';
    const enc = /iso-8859-1|latin1|windows-1252/i.test(ct) || url.includes('gaceta.diputados.gob.mx') ? 'iso-8859-1' : 'utf-8';
    return { status: r.status, texto: new TextDecoder(enc).decode(buf) };
  } catch {
    return null;
  }
};

// Partes del Anexo II en PDF: el tope sólo evita una descarga patológica.
// 11-sep-2026: con 2.5 MB se descartaban las partes de 10–28 MB, y ahí vivían
// iniciativas de IA reales cuyo TÍTULO sí es legible en la portada. Medido: bajar
// 27.7 MB tarda ~2 s y extraer su texto ~0.2 s, así que el tope sube a 40 MB.
const MAX_PDF_BYTES = Number(process.env.GACETAS_MAX_PDF_BYTES || 40_000_000);
const UA = 'Mozilla/5.0 (compatible; ObservatorioIAMexico/1.0; +https://www.observatorio-ia-mexico.com)';

const fetchBinario: FetchBinario = async (url, maxBytes) => {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(TIMEOUT_PDF_MS), cache: 'no-store' });
    const anunciado = Number(r.headers.get('content-length') || 0);
    if (anunciado > maxBytes) {
      await r.body?.cancel();
      return { status: r.status, bytes: null, tamano: anunciado };
    }
    const bytes = new Uint8Array(await r.arrayBuffer());
    if (bytes.byteLength > maxBytes) return { status: r.status, bytes: null, tamano: bytes.byteLength };
    return { status: r.status, bytes, tamano: bytes.byteLength };
  } catch {
    return null;
  }
};

async function extraerTextoPdf(bytes: Uint8Array): Promise<{ texto: string; paginas: number }> {
  const pdf = await getDocumentProxy(bytes);
  const { totalPages, text } = await extractText(pdf, { mergePages: true });
  return { texto: text, paginas: totalPages };
}

// Fecha a MEDIODÍA UTC: cualquier lector entre UTC-11 y UTC+11 ve el mismo día
// calendario (el bug de "un día antes" venía de guardar medianoche UTC).
function fechaMediodia(isoDia: string): Timestamp {
  return Timestamp.fromDate(new Date(`${isoDia}T12:00:00.000Z`));
}

function docDe(h: HallazgoGaceta, numero: number) {
  const fuenteMedio = h.fuente === 'diputados' ? 'Gaceta Parlamentaria · Cámara de Diputados' : 'Gaceta del Senado';
  const notaCuerpo = h.cuerpoNoDisponible
    ? 'La Gaceta publicó esta parte del Anexo II con el articulado escaneado; sólo se pudo leer el título del índice oficial. Falta cotejar el texto.'
    : '';
  const eventos: Array<Record<string, unknown>> = [
    { fecha: fechaMediodia(h.fecha), tipo: 'presentacion', descripcion: `Presentada por ${h.proponente || 'legislador(a)'}${h.grupo ? ` (${h.grupo})` : ''}.` },
  ];
  if (h.turno) eventos.push({ fecha: fechaMediodia(h.fecha), tipo: 'turnado_comision', descripcion: `Turno: ${h.turno}` });
  return {
    numero,
    titulo: h.titulo,
    proponente: h.proponente,
    partido: partidoDe(h.grupo),
    fecha: fechaMediodia(h.fecha),
    legislatura: 'LXVI',
    camara: h.camara,
    entidadFederativa: 'Federal',
    // La descripción deja ver POR QUÉ entró: si la IA no está en el título, primero el fragmento donde aparece.
    descripcion: (h.relevancia === 'cuerpo' && h.evidencia ? `${h.evidencia}\n\n` : '') + h.textoCompleto.slice(0, 1200) + (notaCuerpo ? `\n\n${notaCuerpo}` : ''),
    status: h.turno ? 'turnada' : 'en_comisiones',
    estatus: h.turno ? 'turnada' : 'en_comisiones',
    tipo: tipoDe(h.titulo),
    tematicas: tematicasDe(`${h.titulo} ${h.textoCompleto}`),
    urlGaceta: h.url,
    fuentes: [{ tipo: 'gaceta_oficial', url: h.url, titulo: `${fuenteMedio} · ${h.fecha}`, medio: fuenteMedio }],
    eventos,
    origen: 'gaceta',
    deteccion: {
      metodo: 'gacetas-determinista',
      relevancia: h.relevancia ?? 'titulo',      // 'titulo' | 'cuerpo' (≥3 menciones en el texto completo)
      menciones: h.menciones ?? null,
      evidencia: h.evidencia ?? '',
      anexo: /-VII\.html/.test(h.url) ? 'VII' : /-II/.test(h.url) ? 'II' : null,
      cuerpoNoDisponible: h.cuerpoNoDisponible ?? false,
    },
    estadoVerificacion: 'pendiente',
    nivelRevision: 'automatizado',
    creadoManualmente: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}

export async function GET(request: Request) {
  const authError = requireCron(request);
  if (authError) return authError;

  const startTime = Date.now();
  const errores: string[] = [];
  let iniciativasEncontradas = 0;
  let yaRegistradas = 0;

  try {
    const db = getAdminDb();

    // 1) Corpus actual para deduplicar por título normalizado y por URL.
    const snap = await db.collection('iniciativas').get();
    const claves = new Set<string>();
    const urls = new Set<string>();
    let maxNumero = 0;
    /** Fichas creadas por ESTE agente que siguen sin revisión humana: candidatas a autocorrección. */
    const propiasPendientes: Array<{ id: string; titulo: string; clave: string; urlGaceta: string }> = [];
    for (const d of snap.docs) {
      const x = d.data();
      if (x.titulo) claves.add(claveTitulo(String(x.titulo)));
      if (x.urlGaceta) urls.add(String(x.urlGaceta).split('#')[0]);
      if (typeof x.numero === 'number' && x.numero > maxNumero) maxNumero = x.numero;
      const det = x.deteccion as { metodo?: string } | undefined;
      if (
        det?.metodo === 'gacetas-determinista' &&
        x.oculto !== true &&
        x.estadoVerificacion === 'pendiente' &&
        x.creadoManualmente !== true &&
        typeof x.titulo === 'string' &&
        typeof x.urlGaceta === 'string'
      ) {
        propiasPendientes.push({ id: d.id, titulo: x.titulo, clave: claveTitulo(x.titulo), urlGaceta: x.urlGaceta });
      }
    }

    // 2) Rastreo determinista de las gacetas.
    const r = await rastrearGacetas(fetchTexto, new Date(), VENTANA_DIAS, 120, {
      fetchBinario, extraerTextoPdf, maxPdfBytes: MAX_PDF_BYTES,
      deadlineMs: startTime + PRESUPUESTO_MS, reintentos: 1, concurrenciaPartes: 3,
    });
    errores.push(...r.diputados.errores.map((e) => `diputados: ${e}`), ...r.senado.errores.map((e) => `senado: ${e}`));
    // Los límites conocidos de la fuente (muro del Senado, articulado escaneado) se
    // informan, pero NO son fallos: si entraran en `errores`, el orquestador marcaría
    // el agente como roto en cada corrida y un fallo real pasaría inadvertido.
    const limitaciones = [
      ...r.diputados.limitaciones.map((e) => `diputados: ${e}`),
      ...r.senado.limitaciones.map((e) => `senado: ${e}`),
    ];

    // 3) Alta de lo nuevo (provisional: pendiente de auditoría humana).
    const altas: Array<{ id: string; titulo: string }> = [];
    for (const h of r.hallazgos) {
      const clave = claveTitulo(h.titulo);
      // La URL sólo identifica UN asunto en el Senado (documento/NNN). En Diputados la
      // URL es la página del día o la parte del Anexo II, compartida por decenas de
      // asuntos: deduplicar por ella descartaría iniciativas distintas del mismo día.
      const urlUnica = /senado\.gob\.mx\/.*\/documento\//.test(h.url);
      if (claves.has(clave) || (urlUnica && urls.has(h.url.split('#')[0]))) { yaRegistradas++; continue; }
      try {
        const ref = db.collection('iniciativas').doc();
        const numero = ++maxNumero;
        await ref.set({ id: ref.id, ...docDe(h, numero) });
        await db.collection('actividad').add({
          fecha: Timestamp.now(),
          tipo: 'nueva_iniciativa',
          iniciativaId: ref.id,
          iniciativaTitulo: h.titulo,
          descripcion: `Nueva iniciativa detectada en la ${h.fuente === 'diputados' ? 'Gaceta de Diputados' : 'Gaceta del Senado'} (${h.fecha}): ${h.titulo.slice(0, 140)}`,
        });
        claves.add(clave);
        altas.push({ id: ref.id, titulo: h.titulo });
        iniciativasEncontradas++;
      } catch (e) {
        errores.push(`alta "${h.titulo.slice(0, 60)}": ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // 3 bis) Autocorrección: una ficha que este agente creó y que nadie ha revisado
    // deja de sostenerse si, al releer HOY el mismo documento de la Gaceta, el asunto
    // ya no califica como de IA. Sólo se actúa sobre documentos leídos con éxito en
    // esta corrida (`urlsLeidas`): que una parte falle al descargarse no prueba nada.
    // No se borra: se oculta con su nota, igual que en la fusión de duplicados.
    const leidas = new Set(r.urlsLeidas.map((u) => u.split('#')[0]));
    const vigentes = new Set(r.clavesRelevantes);
    const retiradas: Array<{ id: string; titulo: string }> = [];
    for (const f of propiasPendientes) {
      if (!leidas.has(f.urlGaceta.split('#')[0])) continue;   // el documento no se releyó
      if (vigentes.has(f.clave)) continue;                    // sigue calificando
      try {
        await db.collection('iniciativas').doc(f.id).update({
          oculto: true,
          notaCorreccion:
            'Retirada automáticamente el ' + new Date().toISOString().slice(0, 10) +
            ': al releer la misma gaceta con el criterio vigente, la inteligencia artificial resultó ser una mención incidental y no el tema del asunto. Fuente: ' + f.urlGaceta,
          updatedAt: Timestamp.now(),
        });
        await db.collection('actividad').add({
          fecha: Timestamp.now(),
          tipo: 'correccion',
          iniciativaId: f.id,
          iniciativaTitulo: f.titulo,
          descripcion: `Ficha retirada tras releer la gaceta: la inteligencia artificial sólo se menciona de paso. ${f.titulo.slice(0, 120)}`,
        });
        retiradas.push({ id: f.id, titulo: f.titulo });
      } catch (e) {
        errores.push(`autocorrección "${f.titulo.slice(0, 50)}": ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // 4) Evidencia: interna y pública, con el resultado SEMÁNTICO (qué se leyó).
    const duracionMs = Date.now() - startTime;
    const resumen = resumenRastreo(r, iniciativasEncontradas, yaRegistradas);
    await db.collection('agenteLogs').add({
      tipo: 'legislacion',
      fecha: Timestamp.now(),
      duracionMs,
      iniciativasEncontradas,
      yaRegistradas,
      ventana: r.ventana,
      diputados: r.diputados,
      senado: r.senado,
      altas,
      retiradas,
      errores,
      limitaciones,
      trigger: 'cron' as const,
      metodo: 'gacetas-determinista',
    });
    await db.collection('actividad').add({
      fecha: Timestamp.now(),
      tipo: 'agente_ejecutado',
      descripcion:
        `Agente de legislación ejecutado. ${iniciativasEncontradas} nueva(s) iniciativa(s) encontrada(s). ${resumen}` +
        (retiradas.length ? ` ${retiradas.length} ficha(s) retirada(s) al releer la gaceta: la IA sólo se mencionaba de paso.` : ''),
    });

    return NextResponse.json({
      mensaje: `Legislación completada. ${iniciativasEncontradas} nueva(s) iniciativa(s) encontrada(s).`,
      success: true,
      metodo: 'gacetas-determinista',
      iniciativasEncontradas,
      yaRegistradas,
      ventana: r.ventana,
      diputados: r.diputados,
      senado: r.senado,
      altas,
      retiradas,
      errores,
      limitaciones,
      duracionMs,
    });
  } catch (error) {
    const detalle = error instanceof Error ? error.message : String(error);
    console.error('[CRON] Error en agente de legislación:', error);
    try {
      const db = getAdminDb();
      await db.collection('actividad').add({
        fecha: Timestamp.now(),
        tipo: 'agente_fallo',
        descripcion: `El agente de legislación falló y no pudo revisar las gacetas: ${detalle}`,
      });
    } catch { /* si ni esto se puede, queda en la respuesta */ }
    return NextResponse.json({ error: 'Error al ejecutar agente de legislación', success: false, detalle, errores }, { status: 500 });
  }
}
