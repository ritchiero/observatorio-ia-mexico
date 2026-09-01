// Señal DERIVADA de vigencia de una promesa pública.
//
// No afirma incumplimiento: afirmar que algo no se cumplió exige evidencia y
// revisor (OIA-005/008). Lo que sí se puede derivar del propio registro es más
// modesto y más honesto: la fecha comprometida ya pasó y no hay constancia de
// que alguien lo haya revisado después. Eso es lo que se publica.

export interface ActualizacionMin {
  fecha?: unknown;
  descripcion?: unknown;
}

export interface AnuncioPlazo {
  fechaPrometida?: unknown;
  actualizaciones?: unknown;
  status?: unknown;
}

export interface EstadoPlazo {
  /** hay fecha comprometida y ya pasó */
  vencido: boolean;
  /** días transcurridos desde la fecha comprometida (0 si no venció) */
  diasVencido: number;
  /** fecha de la revisión registrada más reciente, si existe */
  ultimaRevision: Date | null;
  /** venció y NADIE lo ha revisado desde entonces: es lo que se muestra */
  sinVerificar: boolean;
}

const SIN_PLAZO: EstadoPlazo = {
  vencido: false,
  diasVencido: 0,
  ultimaRevision: null,
  sinVerificar: false,
};

/** Acepta Date, ISO string, o el {_seconds} que devuelve la API de Firestore. */
export function aFecha(v: unknown): Date | null {
  if (v instanceof Date) return isNaN(v.getTime()) ? null : v;
  if (v && typeof v === 'object') {
    const s = (v as { _seconds?: unknown })._seconds;
    if (typeof s === 'number') return new Date(s * 1000);
  }
  if (typeof v === 'string' && /^\d{4}-\d\d-\d\d/.test(v)) {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

const DIA = 86_400_000;

export function evaluarPlazo(anuncio: AnuncioPlazo, hoy: Date = new Date()): EstadoPlazo {
  const prometida = aFecha(anuncio?.fechaPrometida);
  if (!prometida) return SIN_PLAZO;

  const vencido = prometida.getTime() < hoy.getTime();
  if (!vencido) return { ...SIN_PLAZO, ultimaRevision: ultimaRevisionDe(anuncio) };

  const ultimaRevision = ultimaRevisionDe(anuncio);
  // Una revisión ANTERIOR al plazo no dice nada sobre si se cumplió: solo cuenta
  // la constancia posterior a la fecha comprometida.
  const revisadoDespues = !!ultimaRevision && ultimaRevision.getTime() >= prometida.getTime();

  return {
    vencido: true,
    diasVencido: Math.max(0, Math.floor((hoy.getTime() - prometida.getTime()) / DIA)),
    ultimaRevision,
    sinVerificar: !revisadoDespues,
  };
}

function ultimaRevisionDe(anuncio: AnuncioPlazo): Date | null {
  const arr = Array.isArray(anuncio?.actualizaciones) ? (anuncio.actualizaciones as ActualizacionMin[]) : [];
  let max: Date | null = null;
  for (const a of arr) {
    const f = aFecha(a?.fecha);
    if (f && (!max || f > max)) max = f;
  }
  return max;
}

/** Texto corto para la etiqueta pública. */
export function leyendaPlazo(e: EstadoPlazo, locale: 'es' | 'en' = 'es'): string | null {
  if (!e.sinVerificar) return null;
  const d = e.diasVencido;
  return locale === 'en'
    ? `Deadline passed ${d} day${d === 1 ? '' : 's'} ago · not verified since`
    : `Plazo vencido hace ${d} día${d === 1 ? '' : 's'} · sin verificar desde entonces`;
}
