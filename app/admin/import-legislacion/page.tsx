'use client';

import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import iniciativasData from '@/iniciativas-final.json';

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
    
    for (let i = 0; i < iniciativasData.length; i++) {
      const iniciativa = iniciativasData[i];
      
      try {
        // Convertir fecha ISO string a Timestamp
        const fecha = Timestamp.fromDate(new Date(iniciativa.fecha));
        
        // Convertir eventos
        const eventos = iniciativa.eventos.map((evento: any) => ({
          ...evento,
          fecha: Timestamp.fromDate(new Date(evento.fecha))
        }));
        
        // Preparar documento
        const docData = {
          ...iniciativa,
          fecha,
          eventos,
          creadoManualmente: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        
        // Agregar a Firestore
        await addDoc(collection(db, 'iniciativas'), docData);
        
        successCount++;
        setProgress(Math.round(((i + 1) / iniciativasData.length) * 100));
        addLog(`✅ Iniciativa #${iniciativa.numero} importada (${successCount}/${iniciativasData.length})`);
        
      } catch (error: any) {
        errorCount++;
        addLog(`❌ Error en iniciativa #${iniciativa.numero}: ${error.message}`);
      }
      
      // Pequeña pausa para no saturar
      await new Promise(resolve => setTimeout(resolve, 100));
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
              <a
                href="/legislacion"
                className="text-blue-500 hover:underline mt-2 inline-block"
              >
                Ver iniciativas →
              </a>
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
