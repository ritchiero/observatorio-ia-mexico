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

  const inputClasses = "w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-500";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClasses}>
          Título *
        </label>
        <input
          type="text"
          required
          value={formData.titulo}
          onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          className={inputClasses}
          placeholder="Ej: Laboratorio Nacional de IA"
        />
      </div>

      <div>
        <label className={labelClasses}>
          Descripción *
        </label>
        <textarea
          required
          rows={3}
          value={formData.descripcion}
          onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          className={inputClasses}
          placeholder="Descripción del anuncio..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>
            Fecha de Anuncio *
          </label>
          <input
            type="date"
            required
            value={formData.fechaAnuncio}
            onChange={(e) => setFormData({ ...formData, fechaAnuncio: e.target.value })}
            className={inputClasses}
          />
        </div>

        <div>
          <label className={labelClasses}>
            Fecha Prometida
          </label>
          <input
            type="date"
            value={formData.fechaPrometida}
            onChange={(e) => setFormData({ ...formData, fechaPrometida: e.target.value })}
            className={inputClasses}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClasses}>
            Responsable *
          </label>
          <input
            type="text"
            required
            value={formData.responsable}
            onChange={(e) => setFormData({ ...formData, responsable: e.target.value })}
            className={inputClasses}
            placeholder="Ej: Sheinbaum"
          />
        </div>

        <div>
          <label className={labelClasses}>
            Dependencia *
          </label>
          <input
            type="text"
            required
            value={formData.dependencia}
            onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })}
            className={inputClasses}
            placeholder="Ej: Presidencia"
          />
        </div>
      </div>

      <div>
        <label className={labelClasses}>
          Fuente Original (URL)
        </label>
        <input
          type="url"
          value={formData.fuenteOriginal}
          onChange={(e) => setFormData({ ...formData, fuenteOriginal: e.target.value })}
          className={inputClasses}
          placeholder="https://..."
        />
      </div>

      <div>
        <label className={labelClasses}>
          Cita de la Promesa
        </label>
        <textarea
          rows={2}
          value={formData.citaPromesa}
          onChange={(e) => setFormData({ ...formData, citaPromesa: e.target.value })}
          className={inputClasses}
          placeholder="Cita textual de la promesa..."
        />
      </div>

      <div>
        <label className={labelClasses}>
          Status
        </label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value as StatusType })}
          className={inputClasses}
        >
          <option value="prometido">⚪ Prometido</option>
          <option value="en_desarrollo">🟡 En Desarrollo</option>
          <option value="operando">🟢 Operando</option>
          <option value="incumplido">🔴 Incumplido</option>
          <option value="abandonado">⚫ Abandonado</option>
        </select>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-200">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 text-gray-900 py-3 rounded-lg font-medium hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? 'Guardando...' : '✨ Agregar Anuncio'}
      </button>
    </form>
  );
}
