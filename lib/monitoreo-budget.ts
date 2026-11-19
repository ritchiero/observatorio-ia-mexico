/**
 * Configuración de presupuesto y límites para el agente de monitoreo
 * Centralizado para testing sin duplicación de constantes
 */

export const MONITOREO_DEFAULTS = {
  LIMIT: 2, // expedientes por corrida
  TIMEOUT_POR_LLAMADA_MS: 120_000, // timeout fijo de 120s por llamada
  DEADLINE_MS: 250_000, // deadline interno de 250s (margen dentro de 300s)
  MAX_SEARCHES: 3, // búsquedas web por anuncio
} as const;

/**
 * Regla de parada: determina si el monitoreo debe detenerse porque
 * no cabe un timeout completo antes del deadline
 */
export function debeDetenerMonitoreo(
  transcurridoMs: number,
  opts: {
    deadlineMs?: number;
    timeoutPorLlamadaMs?: number;
  } = {}
): { debeDetener: boolean; tiempoRestante: number; razon?: string } {
  const deadlineMs = opts.deadlineMs ?? MONITOREO_DEFAULTS.DEADLINE_MS;
  const timeoutPorLlamadaMs = opts.timeoutPorLlamadaMs ?? MONITOREO_DEFAULTS.TIMEOUT_POR_LLAMADA_MS;
  
  const tiempoRestante = deadlineMs - transcurridoMs;
  
  if (tiempoRestante < timeoutPorLlamadaMs) {
    return {
      debeDetener: true,
      tiempoRestante,
      razon: `Tiempo restante (${tiempoRestante}ms) < timeout requerido (${timeoutPorLlamadaMs}ms)`,
    };
  }
  
  return {
    debeDetener: false,
    tiempoRestante,
  };
}
