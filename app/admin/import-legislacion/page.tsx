'use client';

import { useState } from 'react';
import Link from 'next/link';
import iniciativasData from '@/iniciativas-final.json';

const BATCH_SIZE = 20;

export default function ImportLegislacionPage() {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [completed, setCompleted] = useState(false);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const importIniciativas = async () => {
    setImporting(true);
    setLog([]);
    setProgress(0);
    
    addLog(`Iniciando importación de ${iniciativasData.length} iniciativas...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < iniciativasData.length; i += BATCH_SIZE) {
      const batch = iniciativasData.slice(i, i + BATCH_SIZE);
      try {
        const response = await fetch('/api/admin/import-iniciativas', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ iniciativas: batch }),
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || `Error HTTP ${response.status}`);
        }

        successCount += Number(result.imported ?? 0);
        errorCount += Number(result.errors ?? 0);
        for (const item of result.results ?? []) {
          addLog(
            item.status === 'success'
              ? `✅ ${item.titulo || item.id} importada`
              : `❌ ${item.titulo || item.id}: ${item.error || 'Error desconocido'}`
          );
        }
      } catch (error: unknown) {
        errorCount += batch.length;
        addLog(
          `❌ Error en lote ${Math.floor(i / BATCH_SIZE) + 1}: ${
            error instanceof Error ? error.message : 'Error desconocido'
          }`
        );
      }

      setProgress(Math.round((Math.min(i + BATCH_SIZE, iniciativasData.length) / iniciativasData.length) * 100));
    }
    
    addLog(`\n📈 Resumen:`);
    addLog(`   ✅ Exitosas: ${successCount}`);
    addLog(`   ❌ Errores: ${errorCount}`);
    
    setImporting(false);
    setCompleted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-sm p-8">
          <h1 className="font-serif text-3xl text-gray-900 mb-4">
            Importar Iniciativas Legislativas
          </h1>
          
          <p className="text-gray-600 mb-6">
            Este script importará las {iniciativasData.length} iniciativas legislativas a Firestore.
          </p>
          
          {!importing && !completed && (
            <button
              onClick={importIniciativas}
              className="px-6 py-3 bg-blue-500 text-white rounded-sm hover:bg-blue-600 transition-colors"
            >
              Iniciar Importación
            </button>
          )}
          
          {importing && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progreso</span>
                <span className="text-sm font-semibold text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {completed && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm">
              <p className="text-green-700 font-semibold">✅ Importación completada</p>
              <Link
                href="/legislacion"
                className="text-blue-500 hover:underline mt-2 inline-block"
              >
                Ver iniciativas →
              </Link>
            </div>
          )}
          
          {log.length > 0 && (
            <div className="mt-6">
              <h2 className="font-sans text-sm uppercase tracking-wider text-gray-500 mb-2">
                Log de Importación
              </h2>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-sm font-mono text-xs max-h-96 overflow-y-auto">
                {log.map((line, index) => (
                  <div key={index} className="mb-1">
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
