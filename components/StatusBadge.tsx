import { StatusType } from '@/types';

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    prometido: { label: 'Prometido', emoji: '⚪' },
    en_desarrollo: { label: 'En Desarrollo', emoji: '🟡' },
    operando: { label: 'Operando', emoji: '🟢' },
    incumplido: { label: 'Incumplido', emoji: '🔴' },
    abandonado: { label: 'Abandonado', emoji: '⚫' },
  };

  const config = statusConfig[status];

  return (
    <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border border-gray-300 bg-white text-gray-700 whitespace-nowrap">
      <span className="hidden sm:inline">{config.emoji}</span>
      {config.label}
    </span>
  );
}
