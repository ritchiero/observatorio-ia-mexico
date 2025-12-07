import { StatusType } from '@/types';

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    prometido: { label: 'Prometido', emoji: '⚪', colors: 'bg-gray-800/50 text-gray-400 border-gray-700' },
    en_desarrollo: { label: 'En Desarrollo', emoji: '🟡', colors: 'bg-amber-950/50 text-amber-400 border-amber-800/50' },
    operando: { label: 'Operando', emoji: '🟢', colors: 'bg-emerald-950/50 text-emerald-400 border-emerald-800/50' },
    incumplido: { label: 'Incumplido', emoji: '🔴', colors: 'bg-red-950/50 text-red-400 border-red-800/50' },
    abandonado: { label: 'Abandonado', emoji: '⚫', colors: 'bg-gray-950 text-gray-300 border-gray-700' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border whitespace-nowrap ${config.colors}`}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}
