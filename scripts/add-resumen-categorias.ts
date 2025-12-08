import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { CategoriaImpacto } from '../types';

// Cargar variables de entorno desde .env.local
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (getApps().length === 0) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('Faltan variables de entorno de Firebase Admin');
    console.error('PROJECT_ID:', projectId);
    console.error('CLIENT_EMAIL:', clientEmail ? 'presente' : 'faltante');
    console.error('PRIVATE_KEY:', privateKey ? 'presente' : 'faltante');
    process.exit(1);
  }

  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

const db = getFirestore();

// Datos de ejemplo para algunas iniciativas
const iniciativasConDatos = [
  {
    // Buscar por título parcial para identificar
    buscar: 'Ley Federal de Protección de Datos Personales',
    resumen: 'Propone reformas a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares para incluir disposiciones específicas sobre el tratamiento de datos personales mediante sistemas de inteligencia artificial, estableciendo obligaciones de transparencia algorítmica y derecho a la explicación de decisiones automatizadas.',
    categoriasImpacto: ['privacidad', 'transparencia', 'responsabilidad'] as CategoriaImpacto[]
  },
  {
    buscar: 'derechos de autor',
    resumen: 'Reforma la Ley Federal del Derecho de Autor para establecer que las obras generadas íntegramente por sistemas de inteligencia artificial no son susceptibles de protección por derechos de autor, requiriendo intervención humana creativa significativa para obtener dicha protección.',
    categoriasImpacto: ['propiedad_intelectual', 'derechos_autor'] as CategoriaImpacto[]
  },
  {
    buscar: 'Código Penal Federal',
    resumen: 'Adiciona disposiciones al Código Penal Federal para tipificar como delito la creación y distribución de contenido deepfake con fines de extorsión, difamación o violencia de género, estableciendo penas de 3 a 8 años de prisión y multas significativas.',
    categoriasImpacto: ['justicia', 'violencia_genero', 'ciberseguridad'] as CategoriaImpacto[]
  },
  {
    buscar: 'Ley General de Educación',
    resumen: 'Reforma la Ley General de Educación para incorporar la alfabetización en inteligencia artificial como componente obligatorio del currículo educativo en todos los niveles, promoviendo el pensamiento crítico sobre el uso ético y responsable de estas tecnologías.',
    categoriasImpacto: ['educacion', 'etica'] as CategoriaImpacto[]
  },
  {
    buscar: 'Ley General de Salud',
    resumen: 'Adiciona disposiciones a la Ley General de Salud para regular el uso de sistemas de inteligencia artificial en diagnóstico médico y toma de decisiones clínicas, estableciendo requisitos de certificación, supervisión médica obligatoria y protocolos de validación clínica.',
    categoriasImpacto: ['salud', 'responsabilidad', 'etica'] as CategoriaImpacto[]
  },
  {
    buscar: 'Seguridad Nacional',
    resumen: 'Reforma la Ley de Seguridad Nacional para establecer controles sobre el desarrollo y despliegue de sistemas de inteligencia artificial de alto riesgo que puedan afectar la seguridad nacional, requiriendo evaluaciones de impacto y autorizaciones previas para su implementación.',
    categoriasImpacto: ['seguridad_nacional', 'ciberseguridad', 'transparencia'] as CategoriaImpacto[]
  },
  {
    buscar: 'Federal del Trabajo',
    resumen: 'Reforma la Ley Federal del Trabajo para regular el uso de sistemas de inteligencia artificial en procesos de selección de personal, evaluación de desempeño y toma de decisiones laborales, estableciendo el derecho de los trabajadores a conocer los criterios algorítmicos utilizados y a solicitar revisión humana.',
    categoriasImpacto: ['trabajo', 'transparencia', 'responsabilidad'] as CategoriaImpacto[]
  },
  {
    buscar: 'responsabilidad civil',
    resumen: 'Adiciona un capítulo al Código Civil Federal sobre responsabilidad civil derivada del uso de sistemas de inteligencia artificial, estableciendo criterios de imputación de responsabilidad entre desarrolladores, operadores y usuarios, así como mecanismos de compensación por daños.',
    categoriasImpacto: ['responsabilidad', 'justicia'] as CategoriaImpacto[]
  }
];

async function actualizarIniciativas() {
  console.log('Iniciando actualización de iniciativas con resúmenes y categorías...\n');

  for (const dato of iniciativasConDatos) {
    try {
      // Buscar iniciativa por título
      const snapshot = await db.collection('iniciativas')
        .where('titulo', '>=', '')
        .get();

      let encontrada = false;
      for (const doc of snapshot.docs) {
        const iniciativa = doc.data();
        if (iniciativa.titulo.toLowerCase().includes(dato.buscar.toLowerCase())) {
          // Actualizar con resumen y categorías
          await doc.ref.update({
            resumen: dato.resumen,
            categoriasImpacto: dato.categoriasImpacto,
            updatedAt: new Date()
          });

          console.log(`✅ Actualizada: ${iniciativa.titulo.substring(0, 60)}...`);
          console.log(`   Categorías: ${dato.categoriasImpacto.join(', ')}\n`);
          encontrada = true;
          break;
        }
      }

      if (!encontrada) {
        console.log(`⚠️  No encontrada iniciativa con: "${dato.buscar}"\n`);
      }
    } catch (error) {
      console.error(`❌ Error procesando "${dato.buscar}":`, error);
    }
  }

  console.log('\n✨ Actualización completada');
}

actualizarIniciativas().catch(console.error);
