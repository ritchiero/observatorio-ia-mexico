'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, FileText, ExternalLink } from 'lucide-react';
import type { ItemHemeroteca, Tono } from '@/lib/hemeroteca';

const TONO_CLASSES: Record<Tono, string> = {
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  slate: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function HemerotecaListEn({ items }: { items: ItemHemeroteca[] }) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const norm = q.trim().toLowerCase();
    if (!norm) return items;
    return items.filter((it) => it.texto.includes(norm));
  }, [q, items]);

  return (
    <div>
      <div className="mb-6 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
        <Search className="h-4 w-4 text-slate-400 shrink-0" aria-hidden />
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title, sponsor, topic…"
          className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
        />
        <span className="shrink-0 text-xs text-slate-400 font-mono">{filtered.length} / {items.length}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          No records match &ldquo;{q}&rdquo;.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Link
              key={item.id}
              href={`/en/hemeroteca/${item.slug}`}
              className="group flex flex-col rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-cyan-300 hover:shadow-md"
            >
              <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className={`rounded border px-1.5 py-0.5 font-medium ${TONO_CLASSES[item.organoTono]}`}>{item.organoLabel}</span>
                <span className={`rounded border px-1.5 py-0.5 font-medium ${TONO_CLASSES[item.vigenciaTono]}`}>{item.vigenciaLabel}</span>
                {item.fechaLegible && <span className="ml-auto font-mono text-slate-400">{item.fechaLegible}</span>}
              </div>
              <h3 className="mb-1.5 line-clamp-2 font-serif-display text-lg leading-snug text-slate-900 group-hover:text-cyan-700">
                {item.titulo}
              </h3>
              <p className="mb-3 line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">{item.resumen}</p>
              <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
                <span>{item.materia}</span>
                <span className="inline-flex items-center gap-1">
                  {item.copiaRespaldo && <FileText className="h-3.5 w-3.5" aria-hidden />}
                  {item.urlGaceta && <ExternalLink className="h-3.5 w-3.5" aria-hidden />}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
