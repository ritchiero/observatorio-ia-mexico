// Partes del Anexo II que la Gaceta de Diputados publica SÓLO en PDF.
//
// Verificado el 8-sep-2026: en la sesión del 2-sep, 7 de 17 partes eran PDF.
// Dos tipos: (a) PDF con capa de texto (0.3–1.6 MB, 30–70 págs), que se leen
// enteros; (b) partes cuyo CUERPO va escaneado (10–28 MB, ~200 págs). Hallazgo
// del 11-sep-2026: en esas segundas la PORTADA (el «CONTENIDO») **sí lleva capa
// de texto** con el título completo, el proponente y el grupo de cada asunto —
// sólo el articulado es imagen. Descartarlas enteras ocultaba iniciativas de IA
// reales (p. ej. la del uso responsable de IA en los servicios consulares, de
// Arellano Ávila, 2-sep-2026, en una parte de 27.7 MB). Por eso ahora SIEMPRE se
// lee la portada, y el cuerpo se marca como no disponible cuando es imagen.
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
  sinCapaTexto: boolean;      // ni siquiera la portada trae texto: no hay nada que leer
  cuerpoEscaneado: boolean;   // la portada se leyó, pero el articulado va como imagen
  separacion: 'cierre' | 'encabezado' | 'unico' | 'ninguna';
  hallazgos: HallazgoGaceta[];
}

/** Une los guiones de fin de línea de la portada («Ley Fe-\nderal») y normaliza espacios. */
export function normalizarLineas(t: string): string {
  return t.replace(/-\n\s*/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * ¿El ARTICULADO va escaneado? (menos de ~300 caracteres útiles por página).
 * Medida sobre el documento completo: una parte con cuerpo en imagen ronda
 * 26–450 c/pág, mientras que una con texto ronda 700–2 300.
 * Ojo: esto NO significa que no haya nada que leer — la portada casi siempre
 * conserva su capa de texto; ver `parseTextoPdfAnexoII`.
 */
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
  return entradas.map((e) => limpiarNumerosDePagina(normalizarLineas(e))).filter((e) => e.length > 20);
}

/**
 * La portada va en dos columnas y unpdf manda los números de página al final del
 * bloque: «…del Grupo Parlamentario de Morena 2 45 57 121 149 171». Sin esto el
 * grupo parlamentario salía como «PRI 2 31 51».
 */
export function limpiarNumerosDePagina(entrada: string): string {
  return entrada.replace(/(?:\s+\d{1,4})+\s*$/, '').trim();
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
  const entradas = entradasDePortada(texto);
  // Sin portada legible no hay nada que hacer: ni títulos ni cuerpo.
  if (entradas.length === 0) {
    return { bloques: 0, incidentales: 0, sinCapaTexto: true, cuerpoEscaneado: pareceEscaneo(texto, paginas), separacion: 'ninguna', hallazgos: [] };
  }
  const cuerpoEscaneado = pareceEscaneo(texto, paginas);
  const iniCuerpo = texto.search(/\n\s*Anexo\s+II[-\d\s]*\n/i);
  const cuerpo = cuerpoEscaneado ? '' : (iniCuerpo > 0 ? texto.slice(iniCuerpo) : texto);
  const { bloques, separacion } = cuerpoEscaneado ? { bloques: [] as string[], separacion: 'ninguna' as const } : bloquesDeCuerpo(cuerpo, entradas.length);
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
      cuerpoNoDisponible: cuerpoEscaneado || undefined,
    });
  });
  return { bloques: entradas.length, incidentales, sinCapaTexto: false, cuerpoEscaneado, separacion, hallazgos };
}
