'use client';

import { useEffect, useState } from 'react';
import { IniciativaLegislativa } from '@/types';
import { AlertCircle } from 'lucide-react';
import LegislacionClientEn from '@/app/legislacion/LegislacionClientEn';

export default function LegislacionPageEn() {
  const [iniciativas, setIniciativas] = useState<IniciativaLegislativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchIniciativas() {
      try {
        console.log('[CLIENT] Fetching bills from API...');
        const response = await fetch('/api/iniciativas');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Error fetching bills');
        }

        console.log('[CLIENT] Bills fetched:', result.count);
        setIniciativas(result.data);
      } catch (e: any) {
        console.error('[CLIENT] Error fetching bills:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchIniciativas();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
          </div>
          <h1 className="text-2xl font-serif-display font-light text-gray-900 mb-2">
            AI <span className="italic text-blue-500">legislation</span>
          </h1>
          <p className="text-gray-600 font-sans-tech text-sm">
            Loading bills · fetching data from the server
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-serif-display font-light text-gray-900 mb-2">
            Error loading bills
          </h2>
          <p className="text-gray-600 font-sans-tech mb-4">{error}</p>
          <p className="text-sm text-gray-400 font-sans-tech">
            Please contact the site administrator.
          </p>
        </div>
      </div>
    );
  }

  return <LegislacionClientEn iniciativas={iniciativas} />;
}
