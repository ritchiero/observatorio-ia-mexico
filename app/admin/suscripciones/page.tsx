'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Mail, Phone, Calendar, Download, Search } from 'lucide-react';

interface Suscripcion {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  fechaRegistro: string;
  activo: boolean;
}

export default function AdminSuscripcionesPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    async function fetchSuscripciones() {
      try {
        const response = await fetch('/api/suscripciones');
        const data = await response.json();
        if (data.suscripciones) {
          setSuscripciones(data.suscripciones);
        }
      } catch (error) {
        console.error('Error fetching suscripciones:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchSuscripciones();
  }, []);

  const suscripcionesFiltradas = suscripciones.filter(s => 
    s.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.telefono.includes(busqueda)
  );

  const formatFecha = (fecha: string) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTelefono = (tel: string) => {
    if (!tel || tel.length < 10) return tel;
    return `+52 ${tel.slice(0, 2)} ${tel.slice(2, 6)} ${tel.slice(6, 10)}`;
  };

  const exportarCSV = () => {
    const headers = ['Nombre', 'Email', 'Teléfono', 'Fecha de Registro', 'Activo'];
    const rows = suscripciones.map(s => [
      s.nombre,
      s.email,
      s.telefono,
      formatFecha(s.fechaRegistro),
      s.activo ? 'Sí' : 'No',
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `suscripciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/dashboard" 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Suscripciones</h1>
          </div>
          <p className="text-gray-600">
            Lista de usuarios suscritos al observatorio.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{suscripciones.length}</div>
                <div className="text-sm text-gray-500">Total suscritos</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {suscripciones.filter(s => s.activo).length}
                </div>
                <div className="text-sm text-gray-500">Activos</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {suscripciones.filter(s => {
                    const fecha = new Date(s.fechaRegistro);
                    const hoy = new Date();
                    const diffDays = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
                    return diffDays <= 7;
                  }).length}
                </div>
                <div className="text-sm text-gray-500">Últimos 7 días</div>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre, email o teléfono..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={16} />
            Exportar CSV
          </button>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8">
            <div className="flex items-center justify-center gap-3 text-gray-500">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando suscripciones...
            </div>
          </div>
        ) : suscripcionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {busqueda ? 'No se encontraron suscripciones' : 'Aún no hay suscripciones'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WhatsApp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suscripcionesFiltradas.map((sub) => (
                    <tr key={sub.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{sub.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a 
                          href={`mailto:${sub.email}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {sub.email}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a 
                          href={`https://wa.me/52${sub.telefono}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:underline text-sm flex items-center gap-1"
                        >
                          <Phone size={14} />
                          {formatTelefono(sub.telefono)}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFecha(sub.fechaRegistro)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                          sub.activo 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {sub.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-200">
              {suscripcionesFiltradas.map((sub) => (
                <div key={sub.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-gray-900">{sub.nombre}</div>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                      sub.activo 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {sub.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <a 
                      href={`mailto:${sub.email}`}
                      className="text-blue-600 flex items-center gap-2"
                    >
                      <Mail size={14} />
                      {sub.email}
                    </a>
                    <a 
                      href={`https://wa.me/52${sub.telefono}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 flex items-center gap-2"
                    >
                      <Phone size={14} />
                      {formatTelefono(sub.telefono)}
                    </a>
                    <div className="text-gray-500 flex items-center gap-2">
                      <Calendar size={14} />
                      {formatFecha(sub.fechaRegistro)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-6 text-center text-sm text-gray-400">
          Mostrando {suscripcionesFiltradas.length} de {suscripciones.length} suscripciones
        </div>
      </div>
    </div>
  );
}
