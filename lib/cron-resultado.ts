// Evaluación de una corrida consolidada de agentes.
//
// El contrato anterior de /api/cron/todo miraba SOLO `r.ok` (el HTTP) y devolvía
// `ok: true` incondicionalmente. Eso es insuficiente y fue la causa de que el
// apagón de jul-ago 2026 pasara 20 corridas inadvertido: los agentes NO lanzan
// cuando fallan — `ejecutarAgenteDeteccion` atrapa el error y devuelve
// `{ success: false, errores: [...] }` con **HTTP 200**. Un orquestador que sólo
// lee el status ve 200 y canta victoria.
//
// Aquí el veredicto se deriva del CUERPO de cada respuesta, no del transporte.

export interface RespuestaAgente {
  agente: string;
  /** false si el fetch mismo falló (red, timeout) */
  alcanzado: boolean;
  status?: number;
  httpOk?: boolean;
  cuerpo?: unknown;
  errorRed?: string;
}

export type EstadoAgente = 'ok' | 'fallo' | 'indeterminado';

export interface EvaluacionAgente {
  agente: string;
  estado: EstadoAgente;
  motivo: string;
  /** resultado semántico: cuántos objetos produjo la corrida */
  hallazgos: number | null;
  errores: string[];
}

export interface EvaluacionCorrida {
  ok: boolean;
  agentes: EvaluacionAgente[];
  fallidos: string[];
  /** total de objetos nuevos/actualizados en toda la corrida */
  hallazgosTotales: number;
  resumen: string;
}

const CLAVES_HALLAZGO = [
  'anunciosEncontrados',
  'iniciativasEncontradas',
  'casosEncontrados',
  'actualizacionesDetectadas',
] as const;

function obj(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;
}

/** Suma los contadores semánticos que reporta el agente (null si no reporta ninguno). */
export function hallazgosDe(cuerpo: unknown): number | null {
  const c = obj(cuerpo);
  if (!c) return null;
  let total: number | null = null;
  for (const k of CLAVES_HALLAZGO) {
    const v = c[k];
    if (typeof v === 'number' && Number.isFinite(v)) total = (total ?? 0) + v;
  }
  return total;
}

export function evaluarAgente(r: RespuestaAgente): EvaluacionAgente {
  const base = { agente: r.agente, hallazgos: null as number | null, errores: [] as string[] };

  if (!r.alcanzado) {
    return { ...base, estado: 'fallo', motivo: r.errorRed || 'no se pudo invocar al agente' };
  }

  const c = obj(r.cuerpo);
  const errores = Array.isArray(c?.errores) ? (c!.errores as unknown[]).map(String) : [];
  const hallazgos = hallazgosDe(r.cuerpo);

  if (r.httpOk === false) {
    const detalle = typeof c?.detalle === 'string' ? c.detalle : `HTTP ${r.status ?? '?'}`;
    return { ...base, estado: 'fallo', motivo: detalle, errores, hallazgos };
  }

  // El caso que rompía todo: HTTP 200 con success:false.
  if (c && c.success === false) {
    return {
      ...base,
      estado: 'fallo',
      motivo: errores[0] || 'el agente reportó success:false',
      errores,
      hallazgos,
    };
  }

  if (!c || c.success === undefined) {
    return {
      ...base,
      estado: 'indeterminado',
      motivo: 'la respuesta no declara `success`',
      errores,
      hallazgos,
    };
  }

  return {
    ...base,
    estado: 'ok',
    motivo: hallazgos === null ? 'sin contador de hallazgos' : `${hallazgos} objeto(s)`,
    errores,
    hallazgos,
  };
}

export function evaluarCorrida(respuestas: RespuestaAgente[]): EvaluacionCorrida {
  const agentes = respuestas.map(evaluarAgente);
  const fallidos = agentes.filter((a) => a.estado !== 'ok').map((a) => a.agente);
  const hallazgosTotales = agentes.reduce((n, a) => n + (a.hallazgos ?? 0), 0);
  const partes = agentes.map((a) => {
    if (a.estado === 'ok') return `${a.agente}: ${a.hallazgos ?? 0}`;
    return `${a.agente}: ${a.estado.toUpperCase()} (${a.motivo})`;
  });
  return {
    ok: fallidos.length === 0,
    agentes,
    fallidos,
    hallazgosTotales,
    resumen: partes.join(' · '),
  };
}
