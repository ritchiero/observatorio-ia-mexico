'use client';

// Badge de "nivel de confianza" por dato. Acepta el registro completo (lo
// clasifica) o un nivel ya calculado. Las clases Tailwind van literales aquí
// para que el detector de Tailwind v4 las conserve.

import { nivelConfianza, NIVEL_INFO, type NivelConfianza } from '@/lib/nivelConfianza';

const ESTILO: Record<NivelConfianza, { text: string; bg: string; border: string; dot: string }> = {
  oficial: {
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
  documentada: {
    text: 'text-sky-700',
    bg: 'bg-sky-50',
    border: 'border-sky-200',
    dot: 'bg-sky-500',
  },
  sin_verificar: {
    text: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
};

interface Props {
  /** Registro completo (se clasifica automáticamente). */
  item?: unknown;
  /** Nivel ya calculado (tiene prioridad sobre `item`). */
  nivel?: NivelConfianza;
  size?: 'sm' | 'md';
  /** Muestra la descripción larga junto a la etiqueta. */
  showDesc?: boolean;
  className?: string;
}

export default function NivelConfianzaBadge({
  item,
  nivel,
  size = 'md',
  showDesc = false,
  className = '',
}: Props) {
  const n: NivelConfianza = nivel ?? nivelConfianza(item);
  const info = NIVEL_INFO[n];
  const c = ESTILO[n];
  const pad = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-sans-tech font-medium ${c.text} ${c.bg} ${c.border} ${pad} ${className}`}
      title={info.desc}
    >
      <span className={`inline-block w-1.5 h-1.5 rounded-full ${c.dot}`} aria-hidden="true" />
      {info.short}
      {showDesc && <span className="font-normal opacity-80"> · {info.desc}</span>}
    </span>
  );
}
