import { StatusType } from '@/types';

// Twin en inglés de StatusBadge.tsx — mismo diseño, labels traducidos.

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadgeEn({ status }: StatusBadgeProps) {
  const statusConfig = {
    prometido: { label: 'Promised', emoji: '⚪', colors: 'bg-gray-800/40 text-gray-400 border-gray-700/30' },
    en_desarrollo: { label: 'In Development', emoji: '🟡', colors: 'bg-blue-50 text-blue-400 border-blue-800/30' },
    operando: { label: 'Operating', emoji: '🟢', colors: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/30' },
    incumplido: { label: 'Broken', emoji: '🔴', colors: 'bg-red-900/20 text-red-400 border-red-800/30' },
    abandonado: { label: 'Abandoned', emoji: '⚫', colors: 'bg-gray-800/40 text-gray-500 border-gray-700/30' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-medium font-sans-tech border whitespace-nowrap backdrop-blur-sm ${config.colors}`}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}
