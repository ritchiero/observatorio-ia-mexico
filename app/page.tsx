import Link from 'next/link';

export default function Home() {
  const anuncios = [
    {
      fecha: 'Abril',
      anuncio: 'Laboratorio Nacional de IA',
      responsable: 'Sheinbaum',
      status: 'incumplido',
      statusLabel: 'INCUMPLIDO',
      fechaPrometida: 'Oct 2025',
      cumplida: false,
      detalle: 'Prometido para octubre por la presidenta Sheinbaum. Octubre llegó y el laboratorio no.',
    },
    {
      fecha: 'Julio',
      anuncio: 'Modelo de lenguaje propio',
      responsable: 'Ebrard',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Anunciado en julio por Marcelo Ebrard. Sin documentación técnica ni código público.',
    },
    {
      fecha: 'Julio',
      anuncio: 'Plataforma México IA+',
      responsable: 'Economía + CCE',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Evento realizado. Sin productos concretos.',
    },
    {
      fecha: 'Sept',
      anuncio: 'Inversión CloudHQ $4.8B USD',
      responsable: 'Sheinbaum / Ebrard',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Anunciado. En planeación.',
    },
    {
      fecha: 'Oct',
      anuncio: 'Marco normativo de IA',
      responsable: 'Senado',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Propuesta publicada. Sin aprobación.',
    },
    {
      fecha: 'Nov',
      anuncio: 'Centro Público de Formación en IA',
      responsable: 'ATDT + Infotec + TecNM',
      status: 'en_desarrollo',
      statusLabel: 'EN DESARROLLO',
      detalle: 'Convocatoria cerrada. Las clases inician en enero de 2026.',
    },
    {
      fecha: 'Nov',
      anuncio: 'KAL - Modelo de lenguaje mexicano',
      responsable: 'Saptiva + SE',
      status: 'en_desarrollo',
      statusLabel: 'EN DESARROLLO',
      detalle: 'Presentado sin documentación técnica, sin código público, sin benchmarks.',
    },
    {
      fecha: 'Nov',
      anuncio: 'Coatlicue - Supercomputadora',
      responsable: 'Sheinbaum',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      fechaPrometida: '2026',
      cumplida: false,
      detalle: 'Será "la más poderosa de América Latina" cuando se construya en 2026, si todo sale bien.',
    },
    {
      fecha: 'Nov',
      anuncio: 'Regulación regional IA (APEC)',
      responsable: 'Marcelo Ebrard',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Propuesta diplomática. Sin acuerdo vinculante.',
    },
    {
      fecha: 'Dic',
      anuncio: '15 carreras de bachillerato con IA',
      responsable: 'SEP',
      status: 'prometido',
      statusLabel: 'PROMETIDO',
      detalle: 'Aprobadas. Implementación: próximo ciclo escolar.',
    },
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      incumplido: 'bg-red-50 text-red-700 border-red-200',
      en_desarrollo: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      prometido: 'bg-gray-100 text-gray-700 border-gray-300',
      operando: 'bg-green-50 text-green-700 border-green-200',
      abandonado: 'bg-black text-white border-black',
    };
    return colors[status as keyof typeof colors] || colors.prometido;
  };

  const getStatusEmoji = (status: string) => {
    const emojis = {
      incumplido: '🔴',
      en_desarrollo: '🟡',
      prometido: '⚪',
      operando: '🟢',
      abandonado: '⚫',
    };
    return emojis[status as keyof typeof emojis] || '⚪';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero con impacto - Fondo oscuro */}
      <section className="bg-gray-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-baseline justify-center gap-12 mb-8">
            <div className="text-center">
              <div className="text-8xl font-bold mb-2">10</div>
              <div className="text-sm text-gray-400">anuncios principales<br />en 2025</div>
            </div>
            <div className="text-center">
              <div className="text-8xl font-bold text-red-600 mb-2">0</div>
              <div className="text-sm text-gray-400">productos funcionando<br />a escala</div>
            </div>
          </div>
          
          <p className="text-xl leading-relaxed mb-8 text-gray-300 text-center">
            El gobierno mexicano prometió laboratorios nacionales, modelos de lenguaje soberanos, 
            supercomputadoras con nombres aztecas. A diciembre de 2025, el inventario de lo que 
            realmente funciona cabe en una servilleta.
          </p>

          <div className="text-center">
            <Link 
              href="/dashboard" 
              className="inline-block bg-white text-gray-900 px-8 py-3 text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Ver el tracker completo →
            </Link>
          </div>
        </div>
      </section>

      {/* Tabla de anuncios */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">Anuncios de IA en 2025</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200">
              <thead className="bg-gray-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Fecha</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Anuncio</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Responsable</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Estado</th>
                </tr>
              </thead>
              <tbody>
                {anuncios.map((item, index) => (
                  <tr 
                    key={index}
                    className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                    }`}
                  >
                    <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">{item.fecha}</td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{item.anuncio}</div>
                      <div className="text-xs text-gray-500 mt-1">{item.detalle}</div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">{item.responsable}</td>
                    <td className="px-4 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-medium border ${getStatusColor(item.status)}`}>
                        <span>{getStatusEmoji(item.status)}</span>
                        <span>{item.statusLabel}</span>
                      </div>
                      {item.fechaPrometida && !item.cumplida && (
                        <div className="text-xs text-red-600 mt-1">
                          Fecha prometida: {item.fechaPrometida} ❌
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/dashboard" 
              className="inline-block bg-gray-900 text-white px-8 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Ver dashboard completo →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer mínimo */}
      <footer className="border-t border-gray-200 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium text-gray-900">Observatorio IA México</p>
              <p className="text-xs mt-1">Tracker ciudadano de anuncios gubernamentales sobre IA</p>
            </div>
            <div className="text-center md:text-right">
              <p>
                Una iniciativa de{' '}
                <a href="https://lawgic.com" target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 hover:underline">
                  Lawgic
                </a>
              </p>
              <p className="text-xs mt-1">
                Dirigida por{' '}
                <a 
                  href="https://www.linkedin.com/in/aldoricardorodriguez" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-medium text-gray-900 hover:underline"
                >
                  Aldo Ricardo Rodríguez Cortés
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
