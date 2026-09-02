import type { Metadata } from 'next';
import Link from 'next/link';
import MapaVivo3D from '@/components/MapaVivo3D';
import { datosMapaVivo } from '@/lib/mapa-vivo-datos';

// English twin of app/mapa-vivo/page.tsx — same data, translated shell.

export const metadata: Metadata = {
  title: 'The living map — every dot is a real record',
  description:
    'The constellation of Observatorio IA México: announcements, bills, judicial cases, topics and people of the AI ecosystem across the Mexican state, connected and sourced.',
  alternates: { canonical: '/en/mapa-vivo', languages: { es: '/mapa-vivo', en: '/en/mapa-vivo' } },
};

export const revalidate = 300;

export default async function LivingMapPage() {
  const d = await datosMapaVivo();
  return (
    <div className="relative h-[100svh] min-h-[560px] w-full overflow-hidden" style={{ background: '#05070C', color: '#E7ECF7' }}>
      <div className="absolute inset-0" style={{
        background: `radial-gradient(ellipse 60% 50% at 22% 30%, rgba(77,123,255,0.09) 0%, transparent 60%),
          radial-gradient(ellipse 50% 60% at 80% 70%, rgba(61,224,255,0.07) 0%, transparent 60%),
          linear-gradient(180deg, #04050D 0%, #030409 100%)`,
      }} />

      <MapaVivo3D puntos={d.puntos} enlaces={d.enlaces} locale="en" />

      {/* Velo de legibilidad sobre la constelación, bajo el texto */}
      <div className="absolute inset-0 z-[5] pointer-events-none" style={{
        background: `linear-gradient(90deg, rgba(3,4,9,0.88) 0%, rgba(3,4,9,0.55) 34%, rgba(3,4,9,0.08) 55%, rgba(3,4,9,0) 70%),
          linear-gradient(0deg, rgba(3,4,9,0.82) 0%, rgba(3,4,9,0) 22%)`,
      }} />
      <div className="absolute left-5 top-5 md:left-10 md:top-8 z-10 pointer-events-none">
        <Link href="/en" className="pointer-events-auto font-sans-tech text-[11px] uppercase tracking-[0.28em] text-gray-400 hover:text-white transition-colors">
          Observatorio · IA México
        </Link>
      </div>

      <div className="absolute left-5 md:left-10 top-[13%] md:top-[14%] z-10 max-w-[560px] lg:max-w-[660px] pointer-events-none pr-5">
        <h1 className="font-serif-display font-medium leading-[0.98] tracking-[-0.03em]" style={{ fontSize: 'clamp(40px, min(7.2vw, 10.5svh), 100px)', color: '#EDF1FA' }}>
          The real map of{' '}
          <span style={{
            background: 'linear-gradient(135deg, #3DE0FF 0%, #4D7BFF 55%, #A47CFF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>AI in the Mexican state</span>
        </h1>
        <p className="font-sans-tech mt-5 text-[14.5px] leading-relaxed text-[#9AA6C2] max-w-[400px]">
          Every dot is a public record with a source; every line, a documented relationship.
          Not a list: the whole ecosystem — three branches of government, academia and the private sector — under the lens.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 pointer-events-auto">
          <Link href="/en/grafo" className="font-sans-tech text-[12.5px] font-semibold rounded-full px-4 py-2 transition-transform hover:scale-[1.03]"
            style={{ color: '#05070C', background: 'linear-gradient(135deg, #3DE0FF, #4D7BFF)' }}>
            Explore the interactive map →
          </Link>
          <Link href="/en/metodologia" className="font-sans-tech text-[12.5px] rounded-full px-4 py-2 border border-white/12 text-[#E7ECF7] hover:border-cyan-300/50 transition-colors">
            How we verify the data
          </Link>
        </div>
      </div>

      <div className="absolute right-5 top-5 md:right-10 md:top-8 z-10 text-right font-sans-tech text-[13px] leading-6 text-[#7886A2] pointer-events-none">
        <div><strong className="text-[#E7ECF7]">{d.puntos.length.toLocaleString('en-US')}</strong> public objects</div>
        <div><strong className="text-[#E7ECF7]">{d.enlaces.length}</strong> documented relationships</div>
        <div><strong className="text-[#E7ECF7]">5</strong> branches of state and society</div>
      </div>

      <div className="absolute bottom-5 md:bottom-8 left-5 md:left-10 z-10 grid grid-cols-2 gap-x-6 gap-y-2 md:flex md:flex-wrap md:items-end md:gap-x-8 pointer-events-none max-w-[58vw] md:max-w-none">
        {[[d.stats.anuncios, 'official announcements'], [d.stats.iniciativas, 'AI bills'], [d.stats.casos, 'judicial cases'], [d.stats.fuentes, 'cited sources & documents'], [d.stats.eventos, 'monitoring events']].map(([n, l]) => (
          <div key={String(l)}>
            <div className="font-serif-display text-3xl md:text-4xl" style={{
              background: 'linear-gradient(135deg, #3DE0FF, #A47CFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{String(n)}</div>
            <div className="font-sans-tech text-[11px] uppercase tracking-[0.18em] text-[#7886A2]">{String(l)}</div>
          </div>
        ))}
      </div>

      <div className="absolute bottom-5 md:bottom-8 right-5 md:right-10 z-10 text-right font-sans-tech text-[11px] leading-5 text-[#7886A2] max-w-[46vw]">
        <div className="pointer-events-none hidden md:block"><span className="inline-block h-2 w-2 rounded-full align-middle mr-1.5" style={{ background: '#3DE0FF', boxShadow: '0 0 8px #3DE0FF88' }} />1 dot = 1 public object: record, source or event</div>
        <div className="pointer-events-none hidden md:block">drag to rotate · scroll to zoom · click opens the record</div>
        <div className="mt-2 inline-flex rounded-full border border-white/15 overflow-hidden pointer-events-auto">
          <a href="/mapa-vivo?hl=es" className="px-3 py-1 text-[#B5BFD4] hover:text-white transition-colors">ES</a>
          <span className="px-3 py-1 font-semibold text-[#05070C]" style={{ background: '#E7ECF7' }}>EN</span>
        </div>
      </div>
    </div>
  );
}
