import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import { CategoriaImpacto } from '@/types';

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
  },
  {
    buscar: 'Transparencia',
    resumen: 'Reforma la Ley Federal de Transparencia y Acceso a la Información Pública para incluir la obligación de los sujetos obligados de publicar información sobre el uso de sistemas de inteligencia artificial en la toma de decisiones administrativas, incluyendo algoritmos, datos de entrenamiento y métricas de desempeño.',
    categoriasImpacto: ['transparencia', 'responsabilidad'] as CategoriaImpacto[]
  },
  {
    buscar: 'Ley de Ciencia y Tecnología',
    resumen: 'Reforma la Ley de Ciencia y Tecnología para establecer un marco de gobernanza para la investigación y desarrollo de inteligencia artificial en México, incluyendo la creación de un Consejo Nacional de IA y lineamientos éticos para la investigación.',
    categoriasImpacto: ['etica', 'transparencia', 'economia'] as CategoriaImpacto[]
  }
];

export async function GET() {
  try {
    const resultados = [];
    
    // Obtener todas las iniciativas
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection('iniciativas').get();
    
    for (const dato of iniciativasConDatos) {
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

          resultados.push({
            id: doc.id,
            titulo: iniciativa.titulo.substring(0, 80) + '...',
            categorias: dato.categoriasImpacto,
            status: 'actualizada'
          });
          
          encontrada = true;
          break;
        }
      }

      if (!encontrada) {
        resultados.push({
          buscar: dato.buscar,
          status: 'no_encontrada'
        });
      }
    }

    return NextResponse.json({
      success: true,
      actualizadas: resultados.filter(r => r.status === 'actualizada').length,
      no_encontradas: resultados.filter(r => r.status === 'no_encontrada').length,
      detalles: resultados
    });

  } catch (error) {
    console.error('Error actualizando iniciativas:', error);
    return NextResponse.json(
      { error: 'Error actualizando iniciativas' },
      { status: 500 }
    );
  }
}
