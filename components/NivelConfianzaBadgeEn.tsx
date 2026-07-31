'use client';

// Twin en inglés de NivelConfianzaBadge.tsx — misma lógica de clasificación
// (nivelConfianza/lib/nivelConfianza.ts es idioma-neutral, solo procesa
// campos de datos), labels vía NIVEL_INFO_EN.

import { nivelConfianza, type NivelConfianza } from '@/lib/nivelConfianza';
import { NIVEL_INFO_EN } from '@/lib/i18n/labels-en';

const ESTILO: Record<NivelConfianza, { text: string; bg: string; border: string; dot: string }> = {
  oficial: { text: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  documentada: { text: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', dot: 'bg-sky-500' },
  sin_verificar: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500' },
};

interface Props {
  item?: unknown;
  nivel?: NivelConfianza;
  size?: 'sm' | 'md';
  showDesc?: boolean;
  className?: string;
}

export default function NivelConfianzaBadgeEn({ item, nivel, size = 'md', showDesc = false, className = '' }: Props) {
  const n: NivelConfianza = nivel ?? nivelConfianza(item);
  const info = NIVEL_INFO_EN[n];
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
