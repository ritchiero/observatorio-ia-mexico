export const MONITORED_ANNOUNCEMENT_STATUSES = new Set([
  'prometido',
  'en_desarrollo',
  'incumplido',
]);

type DateLike = Date | string | number | { toDate?: () => Date } | null | undefined;

export interface MonitoringCandidate {
  id: string;
  status?: string;
  oculto?: boolean;
  ultimaVerificacionAt?: DateLike;
  updatedAt?: DateLike;
}

function toMillis(value: DateLike): number {
  if (value && typeof value === 'object' && !(value instanceof Date) && typeof value.toDate === 'function') {
    return value.toDate().getTime();
  }

  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

/**
 * Selecciona el siguiente lote por la fecha de la ultima revision valida.
 * `updatedAt` solo desempata: usarlo como cursor dejaba a los expedientes sin
 * cambios atrapados para siempre al principio de la cola.
 */
export function selectMonitoringCandidates<T extends MonitoringCandidate>(
  announcements: T[],
  limit: number,
): T[] {
  return announcements
    .filter((item) => !item.oculto && MONITORED_ANNOUNCEMENT_STATUSES.has(String(item.status)))
    .sort((a, b) => {
      const byLastCheck = toMillis(a.ultimaVerificacionAt) - toMillis(b.ultimaVerificacionAt);
      if (byLastCheck !== 0) return byLastCheck;

      const byUpdate = toMillis(a.updatedAt) - toMillis(b.updatedAt);
      if (byUpdate !== 0) return byUpdate;

      return a.id.localeCompare(b.id);
    })
    .slice(0, Math.max(0, limit));
}

export function summarizeMonitoringRun(input: {
  candidates: number;
  successfulChecks: number;
  failedChecks: number;
}) {
  const { candidates, successfulChecks, failedChecks } = input;
  const totalChecks = successfulChecks + failedChecks;
  const success = candidates === 0 || successfulChecks > 0;

  return {
    success,
    partial: success && failedChecks > 0,
    totalChecks,
  };
}
