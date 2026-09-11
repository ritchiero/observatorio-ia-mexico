// Gaceta Parlamentaria de la Cámara de Diputados — Anexo VII ("Comunicación de
// la Presidencia de la Mesa Directiva, por la que informa el turno…").
//
// Es la fuente determinista ideal: una página por sesión (~30 KB) con TODAS las
// iniciativas del día numeradas, título completo, proponente, grupo parlamentario
// y turno. Sólo existe en días de sesión; los demás devuelven 404.

import { esRelevanteIA, conteoIA, evidenciaIA, relevanciaConCuerpo } from './keywords.ts';

export interface HallazgoGaceta {
  fuente: 'diputados' | 'senado' | 'permanente';
  camara: 'diputados' | 'senadores';
  fecha: string;          // YYYY-MM-DD (fecha de la sesión)
  numeroEnGaceta?: number;
  titulo: string;
  proponente: string;
  grupo: string;
  turno: string;
  url: string;
  clase: 'iniciativa' | 'punto_acuerdo' | 'minuta';
  textoCompleto: string;
  /** Sólo cuando se leyó el texto completo (Anexo II / PDF): cuántas veces aparece la IA, por qué pasó y un fragmento. */
  menciones?: number;
  relevancia?: 'titulo' | 'cuerpo';
  evidencia?: string;
  /** La Gaceta publicó el articulado como imagen: sólo se pudo leer el título de la portada. */
  cuerpoNoDisponible?: boolean;
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function iso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

export function urlAnexoVII(fecha: Date, legislatura = 66): string {
  const y = fecha.getUTCFullYear();
  const m = MESES[fecha.getUTCMonth()];
  const ymd = iso(fecha).replace(/-/g, '');
  return `https://gaceta.diputados.gob.mx/Gaceta/${legislatura}/${y}/${m}/${ymd}-VII.html`;
}

const ENTIDADES: Record<string, string> = {
  '&aacute;': 'á', '&eacute;': 'é', '&iacute;': 'í', '&oacute;': 'ó', '&uacute;': 'ú',
  '&Aacute;': 'Á', '&Eacute;': 'É', '&Iacute;': 'Í', '&Oacute;': 'Ó', '&Uacute;': 'Ú',
  '&ntilde;': 'ñ', '&Ntilde;': 'Ñ', '&uuml;': 'ü', '&nbsp;': ' ', '&amp;': '&',
  '&quot;': '"', '&#147;': '“', '&#148;': '”', '&#146;': '’', '&#145;': '‘', '&ordm;': 'º', '&ordf;': 'ª',
};

export function limpiarHtml(fragmento: string): string {
  let t = fragmento.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' ');
  t = t.replace(/&[a-zA-Z]+;|&#\d+;/g, (e) => ENTIDADES[e] ?? (e.startsWith('&#') ? String.fromCharCode(Number(e.slice(2, -1))) : e));
  return t.replace(/\s+/g, ' ').trim();
}

const RE_ENTRADA = /<p>\s*<b>\s*(\d+)\.\s*<\/b>([\s\S]*?)(?=<p>\s*<b>\s*\d+\.\s*<\/b>|<\/body>|$)/gi;
const RE_CAMPOS = /^(.*?),\s*(?:a cargo de(?: la| los| las| el)?|suscrita por(?: la| los| las| el)?|presentada por(?: la| los| las| el)?)\s+(.*?),?\s*(?:del|de la|de los|de las)\s+Grupos?\s+Parlamentarios?\s+(?:del|de la|de)?\s*(.*?)\.?\s*Turno:\s*(.*?)\.?\s*$/i;

/** Parsea el Anexo VII completo (todas las entradas) y filtra las relevantes a IA. */
export function parseAnexoVII(html: string, fecha: string, url: string): { entradas: number; hallazgos: HallazgoGaceta[] } {
  let entradas = 0;
  const hallazgos: HallazgoGaceta[] = [];
  for (const m of html.matchAll(RE_ENTRADA)) {
    entradas++;
    const numero = Number(m[1]);
    const texto = limpiarHtml(m[2]);
    if (!esRelevanteIA(texto)) continue;
    const c = texto.match(RE_CAMPOS);
    const titulo = c ? c[1].trim() : texto.split(/\s*Turno:/i)[0].trim();
    const proponente = c ? c[2].trim().replace(/\s+y (?:las y los|los|las) (?:diputad[oa]s|integrantes).*$/i, '') : '';
    const grupo = c ? c[3].trim() : '';
    const turno = c ? c[4].trim() : (texto.split(/Turno:/i)[1] ?? '').trim();
    hallazgos.push({
      fuente: 'diputados',
      camara: 'diputados',
      fecha,
      numeroEnGaceta: numero,
      titulo,
      proponente,
      grupo,
      turno,
      url: `${url}#${numero}`,
      clase: /punto de acuerdo|exhort/i.test(titulo) ? 'punto_acuerdo' : 'iniciativa',
      textoCompleto: texto,
    });
  }
  return { entradas, hallazgos };
}

// ─── Anexo II: iniciativas registradas (con o sin turno) ─────────────────────
//
// El Anexo VII sólo lista lo que la Mesa Directiva ya turnó. Las iniciativas
// registradas el mismo día pero aún sin turno (en la sesión del 2-sep-2026, 5 de
// las 6 de IA) sólo existen en el Anexo II: un subíndice por grupo parlamentario
// con partes en HTML (y algunas en PDF, que aquí no se leen). En cada parte, cada
// iniciativa arranca con <p class="Versales">título, suscrita por … del GP …</p>.

export function urlIndiceDia(fecha: Date, legislatura = 66): string {
  const y = fecha.getUTCFullYear();
  const m = MESES[fecha.getUTCMonth()];
  const ymd = iso(fecha).replace(/-/g, '');
  return `https://gaceta.diputados.gob.mx/Gaceta/${legislatura}/${y}/${m}/${ymd}.html`;
}

const BASE_DIP = 'https://gaceta.diputados.gob.mx';

/** Del índice del día, la URL del subíndice del Anexo II (iniciativas), si existe. */
export function urlAnexoIIDesdeIndice(htmlIndice: string): string | null {
  const m = htmlIndice.match(/href="(\/Gaceta\/\d+\/\d{4}\/[a-z]{3}\/\d{8}-II\.html)"/i);
  return m ? BASE_DIP + m[1] : null;
}

/** Del subíndice del Anexo II, las partes en HTML (las PDF se reportan aparte). */
export function partesAnexoII(htmlSubindice: string): { html: string[]; pdf: string[] } {
  const html: string[] = [];
  const pdf: string[] = [];
  for (const m of htmlSubindice.matchAll(/href="(\/(?:Gaceta|PDF)\/\d+\/\d{4}\/[a-z]{3}\/\d{8}-II-[\dA-Z-]+\.(html|pdf))"/gi)) {
    (m[2].toLowerCase() === 'html' ? html : pdf).push(BASE_DIP + m[1]);
  }
  return { html: [...new Set(html)], pdf: [...new Set(pdf)] };
}

const RE_VERSALES = /<p\s+class="Versales"\s*>([\s\S]*?)<\/p>/gi;
const RE_ENCABEZADO = /^(.*?),\s*(?:suscrita|presentada|a cargo)\s+(?:por\s+)?(?:la|el|los|las)?\s*(.*?)(?:,|\s+y\s+(?:las y los|los|las)\s+(?:legislador|diputad|integrantes)[\s\S]*?)?\s+(?:del|de la|de los)\s+Grupos?\s+Parlamentarios?\s+(?:del|de la|de)?\s*([A-Za-zÁÉÍÓÚÑáéíóúñ .]+?)\s*$/i;

/** Parsea una parte HTML del Anexo II: un bloque por iniciativa. */
/** Encabezado de un asunto («Que reforma…, suscrita por…, del Grupo Parlamentario de…») → campos. */
export function parseEncabezado(enc: string): { titulo: string; proponente: string; grupo: string; clase: 'iniciativa' | 'punto_acuerdo' } {
  const c = enc.match(RE_ENCABEZADO);
  return {
    titulo: (c ? c[1] : enc.split(/,\s*(?:suscrita|presentada|a cargo)/i)[0]).trim(),
    proponente: c ? c[2].trim() : '',
    grupo: c ? c[3].trim() : (enc.match(/Grupo Parlamentario (?:del|de la|de)?\s*(.*)$/i) || ['', ''])[1].trim(),
    clase: /punto de acuerdo|exhort/i.test(enc) ? 'punto_acuerdo' : 'iniciativa',
  };
}

export function parseParteAnexoII(html: string, fecha: string, url: string): { bloques: number; incidentales: number; hallazgos: HallazgoGaceta[] } {
  const inicios: number[] = [];
  let incidentales = 0; // bloques con mención de IA que no alcanza el umbral (no se registran, sí se cuentan)
  for (const m of html.matchAll(RE_VERSALES)) inicios.push(m.index ?? 0);
  const hallazgos: HallazgoGaceta[] = [];
  for (let i = 0; i < inicios.length; i++) {
    const bloque = html.slice(inicios[i], inicios[i + 1] ?? html.length);
    const enc = limpiarHtml((bloque.match(/<p\s+class="Versales"\s*>([\s\S]*?)<\/p>/i) || ['', ''])[1]);
    const cuerpo = limpiarHtml(bloque);
    const nivel = relevanciaConCuerpo(enc, cuerpo);
    if (!nivel) { if (conteoIA(cuerpo) > 0) incidentales++; continue; }
    const e = parseEncabezado(enc);
    hallazgos.push({
      fuente: 'diputados',
      camara: 'diputados',
      fecha,
      numeroEnGaceta: i + 1,
      titulo: e.titulo,
      proponente: e.proponente,
      grupo: e.grupo,
      turno: '',
      url,
      clase: e.clase,
      textoCompleto: cuerpo.slice(0, 4000),
      menciones: conteoIA(cuerpo),
      relevancia: nivel,
      evidencia: evidenciaIA(cuerpo),
    });
  }
  return { bloques: inicios.length, incidentales, hallazgos };
}
