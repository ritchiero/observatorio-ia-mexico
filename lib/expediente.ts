// lib/expediente.ts
//
// Utilidades del "expediente" para el heartbeat: folio (identificador estable),
// dedup (para que no se revuelvan) y verificación de fuente (reja de credibilidad).
// Servidor-only (lo usan los agentes/crons).

// ---------- Verificación de fuente (espejo de lib/nivelConfianza.ts) ----------
const RE_OFICIAL =
  /(\.gob\.mx|dof\.gob\.mx|scjn|sjf2?\.scjn|diputados|senado\.gob|congreso|poderjudicial|tribunal|consejodelajudicatura|segob|inai\.org\.mx|ine\.mx|cndh|indautor|impi\.gob\.mx|profeco|banxico|inegi|sat\.gob\.mx|unesco|europa\.eu|un\.org|oecd\.org)/i;

export type TierFuente = 'oficial' | 'documentada' | 'sin_verificar';

export function tierFuente(urls: (string | undefined | null)[]): TierFuente {
  const us = urls.filter((u): u is string => typeof u === 'string' && /^https?:\/\//i.test(u));
  if (us.length === 0) return 'sin_verificar';
  if (us.some((u) => RE_OFICIAL.test(u))) return 'oficial';
  return 'documentada';
}

// ---------- Normalización para dedup ----------
export function normalizarTitulo(s: string | undefined | null): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '') // quita acentos (ASCII-safe)
    .replace(/[^a-z0-9\s]/g, ' ') // quita puntuación
    .replace(/\b(el|la|los|las|de|del|para|por|en|y|con|the|of|a|un|una)\b/g, ' ') // stopwords
    .replace(/\s+/g, ' ')
    .trim();
}

function tokens(s: string): Set<string> {
  return new Set(normalizarTitulo(s).split(' ').filter((t) => t.length > 2));
}

/** Similitud Jaccard de tokens (0..1) entre dos títulos. */
export function tituloSimilar(a: string, b: string): number {
  const ta = tokens(a);
  const tb = tokens(b);
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter++;
  return inter / (ta.size + tb.size - inter);
}

/** Normaliza una URL a host+path (sin protocolo, www, query ni slash final). */
export function normalizarUrl(u: string | undefined | null): string {
  if (!u) return '';
  return u
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split(/[?#]/)[0]
    .replace(/\/+$/, '')
    .toLowerCase();
}

export interface RegistroExistente {
  titulo?: string;
  urls?: string[];
}

/**
 * ¿El candidato es duplicado de algún registro existente?
 * Match si: título muy similar (Jaccard ≥ umbral) O comparte una URL de fuente.
 */
export function esDuplicado(
  titulo: string,
  urls: (string | undefined | null)[],
  existentes: RegistroExistente[],
  umbral = 0.6,
): { dup: boolean; folioMatch?: string; razon?: string } {
  const urlsNorm = new Set(urls.map(normalizarUrl).filter(Boolean));
  for (const e of existentes) {
    const sim = tituloSimilar(titulo, e.titulo || '');
    if (sim >= umbral) {
      return { dup: true, razon: `título similar (${sim.toFixed(2)}) a "${(e.titulo || '').slice(0, 50)}"` };
    }
    if (urlsNorm.size > 0 && (e.urls || []).some((u) => urlsNorm.has(normalizarUrl(u)))) {
      return { dup: true, razon: `comparte fuente con "${(e.titulo || '').slice(0, 50)}"` };
    }
  }
  return { dup: false };
}

// ---------- Folio ----------
/**
 * Fábrica de folios: dado el prefijo (ANU/LEG/CAS) y los folios existentes,
 * devuelve una función que entrega el siguiente folio por año (max+1), de forma
 * monotónica dentro de una misma corrida.
 */
export function folioFactory(prefix: string, foliosExistentes: (string | undefined | null)[]) {
  const maxPorAnio: Record<string, number> = {};
  const re = new RegExp(`^${prefix}-(\\d{4})-(\\d+)$`);
  for (const f of foliosExistentes) {
    const m = (f || '').match(re);
    if (m) {
      const [, yr, n] = m;
      const num = parseInt(n, 10);
      if (!maxPorAnio[yr] || num > maxPorAnio[yr]) maxPorAnio[yr] = num;
    }
  }
  return function siguiente(anio: string): string {
    const yr = /^\d{4}$/.test(anio) ? anio : '2026';
    maxPorAnio[yr] = (maxPorAnio[yr] || 0) + 1;
    return `${prefix}-${yr}-${String(maxPorAnio[yr]).padStart(3, '0')}`;
  };
}
