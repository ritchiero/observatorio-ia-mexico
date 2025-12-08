'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { IniciativaLegislativa, IniciativaStatus } from '@/types';
import { FileText, Scale, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LegislacionPage() {
  const [iniciativas, setIniciativas] = useState<IniciativaLegislativa[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState<IniciativaStatus | 'todos'>('todos');
  const [filtroLegislatura, setFiltroLegislatura] = useState<string>('todos');

  useEffect(() => {
    const fetchIniciativas = async () => {
      try {
        const q = query(
          collection(db, 'iniciativas')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as IniciativaLegislativa[];
        setIniciativas(data);
      } catch (error) {
        console.error('Error fetching iniciativas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIniciativas();
  }, []);

  const iniciativasFiltradas = iniciativas.filter(i => {
    if (filtroStatus !== 'todos' && i.status !== filtroStatus) return false;
    if (filtroLegislatura !== 'todos' && i.legislatura !== filtroLegislatura) return false;
    return true;
  });

  const stats = {
    total: iniciativas.length,
    activas: iniciativas.filter(i => i.status === 'en_comisiones').length,
    desechadas: iniciativas.filter(i => i.status === 'desechada_termino' || i.status === 'archivada').length,
    aprobadas: iniciativas.filter(i => i.status === 'aprobada').length
  };

  const getStatusBadge = (status: IniciativaStatus) => {
    const badges = {
      'en_comisiones': { text: 'En comisiones', color: 'bg-blue-100 text-blue-700 border-blue-200' },
      'desechada_termino': { text: 'Desechada', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      'archivada': { text: 'Archivada', color: 'bg-gray-100 text-gray-600 border-gray-200' },
      'aprobada': { text: 'Aprobada', color: 'bg-green-100 text-green-700 border-green-200' },
      'rechazada': { text: 'Rechazada', color: 'bg-red-100 text-red-700 border-red-200' },
      'turnada': { text: 'Turnada', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      'dictaminada': { text: 'Dictaminada', color: 'bg-orange-100 text-orange-700 border-orange-200' }
    };
    return badges[status] || badges['en_comisiones'];
  };

  const formatFecha = (timestamp: Timestamp) => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-2">Cargando iniciativas...</div>
          <div className="text-sm text-gray-400">Esto puede tardar unos segundos</div>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay iniciativas
  if (!loading && iniciativas.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-16">
            <h1 className="font-serif text-4xl text-gray-900 mb-4">Legislación en IA</h1>
            <p className="text-gray-600">Seguimiento de iniciativas legislativas relacionadas con inteligencia artificial</p>
          </div>
        </section>
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="bg-blue-50 border border-blue-200 rounded-sm p-8 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="font-serif text-2xl text-gray-900 mb-2">Base de datos en preparación</h2>
            <p className="text-gray-600 mb-4">
              Estamos importando las 69 iniciativas legislativas documentadas.
              <br />
              Esta sección estará disponible próximamente.
            </p>
            <a href="/" className="text-blue-500 hover:underline">Volver al inicio</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO SECTION */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-16">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-6">
            <Scale className="w-5 h-5 text-blue-500" />
            <span className="font-sans text-sm tracking-wider text-gray-600 uppercase">
              Legislación en IA
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-6xl text-gray-900 mb-6 leading-tight">
            Seguimiento de{' '}
            <span className="text-blue-500 italic">iniciativas legislativas</span>
          </h1>

          {/* Subheadline */}
          <p className="font-sans text-lg md:text-xl text-gray-600 max-w-3xl leading-relaxed border-l border-blue-500/30 pl-6">
            Documentamos y monitoreamos todas las iniciativas de ley relacionadas con inteligencia artificial presentadas en el Congreso de México desde 2020.
          </p>

          {/* STATS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 border-t border-gray-200 pt-8">
            <div className="group cursor-default">
              <div className="font-serif text-4xl md:text-5xl text-gray-900 group-hover:text-blue-500 transition-colors">
                {stats.total}
              </div>
              <div className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Iniciativas
              </div>
            </div>
            <div className="group cursor-default">
              <div className="font-serif text-4xl md:text-5xl text-blue-500 group-hover:text-gray-900 transition-colors">
                {stats.activas}
              </div>
              <div className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Activas
              </div>
            </div>
            <div className="group cursor-default">
              <div className="font-serif text-4xl md:text-5xl text-gray-400 group-hover:text-gray-600 transition-colors">
                {stats.desechadas}
              </div>
              <div className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Desechadas
              </div>
            </div>
            <div className="group cursor-default">
              <div className="font-serif text-4xl md:text-5xl text-green-500 group-hover:text-green-600 transition-colors">
                {stats.aprobadas}
              </div>
              <div className="font-sans text-xs text-gray-500 uppercase tracking-widest mt-1">
                Aprobadas
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTROS */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-500 mb-2">
                Estado
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as IniciativaStatus | 'todos')}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm font-sans text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="todos">Todas ({stats.total})</option>
                <option value="en_comisiones">En comisiones ({stats.activas})</option>
                <option value="desechada_termino">Desechadas ({iniciativas.filter(i => i.status === 'desechada_termino').length})</option>
                <option value="archivada">Archivadas ({iniciativas.filter(i => i.status === 'archivada').length})</option>
                <option value="aprobada">Aprobadas ({stats.aprobadas})</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-sans uppercase tracking-wider text-gray-500 mb-2">
                Legislatura
              </label>
              <select
                value={filtroLegislatura}
                onChange={(e) => setFiltroLegislatura(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-sm font-sans text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="todos">Todas</option>
                <option value="LXVI">LXVI (2024-2027)</option>
                <option value="LXV">LXV (2021-2024)</option>
                <option value="LXIV">LXIV (2018-2021)</option>
                <option value="III_CDMX">III CDMX</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* TABLA DE INICIATIVAS */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white border border-gray-200 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-sans uppercase tracking-wider text-gray-600">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-sans uppercase tracking-wider text-gray-600">
                    Iniciativa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-sans uppercase tracking-wider text-gray-600">
                    Proponente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-sans uppercase tracking-wider text-gray-600">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-sans uppercase tracking-wider text-gray-600">
                    Legislatura
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-sans uppercase tracking-wider text-gray-600">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {iniciativasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No se encontraron iniciativas con los filtros seleccionados
                    </td>
                  </tr>
                ) : (
                  iniciativasFiltradas.map((iniciativa) => {
                    const badge = getStatusBadge(iniciativa.status);
                    return (
                      <tr key={iniciativa.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-mono text-gray-500">
                          {iniciativa.numero}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/legislacion/${iniciativa.id}`}
                            className="font-sans text-sm text-gray-900 hover:text-blue-500 transition-colors line-clamp-2"
                          >
                            {iniciativa.titulo}
                          </Link>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{iniciativa.proponente}</div>
                          <div className="text-xs text-gray-500">{iniciativa.partido}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600">
                          {formatFecha(iniciativa.fecha)}
                        </td>
                        <td className="px-6 py-4 text-sm font-sans text-gray-600">
                          {iniciativa.legislatura}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-sans border ${badge.color}`}>
                            {badge.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INFO FOOTER */}
        <div className="mt-8 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-sm">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold mb-1">Monitoreo automatizado</p>
            <p className="text-gray-600">
              Un agente de IA revisa semanalmente la Gaceta Parlamentaria para detectar nuevas iniciativas 
              y actualizar el estado de las existentes. Última actualización: {new Date().toLocaleDateString('es-MX')}.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
