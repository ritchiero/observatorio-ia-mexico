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
  const settled = await Promise.allSettled(
    AGENTS.map((agente) =>
      fetch(`${base}/api/cron/${agente}`, {
        headers: { Authorization: `Bearer ${secret}` },
        cache: 'no-store',
      }).then(async (response) => {
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
      }),
    ),
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
