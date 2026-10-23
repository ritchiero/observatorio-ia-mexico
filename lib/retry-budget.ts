/**
 * Helper puro para calcular presupuesto de retry
 * Separado para testing sin dependencias de Anthropic SDK
 */
export function calculateRetryBudget(options: {
  now: number;
  deadline?: number;
  attempt: number;
  initialDelayMs: number;
  timeoutMs?: number;
}): { canRetry: boolean; delay: number; reason?: string } {
  const { now, deadline, attempt, initialDelayMs, timeoutMs } = options;
  
  const delay = initialDelayMs * Math.pow(2, attempt);
  
  if (!deadline) {
    return { canRetry: true, delay };
  }
  
  const timeLeft = deadline - now;
  const timeNeededForRetry = delay + (timeoutMs || 30_000);
  
  if (timeLeft < delay) {
    return {
      canRetry: false,
      delay,
      reason: `No hay presupuesto para backoff (${delay}ms > ${timeLeft}ms restantes)`,
    };
  }
  
  if (timeLeft < timeNeededForRetry) {
    return {
      canRetry: false,
      delay,
      reason: `No hay presupuesto para intento completo (${timeNeededForRetry}ms > ${timeLeft}ms restantes)`,
    };
  }
  
  return { canRetry: true, delay };
}
