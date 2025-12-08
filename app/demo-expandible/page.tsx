'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

type CategoriaImpacto = 
  | 'propiedad_intelectual'
  | 'responsabilidad'
  | 'etica'
  | 'ciberseguridad'
  | 'seguridad_nacional'
  | 'justicia'
  | 'educacion'
  | 'salud'
  | 'privacidad'
  | 'derechos_autor'
  | 'violencia_genero'
  | 'transparencia'
  | 'trabajo'
  | 'economia';

interface IniciativaDemo {
  id: string;
  titulo: string;
  proponente: string;
  partido: string;
  fecha: string;
  status: string;
  legislatura: string;
  tipo: string;
  camara: string;
  resumen?: string;
  categoriasImpacto?: CategoriaImpacto[];
}

const iniciativasDemo: IniciativaDemo[] = [
  {
    id: '1',
    titulo: 'Reforma artículo 199 Octies del Código Penal Federal',
    proponente: 'Dip. María González',
    partido: 'MORENA',
    fecha: '2024-03-15',
    status: 'En comisiones',
    legislatura: 'LXVI',
    tipo: 'Reforma',
    camara: 'Diputados',
    resumen: 'Adiciona disposiciones al Código Penal Federal para tipificar como delito la creación y distribución de contenido deepfake con fines de extorsión, difamación o violencia de género, estableciendo penas de 3 a 8 años de prisión y multas significativas.',
    categoriasImpacto: ['justicia', 'violencia_genero', 'ciberseguridad']
  },
  {
    id: '2',
    titulo: 'Reforma artículos 30 y 70 de Ley General de Educación',
    proponente: 'Dip. Carlos Ramírez',
    partido: 'PAN',
    fecha: '2024-02-20',
    status: 'En comisiones',
    legislatura: 'LXVI',
    tipo: 'Reforma',
    camara: 'Diputados',
    resumen: 'Reforma la Ley General de Educación para incorporar la alfabetización en inteligencia artificial como componente obligatorio del currículo educativo en todos los niveles, promoviendo el pensamiento crítico sobre el uso ético y responsable de estas tecnologías.',
    categoriasImpacto: ['educacion', 'etica']
  },
  {
    id: '3',
    titulo: 'Reforma y adición a Ley de Ciencia y Tecnología y Ley General de Salud',
    proponente: 'Sen. Ana López',
    partido: 'PRI',
    fecha: '2024-01-10',
    status: 'En comisiones',
    legislatura: 'LXVI',
    tipo: 'Reforma',
    camara: 'Senadores',
    resumen: 'Adiciona disposiciones a la Ley General de Salud para regular el uso de sistemas de inteligencia artificial en diagnóstico médico y toma de decisiones clínicas, estableciendo requisitos de certificación, supervisión médica obligatoria y protocolos de validación clínica.',
    categoriasImpacto: ['salud', 'responsabilidad', 'etica']
  }
];

export default function DemoExpandible() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getCategoriaLabel = (categoria: CategoriaImpacto): string => {
    const labels: Record<CategoriaImpacto, string> = {
      'propiedad_intelectual': 'Propiedad Intelectual',
      'responsabilidad': 'Responsabilidad',
      'etica': 'Ética',
      'ciberseguridad': 'Ciberseguridad',
      'seguridad_nacional': 'Seguridad Nacional',
      'justicia': 'Justicia',
      'educacion': 'Educación',
      'salud': 'Salud',
      'privacidad': 'Privacidad',
      'derechos_autor': 'Derechos de Autor',
      'violencia_genero': 'Violencia de Género',
      'transparencia': 'Transparencia',
      'trabajo': 'Trabajo',
      'economia': 'Economía'
    };
    return labels[categoria];
  };

  const getCategoriaColor = (categoria: CategoriaImpacto): string => {
    const colors: Record<CategoriaImpacto, string> = {
      'propiedad_intelectual': 'bg-purple-100 text-purple-700 border-purple-200',
      'responsabilidad': 'bg-red-100 text-red-700 border-red-200',
      'etica': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'ciberseguridad': 'bg-cyan-100 text-cyan-700 border-cyan-200',
      'seguridad_nacional': 'bg-orange-100 text-orange-700 border-orange-200',
      'justicia': 'bg-blue-100 text-blue-700 border-blue-200',
      'educacion': 'bg-green-100 text-green-700 border-green-200',
      'salud': 'bg-pink-100 text-pink-700 border-pink-200',
      'privacidad': 'bg-violet-100 text-violet-700 border-violet-200',
      'derechos_autor': 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
      'violencia_genero': 'bg-rose-100 text-rose-700 border-rose-200',
      'transparencia': 'bg-teal-100 text-teal-700 border-teal-200',
      'trabajo': 'bg-amber-100 text-amber-700 border-amber-200',
      'economia': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return colors[categoria];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">
            Demo: Vista Expandible de Iniciativas
          </h1>
          <p className="text-lg text-gray-600">
            Haz clic en cualquier fila para ver el resumen y las categorías de impacto
          </p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-8 px-2 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Iniciativa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proponente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {iniciativasDemo.map((iniciativa) => {
                const isExpanded = expandedId === iniciativa.id;
                
                return (
                  <>
                    <tr 
                      key={iniciativa.id} 
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : iniciativa.id)}
                    >
                      <td className="px-2 py-4 text-gray-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-blue-600 font-medium">
                          {iniciativa.titulo}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {iniciativa.tipo} · {iniciativa.camara}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {iniciativa.proponente}
                        <div className="text-xs text-gray-500">{iniciativa.partido}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(iniciativa.fecha).toLocaleDateString('es-MX', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-100 text-blue-700 border-blue-200">
                          {iniciativa.status}
                        </span>
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {isExpanded && (
                      <tr key={`${iniciativa.id}-expanded`}>
                        <td colSpan={5} className="px-8 py-6 bg-gray-50 border-t border-gray-200">
                          <div className="max-w-4xl">
                            {/* Resumen */}
                            {iniciativa.resumen && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Resumen de la propuesta</h4>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                  {iniciativa.resumen}
                                </p>
                              </div>
                            )}
                            
                            {/* Categorías de Impacto */}
                            {iniciativa.categoriasImpacto && iniciativa.categoriasImpacto.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-semibold text-gray-900 mb-2">Categorías de impacto</h4>
                                <div className="flex flex-wrap gap-2">
                                  {iniciativa.categoriasImpacto.map((categoria) => (
                                    <span 
                                      key={categoria}
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getCategoriaColor(categoria)}`}
                                    >
                                      {getCategoriaLabel(categoria)}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Enlaces */}
                            <div className="flex gap-4 mt-4">
                              <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Ver detalles completos →
                              </button>
                              <button className="text-sm text-blue-600 hover:text-blue-800">
                                Ver PDF oficial ↗
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            ✅ Funcionalidad Implementada
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Filas expandibles/colapsables con ícono de chevron</li>
            <li>• Resumen de la propuesta legislativa</li>
            <li>• Pastillas de colores para categorías de impacto</li>
            <li>• 14 categorías diferentes con colores únicos</li>
            <li>• Diseño limpio y profesional con esquema institucional azul/blanco</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
