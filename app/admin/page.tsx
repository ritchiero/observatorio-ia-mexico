'use client';

import { useState, Suspense } from 'react';
import AdminForm from '@/components/AdminForm';

function AdminContent() {
  const [detectLoading, setDetectLoading] = useState(false);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [message, setMessage] = useState('');

  const ejecutarDeteccion = async () => {
    setDetectLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/agents/detect', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setMessage(`✅ Detección completada. ${data.anunciosEncontrados} nuevo(s) anuncio(s) encontrado(s).`);
      } else {
        setMessage(`❌ Error: ${data.errores?.join(', ') || 'Error desconocido'}`);
      }
    } catch {
      setMessage('❌ Error de conexión');
    } finally {
      setDetectLoading(false);
    }
  };

  const ejecutarMonitoreo = async () => {
    setMonitorLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/agents/monitor', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setMessage(`✅ Monitoreo completado. ${data.actualizacionesDetectadas} actualización(es) detectada(s).`);
      } else {
        setMessage(`❌ Error: ${data.errores?.join(', ') || 'Error desconocido'}`);
      }
    } catch {
      setMessage('❌ Error de conexión');
    } finally {
      setMonitorLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <span className="text-cyan-400">⚙️</span>
          Panel de Administración
        </h1>

        {/* Navegación rápida */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/agentes"
            className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-xl hover:from-emerald-400 hover:to-teal-500 transition-all group"
          >
            <div className="text-2xl mb-2">🤖</div>
            <div className="font-semibold">Agentes IA</div>
            <div className="text-sm opacity-80">Control y métricas</div>
          </a>
          <a
            href="/admin/anuncios"
            className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 rounded-xl hover:from-blue-400 hover:to-indigo-500 transition-all group"
          >
            <div className="text-2xl mb-2">📢</div>
            <div className="font-semibold">Anuncios</div>
            <div className="text-sm opacity-80">Gestionar contenido</div>
          </a>
          <a
            href="/admin/dashboard"
            className="bg-gradient-to-br from-purple-500 to-pink-600 text-white p-4 rounded-xl hover:from-purple-400 hover:to-pink-500 transition-all group"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold">Dashboard</div>
            <div className="text-sm opacity-80">Legislación</div>
          </a>
          <a
            href="/admin/suscripciones"
            className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 rounded-xl hover:from-amber-400 hover:to-orange-500 transition-all group"
          >
            <div className="text-2xl mb-2">📧</div>
            <div className="font-semibold">Suscripciones</div>
            <div className="text-sm opacity-80">Lista de emails</div>
          </a>
        </section>

        {/* Ejecutar agentes */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-cyan-400">🤖</span>
            Ejecutar Agentes Manualmente
          </h2>
          <div className="flex gap-4">
            <button
              onClick={ejecutarDeteccion}
              disabled={detectLoading}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 text-gray-900 py-3 rounded-lg font-medium hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {detectLoading ? 'Ejecutando...' : '🔍 Ejecutar Detección'}
            </button>
            <button
              onClick={ejecutarMonitoreo}
              disabled={monitorLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-gray-900 py-3 rounded-lg font-medium hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {monitorLoading ? 'Ejecutando...' : '📡 Ejecutar Monitoreo'}
            </button>
          </div>
          {message && (
            <div className="mt-4 p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-200">
              {message}
            </div>
          )}
        </section>

        {/* Agregar anuncio manualmente */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-cyan-400">📝</span>
            Agregar Anuncio Manualmente
          </h2>
          <AdminForm />
        </section>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px] bg-gray-950">
        <div className="text-xl text-gray-400 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-cyan-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando...
        </div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
