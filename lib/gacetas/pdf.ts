// Partes del Anexo II que la Gaceta de Diputados publica SÓLO en PDF.
//
// Verificado el 8-sep-2026: en la sesión del 2-sep, 7 de 17 partes eran PDF.
// Dos tipos: (a) PDF con capa de texto (0.3–1.6 MB, 30–70 págs): se pueden leer;
// (b) escaneos sin texto (10–28 MB, 200 págs, «Acrobat Distiller»): no hay
// nada que leer sin OCR, y no se descargan (el tope de bytes los descarta).
//
// Estructura del texto extraído (unpdf, páginas unidas):
//   Gaceta Parlamentaria … Número 7117-II-2-3
//   CONTENIDO
//   Iniciativas
//   Que reforma … , suscrita por el diputado X … del Grupo Parlamentario del PAN   ← portada, fiable
//   Anexo II-2-3
//   INICIATIVA CON PROYECTO DE DECRETO POR EL QUE … ; A CARGO DE …                  ← cuerpo
//   … Palacio Legislativo de San Lázaro, a 2 de septiembre de 2026. Diputado X (rúbrica)
// Cada asunto CIERRA con «Palacio Legislativo de San Lázaro, a N de mes de AAAA»;
// Separación: por encabezados en mayúsculas (coincidieron con la portada en las
// 5 partes de muestra); si no cuadra, por el cierre; si tampoco, y hay un solo
// asunto, todo el cuerpo es suyo; con varios y sin separación fiable, sólo se
// evalúa el título.

import type { HallazgoGaceta } from './diputados.ts';
import { parseEncabezado } from './diputados.ts';
import { conteoIA, evidenciaIA, relevanciaConCuerpo } from './keywords.ts';

export interface ResultadoPdf {
  bloques: number;            // asuntos según la portada (CONTENIDO)
  incidentales: number;
  sinCapaTexto: boolean;      // escaneo: no hay texto que leer
  separacion: 'cierre' | 'encabezado' | 'unico' | 'ninguna';
  hallazgos: HallazgoGaceta[];
}

/** Une los guiones de fin de línea de la portada («Ley Fe-\nderal») y normaliza espacios. */
export function normalizarLineas(t: string): string {
  return t.replace(/-\n\s*/g, '').replace(/\s+/g, ' ').trim();
}

/** ¿El PDF es un escaneo sin capa de texto? (menos de ~300 caracteres útiles por página) */
export function pareceEscaneo(texto: string, paginas: number): boolean {
  const utiles = (texto || '').replace(/\s+/g, '').length;
  return paginas > 0 ? utiles / paginas < 300 : utiles < 1500;
}

/** Entradas de la portada (CONTENIDO): una por asunto, en el orden del cuerpo. */
export function entradasDePortada(texto: string): string[] {
  const ini = texto.search(/\bCONTENIDO\b/);
  if (ini < 0) return [];
  const resto = texto.slice(ini + 9);
  const finRel = resto.search(/\n\s*Anexo\s+II[-\d\s]*\n/i);
  const portada = finRel > 0 ? resto.slice(0, finRel) : resto.slice(0, 4000);
  const lineas = portada.split('\n').map((l) => l.trim()).filter(Boolean);
  const entradas: string[] = [];
  let actual: string[] | null = null;
  for (const l of lineas) {
    if (/^(Iniciativas?|Proposiciones|Dict[aá]menes|Comunicaciones|Actas?)$/i.test(l)) { if (actual) entradas.push(actual.join('\n')); actual = null; continue; }
    if (/^(Que\s|Con punto de acuerdo|De la\s|Del\s)/.test(l) && (!actual || actual.length > 0)) {
      if (actual) entradas.push(actual.join('\n'));
      actual = [l];
    } else if (actual) {
      actual.push(l);
    }
  }
  if (actual) entradas.push(actual.join('\n'));
  return entradas.map(normalizarLineas).filter((e) => e.length > 20);
}

const RE_CIERRE = /Palacio Legislativo de San L[aá]zaro,?\s+a\s+\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+\d{4}/gi;
const RE_ENCABEZADO_CUERPO = /(?:^|\n)\s*(?:INICIATIVA\s+CON\s+PROYECTO\s+DE\s+DECRETO|Iniciativa\s+con\s+[Pp]royecto\s+de\s+[Dd]ecreto|PROPOSICI[ÓO]N\s+CON\s+PUNTO\s+DE\s+ACUERDO)\b/g;

/** Separa el cuerpo en tantos bloques como entradas tenga la portada. */
export function bloquesDeCuerpo(cuerpo: string, n: number): { bloques: string[]; separacion: ResultadoPdf['separacion'] } {
  if (n <= 0) return { bloques: [], separacion: 'ninguna' };
  if (n === 1) return { bloques: [cuerpo], separacion: 'unico' };
  // Primero los encabezados («INICIATIVA CON PROYECTO DE DECRETO …»): en las 5
  // partes de muestra su número coincidió siempre con la portada. El cierre
  // («Palacio Legislativo…, a N de») a veces viene partido en dos líneas.
  const encs = [...cuerpo.matchAll(RE_ENCABEZADO_CUERPO)].map((m) => m.index ?? 0)
    .filter((i) => /GRUPO\s+PARLAMENTARIO|Grupo\s+Parlamentario|DIPUTAD[OA]S?\b|[Dd]iputad[oa]s?\b/.test(cuerpo.slice(i, i + 1500)));
  if (encs.length === n) {
    const out: string[] = [];
    for (let i = 0; i < encs.length; i++) out.push(cuerpo.slice(encs[i], encs[i + 1] ?? cuerpo.length));
    return { bloques: out, separacion: 'encabezado' };
  }
  const cierres = [...cuerpo.matchAll(RE_CIERRE)].map((m) => (m.index ?? 0) + m[0].length);
  if (cierres.length === n) {
    const out: string[] = []; let prev = 0;
    for (const c of cierres) { out.push(cuerpo.slice(prev, c)); prev = c; }
    return { bloques: out, separacion: 'cierre' };
  }
  return { bloques: [], separacion: 'ninguna' };
}

export function parseTextoPdfAnexoII(texto: string, paginas: number, fecha: string, url: string): ResultadoPdf {
  if (pareceEscaneo(texto, paginas)) return { bloques: 0, incidentales: 0, sinCapaTexto: true, separacion: 'ninguna', hallazgos: [] };
  const entradas = entradasDePortada(texto);
  const iniCuerpo = texto.search(/\n\s*Anexo\s+II[-\d\s]*\n/i);
  const cuerpo = iniCuerpo > 0 ? texto.slice(iniCuerpo) : texto;
  const { bloques, separacion } = bloquesDeCuerpo(cuerpo, entradas.length);
  const hallazgos: HallazgoGaceta[] = [];
  let incidentales = 0;
  entradas.forEach((enc, i) => {
    const b = bloques[i] ?? '';                  // sin separación fiable: sólo cuenta el título
    const nivel = relevanciaConCuerpo(enc, b);
    if (!nivel) { if (conteoIA(b) > 0) incidentales++; return; }
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
      textoCompleto: (b || enc).replace(/\s+/g, ' ').slice(0, 4000),
      menciones: conteoIA(b || enc),
      relevancia: nivel,
      evidencia: evidenciaIA(b || enc),
    });
  });
  return { bloques: entradas.length, incidentales, sinCapaTexto: false, separacion, hallazgos };
}
