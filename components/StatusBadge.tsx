import { StatusType } from '@/types';

interface StatusBadgeProps {
  status: StatusType;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    prometido: { label: 'Prometido' },
    en_desarrollo: { label: 'En Desarrollo' },
    operando: { label: 'Operando' },
    incumplido: { label: 'Incumplido' },
    abandonado: { label: 'Abandonado' },
  };

  const config = statusConfig[status];

  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border border-gray-300 bg-white text-gray-700">
      {config.label}
    </span>
  );
}
