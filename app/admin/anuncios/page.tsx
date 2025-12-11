'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Save, 
  X, 
  Trash2, 
  ExternalLink,
  Calendar,
  FileText,
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Search,
  AlertTriangle,
  Copy,
  Download,
  Upload,
  ChevronUp,
  ChevronDown,
  Check,
  History,
  Clock,
  ImageIcon,
  Loader2
} from 'lucide-react';

interface Fuente {
  url: string;
  titulo: string;
  fecha: string;
  tipo: string;
  medio?: string;
  accesible?: boolean;
  extracto?: string;
}

interface EventoTimeline {
  id: string;
  fecha: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  impacto: 'positivo' | 'neutral' | 'negativo';
  citaTextual?: string;
  responsable?: string;
  fuentes: Fuente[];
}

interface Anuncio {
  id: string;
  titulo: string;
  descripcion: string;
  fechaAnuncio: string;
  fechaPrometida?: string;
  responsable: string;
  dependencia: string;
  status: string;
  citaPromesa?: string;
  fuenteOriginal?: string;
  fuentes?: Fuente[];
  resumenAgente?: string;
  imagen?: string;
}

const STATUS_OPTIONS = [
  { value: 'prometido', label: 'Prometido', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'en_desarrollo', label: 'En Desarrollo', color: 'bg-blue-100 text-blue-800' },
  { value: 'operando', label: 'Operando', color: 'bg-green-100 text-green-800' },
  { value: 'incumplido', label: 'Incumplido', color: 'bg-red-100 text-red-800' },
  { value: 'abandonado', label: 'Abandonado', color: 'bg-gray-100 text-gray-800' },
];

const TIPO_FUENTE_OPTIONS = [
  { value: 'anuncio_original', label: 'Anuncio Original' },
  { value: 'nota_prensa', label: 'Nota de Prensa' },
  { value: 'declaracion', label: 'Declaración' },
  { value: 'transparencia', label: 'Transparencia' },
  { value: 'otro', label: 'Otro' },
];

const TIPO_EVENTO_OPTIONS = [
  { value: 'anuncio_inicial', label: 'Anuncio Inicial' },
  { value: 'actualizacion', label: 'Actualización' },
  { value: 'progreso', label: 'Progreso' },
  { value: 'cambio_status', label: 'Cambio de Status' },
  { value: 'cumplimiento', label: 'Cumplimiento' },
  { value: 'incumplimiento', label: 'Incumplimiento' },
  { value: 'retraso', label: 'Retraso' },
];

const IMPACTO_OPTIONS = [
  { value: 'positivo', label: 'Positivo', icon: TrendingUp, color: 'text-green-600' },
  { value: 'neutral', label: 'Neutral', icon: Minus, color: 'text-gray-600' },
  { value: 'negativo', label: 'Negativo', icon: TrendingDown, color: 'text-red-600' },
];

export default function AdminAnunciosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const newImageInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Estados principales
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);
  const [eventos, setEventos] = useState<EventoTimeline[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(false);
  
  // Log de actividad
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [activityLog, setActivityLog] = useState<Array<{
    id: string;
    fecha: string;
    tipo: string;
    descripcion: string;
    anuncioTitulo?: string;
  }>>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  
  // Búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [sortBy, setSortBy] = useState<'fechaAnuncio' | 'fechaPrometida' | 'titulo' | 'status' | 'manual'>('fechaAnuncio');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Estados de edición
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Anuncio>>({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Estados para crear nuevo anuncio
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAnuncio, setNewAnuncio] = useState<Partial<Anuncio>>({
    status: 'prometido'
  });
  
  // Estados para agregar/editar fuente
  const [showAddFuente, setShowAddFuente] = useState(false);
  const [editingFuenteIdx, setEditingFuenteIdx] = useState<number | null>(null);
  const [newFuente, setNewFuente] = useState<Partial<Fuente>>({
    tipo: 'nota_prensa',
    accesible: true
  });
  
  // Estados para agregar/editar evento
  const [showAddEvento, setShowAddEvento] = useState(false);
  const [editingEventoId, setEditingEventoId] = useState<string | null>(null);
  const [newEvento, setNewEvento] = useState<Partial<EventoTimeline>>({
    tipo: 'actualizacion',
    impacto: 'neutral',
    fuentes: []
  });
  const [newEventoFuente, setNewEventoFuente] = useState<Partial<Fuente>>({
    tipo: 'nota_prensa'
  });
  const [eventoJsonMode, setEventoJsonMode] = useState(false);
  const [eventoJsonText, setEventoJsonText] = useState('');

  // Auth check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login');
    }
  }, [status, router]);

  // Cargar anuncios
  useEffect(() => {
    loadAnuncios();
  }, []);

  // Filtrar y ordenar anuncios
  const filteredAnuncios = useMemo(() => {
    const filtered = anuncios.filter(a => {
      const matchesSearch = searchTerm === '' || 
        a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.responsable.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'todos' || a.status === filterStatus;
      return matchesSearch && matchesStatus;
    });

    // Ordenar
    const statusOrder = ['incumplido', 'prometido', 'en_desarrollo', 'operando', 'abandonado'];
    
    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'fechaAnuncio':
          comparison = new Date(a.fechaAnuncio || 0).getTime() - new Date(b.fechaAnuncio || 0).getTime();
          break;
        case 'fechaPrometida':
          const fechaA = a.fechaPrometida ? new Date(a.fechaPrometida).getTime() : 0;
          const fechaB = b.fechaPrometida ? new Date(b.fechaPrometida).getTime() : 0;
          comparison = fechaA - fechaB;
          break;
        case 'titulo':
          comparison = a.titulo.localeCompare(b.titulo, 'es');
          break;
        case 'status':
          comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
          break;
        case 'manual':
          // Usa el campo 'orden' si existe
          comparison = (a as Anuncio & { orden?: number }).orden || 0 - ((b as Anuncio & { orden?: number }).orden || 0);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [anuncios, searchTerm, filterStatus, sortBy, sortOrder]);

  const loadAnuncios = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/anuncios');
      const data = await response.json();
      setAnuncios(data.anuncios || []);
    } catch (error) {
      console.error('Error cargando anuncios:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLog = async () => {
    setLoadingActivity(true);
    try {
      const response = await fetch('/api/actividad?limit=50');
      const data = await response.json();
      setActivityLog(data.actividad || []);
    } catch (error) {
      console.error('Error cargando actividad:', error);
    } finally {
      setLoadingActivity(false);
    }
  };

  const loadEventos = async (anuncioId: string) => {
    setLoadingEventos(true);
    try {
      const response = await fetch(`/api/timeline/${anuncioId}`);
      const data = await response.json();
      setEventos(data.eventos || []);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setLoadingEventos(false);
    }
  };

  const selectAnuncio = (anuncio: Anuncio) => {
    setSelectedAnuncio(anuncio);
    setEditForm(anuncio);
    setEditMode(false);
    setMessage(null);
    setEditingFuenteIdx(null);
    setEditingEventoId(null);
    loadEventos(anuncio.id);
  };

  const handleSaveAnuncio = async () => {
    if (!selectedAnuncio) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/admin/anuncios', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedAnuncio.id,
          ...editForm
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Anuncio guardado correctamente' });
        setEditMode(false);
        setAnuncios(prev => prev.map(a => 
          a.id === selectedAnuncio.id ? { ...a, ...editForm } : a
        ));
        setSelectedAnuncio({ ...selectedAnuncio, ...editForm } as Anuncio);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAnuncio = async () => {
    if (!selectedAnuncio) return;
    
    const confirmar = confirm(
      `⚠️ ELIMINAR PROMESA\n\n` +
      `¿Estás seguro de eliminar "${selectedAnuncio.titulo}"?\n\n` +
      `Esto también eliminará todos los eventos del timeline.\n` +
      `Esta acción NO se puede deshacer.`
    );
    
    if (!confirmar) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/anuncios?id=${selectedAnuncio.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Promesa eliminada correctamente' });
        setAnuncios(prev => prev.filter(a => a.id !== selectedAnuncio.id));
        setSelectedAnuncio(null);
        setEventos([]);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Error al eliminar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setDeleting(false);
    }
  };

  const handleDuplicateAnuncio = async () => {
    if (!selectedAnuncio) return;
    
    setSaving(true);
    try {
      const duplicado = {
        ...selectedAnuncio,
        titulo: `${selectedAnuncio.titulo} (copia)`,
        status: 'prometido'
      };
      delete (duplicado as Partial<Anuncio> & { id?: string }).id;
      
      const response = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(duplicado)
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Promesa duplicada correctamente' });
        loadAnuncios();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Error al duplicar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleCreateAnuncio = async () => {
    if (!newAnuncio.titulo || !newAnuncio.descripcion || !newAnuncio.responsable || !newAnuncio.dependencia) {
      setMessage({ type: 'error', text: 'Título, descripción, responsable y dependencia son requeridos' });
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/anuncios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newAnuncio,
          fechaAnuncio: newAnuncio.fechaAnuncio || new Date().toISOString().split('T')[0],
          imagen: newAnuncio.imagen || ''
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Promesa creada correctamente' });
        setShowCreateModal(false);
        setNewAnuncio({ status: 'prometido' });
        loadAnuncios();
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al crear' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  // === FUENTES ===
  const handleAddFuente = async () => {
    if (!selectedAnuncio || !newFuente.url || !newFuente.titulo) {
      setMessage({ type: 'error', text: 'URL y título son requeridos' });
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/add-fuentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey: 'skip',
          anuncioId: selectedAnuncio.id,
          fuentes: [{
            ...newFuente,
            fecha: newFuente.fecha || new Date().toISOString().split('T')[0]
          }]
        })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Fuente agregada correctamente' });
        setShowAddFuente(false);
        setNewFuente({ tipo: 'nota_prensa', accesible: true });
        await reloadSelectedAnuncio();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Error al agregar fuente' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleEditFuente = (idx: number) => {
    if (!selectedAnuncio?.fuentes) return;
    const fuente = selectedAnuncio.fuentes[idx];
    setNewFuente({ ...fuente });
    setEditingFuenteIdx(idx);
  };

  const handleSaveFuente = async () => {
    if (!selectedAnuncio || editingFuenteIdx === null || !newFuente.url || !newFuente.titulo) {
      setMessage({ type: 'error', text: 'URL y título son requeridos' });
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/update-fuente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anuncioId: selectedAnuncio.id,
          fuenteIndex: editingFuenteIdx,
          fuente: {
            ...newFuente,
            fecha: newFuente.fecha || new Date().toISOString().split('T')[0]
          }
        })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Fuente actualizada' });
        setEditingFuenteIdx(null);
        setNewFuente({ tipo: 'nota_prensa', accesible: true });
        await reloadSelectedAnuncio();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Error al actualizar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteFuente = async (fuenteUrl: string) => {
    if (!selectedAnuncio) return;
    
    const confirmar = confirm('¿Eliminar esta fuente?');
    if (!confirmar) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/delete-fuente', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anuncioId: selectedAnuncio.id,
          fuenteUrl
        })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Fuente eliminada' });
        const updatedFuentes = selectedAnuncio.fuentes?.filter(f => f.url !== fuenteUrl) || [];
        setSelectedAnuncio({ ...selectedAnuncio, fuentes: updatedFuentes });
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Error al eliminar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleMoveFuente = async (idx: number, direction: 'up' | 'down') => {
    if (!selectedAnuncio?.fuentes) return;
    
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= selectedAnuncio.fuentes.length) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/reorder-fuentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anuncioId: selectedAnuncio.id,
          fromIndex: idx,
          toIndex: newIdx
        })
      });
      
      if (response.ok) {
        await reloadSelectedAnuncio();
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Error al reordenar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  // === EVENTOS ===
  const handleAddEvento = async () => {
    if (!selectedAnuncio || !newEvento.titulo || !newEvento.descripcion || !newEvento.fecha) {
      setMessage({ type: 'error', text: 'Título, descripción y fecha son requeridos' });
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/add-evento-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anuncioId: selectedAnuncio.id,
          evento: newEvento
        })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Evento agregado al timeline' });
        setShowAddEvento(false);
        setNewEvento({ tipo: 'actualizacion', impacto: 'neutral', fuentes: [] });
        loadEventos(selectedAnuncio.id);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Error al agregar evento' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddEventosFromJson = async () => {
    if (!selectedAnuncio || !eventoJsonText.trim()) {
      setMessage({ type: 'error', text: 'Ingresa el JSON de los eventos' });
      return;
    }

    let eventosToAdd: Partial<EventoTimeline>[];
    try {
      const parsed = JSON.parse(eventoJsonText);
      // Soporta array de eventos o un solo evento
      eventosToAdd = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      setMessage({ type: 'error', text: 'JSON inválido. Verifica el formato.' });
      return;
    }

    // Validar estructura mínima
    for (const evento of eventosToAdd) {
      if (!evento.titulo || !evento.fecha) {
        setMessage({ type: 'error', text: 'Cada evento necesita al menos "titulo" y "fecha"' });
        return;
      }
    }

    setSaving(true);
    let added = 0;
    let errors = 0;

    for (const evento of eventosToAdd) {
      try {
        const response = await fetch('/api/admin/add-evento-timeline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            anuncioId: selectedAnuncio.id,
            evento: {
              titulo: evento.titulo,
              descripcion: evento.descripcion || evento.titulo,
              fecha: evento.fecha,
              tipo: evento.tipo || 'actualizacion',
              impacto: evento.impacto || 'neutral',
              citaTextual: evento.citaTextual || '',
              responsable: evento.responsable || '',
              fuentes: evento.fuentes || []
            }
          })
        });
        if (response.ok) {
          added++;
        } else {
          errors++;
        }
      } catch {
        errors++;
      }
    }

    if (added > 0) {
      setMessage({ type: 'success', text: `${added} evento(s) agregado(s)${errors > 0 ? `, ${errors} error(es)` : ''}` });
      setShowAddEvento(false);
      setEventoJsonMode(false);
      setEventoJsonText('');
      loadEventos(selectedAnuncio.id);
    } else {
      setMessage({ type: 'error', text: 'No se pudo agregar ningún evento' });
    }
    setSaving(false);
  };

  const handleEditEvento = (evento: EventoTimeline) => {
    setNewEvento({ ...evento });
    setEditingEventoId(evento.id);
  };

  const handleSaveEvento = async () => {
    if (!editingEventoId || !newEvento.titulo || !newEvento.descripcion || !newEvento.fecha) {
      setMessage({ type: 'error', text: 'Título, descripción y fecha son requeridos' });
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/update-evento-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventoId: editingEventoId,
          evento: newEvento
        })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Evento actualizado' });
        setEditingEventoId(null);
        setNewEvento({ tipo: 'actualizacion', impacto: 'neutral', fuentes: [] });
        if (selectedAnuncio) loadEventos(selectedAnuncio.id);
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Error al actualizar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvento = async (eventoId: string) => {
    const confirmar = confirm('¿Eliminar este evento del timeline?');
    if (!confirmar) return;
    
    setSaving(true);
    try {
      const response = await fetch('/api/admin/delete-evento-timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Evento eliminado' });
        setEventos(prev => prev.filter(e => e.id !== eventoId));
      } else {
        const data = await response.json();
        setMessage({ type: 'error', text: data.error || 'Error al eliminar' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' });
    } finally {
      setSaving(false);
    }
  };

  const addFuenteToEvento = () => {
    if (!newEventoFuente.url || !newEventoFuente.titulo) return;
    
    setNewEvento(prev => ({
      ...prev,
      fuentes: [
        ...(prev.fuentes || []),
        {
          ...newEventoFuente,
          fecha: newEventoFuente.fecha || new Date().toISOString().split('T')[0]
        } as Fuente
      ]
    }));
    setNewEventoFuente({ tipo: 'nota_prensa' });
  };

  // === EXPORT/IMPORT ===
  const handleExportJSON = () => {
    const dataToExport = {
      anuncios,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promesas-ia-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setMessage({ type: 'success', text: 'JSON exportado correctamente' });
  };

  const handleImportJSON = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (!data.anuncios || !Array.isArray(data.anuncios)) {
        setMessage({ type: 'error', text: 'Formato de archivo inválido' });
        return;
      }
      
      const confirmar = confirm(
        `Se importarán ${data.anuncios.length} promesas.\n\n` +
        `Las promesas existentes con el mismo ID serán actualizadas.\n` +
        `¿Continuar?`
      );
      
      if (!confirmar) return;
      
      setSaving(true);
      let imported = 0;
      
      for (const anuncio of data.anuncios) {
        try {
          const response = await fetch('/api/admin/import-anuncio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(anuncio)
          });
          if (response.ok) imported++;
        } catch (e) {
          console.error('Error importando:', anuncio.titulo, e);
        }
      }
      
      setMessage({ type: 'success', text: `${imported} de ${data.anuncios.length} promesas importadas` });
      loadAnuncios();
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al leer el archivo JSON' });
    } finally {
      setSaving(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // === UPLOAD IMAGE ===
  const handleUploadImage = async (event: React.ChangeEvent<HTMLInputElement>, target: 'edit' | 'new') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (selectedAnuncio) {
        formData.append('anuncioId', selectedAnuncio.id);
      }

      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.url) {
        if (target === 'edit') {
          setEditForm({ ...editForm, imagen: data.url });
        } else {
          setNewAnuncio({ ...newAnuncio, imagen: data.url });
        }
        setMessage({ type: 'success', text: 'Imagen subida correctamente' });
      } else {
        const errorMsg = data.details ? `${data.error}: ${data.details}` : data.error;
        setMessage({ type: 'error', text: errorMsg || 'Error al subir imagen' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al subir imagen' });
    } finally {
      setUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  // === HELPERS ===
  const reloadSelectedAnuncio = async () => {
    if (!selectedAnuncio) return;
    try {
      const response = await fetch(`/api/anuncios/${selectedAnuncio.id}`);
      const data = await response.json();
      if (data.anuncio) {
        setSelectedAnuncio(data.anuncio);
        setEditForm(data.anuncio);
      }
    } catch (error) {
      console.error('Error recargando anuncio:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getStatusColor = (statusValue: string) => {
    return STATUS_OPTIONS.find(s => s.value === statusValue)?.color || 'bg-gray-100 text-gray-800';
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Cargando...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">
              Administrar Promesas de IA
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
            <button
              onClick={() => { setShowActivityLog(true); loadActivityLog(); }}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Ver historial de cambios"
            >
              <History size={16} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Importar JSON"
            >
              <Upload size={16} />
            </button>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              title="Exportar JSON"
            >
              <Download size={16} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              <Plus size={16} />
              Nueva Promesa
            </button>
            <button
              onClick={loadAnuncios}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Estadísticas rápidas */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-500">Resumen:</span>
          {STATUS_OPTIONS.map(opt => {
            const count = anuncios.filter(a => a.status === opt.value).length;
            if (count === 0) return null;
            return (
              <button
                key={opt.value}
                onClick={() => setFilterStatus(filterStatus === opt.value ? 'todos' : opt.value)}
                className={`px-2 py-1 rounded-full text-xs font-medium transition-all ${
                  filterStatus === opt.value 
                    ? opt.color + ' ring-2 ring-offset-1 ring-gray-400' 
                    : opt.color + ' opacity-70 hover:opacity-100'
                }`}
              >
                {count} {opt.label}
              </button>
            );
          })}
          <span className="text-gray-400 ml-auto">
            Total: {anuncios.length} promesas
          </span>
        </div>
      </div>

      <div className="flex h-[calc(100vh-113px)]">
        {/* Lista de anuncios */}
        <div className="w-1/3 border-r border-gray-200 bg-white overflow-hidden flex flex-col">
          {/* Búsqueda y filtros */}
          <div className="p-4 border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por título o responsable..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="todos">Todos los status</option>
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as typeof sortBy)}
                className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm"
              >
                <option value="fechaAnuncio">Fecha de anuncio</option>
                <option value="fechaPrometida">Fecha prometida</option>
                <option value="titulo">Alfabético (A-Z)</option>
                <option value="status">Por status</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {filteredAnuncios.length}/{anuncios.length}
              </span>
            </div>
          </div>
          
          {/* Lista */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredAnuncios.map(anuncio => (
              <button
                key={anuncio.id}
                onClick={() => selectAnuncio(anuncio)}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedAnuncio?.id === anuncio.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {anuncio.titulo}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {anuncio.responsable} • {formatDate(anuncio.fechaAnuncio)}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${getStatusColor(anuncio.status)}`}>
                    {STATUS_OPTIONS.find(s => s.value === anuncio.status)?.label || anuncio.status}
                  </span>
                </div>
              </button>
            ))}
            {filteredAnuncios.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No se encontraron promesas
              </div>
            )}
          </div>
        </div>

        {/* Panel de detalle/edición */}
        <div className="flex-1 overflow-y-auto">
          {selectedAnuncio ? (
            <div className="p-6 space-y-6">
              {/* Mensaje de estado */}
              {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {message.type === 'error' && <AlertTriangle size={16} />}
                  {message.type === 'success' && <Check size={16} />}
                  {message.text}
                </div>
              )}

              {/* Cabecera del anuncio */}
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {selectedAnuncio.titulo}
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm font-mono">
                    ID: {selectedAnuncio.id}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {editMode ? (
                    <>
                      <button
                        onClick={() => setEditMode(false)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveAnuncio}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        <Save size={16} />
                        {saving ? 'Guardando...' : 'Guardar'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleDuplicateAnuncio}
                        disabled={saving}
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                        title="Duplicar promesa"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={handleDeleteAnuncio}
                        disabled={deleting}
                        className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                        title="Eliminar promesa"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        onClick={() => setEditMode(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Edit size={16} />
                        Editar
                      </button>
                      <Link
                        href={`/anuncio/${selectedAnuncio.id}`}
                        target="_blank"
                        className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Formulario de edición */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                <h3 className="font-medium text-gray-900 mb-4">Información General</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                    <input
                      type="text"
                      value={editForm.titulo || ''}
                      onChange={e => setEditForm({ ...editForm, titulo: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={editForm.status || ''}
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                    <input
                      type="text"
                      value={editForm.responsable || ''}
                      onChange={e => setEditForm({ ...editForm, responsable: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dependencia</label>
                    <input
                      type="text"
                      value={editForm.dependencia || ''}
                      onChange={e => setEditForm({ ...editForm, dependencia: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Anuncio</label>
                    <input
                      type="date"
                      value={editForm.fechaAnuncio?.split('T')[0] || ''}
                      onChange={e => setEditForm({ ...editForm, fechaAnuncio: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Prometida</label>
                    <input
                      type="date"
                      value={editForm.fechaPrometida?.split('T')[0] || ''}
                      onChange={e => setEditForm({ ...editForm, fechaPrometida: e.target.value })}
                      disabled={!editMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea
                    value={editForm.descripcion || ''}
                    onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })}
                    disabled={!editMode}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cita de la Promesa</label>
                  <textarea
                    value={editForm.citaPromesa || ''}
                    onChange={e => setEditForm({ ...editForm, citaPromesa: e.target.value })}
                    disabled={!editMode}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resumen del Agente</label>
                  <textarea
                    value={editForm.resumenAgente || ''}
                    onChange={e => setEditForm({ ...editForm, resumenAgente: e.target.value })}
                    disabled={!editMode}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Thumbnail</label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={editForm.imagen || ''}
                          onChange={e => setEditForm({ ...editForm, imagen: e.target.value })}
                          disabled={!editMode}
                          placeholder="https://... o sube una imagen"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-50 text-sm"
                        />
                        <input
                          type="file"
                          ref={imageInputRef}
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => handleUploadImage(e, 'edit')}
                          className="hidden"
                          disabled={!editMode}
                        />
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={!editMode || uploadingImage}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                          {uploadingImage ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ImageIcon size={16} />
                          )}
                          Subir
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP o GIF. Máximo 5MB. Aparece en la landing.</p>
                    </div>
                    {editForm.imagen && (
                      <div className="relative group">
                        <img 
                          src={editForm.imagen} 
                          alt="Preview" 
                          className="w-20 h-20 object-cover rounded-lg border"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect fill="%23f3f4f6" width="80" height="80"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="10">Error</text></svg>'; }}
                        />
                        {editMode && (
                          <button
                            onClick={() => setEditForm({ ...editForm, imagen: '' })}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Fuentes */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Newspaper size={18} />
                    Fuentes ({selectedAnuncio.fuentes?.length || 0})
                  </h3>
                  <button
                    onClick={() => { setShowAddFuente(true); setEditingFuenteIdx(null); setNewFuente({ tipo: 'nota_prensa', accesible: true }); }}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>
                
                {/* Form agregar/editar fuente */}
                {(showAddFuente || editingFuenteIdx !== null) && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-3">
                      {editingFuenteIdx !== null ? 'Editar Fuente' : 'Nueva Fuente'}
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="url" placeholder="URL *" value={newFuente.url || ''} onChange={e => setNewFuente({ ...newFuente, url: e.target.value })} className="px-3 py-2 border rounded-lg" />
                      <input type="text" placeholder="Título *" value={newFuente.titulo || ''} onChange={e => setNewFuente({ ...newFuente, titulo: e.target.value })} className="px-3 py-2 border rounded-lg" />
                      <input type="text" placeholder="Medio (ej: El Universal)" value={newFuente.medio || ''} onChange={e => setNewFuente({ ...newFuente, medio: e.target.value })} className="px-3 py-2 border rounded-lg" />
                      <select value={newFuente.tipo || 'nota_prensa'} onChange={e => setNewFuente({ ...newFuente, tipo: e.target.value })} className="px-3 py-2 border rounded-lg">
                        {TIPO_FUENTE_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                      </select>
                      <input type="date" value={newFuente.fecha || ''} onChange={e => setNewFuente({ ...newFuente, fecha: e.target.value })} className="px-3 py-2 border rounded-lg" />
                    </div>
                    <div className="flex justify-end gap-2 mt-3">
                      <button onClick={() => { setShowAddFuente(false); setEditingFuenteIdx(null); setNewFuente({ tipo: 'nota_prensa', accesible: true }); }} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                      <button 
                        onClick={editingFuenteIdx !== null ? handleSaveFuente : handleAddFuente} 
                        disabled={saving} 
                        className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {saving ? 'Guardando...' : (editingFuenteIdx !== null ? 'Actualizar' : 'Agregar')}
                      </button>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {selectedAnuncio.fuentes?.map((fuente, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg group">
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveFuente(idx, 'up')}
                          disabled={idx === 0 || saving}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => handleMoveFuente(idx, 'down')}
                          disabled={idx === (selectedAnuncio.fuentes?.length || 0) - 1 || saving}
                          className="p-0.5 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                      <FileText size={16} className="text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">{fuente.titulo}</p>
                        <p className="text-xs text-gray-500">{fuente.medio} • {formatDate(fuente.fecha)}</p>
                        <a href={fuente.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">{fuente.url}</a>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditFuente(idx)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                          title="Editar fuente"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteFuente(fuente.url)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="Eliminar fuente"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )) || (<p className="text-gray-400 text-sm">No hay fuentes registradas</p>)}
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <Calendar size={18} />
                    Timeline ({eventos.length} eventos)
                  </h3>
                  <button onClick={() => { setShowAddEvento(true); setEditingEventoId(null); setNewEvento({ tipo: 'actualizacion', impacto: 'neutral', fuentes: [] }); }} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                    <Plus size={16} />
                    Agregar
                  </button>
                </div>
                
                {/* Form agregar/editar evento */}
                {(showAddEvento || editingEventoId !== null) && (
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-green-900">
                        {editingEventoId ? 'Editar Evento' : 'Nuevo Evento'}
                      </h4>
                      {!editingEventoId && (
                        <button
                          onClick={() => setEventoJsonMode(!eventoJsonMode)}
                          className={`text-xs px-2 py-1 rounded ${eventoJsonMode ? 'bg-green-600 text-white' : 'bg-white text-green-700 border border-green-300'}`}
                        >
                          {eventoJsonMode ? '📝 Formulario' : '{ } JSON'}
                        </button>
                      )}
                    </div>
                    
                    {eventoJsonMode && !editingEventoId ? (
                      /* Modo JSON */
                      <div className="space-y-3">
                        <textarea
                          placeholder={`Pega un evento o array de eventos en JSON:
{
  "titulo": "Título del evento",
  "fecha": "2025-01-15",
  "descripcion": "Descripción...",
  "tipo": "actualizacion",
  "impacto": "positivo",
  "citaTextual": "Cita opcional...",
  "fuentes": [
    { "url": "https://...", "titulo": "Nota", "medio": "El Universal" }
  ]
}`}
                          value={eventoJsonText}
                          onChange={e => setEventoJsonText(e.target.value)}
                          rows={12}
                          className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                        />
                        <p className="text-xs text-gray-500">
                          Campos requeridos: <code>titulo</code>, <code>fecha</code> (YYYY-MM-DD). 
                          Puedes pegar un array <code>[{'{...}'}, {'{...}'}]</code> para agregar múltiples.
                        </p>
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setShowAddEvento(false); setEventoJsonMode(false); setEventoJsonText(''); }} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                          <button 
                            onClick={handleAddEventosFromJson} 
                            disabled={saving} 
                            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {saving ? 'Importando...' : 'Importar JSON'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Modo Formulario */
                      <>
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <input type="date" value={newEvento.fecha || ''} onChange={e => setNewEvento({ ...newEvento, fecha: e.target.value })} className="px-3 py-2 border rounded-lg" />
                            <select value={newEvento.tipo || 'actualizacion'} onChange={e => setNewEvento({ ...newEvento, tipo: e.target.value })} className="px-3 py-2 border rounded-lg">
                              {TIPO_EVENTO_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                            <select value={newEvento.impacto || 'neutral'} onChange={e => setNewEvento({ ...newEvento, impacto: e.target.value as 'positivo' | 'neutral' | 'negativo' })} className="px-3 py-2 border rounded-lg">
                              {IMPACTO_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                            </select>
                          </div>
                          <input type="text" placeholder="Título *" value={newEvento.titulo || ''} onChange={e => setNewEvento({ ...newEvento, titulo: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                          <textarea placeholder="Descripción *" value={newEvento.descripcion || ''} onChange={e => setNewEvento({ ...newEvento, descripcion: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                          <textarea placeholder="Cita textual (opcional)" value={newEvento.citaTextual || ''} onChange={e => setNewEvento({ ...newEvento, citaTextual: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" />
                          <input type="text" placeholder="Responsable (opcional)" value={newEvento.responsable || ''} onChange={e => setNewEvento({ ...newEvento, responsable: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                          
                          <div className="border-t pt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Fuentes del evento:</p>
                            {newEvento.fuentes && newEvento.fuentes.length > 0 && (
                              <div className="mb-2 space-y-1">
                                {newEvento.fuentes.map((f, i) => (
                                  <div key={i} className="text-xs bg-white p-2 rounded flex justify-between">
                                    <span>{f.titulo}</span>
                                    <button onClick={() => setNewEvento({ ...newEvento, fuentes: newEvento.fuentes?.filter((_, idx) => idx !== i) })} className="text-red-500"><X size={12} /></button>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex gap-2">
                              <input type="url" placeholder="URL" value={newEventoFuente.url || ''} onChange={e => setNewEventoFuente({ ...newEventoFuente, url: e.target.value })} className="flex-1 px-2 py-1 border rounded text-sm" />
                              <input type="text" placeholder="Título" value={newEventoFuente.titulo || ''} onChange={e => setNewEventoFuente({ ...newEventoFuente, titulo: e.target.value })} className="flex-1 px-2 py-1 border rounded text-sm" />
                              <input type="text" placeholder="Medio" value={newEventoFuente.medio || ''} onChange={e => setNewEventoFuente({ ...newEventoFuente, medio: e.target.value })} className="w-24 px-2 py-1 border rounded text-sm" />
                              <button onClick={addFuenteToEvento} className="px-2 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">+</button>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-3">
                          <button onClick={() => { setShowAddEvento(false); setEditingEventoId(null); setNewEvento({ tipo: 'actualizacion', impacto: 'neutral', fuentes: [] }); }} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded">Cancelar</button>
                          <button 
                            onClick={editingEventoId ? handleSaveEvento : handleAddEvento} 
                            disabled={saving} 
                            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                            {saving ? 'Guardando...' : (editingEventoId ? 'Actualizar' : 'Agregar')}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
                
                {loadingEventos ? (
                  <p className="text-gray-400 text-sm">Cargando eventos...</p>
                ) : eventos.length > 0 ? (
                  <div className="space-y-3">
                    {eventos.map(evento => {
                      const ImpactoIcon = IMPACTO_OPTIONS.find(i => i.value === evento.impacto)?.icon || Minus;
                      const impactoColor = IMPACTO_OPTIONS.find(i => i.value === evento.impacto)?.color || 'text-gray-600';
                      
                      return (
                        <div key={evento.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-gray-300 group">
                          <div className="flex items-start gap-3">
                            <ImpactoIcon size={18} className={impactoColor} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{formatDate(evento.fecha)}</span>
                                <span className="text-xs px-1.5 py-0.5 bg-gray-200 rounded">{evento.tipo}</span>
                              </div>
                              <h4 className="font-medium text-gray-900 text-sm mt-1">{evento.titulo}</h4>
                              <p className="text-xs text-gray-600 mt-1">{evento.descripcion}</p>
                              {evento.citaTextual && (<p className="text-xs italic text-gray-500 mt-1 border-l-2 border-gray-300 pl-2">&quot;{evento.citaTextual}&quot;</p>)}
                              {evento.fuentes?.length > 0 && (<p className="text-xs text-blue-600 mt-1">{evento.fuentes.length} fuente(s)</p>)}
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEditEvento(evento)}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                title="Editar evento"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteEvento(evento.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                title="Eliminar evento"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No hay eventos en el timeline</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              Selecciona una promesa para ver y editar sus detalles
            </div>
          )}
        </div>
      </div>

      {/* Modal: Crear Nueva Promesa */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nueva Promesa de IA</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input type="text" value={newAnuncio.titulo || ''} onChange={e => setNewAnuncio({ ...newAnuncio, titulo: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: Laboratorio Nacional de IA" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Responsable *</label>
                  <input type="text" value={newAnuncio.responsable || ''} onChange={e => setNewAnuncio({ ...newAnuncio, responsable: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: Claudia Sheinbaum" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dependencia *</label>
                  <input type="text" value={newAnuncio.dependencia || ''} onChange={e => setNewAnuncio({ ...newAnuncio, dependencia: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Ej: Presidencia" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Anuncio</label>
                  <input type="date" value={newAnuncio.fechaAnuncio || ''} onChange={e => setNewAnuncio({ ...newAnuncio, fechaAnuncio: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Prometida</label>
                  <input type="date" value={newAnuncio.fechaPrometida || ''} onChange={e => setNewAnuncio({ ...newAnuncio, fechaPrometida: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={newAnuncio.status || 'prometido'} onChange={e => setNewAnuncio({ ...newAnuncio, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    {STATUS_OPTIONS.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuente Original (URL)</label>
                  <input type="url" value={newAnuncio.fuenteOriginal || ''} onChange={e => setNewAnuncio({ ...newAnuncio, fuenteOriginal: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <textarea value={newAnuncio.descripcion || ''} onChange={e => setNewAnuncio({ ...newAnuncio, descripcion: e.target.value })} rows={3} className="w-full px-3 py-2 border rounded-lg" placeholder="Descripción de la promesa..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cita de la Promesa</label>
                  <textarea value={newAnuncio.citaPromesa || ''} onChange={e => setNewAnuncio({ ...newAnuncio, citaPromesa: e.target.value })} rows={2} className="w-full px-3 py-2 border rounded-lg" placeholder="Cita textual de la promesa..." />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen del Thumbnail</label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="url" 
                          value={newAnuncio.imagen || ''} 
                          onChange={e => setNewAnuncio({ ...newAnuncio, imagen: e.target.value })} 
                          className="flex-1 px-3 py-2 border rounded-lg text-sm" 
                          placeholder="https://... o sube una imagen" 
                        />
                        <input
                          type="file"
                          ref={newImageInputRef}
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => handleUploadImage(e, 'new')}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => newImageInputRef.current?.click()}
                          disabled={uploadingImage}
                          className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 text-sm"
                        >
                          {uploadingImage ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <ImageIcon size={16} />
                          )}
                          Subir
                        </button>
                      </div>
                      <p className="text-xs text-gray-400">JPG, PNG, WebP o GIF. Máximo 5MB.</p>
                    </div>
                    {newAnuncio.imagen && (
                      <div className="relative group">
                        <img 
                          src={newAnuncio.imagen} 
                          alt="Preview" 
                          className="w-16 h-16 object-cover rounded-lg border"
                          onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect fill="%23f3f4f6" width="64" height="64"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%239ca3af" font-size="8">Error</text></svg>'; }}
                        />
                        <button
                          onClick={() => setNewAnuncio({ ...newAnuncio, imagen: '' })}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
              <button onClick={handleCreateAnuncio} disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">
                {saving ? 'Creando...' : 'Crear Promesa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Log de Actividad */}
      {showActivityLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <History size={20} />
                Historial de Cambios
              </h2>
              <button onClick={() => setShowActivityLog(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {loadingActivity ? (
                <p className="text-gray-400 text-center py-8">Cargando historial...</p>
              ) : activityLog.length > 0 ? (
                <div className="space-y-3">
                  {activityLog.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Clock size={16} className="text-gray-400 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                            {item.tipo.replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDate(item.fecha)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{item.descripcion}</p>
                        {item.anuncioTitulo && (
                          <p className="text-xs text-gray-500 mt-1">📋 {item.anuncioTitulo}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">No hay actividad registrada</p>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-xs text-gray-400">Últimos 50 cambios</span>
              <button 
                onClick={() => setShowActivityLog(false)} 
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
