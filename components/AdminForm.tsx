'use client';

import { useState } from 'react';
import { StatusType } from '@/types';

export default function AdminForm() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    fechaAnuncio: '',
    fechaPrometida: '',
    responsable: '',
    dependencia: '',
    fuenteOriginal: '',
    citaPromesa: '',
    status: 'prometido' as StatusType,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage('✅ Anuncio agregado exitosamente');
        setFormData({
          titulo: '',
          descripcion: '',
          fechaAnuncio: '',
          fechaPrometida: '',
          responsable: '',
          dependencia: '',
          fuenteOriginal: '',
          citaPromesa: '',
          status: 'prometido',
        });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage('❌ Error al agregar anuncio');
      }
    } catch {
      setMessage('❌ Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título *
        </label>
        <input
          type="text"
          required
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Descripción *
        </label>
        <textarea
          required
          rows={3}
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Anuncio *
          </label>
          <input
            type="date"
            required
            value={formData.fechaAnuncio}
            onChange={(e) => setFormData({ ...formData, fechaAnuncio: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Prometida
          </label>
          <input
            type="date"
            value={formData.fechaPrometida}
            onChange={(e) => setFormData({ ...formData, fechaPrometida: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Responsable *
          </label>
          <input
            type="text"
            required
            value={formData.responsable}
            onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dependencia *
          </label>
          <input
            type="text"
            required
            value={formData.dependencia}
            onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fuente Original (URL)
        </label>
        <input
          type="url"
          value={formData.fuenteOriginal}
          onChange={(e) => setFormData({ ...formData, fuenteOriginal: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cita de la Promesa
        </label>
        <textarea
          rows={2}
          value={formData.citaPromesa}
          onChange={(e) => setFormData({ ...formData, citaPromesa: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusType })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-900 focus:border-transparent"
        >
          <option value="prometido">Prometido</option>
          <option value="en_desarrollo">En Desarrollo</option>
          <option value="operando">Operando</option>
          <option value="incumplido">Incumplido</option>
          <option value="abandonado">Abandonado</option>
        </select>
      </div>

      {message && (
        <div className="p-3 rounded-md bg-gray-100 text-gray-900">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-900 text-white py-3 rounded-md font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Guardando...' : 'Agregar Anuncio'}
      </button>
    </form>
  );
}
