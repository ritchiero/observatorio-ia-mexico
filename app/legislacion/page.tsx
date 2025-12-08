import { getAdminDb } from '@/lib/firebase-admin';
import { IniciativaLegislativa } from '@/types';
import { AlertCircle } from 'lucide-react';
import LegislacionClient from './LegislacionClient';

export const revalidate = 0; // Deshabilitar cache

export default async function LegislacionPage() {
  let iniciativas: IniciativaLegislativa[] = [];
  let error: string | null = null;

  try {
    console.log('[SERVER] Fetching iniciativas from Firestore...');
    const db = getAdminDb();
    const snapshot = await db.collection('iniciativas').get();
    console.log('[SERVER] Snapshot size:', snapshot.size);
    
    iniciativas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as IniciativaLegislativa[];
    
    // Ordenar por fecha descendente (más recientes primero)
    iniciativas.sort((a, b) => {
      const dateA = typeof a.fecha === 'string' ? new Date(a.fecha).getTime() : a.fecha.toDate().getTime();
      const dateB = typeof b.fecha === 'string' ? new Date(b.fecha).getTime() : b.fecha.toDate().getTime();
      return dateB - dateA; // Descendente
    });
    
    console.log('[SERVER] Iniciativas fetched:', iniciativas.length);
  } catch (e: any) {
    console.error('[SERVER] Error fetching iniciativas:', e);
    error = e.message;
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
