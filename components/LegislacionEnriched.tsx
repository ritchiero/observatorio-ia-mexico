'use client';

import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Scale, ShieldCheck } from 'lucide-react';

interface LegStats { total: number; activas: number; aprobadas: number; verificadas: number }
interface Iniciativa { id: string; titulo: string; status?: string; proponente?: string; fecha?: string; camara?: string; estadoVerificacion?: string }
export interface LegislacionProps { legStats: LegStats; loading: boolean; iniciativas: Iniciativa[] }
type Locale = 'es' | 'en';

const copy = {
  es: {
    kicker: 'El radar legislativo',
    title: 'Últimas iniciativas de IA',
    intro: 'Lo más reciente del Congreso de la Unión y los congresos estatales.',
    newest: 'La más reciente',
    read: 'Leer iniciativa',
    list: 'También en el radar',
    all: 'Ver todas las iniciativas',
    noData: 'No hay iniciativas para mostrar en este momento.',
    loading: 'Cargando las últimas iniciativas…',
    counts: ['En el registro', 'Activas', 'Aprobadas o publicadas', 'Desechadas', 'Verificadas con IA'],
    verified: 'Verificada con IA', review: 'Verificación en revisión', pending: 'Verificación pendiente',
    stages: ['Aprobada', 'Dictamen', 'En comisiones', 'Turnada', 'En discusión', 'Primera lectura', 'Desechada', 'Presentada', 'En proceso', 'En trámite'],
  },
  en: {
    kicker: 'Legislative radar',
    title: 'Latest AI bills',
    intro: 'New proposals from Mexico’s federal and state legislatures.',
    newest: 'Most recent',
    read: 'Read bill',
    list: 'Also on the radar',
    all: 'See all bills',
    noData: 'No bills to show right now.',
    loading: 'Loading the latest bills…',
    counts: ['In the register', 'Active', 'Passed or published', 'Dismissed', 'AI-verified'],
    verified: 'AI-verified', review: 'Verification under review', pending: 'Verification pending',
    stages: ['Passed', 'Committee report', 'In committee', 'Referred', 'Under debate', 'First reading', 'Dismissed', 'Introduced', 'In progress', 'Pending'],
  },
};

// Short display titles for specific public records. Other bills keep their source title.
const displayTitles: Record<string, Record<Locale, string>> = {
  FMHV3j86S5I7auFVssaJ: { es: 'Fraude financiero con IA contra personas mayores', en: 'AI-enabled financial fraud targeting older adults' },
  '9YSDYjsYl0vUtiFXYNm3': { es: 'IA para la prevención y detección temprana de enfermedades', en: 'AI for disease prevention and early detection' },
  L8jINV6fo9p2WeTOQ5bQ: { es: 'Responsabilidad civil por el uso de IA', en: 'Civil liability for the use of AI' },
};

const dateFormats = {
  es: new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
  en: new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }),
};

function stageOf(raw: string | undefined, locale: Locale) {
  const stages = copy[locale].stages;
  const s = (raw || '').toLowerCase();
  if (s.includes('aprob') || s.includes('publicad')) return stages[0];
  if (s.includes('dictam')) return stages[1];
  if (s.includes('comision')) return stages[2];
  if (s.includes('turnad')) return stages[3];
  if (s.includes('discus')) return stages[4];
  if (s.includes('lectura')) return stages[5];
  if (s.includes('desech') || s.includes('archiv')) return stages[6];
  if (s.includes('present')) return stages[7];
  if (s.includes('elabor') || s.includes('prepar') || s.includes('recib') || s.includes('proceso')) return stages[8];
  return raw ? raw.replace(/_/g, ' ') : stages[9];
}

function BillDate({ value, locale, before, after }: { value?: string; locale: Locale; before?: React.ReactNode; after?: React.ReactNode }) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return <>{before}<time dateTime={date.toISOString().slice(0, 10)}>{dateFormats[locale].format(date)}</time>{after}</>;
}

function BillBadges({ bill, locale }: { bill: Iniciativa; locale: Locale }) {
  const t = copy[locale];
  const verified = bill.estadoVerificacion === 'verificado';
  const review = bill.estadoVerificacion === 'revision';
  return (
    <div className="flex flex-wrap items-center gap-2 font-sans-tech text-xs font-medium leading-snug">
      <span className={"rounded-full border border-[#2855E0]/25 bg-[#2855E0]/5 px-2.5 py-1 text-[#2855E0]"}>{stageOf(bill.status, locale)}</span>
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 ${verified ? 'bg-[#087047]/5 text-[#087047]' : 'bg-gray-100 text-[#515E74]'}`}>
        {verified && <ShieldCheck size={13} aria-hidden="true" />}
        {verified ? t.verified : review ? t.review : t.pending}
      </span>
    </div>
  );
}

export default function LegislacionEnriched({ legStats, loading, iniciativas, locale = 'es' }: LegislacionProps & { locale?: Locale }) {
  const t = copy[locale];
  const indexHref = locale === 'en' ? '/en/legislacion' : '/legislacion';
  const [lead, ...support] = iniciativas.slice(0, 3);
  const discarded = Math.max(0, legStats.total - legStats.activas - legStats.aprobadas);
  const counts = [legStats.total, legStats.activas, legStats.aprobadas, discarded, legStats.verificadas];
  const titleOf = (bill: Iniciativa) => displayTitles[bill.id]?.[locale] ?? bill.titulo;
  const anchor = locale === 'en' ? 'latest-ai-bills' : 'novedades-legislativas';
  const sectionId = `${anchor}-heading`;

  return (
    <section id={anchor} aria-labelledby={sectionId} className="scroll-mt-28 border-y border-gray-200/50 bg-gray-50 px-4 py-12 text-[#0B1220] sm:px-6 lg:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 sm:mb-9">
          <div>
            <p className="inline-flex items-center gap-2 font-mono uppercase" style={{ padding: '7px 14px 7px 11px', border: '1px solid #2855E033', background: '#2855E00D', borderRadius: 999, fontSize: 10.5, letterSpacing: '0.18em', color: '#2855E0', fontWeight: 600 }}>
              <Scale size={13} aria-hidden="true" />{t.kicker}
            </p>
            <h2 id={sectionId} className="mt-5 font-serif-display text-[clamp(34px,6vw,56px)] leading-none font-medium tracking-[-0.035em]">{t.title}</h2>
            <p className="mt-3 max-w-lg font-sans-tech text-sm leading-relaxed text-[#3B475C] sm:text-base">{t.intro}</p>
          </div>
          <Link href={indexHref} className="inline-flex min-h-11 items-center gap-2 border-b border-[#2855E0] font-sans-tech text-sm font-semibold text-[#2855E0] hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2855E0]">
            {t.all}<ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </header>

        {lead ? (
          <div className={`grid items-stretch gap-y-6 ${support.length ? 'lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-x-9' : ''}`}>
            <article className="relative min-w-0">
              <Link href={`${indexHref}/${lead.id}`} className="group flex h-full min-h-68 flex-col gap-4 overflow-hidden rounded-xl border border-[#CED6E6] border-l-[5px] border-l-[#2855E0] bg-white p-5 text-[#0B1220] hover:shadow-lg motion-safe:transition-shadow focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2855E0] sm:p-8">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs font-medium text-[#515E74]">
                  <span className="text-[11px] font-bold tracking-widest uppercase">{t.newest}</span>
                  <BillDate value={lead.fecha} locale={locale} before={<span aria-hidden="true">/</span>} />
                </div>
                <h3 className="max-w-3xl font-sans-tech text-[clamp(1.45rem,3.2vw,2.4rem)] leading-tight font-semibold break-words tracking-[-0.015em] text-[#0B1220] group-hover:underline group-focus-visible:underline decoration-[#2855E0] underline-offset-4">
                  {titleOf(lead)}
                </h3>
                {lead.camara && <p className="font-sans-tech text-sm text-[#515E74]">{lead.camara}</p>}
                <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-2">
                  <BillBadges bill={lead} locale={locale} />
                  <span className="inline-flex items-center gap-1.5 font-sans-tech text-sm font-semibold text-[#2855E0]">{t.read}<ArrowRight size={17} aria-hidden="true" /></span>
                </div>
              </Link>
            </article>

            {support.length > 0 && (
              <aside className="min-w-0" aria-label={t.list}>
                <h3 className="mb-3 font-mono text-[11px] font-bold tracking-[0.11em] text-[#515E74] uppercase">{t.list}</h3>
                <ul className="grid gap-3">
                  {support.map((bill) => (
                    <li key={bill.id}>
                      <Link href={`${indexHref}/${bill.id}`} className="group grid min-h-11 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 rounded-xl border border-[#CED6E6] bg-white p-4 hover:shadow-lg motion-safe:transition-shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2855E0]">
                        <p className="font-mono text-xs font-medium text-[#3B475C]">
                          <BillDate value={bill.fecha} locale={locale} after={bill.camara && ' · '} />{bill.camara}
                        </p>
                        <ArrowUpRight size={18} className="col-start-2 row-start-1 row-span-2 mt-0.5 text-[#2855E0]" aria-hidden="true" />
                        <h4 className="font-sans-tech text-[clamp(1.05rem,2vw,1.25rem)] leading-tight font-semibold break-words group-hover:underline group-focus-visible:underline decoration-[#2855E0] underline-offset-3">
                          {titleOf(bill)}
                        </h4>
                        <div className="col-span-2"><BillBadges bill={bill} locale={locale} /></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </aside>
            )}
          </div>
        ) : (
          <p role={loading ? 'status' : undefined} className="border-y border-[#E5E9F2] py-8 font-sans-tech text-sm text-[#3B475C]">{loading ? t.loading : t.noData}</p>
        )}

        <dl className="mt-7 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-[#E5E9F2] py-3 sm:grid-cols-3 lg:grid-cols-5">
          {t.counts.map((label, index) => (
            <div key={label} className="flex flex-wrap items-baseline gap-x-2">
              <dt className="font-sans-tech text-xs text-[#3B475C]">{label}</dt>
              <dd className="order-first shrink-0 font-mono text-sm font-bold tabular-nums text-[#0B1220]">{loading ? '—' : counts[index]}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
