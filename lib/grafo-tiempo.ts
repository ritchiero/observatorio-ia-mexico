// Modo Historia del grafo: cuándo "aparece" cada pieza del atlas.
// Reglas de precedencia acordadas (spec de Sol, corregido a los datos reales):
//   anuncio    -> fechaAnuncio, fallback createdAt
//   iniciativa -> fecha (presentación), fallback createdAt
//   caso       -> primer fechaIngreso/fechaResolucion de su trayectoria,
//                 después fechaCreacion y fechaActualizacion
//   hub        -> año mínimo de sus registros conectados
//   arista rel -> año de su registro
//   malla      -> año del SEGUNDO registro compartido (cuando de verdad se
//                 cumple el umbral de co-ocurrencia >= 2)
// Fechas ausentes o inválidas -> null: fuera del playback, contabilizadas,
// jamás asignadas artificialmente al año actual.

export const PLAYBACK_INICIO = 2016;

const ANIO_MIN = 1990;
const ANIO_MAX = 2100;

export function anioDe(valor: unknown): number | null {
  const s = String(valor ?? '').trim();
  const m = s.match(/^(\d{4})(.*)$/);
  if (!m) return null;
  const y = Number(m[1]);
  if (!Number.isFinite(y) || y < ANIO_MIN || y > ANIO_MAX) return null;
  // si hay más que el año ("2025-13-40", "2020-00-00"), la fecha completa
  // debe ser parseable; una fecha imposible no aporta un año honesto
  if (m[2] && Number.isNaN(new Date(s).getTime())) return null;
  return y;
}

type Raw = Record<string, unknown>;

function primeraFechaTrayectoria(tr: unknown): number | null {
  if (!Array.isArray(tr)) return null;
  const anios: number[] = [];
  for (const e of tr) {
    if (typeof e !== 'object' || e === null) continue;
    const ev = e as Raw;
    for (const k of ['fechaIngreso', 'fechaResolucion']) {
      const y = anioDe(ev[k]);
      if (y !== null) anios.push(y);
    }
  }
  return anios.length ? Math.min(...anios) : null;
}

export function anioAparicionItem(tipo: 'anuncio' | 'iniciativa' | 'caso', raw: Raw): number | null {
  if (tipo === 'anuncio') {
    return anioDe(raw.fechaAnuncio) ?? anioDe(raw.createdAt);
  }
  if (tipo === 'iniciativa') {
    return anioDe(raw.fecha) ?? anioDe(raw.createdAt);
  }
  // caso
  return (
    primeraFechaTrayectoria(raw.trayectoria) ??
    anioDe(raw.fechaCreacion) ??
    anioDe(raw.fechaActualizacion)
  );
}

/** hub: aparece con su PRIMER registro conectado; null si ninguno tiene fecha */
export function anioHub(aniosDeItems: Array<number | null>): number | null {
  const v = aniosDeItems.filter((y): y is number => y !== null);
  return v.length ? Math.min(...v) : null;
}

/** malla: aparece cuando el umbral de 2 compartidos se cumple de verdad */
export function anioMesh(aniosCompartidos: Array<number | null>): number | null {
  const v = aniosCompartidos.filter((y): y is number => y !== null).sort((a, b) => a - b);
  if (v.length < 2) return null; // sin dos fechas conocidas no hay año honesto
  return v[1];
}

/** corte acumulativo: ¿esta pieza es visible en el año dado? (null = sin fecha, sólo en actualidad) */
export function visibleEnAnio(anioPieza: number | null, anioCorte: number | null, anioActual: number): boolean {
  if (anioCorte === null || anioCorte >= anioActual) return true; // actualidad: todo
  if (anioPieza === null) return false; // sin fecha: fuera del playback
  return anioPieza <= anioCorte;
}
