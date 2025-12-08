import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IniciativaLegislativa, IniciativaStatus } from '@/types';
import { FileText, Scale, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import LegislacionClient from './LegislacionClient';

export const revalidate = 0; // Deshabilitar cache

export default async function LegislacionPage() {
  let iniciativas: IniciativaLegislativa[] = [];
  let error: string | null = null;

  try {
    console.log('[SERVER] Fetching iniciativas...');
    const snapshot = await getDocs(collection(db, 'iniciativas'));
    console.log('[SERVER] Snapshot size:', snapshot.size);
    iniciativas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as IniciativaLegislativa[];
    console.log('[SERVER] Iniciativas fetched:', iniciativas.length);
  } catch (e: any) {
    console.error('[SERVER] Error fetching iniciativas:', e);
    error = e.message;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Error cargando iniciativas</div>
          <div className="text-sm text-gray-600">{error}</div>
        </div>
      </div>
    );
  }

  return <LegislacionClient iniciativas={iniciativas} />;
}
