'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminForm from '@/components/AdminForm';

function AdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [detectLoading, setDetectLoading] = useState(false);
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const key = searchParams.get('key');
    // En producción, esto debería compararse con una variable de entorno
    // Por ahora, aceptamos cualquier key para desarrollo
    if (key) {
      setAuthorized(true);
    } else {
      setAuthorized(false);
    }
  }, [searchParams]);

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

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Acceso Restringido
        </h1>
        <p className="text-gray-600 mb-6">
          Necesitas una clave de acceso para ver esta página.
        </p>
        <button
          onClick={() => router.push('/')}
          className="text-blue-600 hover:underline"
        >
          ← Volver al inicio
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">
        Panel de Administración
      </h1>

      {/* Ejecutar agentes */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Ejecutar Agentes Manualmente
        </h2>
        <div className="flex gap-4">
          <button
            onClick={ejecutarDeteccion}
            disabled={detectLoading}
            className="flex-1 bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {detectLoading ? 'Ejecutando...' : 'Ejecutar Detección'}
          </button>
          <button
            onClick={ejecutarMonitoreo}
            disabled={monitorLoading}
            className="flex-1 bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {monitorLoading ? 'Ejecutando...' : 'Ejecutar Monitoreo'}
          </button>
        </div>
        {message && (
          <div className="mt-4 p-3 rounded-md bg-gray-100 text-gray-900">
            {message}
          </div>
        )}
      </section>

      {/* Agregar anuncio manualmente */}
      <section className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Agregar Anuncio Manualmente
        </h2>
        <AdminForm />
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-xl text-gray-600">Cargando...</div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  );
}
