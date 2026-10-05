export type ConsolidatedAgentResult = {
  agente: string;
  ok?: boolean;
  partial?: boolean;
  status?: number;
  error?: string;
};

const AGENTS = ['deteccion', 'legislacion', 'casos', 'monitoreo'] as const;

export function getCurrentDeploymentOrigin(requestUrl: string) {
  const deploymentHost = process.env.VERCEL_URL?.trim();
  if (deploymentHost) {
    return deploymentHost.startsWith('http://') || deploymentHost.startsWith('https://')
      ? new URL(deploymentHost).origin
      : `https://${deploymentHost}`;
  }

  return new URL(requestUrl).origin;
}

export async function runConsolidatedAgents(base: string, secret: string) {
  // Timeout por sub-ruta: 290s para dar margen antes del maxDuration de 300s
  const SUB_ROUTE_TIMEOUT_MS = 290_000;
  
  const fetchWithTimeout = async (agente: typeof AGENTS[number]): Promise<ConsolidatedAgentResult> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SUB_ROUTE_TIMEOUT_MS);
    
    try {
      const response = await fetch(`${base}/api/cron/${agente}`, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: 'no-store',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      const body = await response.json().catch(() => null) as {
        success?: boolean;
        partial?: boolean;
      } | null;

      return {
        agente,
        ok: response.ok && body?.success !== false,
        partial: body?.partial === true,
        status: response.status,
      } satisfies ConsolidatedAgentResult;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return {
          agente,
          error: `Timeout después de ${SUB_ROUTE_TIMEOUT_MS}ms`,
        };
      }
      throw error;
    }
  };
  
  const settled = await Promise.allSettled(
    AGENTS.map(fetchWithTimeout),
  );

  const resultados: ConsolidatedAgentResult[] = settled.map((result, index) =>
    result.status === 'fulfilled'
      ? result.value
      : {
          agente: AGENTS[index],
          error: result.reason instanceof Error ? result.reason.message : String(result.reason),
        },
  );
  const ok = resultados.every((resultado) => resultado.ok === true);

  console.log('[CRON todo] corrida consolidada:', JSON.stringify(resultados));

  return {
    ok,
    corridaConsolidada: true,
    agentes: [...AGENTS],
    resultados,
  };
}
