import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
          const db = getAdminDb();
          const snapshot = await db.collection('recapsMensuales')
            .orderBy('anio', 'desc')
            .orderBy('mes', 'desc')
            .limit(12)
            .get();

      const recaps = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                        id: data.id,
                        mes: data.mes,
                        anio: data.anio,
                        mesLabel: data.mesLabel,
                        titulo: data.titulo,
                        subtitulo: data.subtitulo,
                        contenido: data.contenido,
                        datosClave: data.datosClave,
                        veredicto: data.veredicto,
                        statsSnapshot: data.statsSnapshot,
                        fuentesConsultadas: data.fuentesConsultadas,
                        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
              };
      });

      return NextResponse.json({ recaps });
    } catch (error) {
                    return NextResponse.json(
                {
                          error: 'Error al obtener recaps',
                          detalle: error instanceof Error ? error.message : String(error),
                },
                      { status: 500 }
                          );
    }
}
