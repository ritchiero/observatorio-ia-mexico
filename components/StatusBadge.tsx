import { StatusType } from '@/types';

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    prometido: { label: 'Prometido', emoji: '⚪', colors: 'bg-gray-800/40 text-gray-400 border-gray-700/30' },
    en_desarrollo: { label: 'En Desarrollo', emoji: '🟡', colors: 'bg-blue-50 text-blue-400 border-blue-800/30' },
    operando: { label: 'Operando', emoji: '🟢', colors: 'bg-emerald-900/20 text-emerald-400 border-emerald-800/30' },
    incumplido: { label: 'Incumplido', emoji: '🔴', colors: 'bg-red-900/20 text-red-400 border-red-800/30' },
    abandonado: { label: 'Abandonado', emoji: '⚫', colors: 'bg-gray-800/40 text-gray-500 border-gray-700/30' },
  };

  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium font-sans-tech border whitespace-nowrap backdrop-blur-sm ${config.colors}`}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  );
}
