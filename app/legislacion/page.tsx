'use client';

import { useEffect, useState } from 'react';
import { IniciativaLegislativa } from '@/types';
import { AlertCircle } from 'lucide-react';
import LegislacionClient from './LegislacionClient';

export default function LegislacionPage() {
  const [iniciativas, setIniciativas] = useState<IniciativaLegislativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIniciativas() {
      try {
        console.log('[CLIENT] Fetching iniciativas from API...');
        const response = await fetch('/api/iniciativas');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Error fetching iniciativas');
        }
        
        console.log('[CLIENT] Iniciativas fetched:', result.count);
        setIniciativas(result.data);
      } catch (e: any) {
        console.error('[CLIENT] Error fetching iniciativas:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchIniciativas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Cargando iniciativas...
          </h2>
          <p className="text-gray-600">
            Obteniendo datos del servidor
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Error cargando iniciativas
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Por favor contacta al administrador del sitio.
          </p>
        </div>
      </div>
    );
  }

  return <LegislacionClient iniciativas={iniciativas} />;
}
