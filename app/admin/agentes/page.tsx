'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { 
  MasterConfig, 
  AgentConfig, 
  AgentUsageResponse,
  AgentRunResult,
  ExecutionMode,
  AgentType 
} from '@/types/agents';

function AgentesContent() {
  const router = useRouter();
  const { status } = useSession();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [masterConfig, setMasterConfig] = useState<MasterConfig | null>(null);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
  const [usage, setUsage] = useState<AgentUsageResponse | null>(null);
  const [executingAgent, setExecutingAgent] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<AgentRunResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<ExecutionMode>('test');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [configRes, usageRes] = await Promise.all([
        fetch('/api/admin/agentes/config'),
        fetch('/api/admin/agentes/usage'),
      ]);

      if (!configRes.ok || !usageRes.ok) {
        if (configRes.status === 401 || usageRes.status === 401) {
          router.replace('/admin/login');
          return;
        }
        throw new Error('Error al cargar datos');
      }

      const configData = await configRes.json();
      const usageData = await usageRes.json();

      setMasterConfig(configData.master);
      setAgentConfigs(configData.agents);
      setUsage(usageData);
      setSelectedMode(configData.master.mode || 'test');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/login');
      return;
    }
    if (status === 'authenticated') {
      loadData();
    }
  }, [status, router, loadData]);

  const toggleMaster = async () => {
    if (!masterConfig) return;

    try {
      const newEnabled = !masterConfig.enabled;
      const res = await fetch('/api/admin/agentes/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'master',
          data: { 
            enabled: newEnabled,
            status: newEnabled ? 'active' : 'disabled',
          },
        }),
      });

      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (res.ok) {
        setMasterConfig(prev => prev ? { ...prev, enabled: newEnabled } : null);
      }
    } catch (err) {
      console.error('Error toggling master:', err);
    }
  };

  const changeMode = async (mode: ExecutionMode) => {
    try {
      const res = await fetch('/api/admin/agentes/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'master',
          data: { mode },
        }),
      });

      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      if (res.ok) {
        setMasterConfig(prev => prev ? { ...prev, mode } : null);
        setSelectedMode(mode);
      }
    } catch (err) {
      console.error('Error changing mode:', err);
    }
  };

  const executeAgent = async (agentType: AgentType) => {
    setExecutingAgent(agentType);
    setLastRun(null);

    try {
      const res = await fetch('/api/admin/agentes/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          mode: selectedMode,
        }),
      });

      if (res.status === 401) {
        router.replace('/admin/login');
        return;
      }
      const data = await res.json();
      setLastRun(data.run);
      await loadData();
    } catch (err) {
      console.error('Error executing agent:', err);
    } finally {
      setExecutingAgent(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 font-sans-tech">
                Panel de Agentes IA
              </h1>
              <p className="text-gray-500 text-sm mt-1">Gestión y monitoreo de agentes de IA</p>
            </div>
            <Link 
              href="/admin"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Volver a Admin
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Master Switch */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Control Principal</h2>
              <p className="text-sm text-gray-500 mt-1">
                {masterConfig?.enabled ? 'Sistema activo' : 'Sistema desactivado'}
              </p>
            </div>
            <button
              onClick={toggleMaster}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                masterConfig?.enabled ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition-transform ${
                  masterConfig?.enabled ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Modo de Ejecución */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Modo de Ejecución</h3>
            <div className="flex gap-3">
              {(['test', 'preview', 'live'] as ExecutionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => changeMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
                    selectedMode === mode
                      ? mode === 'test'
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : mode === 'preview'
                        ? 'bg-amber-50 text-amber-700 border-amber-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {mode === 'test' && '🧪 Test (Mock)'}
                  {mode === 'preview' && '👁️ Preview'}
                  {mode === 'live' && '🚀 Live'}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedMode === 'test' && 'No llama a Claude, usa datos de prueba ($0)'}
              {selectedMode === 'preview' && 'Llama a Claude pero no guarda en base de datos'}
              {selectedMode === 'live' && 'Ejecución real, guarda en cola de revisión'}
            </p>
          </div>
        </div>

        {/* Métricas de Uso */}
        {usage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-500">Hoy</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  ${usage.today.estimatedCostUsd.toFixed(4)}
                </span>
                <span className="text-gray-400 text-sm ml-2">
                  / ${usage.budgetStatus.dailyLimit.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    usage.budgetStatus.dailyPercentage > 80
                      ? 'bg-red-500'
                      : usage.budgetStatus.dailyPercentage > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usage.budgetStatus.dailyPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {usage.today.totalCalls} llamadas • {usage.today.totalTokens.toLocaleString()} tokens
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-500">Este Mes</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  ${usage.budgetStatus.monthlyUsed.toFixed(2)}
                </span>
                <span className="text-gray-400 text-sm ml-2">
                  / ${usage.budgetStatus.monthlyLimit.toFixed(2)}
                </span>
              </div>
              <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    usage.budgetStatus.monthlyPercentage > 80
                      ? 'bg-red-500'
                      : usage.budgetStatus.monthlyPercentage > 50
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(usage.budgetStatus.monthlyPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {usage.budgetStatus.monthlyPercentage}% del presupuesto
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h3 className="text-sm font-medium text-gray-500">Últimas Llamadas</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  {usage.recentCalls.length}
                </span>
                <span className="text-gray-400 text-sm ml-2">recientes</span>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                {usage.recentCalls.filter(c => c.success).length} exitosas,{' '}
                {usage.recentCalls.filter(c => !c.success).length} con error
              </p>
            </div>
          </div>
        )}

        {/* Lista de Agentes */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Agentes</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {agentConfigs.map((agent) => (
              <div key={agent.id} className="p-5 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        agent.enabled
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {agent.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{agent.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-400">
                    <span>Modelo: {agent.model.split('-').slice(-2, -1)[0]}</span>
                    <span>Max: {agent.maxItemsPerRun} items</span>
                    {agent.lastRunAt && (
                      <span>
                        Último: {new Date(agent.lastRunAt).toLocaleString('es-MX')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => executeAgent(agent.id as AgentType)}
                  disabled={
                    executingAgent !== null ||
                    !agent.enabled ||
                    (agent.id !== 'detection' && agent.id !== 'monitoring')
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !agent.enabled || (agent.id !== 'detection' && agent.id !== 'monitoring')
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : executingAgent === agent.id
                      ? 'bg-gray-100 text-gray-400 cursor-wait'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {!agent.enabled
                    ? 'Inactivo'
                    : agent.id !== 'detection' && agent.id !== 'monitoring'
                    ? 'No implementado'
                    : executingAgent === agent.id
                    ? 'Ejecutando...'
                    : 'Ejecutar'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resultado de última ejecución */}
        {lastRun && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resultado de Ejecución
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-sm rounded ${
                    lastRun.status === 'success'
                      ? 'bg-emerald-50 text-emerald-700'
                      : lastRun.status === 'error'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {lastRun.status === 'success' ? '✓ Éxito' : lastRun.status === 'error' ? '✗ Error' : '⏳ Ejecutando'}
                </span>
                <span className="text-sm text-gray-500">
                  Modo: {lastRun.mode}
                </span>
              </div>

              {lastRun.error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                  {lastRun.error}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Items encontrados:</span>
                  <span className="ml-2 font-medium text-gray-900">{lastRun.itemsFound}</span>
                </div>
                <div>
                  <span className="text-gray-500">Llamadas API:</span>
                  <span className="ml-2 font-medium text-gray-900">{lastRun.apiCalls}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tokens:</span>
                  <span className="ml-2 font-medium text-gray-900">{lastRun.totalTokens.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Costo:</span>
                  <span className="ml-2 font-medium text-gray-900">${lastRun.estimatedCostUsd.toFixed(4)}</span>
                </div>
              </div>

              {lastRun.results && lastRun.results.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Resultados ({lastRun.results.length}):
                  </h3>
                  <div className="space-y-2">
                    {lastRun.results.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100"
                      >
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-gray-500 mt-1">{item.preview}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Historial de llamadas recientes */}
        {usage && usage.recentCalls.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Historial de Llamadas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Hora</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Agente</th>
                    <th className="px-4 py-3 text-left text-gray-500 font-medium">Modo</th>
                    <th className="px-4 py-3 text-right text-gray-500 font-medium">Tokens</th>
                    <th className="px-4 py-3 text-right text-gray-500 font-medium">Costo</th>
                    <th className="px-4 py-3 text-center text-gray-500 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usage.recentCalls.slice(0, 10).map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(call.timestamp).toLocaleTimeString('es-MX')}
                      </td>
                      <td className="px-4 py-3 text-gray-900">{call.agentType}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 text-xs rounded ${
                            call.mode === 'test'
                              ? 'bg-blue-50 text-blue-700'
                              : call.mode === 'preview'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {call.mode}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {call.usage.totalTokens.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        ${call.estimatedCostUsd.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {call.success ? (
                          <span className="text-emerald-600">✓</span>
                        ) : (
                          <span className="text-red-600" title={call.error}>✗</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      </div>
    }>
      <AgentesContent />
    </Suspense>
  );
}
