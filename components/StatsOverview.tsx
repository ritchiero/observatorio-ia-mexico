import { Anuncio } from '@/types';
import { 
  ChartBarIcon, 
  CheckCircleIcon, 
  WrenchScrewdriverIcon, 
  DocumentTextIcon, 
  XCircleIcon 
} from '@heroicons/react/24/outline';

interface StatsOverviewProps {
  anuncios: Anuncio[];
}

export default function StatsOverview({ anuncios }: StatsOverviewProps) {
  const total = anuncios.length;
  const operando = anuncios.filter(a => a.status === 'operando').length;
  const enDesarrollo = anuncios.filter(a => a.status === 'en_desarrollo').length;
  const prometido = anuncios.filter(a => a.status === 'prometido').length;
  const incumplido = anuncios.filter(a => a.status === 'incumplido').length;

  const stats = [
    { label: 'Total', value: total, Icon: ChartBarIcon, color: 'text-cyan-400' },
    { label: 'Operando', value: operando, Icon: CheckCircleIcon, color: 'text-emerald-400' },
    { label: 'En Desarrollo', value: enDesarrollo, Icon: WrenchScrewdriverIcon, color: 'text-blue-400' },
    { label: 'Prometido', value: prometido, Icon: DocumentTextIcon, color: 'text-gray-400' },
    { label: 'Incumplido', value: incumplido, Icon: XCircleIcon, color: 'text-red-400' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 hover:border-blue-300/50 transition-colors"
        >
          <div className="flex flex-col items-center text-center">
            <stat.Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.color} mb-1.5 sm:mb-2`} />
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {stat.value}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
