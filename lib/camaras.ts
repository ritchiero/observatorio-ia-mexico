// Normalización de la cámara de origen de una iniciativa.
//
// El campo `camara` del corpus creció sin canon: conviven «Diputados» y
// «diputados», «Senado» y «senadores», y quince formas distintas de nombrar un
// congreso estatal («Congreso de la CDMX», «congreso_cdmx», «Congreso local»,
// «Congreso del Estado de Michoacán»…). Los filtros de /legislacion comparaban
// el valor crudo, así que el 11-sep-2026 «Diputados» encontraba 92 de 108
// fichas, «Senado» 49 de 53 y «Local» ninguna de 22.
//
// Se normaliza al leer en vez de reescribir el corpus: las fichas conservan el
// nombre con que la fuente las publicó, que es lo que se cita.

export type CamaraCanonica = 'Diputados' | 'Senado' | 'Local';

/** Cámara canónica de un valor cualquiera del corpus. `null` si no hay dato. */
export function normalizarCamara(valor: unknown): CamaraCanonica | null {
  const v = String(valor ?? '').trim().toLowerCase();
  if (!v) return null;
  if (/^diputad/.test(v) || v === 'camara de diputados' || v === 'cámara de diputados') return 'Diputados';
  if (/^senad/.test(v) || v === 'camara de senadores' || v === 'cámara de senadores') return 'Senado';
  // Todo congreso que no sea federal es local, se llame como se llame.
  if (/congreso|local|asamblea|legislatura del estado/.test(v)) return 'Local';
  return null;
}

/** ¿La iniciativa es federal? (Diputados o Senado). */
export function esFederal(camara: unknown): boolean {
  const c = normalizarCamara(camara);
  return c === 'Diputados' || c === 'Senado';
}

const ESTADOS_POR_NOMBRE: Array<[RegExp, string]> = [
  [/cdmx|ciudad de m[eé]xico|distrito federal/i, 'Ciudad de México'],
  [/estado de m[eé]xico|edomex/i, 'Estado de México'],
  [/san luis potos[ií]|\bslp\b/i, 'San Luis Potosí'],
  [/michoac[aá]n/i, 'Michoacán'],
  [/oaxaca/i, 'Oaxaca'],
  [/chihuahua/i, 'Chihuahua'],
  [/quer[eé]taro/i, 'Querétaro'],
  [/yucat[aá]n/i, 'Yucatán'],
  [/guanajuato/i, 'Guanajuato'],
  [/campeche/i, 'Campeche'],
  [/quintana roo/i, 'Quintana Roo'],
  [/jalisco/i, 'Jalisco'],
  [/nuevo le[oó]n/i, 'Nuevo León'],
  [/puebla/i, 'Puebla'],
  [/veracruz/i, 'Veracruz'],
];

/**
 * Entidad de la iniciativa: «Federal» para las dos cámaras del Congreso de la
 * Unión, y el estado cuando es local. Se prefiere el campo explícito; si falta,
 * se deduce del nombre del congreso o de la legislatura.
 */
export function entidadDe(iniciativa: { camara?: unknown; entidadFederativa?: unknown; legislatura?: unknown }): string | null {
  const explicita = String(iniciativa.entidadFederativa ?? '').trim();
  if (explicita) return explicita;
  if (esFederal(iniciativa.camara)) return 'Federal';
  const texto = `${String(iniciativa.camara ?? '')} ${String(iniciativa.legislatura ?? '')}`;
  for (const [re, nombre] of ESTADOS_POR_NOMBRE) if (re.test(texto)) return nombre;
  return null;
}

/**
 * Nombre del congreso de una entidad, con el artículo correcto: «Congreso de la
 * Ciudad de México», «Congreso del Estado de México», «Congreso de Michoacán».
 */
export function nombreCongresoDe(entidad: string): string {
  const e = (entidad || '').trim();
  if (!e) return 'Congreso local';
  if (/^ciudad de m[eé]xico$/i.test(e)) return 'Congreso de la Ciudad de México';
  if (/^estado de m[eé]xico$/i.test(e)) return 'Congreso del Estado de México';
  return `Congreso de ${e}`;
}

/** Nombre legible de la cámara, conservando el de la fuente cuando es local. */
export function etiquetaCamara(valor: unknown): string {
  const c = normalizarCamara(valor);
  if (c === 'Diputados') return 'Cámara de Diputados';
  if (c === 'Senado') return 'Senado';
  const crudo = String(valor ?? '').trim();
  if (!crudo) return 'No especificada';
  // «congreso_cdmx» → «Congreso CDMX»
  return crudo
    .replace(/_/g, ' ')
    .replace(/\bcdmx\b/gi, 'CDMX')
    .replace(/^\w/, (m) => m.toUpperCase());
}
