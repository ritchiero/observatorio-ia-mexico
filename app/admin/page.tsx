'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
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
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 font-sans-tech">
                Panel de Administración
              </h1>
              <p className="text-gray-500 text-sm mt-1">Gestión del Observatorio de IA</p>
            </div>
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navegación rápida */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link
            href="/admin/agentes"
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">🤖</span>
            </div>
            <div className="font-semibold text-gray-900 group-hover:text-blue-600">Agentes IA</div>
            <div className="text-sm text-gray-500 mt-1">Control y métricas</div>
          </Link>
          <Link
            href="/admin/anuncios"
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">📢</span>
            </div>
            <div className="font-semibold text-gray-900 group-hover:text-blue-600">Anuncios</div>
            <div className="text-sm text-gray-500 mt-1">Gestionar contenido</div>
          </Link>
          <Link
            href="/admin/dashboard"
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">📊</span>
            </div>
            <div className="font-semibold text-gray-900 group-hover:text-blue-600">Dashboard</div>
            <div className="text-sm text-gray-500 mt-1">Legislación</div>
          </Link>
          <Link
            href="/admin/suscripciones"
            className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
              <span className="text-xl">📧</span>
            </div>
            <div className="font-semibold text-gray-900 group-hover:text-blue-600">Suscripciones</div>
            <div className="text-sm text-gray-500 mt-1">Lista de emails</div>
          </Link>
        </section>

        {/* Ejecutar agentes */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">🔍</span>
            Ejecutar Agentes Manualmente
          </h2>
          <div className="flex gap-4">
            <button
              onClick={ejecutarDeteccion}
              disabled={detectLoading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {detectLoading ? 'Ejecutando...' : '🔍 Ejecutar Detección'}
            </button>
            <button
              onClick={ejecutarMonitoreo}
              disabled={monitorLoading}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {monitorLoading ? 'Ejecutando...' : '📡 Ejecutar Monitoreo'}
            </button>
          </div>
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              message.startsWith('✅') 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}
        </section>

        {/* Agregar anuncio manualmente */}
        <section className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">📝</span>
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
      <div className="flex justify-center items-center min-h-screen bg-[#F8F9FA]">
        <div className="text-gray-500 flex items-center gap-2">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
