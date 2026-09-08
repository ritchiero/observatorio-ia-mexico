// Gaceta del Senado y Gaceta de la Comisión Permanente.
//
// La sesión (/66/gaceta_del_senado/YYYY_MM_DD) lista cada asunto como un ancla a
// /documento/NNN con el título completo. A diferencia de Diputados, el título
// del Senado casi nunca dice "inteligencia artificial": la IA vive en el cuerpo.
// Por eso el filtro es de DOS niveles: (1) el título decide si el asunto es un
// candidato plausible (leyes donde la IA suele aterrizar), (2) se descarga el
// documento y se decide con el texto completo. Así el cron no se gasta 187
// descargas por sesión ni se pierde a Monreal reformando el Código Penal.

import { esRelevanteIA } from './keywords.ts';
import type { HallazgoGaceta } from './diputados.ts';

export function urlSesionSenado(fecha: Date): string {
  const [y, m, d] = fecha.toISOString().slice(0, 10).split('-');
  return `https://www.senado.gob.mx/66/gaceta_del_senado/${y}_${m}_${d}`;
}

export function urlSesionPermanente(fecha: Date): string {
  const [y, m, d] = fecha.toISOString().slice(0, 10).split('-');
  return `https://www.senado.gob.mx/66/gaceta_comision_permanente/${y}_${m}_${d}/Inic`;
}

export interface AsuntoSenado {
  numero: number;
  url: string;
  texto: string;          // título completo del ancla
  proponente: string;
  grupo: string;
  clase: 'iniciativa' | 'punto_acuerdo' | 'minuta';
}

const RE_ANCLA = /<a\s+href=["'](https?:\/\/www\.senado\.gob\.mx\/66\/gaceta_(?:del_senado|comision_permanente)\/documento\/\d+)["'][^>]*>([\s\S]*?)<\/a>/gi;

/** El Senado sirve tras Imperva/Incapsula; a un cliente no-navegador le devuelve
 *  un cascarón de ~850 B con "Incapsula incident ID". Se detecta y se cuenta. */
export function esMuroAntiBots(html: string): boolean {
  return /Incapsula incident ID|_Incapsula_Resource/i.test(html || '');
}

function texto(fragmento: string): string {
  return fragmento.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
}

/** Todos los asuntos de una sesión (sin filtrar). */
export function parseSesionSenado(html: string): AsuntoSenado[] {
  const out: AsuntoSenado[] = [];
  const vistos = new Set<string>();
  for (const m of html.matchAll(RE_ANCLA)) {
    const url = m[1];
    const t = texto(m[2]);
    if (!t || vistos.has(url)) continue;
    vistos.add(url);
    const num = Number((t.match(/^(\d+)\./) || [])[1] ?? 0);
    const c = t.match(/^\d+\.\s*(?:De la|Del|De las|De los)\s+(.*?),?\s*del\s+Grupo\s+Parlamentario\s+(?:de|del|de la)?\s*(.*?),\s*con\s+(proyecto de decreto|punto de acuerdo)/i);
    const esMinuta = /^\d+\.\s*(?:Minuta|De la C[aá]mara de Diputados)/i.test(t) || /minuta/i.test(t.slice(0, 40));
    out.push({
      numero: num,
      url,
      texto: t,
      proponente: c ? c[1].trim() : '',
      grupo: c ? c[2].trim() : '',
      clase: esMinuta ? 'minuta' : c && /punto de acuerdo/i.test(c[3]) ? 'punto_acuerdo' : /punto de acuerdo/i.test(t) ? 'punto_acuerdo' : 'iniciativa',
    });
  }
  return out;
}

// Nivel 1: leyes y materias donde la IA suele aterrizar. Si el título ya la
// menciona, pasa directo; si no, sólo se descarga el cuerpo cuando el título
// toca alguna de estas materias.
// Materias donde la IA suele aterrizar, en dos niveles de prioridad. Los de
// prioridad ALTA se descargan primero; los de BAJA sólo si queda presupuesto.
// (En la sesión del 2-sep-2026 una lista laxa daba 73 candidatos de 181 y el tope
// de 40 descargas se agotaba antes de llegar al asunto de IA.)
const RE_ALTA = /c[oó]digo penal|datos personales|telecomunicaciones|radiodifusi[oó]n|digital|plataforma|redes sociales|identidad|inform[aá]tic|ciberseg|tecnolog|ciencia|innovaci[oó]n|propiedad intelectual|derecho de autor|propiedad industrial|consumidor|servicio exterior|administraci[oó]n tributaria|\bSAT\b|electoral|ni[ñn]as?, ni[ñn]os|adolescen|intimidad|imagen|voz\b/i;
const RE_BAJA = /constituci[oó]n pol[ií]tica|educaci[oó]n|salud|trabajo|transparencia|informaci[oó]n p[uú]blica|competencia econ[oó]mica|seguridad nacional|defensa|comunicaciones/i;

export function prioridad(asunto: AsuntoSenado): 0 | 1 | 2 {
  if (esRelevanteIA(asunto.texto)) return 0;
  if (RE_ALTA.test(asunto.texto)) return 1;
  if (RE_BAJA.test(asunto.texto)) return 2;
  return 2 + 1 as 2; // no candidato: se filtra en esCandidato
}

export function esCandidato(asunto: AsuntoSenado): boolean {
  return esRelevanteIA(asunto.texto) || RE_ALTA.test(asunto.texto) || RE_BAJA.test(asunto.texto);
}

/** Título "limpio": lo que va después de "con proyecto de decreto" o el ancla completa. */
export function tituloDe(asunto: AsuntoSenado): string {
  const m = asunto.texto.match(/con\s+(?:proyecto de decreto|punto de acuerdo)\s+(.*)$/i);
  let t = m ? m[1].trim() : asunto.texto.replace(/^\d+\.\s*/, '');
  t = t.replace(/^por el que se\s+/i, (x) => x.charAt(0).toUpperCase() + x.slice(1));
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export interface OpcionesRastreoSenado {
  fetchTexto: (url: string) => Promise<string | null>;   // devuelve HTML o null si falla
  maxDescargas?: number;                                  // tope de cuerpos por sesión (default 120)
  concurrencia?: number;                                  // descargas simultáneas (default 3)
  pausaMs?: number;                                       // pausa entre lotes (default 300 ms)
}

/** Rastrea una sesión: parsea anclas, filtra candidatos, baja cuerpos y decide. */
export async function rastrearSesionSenado(
  html: string,
  fecha: string,
  fuente: 'senado' | 'permanente',
  op: OpcionesRastreoSenado,
): Promise<{ asuntos: number; candidatos: number; descargados: number; bloqueados: number; sinEvaluar: number; cortado: boolean; hallazgos: HallazgoGaceta[] }> {
  const asuntos = parseSesionSenado(html);
  const candidatos = asuntos.filter(esCandidato).sort((a, b) => prioridad(a) - prioridad(b));
  const max = op.maxDescargas ?? 120;
  const concurrencia = op.concurrencia ?? 3;
  let descargados = 0;
  let bloqueados = 0;
  let cortado = false; // cortacircuito: si el muro aparece, no se insiste
  const hallazgos: HallazgoGaceta[] = [];

  // Los que ya son relevantes por título no gastan descarga.
  const directos = candidatos.filter((a) => esRelevanteIA(a.texto));
  const porCuerpo = candidatos.filter((a) => !esRelevanteIA(a.texto)).slice(0, max);

  const aHallazgo = (a: AsuntoSenado, cuerpo: string): HallazgoGaceta => ({
    fuente,
    camara: 'senadores',
    fecha,
    numeroEnGaceta: a.numero,
    titulo: tituloDe(a),
    proponente: a.proponente,
    grupo: a.grupo,
    turno: '',
    url: a.url,
    clase: a.clase,
    textoCompleto: cuerpo ? cuerpo.slice(0, 4000) : a.texto,
  });

  for (const a of directos) hallazgos.push(aHallazgo(a, ''));

  // Descarga en lotes concurrentes; un fallo individual no detiene la sesión.
  // Si un lote completo devuelve el muro anti-bots, se corta: seguir insistiendo
  // sólo prolonga el bloqueo de la IP y no aporta datos.
  for (let i = 0; i < porCuerpo.length && !cortado; i += concurrencia) {
    const lote = porCuerpo.slice(i, i + concurrencia);
    const cuerpos = await Promise.all(lote.map(async (a) => {
      const h = await op.fetchTexto(a.url);
      descargados++;
      if (!h) return { a, cuerpo: '', muro: false };
      if (esMuroAntiBots(h)) { bloqueados++; return { a, cuerpo: '', muro: true }; }
      return { a, cuerpo: texto(h.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')), muro: false };
    }));
    for (const { a, cuerpo } of cuerpos) if (cuerpo && esRelevanteIA(cuerpo)) hallazgos.push(aHallazgo(a, cuerpo));
    if (cuerpos.length > 0 && cuerpos.every((c) => c.muro)) cortado = true;
    else if (i + concurrencia < porCuerpo.length) await new Promise((r) => setTimeout(r, op.pausaMs ?? 300));
  }

  // Los candidatos que no se pudieron abrir (por muro o por corte) quedan sin evaluar de fondo.
  const sinEvaluar = Math.max(0, porCuerpo.length - descargados) + bloqueados;

  return { asuntos: asuntos.length, candidatos: candidatos.length, descargados, bloqueados, sinEvaluar, cortado, hallazgos };
}
