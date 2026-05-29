// lib/nivelConfianza.ts
//
// Clasifica el "nivel de confianza" de un registro del Observatorio según la
// jerarquía de fuentes que seguimos:
//
//   1. Fuente oficial      — gobierno / poder judicial / organismos públicos
//   2. Fuente documentada  — fuente pública verificable (p. ej. diario de
//                            circulación nacional) pendiente de corroboración oficial
//   3. Sin fuente citada   — no debería ocurrir; marcador interno
//
// Es agnóstico al tipo de registro (anuncio, iniciativa, caso): recorre el
// objeto y extrae cualquier URL presente (fuentes[], fuenteOriginal,
// documentos[], trayectoria[].documentos[], etc.) sin depender de su forma.

export type NivelConfianza = 'oficial' | 'documentada' | 'sin_verificar';

// Dominios de fuentes oficiales / autoritativas. `.gob.mx` cubre la gran mayoría
// (DOF, SCJN, SJF, INDAUTOR, congresos, etc.); el resto añade organismos y
// fuentes primarias internacionales.
const RE_OFICIAL =
  /(\.gob\.mx|dof\.gob\.mx|scjn|sjf2?\.scjn|diputados|senado\.gob|congreso|poderjudicial|tribunal|consejodelajudicatura|segob|inai\.org\.mx|ine\.mx|cndh|indautor|impi\.gob\.mx|profeco|banxico|inegi|sat\.gob\.mx|unesco|europa\.eu|un\.org|oecd\.org)/i;

const RE_URL = /https?:\/\/[^\s"'<>)\]}]+/gi;

function collectUrls(value: unknown, acc: string[]): void {
  if (typeof value === 'string') {
    const matches = value.match(RE_URL);
    if (matches) acc.push(...matches);
  } else if (Array.isArray(value)) {
    for (const v of value) collectUrls(v, acc);
  } else if (value && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) collectUrls(v, acc);
  }
}

/** Extrae todas las URLs presentes en cualquier campo del registro. */
export function urlsDeRegistro(item: unknown): string[] {
  const acc: string[] = [];
  collectUrls(item, acc);
  return acc;
}

/** Devuelve el nivel de confianza del registro según su mejor fuente. */
export function nivelConfianza(item: unknown): NivelConfianza {
  const urls = urlsDeRegistro(item);
  if (urls.length === 0) return 'sin_verificar';
  if (urls.some((u) => RE_OFICIAL.test(u))) return 'oficial';
  return 'documentada';
}

/** Metadatos de presentación (sin clases Tailwind: las define el componente). */
export interface NivelInfo {
  nivel: NivelConfianza;
  label: string;
  short: string;
  emoji: string;
  desc: string;
}

export const NIVEL_INFO: Record<NivelConfianza, NivelInfo> = {
  oficial: {
    nivel: 'oficial',
    label: 'Fuente oficial',
    short: 'Fuente oficial',
    emoji: '🟢',
    desc: 'Verificado contra al menos una fuente gubernamental o judicial: gob.mx, DOF, SCJN/SJF, congresos u organismos públicos.',
  },
  documentada: {
    nivel: 'documentada',
    label: 'Fuente documentada',
    short: 'Documentada',
    emoji: '🔵',
    desc: 'Citado con fuente pública verificable (p. ej. diario de circulación nacional), pendiente de corroboración en fuente oficial.',
  },
  sin_verificar: {
    nivel: 'sin_verificar',
    label: 'Sin fuente citada',
    short: 'Sin verificar',
    emoji: '⚪',
    desc: 'Sin URL de fuente registrada. El Observatorio no publica datos en este nivel.',
  },
};

export function infoDeRegistro(item: unknown): NivelInfo {
  return NIVEL_INFO[nivelConfianza(item)];
}
