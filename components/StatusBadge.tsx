import { StatusType } from '@/types';

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    prometido: { label: 'Prometido', emoji: '⚪', colors: 'bg-gray-100 text-gray-600 border-gray-300' },
    en_desarrollo: { label: 'En Desarrollo', emoji: '🟡', colors: 'bg-amber-50 text-amber-600 border-amber-200' },
    operando: { label: 'Operando', emoji: '🟢', colors: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    incumplido: { label: 'Incumplido', emoji: '🔴', colors: 'bg-red-50 text-red-600 border-red-200' },
    abandonado: { label: 'Abandonado', emoji: '⚫', colors: 'bg-gray-200 text-gray-700 border-gray-300' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border whitespace-nowrap ${config.colors}`}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}
