/**
 * Clasificador puro de errores de abort para distinguir timeout propio de abort externo
 * Separado para testing sin dependencias del SDK
 */
import type Anthropic from '@anthropic-ai/sdk';

export interface AbortErrorClassification {
  isAbort: boolean;
  type: 'TimeoutError' | 'ExternalAbortError' | null;
  name: string;
  code: string;
  message: string;
  elapsed: number;
  timeoutMs?: number;
  abortedByOurTimer: boolean;
  signalReason?: unknown;
}

export function clasificarErrorAbort(
  error: unknown,
  context: {
    abortedByOurTimer: boolean;
    elapsed: number;
    timeoutMs?: number;
    signalAborted?: boolean;
    signalReason?: unknown;
  }
): AbortErrorClassification {
  const { abortedByOurTimer, elapsed, timeoutMs, signalAborted, signalReason } = context;

  // Detectar si es un abort: APIUserAbortError, AbortError genérico, o signal aborted
  const isAPIUserAbortError = error && typeof error === 'object' && error.constructor.name === 'APIUserAbortError';
  const isGenericAbortError = error instanceof Error && error.name === 'AbortError';
  const isAbort = isAPIUserAbortError || isGenericAbortError || signalAborted === true;

  if (!isAbort) {
    return {
      isAbort: false,
      type: null,
      name: error instanceof Error ? error.name : 'Unknown',
      code: 'NOT_ABORT',
      message: error instanceof Error ? error.message : String(error),
      elapsed,
      timeoutMs,
      abortedByOurTimer: false,
    };
  }

  // Es un abort: clasificar si fue nuestro timer o externo
  if (abortedByOurTimer) {
    // Fue nuestro setTimeout → TimeoutError
    return {
      isAbort: true,
      type: 'TimeoutError',
      name: 'TimeoutError',
      code: 'TIMEOUT',
      message: `TimeoutError tras ${elapsed}ms (timeout ${timeoutMs}ms)`,
      elapsed,
      timeoutMs,
      abortedByOurTimer: true,
    };
  } else {
    // Abort externo (no fue nuestro timer) → ExternalAbortError
    return {
      isAbort: true,
      type: 'ExternalAbortError',
      name: 'ExternalAbortError',
      code: 'EXTERNAL_ABORT',
      message: `ExternalAbortError tras ${elapsed}ms (timeout configurado: ${timeoutMs}ms)`,
      elapsed,
      timeoutMs,
      abortedByOurTimer: false,
      signalReason,
    };
  }
}
