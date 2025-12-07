/**
 * Script para migrar todos los anuncios con fuentes periodísticas y resúmenes de agente
 * 
 * Uso:
 * npx tsx scripts/migrate-all-sources.ts
 */

const ADMIN_KEY = process.env.ADMIN_KEY || 'demo';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface AnuncioUpdate {
  id: string;
  titulo: string;
  fuentes: Array<{
    url: string;
    titulo: string;
    fecha: string;
    tipo: 'anuncio_original' | 'nota_prensa' | 'declaracion' | 'transparencia' | 'otro';
    accesible?: boolean;
    extracto?: string;
  }>;
  resumenAgente: string;
}

const anunciosData: AnuncioUpdate[] = [
  {
    id: 'UfSnLrpDhXrNnqy0BKC1', // Laboratorio Nacional de IA
    titulo: 'Laboratorio Nacional de IA',
    fuentes: [
      {
        url: 'https://www.infobae.com/mexico/2025/04/15/sheinbaum-anuncia-laboratorio-nacional-de-inteligencia-artificial/',
        titulo: 'Sheinbaum anuncia Laboratorio Nacional de Inteligencia Artificial',
        fecha: '2025-04-15',
        tipo: 'nota_prensa',
        accesible: true
      },
      {
        url: 'https://infochannel.info/sheinbaum_creara_laboratorio_nacional_ia/',
        titulo: 'Sheinbaum creará Laboratorio Nacional de IA',
        fecha: '2025-04-15',
        tipo: 'nota_prensa',
        accesible: true
      },
      {
        url: 'https://www.infobae.com/mexico/2025/09/05/sheinbaum-revela-que-proyecto-de-laboratorio-nacional-de-inteligencia-artificial-sera-lanzado-en-octubre/',
        titulo: 'Sheinbaum revela que proyecto de Laboratorio Nacional de Inteligencia Artificial será lanzado en octubre',
        fecha: '2025-09-05',
        tipo: 'nota_prensa',
        accesible: true
      }
    ],
    resumenAgente: 'Sheinbaum prometió en abril 2025 que el Laboratorio estaría listo en octubre. A diciembre 2025, no hay decreto oficial, no hay estructura organizacional publicada, no hay presupuesto asignado visible. El anuncio permanece incumplido.'
  },
  // Aquí se agregarán los demás anuncios
];

async function updateAnuncio(data: AnuncioUpdate) {
  const response = await fetch(`${API_URL}/api/admin/update-anuncio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      adminKey: ADMIN_KEY,
      anuncioId: data.id,
      fuentes: data.fuentes,
      resumenAgente: data.resumenAgente
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Error updating ${data.titulo}: ${error.error}`);
  }

  return await response.json();
}

async function main() {
  console.log('🚀 Iniciando migración de fuentes y resúmenes...\n');
  
  for (const anuncio of anunciosData) {
    try {
      console.log(`📝 Actualizando: ${anuncio.titulo}`);
      const result = await updateAnuncio(anuncio);
      console.log(`✅ ${anuncio.titulo} - ${result.updated.fuentes} fuentes agregadas\n`);
    } catch (error) {
      console.error(`❌ Error en ${anuncio.titulo}:`, error);
    }
  }
  
  console.log('✨ Migración completada!');
}

main().catch(console.error);
