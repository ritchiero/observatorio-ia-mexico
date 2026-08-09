import Link from 'next/link';
import { Radar } from 'lucide-react';
import { iniciativasRumboLeyGeneral, camaraLegible, tonoEstatus } from '@/lib/monitoreo-legislativo';
import { estatusLegible } from '@/lib/hemeroteca';
import { ESTATUS_INICIATIVA_EN } from '@/lib/i18n/labels-en';

// Monitoreo legislativo — sección viva de /proceso-legislativo: el carril de
// proyectos que buscan la Ley General de IA o habilitarla (reformas al art.
// 73, leyes generales/nacionales, agencia reguladora). Server component
// asíncrono: los datos salen del tracker (colección `iniciativas`) con
// revalidación de 30 min; cuando se ingesta una iniciativa nueva del carril,
// aparece aquí sin tocar código.

const T = {
  es: {
    kicker: 'Seguimiento en vivo · desde el tracker',
    titulo: 'Monitoreo legislativo',
    intro: 'Todos los proyectos del tracker que buscan la Ley General de IA o habilitarla: reformas al artículo 73 (facultar al Congreso), leyes generales o nacionales de IA y propuestas de agencia reguladora. El estatus refleja el de la fuente parlamentaria y cada ficha trae su fuente.',
    columnas: { fecha: 'Fecha', iniciativa: 'Iniciativa', camara: 'Cámara', estatus: 'Estatus' },
    total: (n: number) => `${n} proyectos en el carril de la Ley General`,
    vacio: 'No se pudieron cargar las iniciativas en este momento.',
    verTodas: 'Ver todas las iniciativas en el tracker →',
    nota: 'Esta lista se actualiza automáticamente cuando el Observatorio ingesta nuevas iniciativas del carril.',
  },
  en: {
    kicker: 'Live tracking · from the tracker',
    titulo: 'Legislative monitoring',
    intro: 'Every project in the tracker aiming at the Ley General de IA (General AI Law) or enabling it: amendments to article 73 (empowering Congress), general or national AI laws, and regulatory-agency proposals. The status mirrors the parliamentary source, and every record carries its source.',
    columnas: { fecha: 'Date', iniciativa: 'Bill', camara: 'Chamber', estatus: 'Status' },
    total: (n: number) => `${n} projects on the General-Law track`,
    vacio: 'The bills could not be loaded right now.',
    verTodas: 'See every bill in the tracker →',
    nota: 'This list updates automatically whenever the Observatory ingests new bills on this track.',
  },
} as const;

const TONO_CLASE: Record<string, string> = {
  verde: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  ambar: 'bg-amber-50 text-amber-700 border-amber-200',
  rojo: 'bg-red-50 text-red-600 border-red-200',
  gris: 'bg-gray-100 text-gray-600 border-gray-200',
};

function fechaCorta(iso: string | undefined, locale: 'es' | 'en'): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(locale === 'en' ? 'en-US' : 'es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function MonitoreoLegislativo({ locale = 'es' }: { locale?: 'es' | 'en' }) {
  const t = T[locale];
  const items = await iniciativasRumboLeyGeneral();
  const pref = locale === 'en' ? '/en' : '';
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center shrink-0">
          <Radar className="w-5 h-5 text-cyan-600" />
        </div>
        <div>
          <h2 className="font-serif-display text-xl sm:text-2xl font-light text-gray-900">{t.titulo}</h2>
          <p className="text-xs text-gray-500 font-sans-tech">{t.kicker}</p>
        </div>
      </div>
      <p className="font-sans-tech text-sm text-gray-600 leading-relaxed mt-3 mb-5 max-w-3xl">{t.intro}</p>

      {items.length === 0 ? (
        <p className="font-sans-tech text-sm text-gray-400 border border-dashed border-gray-200 rounded-xl p-5">{t.vacio}</p>
      ) : (
        <>
          <p className="font-sans-tech text-xs uppercase tracking-wider text-cyan-700 mb-3">{t.total(items.length)}</p>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-sans-tech">
                <thead>
                  <tr className="bg-gray-50 text-left text-[11px] uppercase tracking-wider text-gray-400">
                    <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.columnas.fecha}</th>
                    <th className="px-4 py-2.5 font-medium">{t.columnas.iniciativa}</th>
                    <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.columnas.camara}</th>
                    <th className="px-4 py-2.5 font-medium whitespace-nowrap">{t.columnas.estatus}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((i) => (
                    <tr key={i.id} className="hover:bg-cyan-50/40 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap align-top">{fechaCorta(i.fecha, locale)}</td>
                      <td className="px-4 py-3 align-top">
                        <Link href={`${pref}/legislacion/${i.id}`} className="text-gray-900 hover:text-cyan-700 leading-snug">
                          {i.titulo}
                        </Link>
                        {i.proponente && (
                          <span className="block text-xs text-gray-400 mt-0.5">
                            {i.proponente}
                            {i.partido ? ` · ${i.partido}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap align-top">{camaraLegible(i.camara)}</td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs ${TONO_CLASE[tonoEstatus(i.estatus)]}`}>
                          {locale === 'en'
                            ? ESTATUS_INICIATIVA_EN[i.estatus ?? ''] ?? estatusLegible(i.estatus)
                            : estatusLegible(i.estatus)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
            <p className="font-sans-tech text-xs text-gray-400">{t.nota}</p>
            <Link href={`${pref}/legislacion`} className="font-sans-tech text-sm text-cyan-700 hover:text-cyan-900 font-medium">
              {t.verTodas}
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
