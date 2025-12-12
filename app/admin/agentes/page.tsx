'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import type { 
  MasterConfig, 
  AgentConfig, 
  AgentUsageResponse,
  AgentRunResult,
  ExecutionMode,
  AgentType 
} from '@/types/agents';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

function AgentesContent() {
  const searchParams = useSearchParams();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado
  const [masterConfig, setMasterConfig] = useState<MasterConfig | null>(null);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>([]);
  const [usage, setUsage] = useState<AgentUsageResponse | null>(null);
  const [executingAgent, setExecutingAgent] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<AgentRunResult | null>(null);
  const [selectedMode, setSelectedMode] = useState<ExecutionMode>('test');

  const adminKey = searchParams.get('key') || '';

  // Verificar autorización
  useEffect(() => {
    if (adminKey) {
      setAuthorized(true);
      loadData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminKey]);

  // Cargar datos
  const loadData = useCallback(async () => {
    if (!adminKey) return;
    
    setLoading(true);
    setError(null);

    try {
      const [configRes, usageRes] = await Promise.all([
        fetch(`/api/admin/agentes/config?key=${adminKey}`),
        fetch(`/api/admin/agentes/usage?key=${adminKey}`),
      ]);

      if (!configRes.ok || !usageRes.ok) {
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
  }, [adminKey]);

  // Toggle master switch
  const toggleMaster = async () => {
    if (!masterConfig) return;

    try {
      const newEnabled = !masterConfig.enabled;
      const res = await fetch(`/api/admin/agentes/config?key=${adminKey}`, {
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

      if (res.ok) {
        setMasterConfig(prev => prev ? { ...prev, enabled: newEnabled } : null);
      }
    } catch (err) {
      console.error('Error toggling master:', err);
    }
  };

  // Cambiar modo
  const changeMode = async (mode: ExecutionMode) => {
    try {
      const res = await fetch(`/api/admin/agentes/config?key=${adminKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'master',
          data: { mode },
        }),
      });

      if (res.ok) {
        setMasterConfig(prev => prev ? { ...prev, mode } : null);
        setSelectedMode(mode);
      }
    } catch (err) {
      console.error('Error changing mode:', err);
    }
  };

  // Ejecutar agente
  const executeAgent = async (agentType: AgentType) => {
    setExecutingAgent(agentType);
    setLastRun(null);

    try {
      const res = await fetch(`/api/admin/agentes/execute?key=${adminKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentType,
          mode: selectedMode,
        }),
      });

      const data = await res.json();
      setLastRun(data.run);

      // Recargar métricas
      await loadData();
    } catch (err) {
      console.error('Error executing agent:', err);
    } finally {
      setExecutingAgent(null);
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Acceso Restringido</h1>
          <p className="text-gray-600">Agrega <code className="bg-gray-100 px-2 py-1 rounded">?key=TU_CLAVE</code> a la URL</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Agentes</h1>
          <p className="text-gray-600 mt-1">Gestión y monitoreo de agentes de IA</p>
        </div>

        {/* Master Switch */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Control Principal</h2>
              <p className="text-sm text-gray-600">
                {masterConfig?.enabled ? 'Sistema activo' : 'Sistema desactivado'}
              </p>
            </div>
            <button
              onClick={toggleMaster}
              className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                masterConfig?.enabled ? 'bg-green-500' : 'bg-gray-300'
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
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Modo de Ejecución</h3>
            <div className="flex gap-3">
              {(['test', 'preview', 'live'] as ExecutionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => changeMode(mode)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMode === mode
                      ? mode === 'test'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : mode === 'preview'
                        ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                        : 'bg-green-100 text-green-700 border-2 border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium text-gray-600">Hoy</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  ${usage.today.estimatedCostUsd.toFixed(4)}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  / ${usage.budgetStatus.dailyLimit.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    usage.budgetStatus.dailyPercentage > 80
                      ? 'bg-red-500'
                      : usage.budgetStatus.dailyPercentage > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usage.budgetStatus.dailyPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {usage.today.totalCalls} llamadas • {usage.today.totalTokens.toLocaleString()} tokens
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium text-gray-600">Este Mes</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  ${usage.budgetStatus.monthlyUsed.toFixed(2)}
                </span>
                <span className="text-gray-500 text-sm ml-2">
                  / ${usage.budgetStatus.monthlyLimit.toFixed(2)}
                </span>
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    usage.budgetStatus.monthlyPercentage > 80
                      ? 'bg-red-500'
                      : usage.budgetStatus.monthlyPercentage > 50
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(usage.budgetStatus.monthlyPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {usage.budgetStatus.monthlyPercentage}% del presupuesto
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium text-gray-600">Últimas Llamadas</h3>
              <div className="mt-2">
                <span className="text-2xl font-bold text-gray-900">
                  {usage.recentCalls.length}
                </span>
                <span className="text-gray-500 text-sm ml-2">recientes</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {usage.recentCalls.filter(c => c.success).length} exitosas,{' '}
                {usage.recentCalls.filter(c => !c.success).length} con error
              </p>
            </div>
          </div>
        )}

        {/* Lista de Agentes */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden mb-6">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Agentes</h2>
          </div>
          <div className="divide-y">
            {agentConfigs.map((agent) => (
              <div key={agent.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">{agent.name}</h3>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        agent.enabled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {agent.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{agent.description}</p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
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
                  disabled={executingAgent !== null}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    executingAgent === agent.id
                      ? 'bg-gray-200 text-gray-500 cursor-wait'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {executingAgent === agent.id ? 'Ejecutando...' : 'Ejecutar'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Resultado de última ejecución */}
        {lastRun && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Resultado de Ejecución
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-sm rounded ${
                    lastRun.status === 'success'
                      ? 'bg-green-100 text-green-700'
                      : lastRun.status === 'error'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {lastRun.status === 'success' ? '✓ Éxito' : lastRun.status === 'error' ? '✗ Error' : '⏳ Ejecutando'}
                </span>
                <span className="text-sm text-gray-500">
                  Modo: {lastRun.mode}
                </span>
              </div>

              {lastRun.error && (
                <div className="bg-red-50 text-red-600 p-3 rounded text-sm">
                  {lastRun.error}
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Items encontrados:</span>
                  <span className="ml-2 font-medium">{lastRun.itemsFound}</span>
                </div>
                <div>
                  <span className="text-gray-500">Llamadas API:</span>
                  <span className="ml-2 font-medium">{lastRun.apiCalls}</span>
                </div>
                <div>
                  <span className="text-gray-500">Tokens:</span>
                  <span className="ml-2 font-medium">{lastRun.totalTokens.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Costo:</span>
                  <span className="ml-2 font-medium">${lastRun.estimatedCostUsd.toFixed(4)}</span>
                </div>
              </div>

              {/* Preview de resultados */}
              {lastRun.results && lastRun.results.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Resultados ({lastRun.results.length}):
                  </h3>
                  <div className="space-y-2">
                    {lastRun.results.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 p-3 rounded text-sm"
                      >
                        <div className="font-medium text-gray-900">{item.title}</div>
                        <div className="text-gray-600 mt-1">{item.preview}</div>
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
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900">Historial de Llamadas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-gray-600">Hora</th>
                    <th className="px-4 py-3 text-left text-gray-600">Agente</th>
                    <th className="px-4 py-3 text-left text-gray-600">Modo</th>
                    <th className="px-4 py-3 text-right text-gray-600">Tokens</th>
                    <th className="px-4 py-3 text-right text-gray-600">Costo</th>
                    <th className="px-4 py-3 text-center text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
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
                              ? 'bg-blue-100 text-blue-700'
                              : call.mode === 'preview'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
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
                          <span className="text-green-600">✓</span>
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

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <a href={`/admin?key=${adminKey}`} className="text-blue-600 hover:underline">
            ← Volver a Admin General
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AgentesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Cargando...</div>}>
      <AgentesContent />
    </Suspense>
  );
}
