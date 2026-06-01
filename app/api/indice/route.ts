import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// ---- helpers ----
type Doc = Record<string, unknown>;

const RE_OFICIAL = /(\.gob\.mx|dof\.gob\.mx|scjn|sjf2?\.scjn|diputados|senado\.gob|congreso|poderjudicial|tribunal|segob|inai\.org\.mx|ine\.mx|cndh|indautor|impi\.gob\.mx|profeco|banxico|inegi|sat\.gob\.mx|unesco|europa\.eu|un\.org|oecd\.org)/i;

function yearOf(v: unknown): string {
  if (v && typeof (v as { toDate?: () => Date }).toDate === 'function') {
    return String((v as { toDate: () => Date }).toDate().getFullYear());
  }
  const m = String(v ?? '').match(/(20\d{2})/);
  return m ? m[1] : '?';
}

function poder(d: Doc): 'Ejecutivo' | 'Legislativo' | 'Judicial' | 'Otro' {
  const t = `${d.dependencia ?? ''} ${d.responsable ?? ''}`.toLowerCase();
  if (/senado|diputad|congreso|c[áa]mara|legislat|jucopo/.test(t)) return 'Legislativo';
  if (/suprema|tribunal|poder judicial|scjn|judicatura/.test(t)) return 'Judicial';
  if (/presidencia|secretar|agencia|atdt|conahcyt|secihti|shcp|gobierno de|gobernaci|imss|issste|salud|econom|sep\b|hacienda|ejecutivo|indautor|impi/.test(t)) return 'Ejecutivo';
  return 'Otro';
}

// Devuelve el nombre OFICIAL y completo del estado (no el pedazo que machea).
const ESTADOS: [RegExp, string][] = [
  [/ciudad de m[ée]xico|cdmx|congreso de la ciudad/, 'Ciudad de México'],
  [/estado de m[ée]xico|edomex|mexiquense/, 'Estado de México'],
  [/baja california sur/, 'Baja California Sur'],
  [/baja california/, 'Baja California'],
  [/nuevo le[óo]n/, 'Nuevo León'],
  [/san luis potos[íi]|san luis/, 'San Luis Potosí'],
  [/quintana roo/, 'Quintana Roo'],
  [/michoac\w*/, 'Michoacán'],
  [/yucat[áa]n/, 'Yucatán'],
  [/quer[ée]taro/, 'Querétaro'],
  [/jalisco/, 'Jalisco'], [/puebla/, 'Puebla'], [/sinaloa/, 'Sinaloa'], [/guanajuato/, 'Guanajuato'],
  [/veracruz/, 'Veracruz'], [/chihuahua/, 'Chihuahua'], [/sonora/, 'Sonora'], [/tabasco/, 'Tabasco'],
  [/oaxaca/, 'Oaxaca'], [/chiapas/, 'Chiapas'], [/hidalgo/, 'Hidalgo'], [/morelos/, 'Morelos'],
  [/durango/, 'Durango'], [/coahuila/, 'Coahuila'], [/guerrero/, 'Guerrero'], [/tamaulipas/, 'Tamaulipas'],
  [/nayarit/, 'Nayarit'], [/colima/, 'Colima'], [/aguascalientes/, 'Aguascalientes'], [/campeche/, 'Campeche'],
  [/tlaxcala/, 'Tlaxcala'], [/zacatecas/, 'Zacatecas'],
];
function estado(d: Doc): string {
  const blob = `${d.camara ?? ''} ${d.entidadFederativa ?? ''} ${d.legislatura ?? ''}`.toLowerCase();
  if (d.camara === 'Diputados' || d.camara === 'Senado' || /\bfederal\b/.test(blob)) return 'Federal';
  for (const [re, nombre] of ESTADOS) if (re.test(blob)) return nombre;
  if (/local|estatal|congreso d/.test(blob)) return 'Estatal (sin especificar)';
  return 'Federal';
}

function enfoque(tipo: string): 'integral' | 'ajuste' | 'otro' {
  const t = (tipo || '').toLowerCase();
  if (t.startsWith('reforma')) return 'ajuste';
  if (t.includes('ley')) return 'integral';
  return 'otro';
}

const PESO: Record<string, number> = { operando: 1, en_desarrollo: 0.5, prometido: 0.25, incumplido: 0, abandonado: 0 };

function inc(o: Record<string, number>, k: string) { o[k] = (o[k] || 0) + 1; }
function topN(o: Record<string, number>, n: number) {
  return Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ k, v }));
}

export async function GET() {
  try {
    const db = getAdminDb();
    const hoy = new Date().toISOString().slice(0, 10);
    const [aSnap, iSnap, cSnap] = await Promise.all([
      db.collection('anuncios').get(),
      db.collection('iniciativas').get(),
      db.collection('casos_ia').get(),
    ]);
    const anuncios = aSnap.docs.filter(d => !d.data().oculto).map(d => d.data() as Doc);
    const inis = iSnap.docs.filter(d => !d.data().oculto).map(d => d.data() as Doc);
    const casos = cSnap.docs.filter(d => !d.data().oculto).map(d => d.data() as Doc);

    // ---- TRACKER (Ejecutivo) ----
    const porPoder: Record<string, number> = {};
    anuncios.forEach(a => inc(porPoder, poder(a)));
    const ejec = anuncios.filter(a => poder(a) === 'Ejecutivo');
    const trkStatus: Record<string, number> = {};
    ejec.forEach(a => inc(trkStatus, String(a.status ?? '?')));
    const indice = ejec.length ? Math.round(ejec.reduce((s, a) => s + (PESO[String(a.status)] ?? 0), 0) / ejec.length * 100) : 0;
    const vencidas = ejec.filter(a => {
      const fp = yearOf(a.fechaPrometida) !== '?' ? String((a.fechaPrometida as { toDate?: () => Date })?.toDate?.().toISOString?.().slice(0, 10) ?? a.fechaPrometida).slice(0, 10) : '';
      return fp && fp < hoy && ['prometido', 'en_desarrollo', 'incumplido'].includes(String(a.status));
    }).length;
    const depScore: Record<string, { n: number; sum: number }> = {};
    ejec.forEach(a => {
      const d = String(a.dependencia || a.responsable || '?');
      depScore[d] = depScore[d] || { n: 0, sum: 0 };
      depScore[d].n++; depScore[d].sum += (PESO[String(a.status)] ?? 0);
    });
    const porDependencia = Object.entries(depScore).filter(([, v]) => v.n >= 2)
      .map(([d, v]) => ({ dependencia: d, n: v.n, score: Math.round(v.sum / v.n * 100) }))
      .sort((a, b) => b.score - a.score || b.n - a.n);

    // ---- LEGISLACIÓN ----
    const legStatus: Record<string, number> = {};
    inis.forEach(i => inc(legStatus, String(i.status || i.estatus || '?')));
    const enf = { integral: 0, ajuste: 0, otro: 0 };
    const ajustesPorLey: Record<string, number> = {};
    const porTema: Record<string, number> = {};
    const porCamara: Record<string, number> = {};
    const porAnio: Record<string, number> = {};
    inis.forEach(i => {
      enf[enfoque(String(i.tipo))]++;
      if (enfoque(String(i.tipo)) === 'ajuste') inc(ajustesPorLey, String(i.tipo));
      inc(porCamara, String(i.camara || '?'));
      inc(porAnio, yearOf(i.fecha));
      ((i.tematicas as string[]) || (i.temas as string[]) || []).forEach(t => inc(porTema, String(t)));
    });

    // ---- RANKING ESTATAL ----
    const porEstado: Record<string, number> = {};
    inis.forEach(i => inc(porEstado, estado(i)));
    const federal = porEstado['Federal'] || 0;
    const estatalArr = Object.entries(porEstado).filter(([k]) => k !== 'Federal')
      .map(([k, v]) => ({ estado: k, n: v })).sort((a, b) => b.n - a.n);

    // ---- CASOS ----
    const casosMateria: Record<string, number> = {};
    const casosTribunal: Record<string, number> = {};
    casos.forEach(c => { inc(casosMateria, String(c.materia || '?')); inc(casosTribunal, String(c.tribunalActual || '?')); });
    const conCriterio = casos.filter(c => c.criterio || ((c.criterios as unknown[]) || []).length).length;

    // ---- CONFIANZA / FUENTES ----
    const pctOficial = (arr: Doc[]) => arr.length ? Math.round(arr.filter(x => RE_OFICIAL.test(JSON.stringify(x))).length / arr.length * 100) : 0;

    return NextResponse.json({
      generatedAt: new Date().toISOString(),
      tracker: {
        totalAnuncios: anuncios.length,
        porPoder,
        ejecutivo: { n: ejec.length, indiceCumplimiento: indice, porStatus: trkStatus, vencidas, porDependencia },
      },
      legislacion: {
        total: inis.length,
        leyVigente: legStatus['publicada'] || 0,
        porStatus: legStatus,
        enfoque: enf,
        ajustesPorLey: topN(ajustesPorLey, 8),
        porCamara: topN(porCamara, 8),
        porAnio: Object.fromEntries(Object.entries(porAnio).sort()),
        porTema: topN(porTema, 10),
      },
      estatal: { federal, totalEstatal: inis.length - federal, porEstado: estatalArr },
      casos: { total: casos.length, conCriterio, porMateria: casosMateria, porTribunal: casosTribunal },
      confianza: {
        oficialPct: { anuncios: pctOficial(anuncios), iniciativas: pctOficial(inis), casos: pctOficial(casos) },
        sinFuente: [...anuncios, ...inis, ...casos].filter(x => !/https?:\/\//.test(JSON.stringify(x))).length,
      },
    });
  } catch (error) {
    console.error('[API/indice] error:', error);
    return NextResponse.json({ error: 'Error al computar el índice' }, { status: 500 });
  }
}
