// Hemeroteca: capa de datos + render de los artículos MD (server-side, indexable).
// Los artículos viven en Firestore (campo `articuloMD`) y se exponen vía /api/iniciativas.

// Fuente de datos: SIEMPRE el API público de producción. Es contenido publicado,
// y así el render en build-time funciona (la URL propia del deployment no está
// viva durante `next build`, lo que dejaba el índice vacío).
export const CANONICAL_BASE = 'https://www.observatorio-ia-mexico.com';

export interface FichaHemeroteca {
  id: string;
  slug: string;
  titulo: string;
  resumen: string;
  md: string;
  fecha?: string;
  camara?: string;
  proponente?: string;
  partido?: string;
  estatus?: string;
  tipo?: string;
  urlGaceta?: string;
  copiaRespaldo?: string;
  tematicas?: string[];
  numero?: number;
}

interface IniciativaRecord {
  id: string;
  numero?: number;
  titulo?: string;
  fecha?: string;
  camara?: string;
  proponente?: string;
  partido?: string;
  status?: string;
  estatus?: string;
  tipo?: string;
  tematicas?: string[];
  urlGaceta?: string;
  urlPDFBackup?: string;
  articuloMD?: string;
  articuloSlug?: string;
  articuloResumen?: string;
}

function toFicha(i: IniciativaRecord): FichaHemeroteca {
  return {
    id: i.id,
    slug: i.articuloSlug as string,
    titulo: i.titulo ?? '',
    resumen: i.articuloResumen ?? '',
    md: i.articuloMD ?? '',
    fecha: i.fecha,
    camara: i.camara,
    proponente: i.proponente,
    partido: i.partido,
    estatus: i.estatus ?? i.status,
    tipo: i.tipo,
    urlGaceta: i.urlGaceta,
    copiaRespaldo: i.urlPDFBackup,
    tematicas: Array.isArray(i.tematicas) ? i.tematicas : undefined,
    numero: typeof i.numero === 'number' ? i.numero : undefined,
  };
}

/** Todas las fichas que tienen artículo, más recientes primero. */
export async function getFichas(): Promise<FichaHemeroteca[]> {
  try {
    const r = await fetch(`${CANONICAL_BASE}/api/iniciativas`, { next: { revalidate: 120 } });
    if (!r.ok) return [];
    const d = await r.json();
    const items: IniciativaRecord[] = d.data ?? d.iniciativas ?? [];
    return items
      .filter((i) => i.articuloMD && i.articuloSlug)
      .map(toFicha)
      .sort((a, b) => (b.fecha ?? '').localeCompare(a.fecha ?? ''));
  } catch {
    return [];
  }
}

export async function getFicha(slug: string): Promise<FichaHemeroteca | null> {
  const fichas = await getFichas();
  return fichas.find((f) => f.slug === slug) ?? null;
}

// --- Render de Markdown acotado (server-side, sin dependencias) ---
// Gramática soportada (la que generan nuestros artículos): frontmatter YAML,
// #/##/### encabezados, **negrita**, *cursiva*, [texto](url), > cita, - lista, --- regla.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(s: string): string {
  let out = escapeHtml(s);
  // enlaces [texto](url) — solo http(s) por seguridad
  out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_m, t, u) => `<a href="${u}" rel="noopener">${t}</a>`);
  // negrita **texto**
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // cursiva *texto*
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return out;
}

export function stripFrontmatter(md: string): string {
  if (md.startsWith('---')) {
    const end = md.indexOf('\n---', 3);
    if (end !== -1) return md.slice(md.indexOf('\n', end + 1) + 1);
  }
  return md;
}

/** Convierte el cuerpo (sin frontmatter) del artículo a HTML. Contenido propio y confiable. */
export function renderMarkdown(md: string): string {
  const lines = stripFrontmatter(md).split('\n');
  const html: string[] = [];
  let para: string[] = [];
  let list: string[] = [];
  const flushPara = () => { if (para.length) { html.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushList = () => { if (list.length) { html.push(`<ul>${list.map((li) => `<li>${inline(li)}</li>`).join('')}</ul>`); list = []; } };

  for (const raw of lines) {
    const line = raw.replace(/\s+$/, '');
    if (!line.trim()) { flushPara(); flushList(); continue; }
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) { flushPara(); flushList(); const n = h[1].length; html.push(`<h${n}>${inline(h[2])}</h${n}>`); continue; }
    if (/^---+$/.test(line)) { flushPara(); flushList(); html.push('<hr/>'); continue; }
    if (/^>\s?/.test(line)) { flushPara(); flushList(); html.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`); continue; }
    if (/^[-*]\s+/.test(line)) { flushPara(); list.push(line.replace(/^[-*]\s+/, '')); continue; }
    flushList(); para.push(line.trim());
  }
  flushPara(); flushList();
  return html.join('\n');
}

// --- SEO: título, descripción y datos estructurados (ganar el clic en Google) ---

/** Limpia el '..' accidental y normaliza espacios. */
export function clean(s: string): string {
  return (s ?? '').replace(/\.{2,}$/, '.').replace(/\s+/g, ' ').trim();
}

/** Recorta por palabra a `max` chars, limpia signos y palabras funcionales colgantes. */
function recorta(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.lastIndexOf(' ', max);
  let r = s.slice(0, cut > 0 ? cut : max).replace(/[\s·:,.–—-]+$/, '');
  let prev = '';
  while (r !== prev) {
    prev = r;
    r = r.replace(/\s+(y|e|o|u|de|del|la|el|los|las|en|con|para|a|al|que|una|un|su|sus|por|sobre)$/i, '');
  }
  return r;
}

function anio(fecha?: string): string {
  if (!fecha) return '';
  const y = new Date(fecha).getFullYear();
  return Number.isFinite(y) ? String(y) : '';
}

/** <title> ≤60 chars, keyword al frente, marca en el sufijo (NO duplicada). */
export function buildTitle(f: FichaHemeroteca): string {
  const y = anio(f.fecha);
  const sufijo = ` · Iniciativa${f.camara ? ' ' + f.camara : ''}${y ? ' ' + y : ''}`;
  return recorta(f.titulo, Math.max(24, 60 - sufijo.length)) + sufijo;
}

/** Meta description ≤155 chars: dato al frente, autoría si cabe entera, CTA verificable. */
export function buildDescription(f: FichaHemeroteca): string {
  const CTA = ' Texto oficial y PDF.';
  const who = f.proponente ? ` ${f.proponente}${f.partido ? ` (${f.partido})` : ''}.` : '';
  const base = clean(f.resumen);
  const conAutor = clean(base + who);
  if ((conAutor + CTA).length <= 155) return conAutor + CTA;
  // No cabe la autoría entera: mejor un resumen limpio con elipsis que pegar el nombre a media frase.
  const room = 155 - CTA.length;
  if (base.length <= room) return base + CTA;
  return recorta(base, room - 1) + '…' + CTA;
}

/** JSON-LD @graph (Article + Legislation + BreadcrumbList) — resultados enriquecidos. */
export function jsonLdGraph(f: FichaHemeroteca): string {
  const url = `${CANONICAL_BASE}/hemeroteca/${f.slug}`;
  const img = `${CANONICAL_BASE}/og-image.png`;
  const org = { '@type': 'Organization', name: 'Observatorio IA México', url: CANONICAL_BASE };
  const temas = (f.tematicas ?? []).map((t) => t.replace(/_/g, ' '));
  const article = {
    '@type': 'Article',
    '@id': `${url}#article`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
    headline: recorta(f.titulo, 110),
    name: f.titulo,
    description: clean(f.resumen),
    inLanguage: 'es-MX',
    isAccessibleForFree: true,
    datePublished: f.fecha,
    dateModified: f.fecha,
    image: [img],
    author: org,
    publisher: { ...org, logo: { '@type': 'ImageObject', url: img } },
    isBasedOn: f.urlGaceta || undefined,
    citation: f.urlGaceta || undefined,
    about: [{ '@type': 'Thing', name: 'Inteligencia artificial' }, ...temas.map((t) => ({ '@type': 'Thing', name: t }))],
    keywords: temas.join(', ') || undefined,
    creativeWorkStatus: f.estatus,
    associatedMedia: f.copiaRespaldo
      ? { '@type': 'MediaObject', encodingFormat: 'application/pdf', contentUrl: f.copiaRespaldo }
      : undefined,
  };
  const legislation = {
    '@type': 'Legislation',
    '@id': `${url}#legislation`,
    name: f.titulo,
    legislationType: 'Bill',
    legislationDate: f.fecha,
    legislationJurisdiction: { '@type': 'AdministrativeArea', name: 'México' },
    legislationLegalForce: f.estatus === 'aprobada' ? 'InForce' : 'NotInForce',
    legislationIdentifier: f.numero ? `Iniciativa ${f.numero}` : undefined,
    legislationPassedBy: f.camara ? { '@type': 'GovernmentOrganization', name: f.camara } : undefined,
    legislationResponsible: f.proponente ? { '@type': 'Person', name: f.proponente } : undefined,
    creator: f.proponente ? { '@type': 'Person', name: f.proponente } : undefined,
    inLanguage: 'es-MX',
    url: f.urlGaceta || undefined,
  };
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: CANONICAL_BASE },
      { '@type': 'ListItem', position: 2, name: 'Hemeroteca', item: `${CANONICAL_BASE}/hemeroteca` },
      { '@type': 'ListItem', position: 3, name: f.titulo },
    ],
  };
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': [article, legislation, breadcrumb] });
}

// --- Clasificador: materia, cámara, estatus, año (para filtros y facetas) ---

const MATERIA_REGLAS: Array<[string, RegExp]> = [
  ['Deepfakes y violencia digital', /deepfake|violencia|pornograf|usurpac|proteccion_menores|proteccion_mujeres|delitos_sexuales/],
  ['Justicia y proceso', /judicial|amparo|supervision_humana|justicia|procedimiento|responsabilidades|juicios_mercantiles|impugnacion/],
  ['Datos y ciberseguridad', /privacidad|proteccion_datos|cibersegur|ciberdelin|delitos_inform|delitos_digit|\bseguridad\b/],
  ['Propiedad intelectual', /derechos_autor|propiedad_intelectual/],
  ['Educación', /educacion/],
  ['Salud', /salud/],
  ['Trabajo', /laboral|trabajo/],
  ['Neuroderechos', /neuroderechos/],
  ['Reforma constitucional', /reforma_constitucional|facultades_congreso/],
  ['Regulación general', /regulacion_general|agencia_reguladora|clasificacion_riesgos|etica|uso_responsable|marco_institucional|transparencia|gobierno_digital|inteligencia_artificial/],
];

export function materiaDe(f: { tematicas?: string[]; titulo?: string }): string {
  const t = ((f.tematicas ?? []).join(' ') + ' ' + (f.titulo ?? '')).toLowerCase();
  for (const [label, re] of MATERIA_REGLAS) if (re.test(t)) return label;
  return 'Otros';
}

export function camaraGrupo(c?: string): string {
  const s = (c ?? '').toLowerCase();
  if (s.includes('diputad')) return 'Diputados';
  if (s.includes('senad')) return 'Senado';
  if (!s) return 'Otro';
  return 'Congresos locales';
}

export function estatusGrupo(e?: string): string {
  const s = (e ?? '').toLowerCase();
  if (/aprob|publicad|vigente/.test(s)) return 'Aprobada';
  if (/desech|archiv|abandon|rechaz|desist/.test(s)) return 'Inactiva';
  return 'En trámite';
}

export function anioDe(fecha?: string): string {
  if (!fecha) return '';
  const y = new Date(fecha).getFullYear();
  return Number.isFinite(y) ? String(y) : '';
}

export interface Faceta { valor: string; n: number; }
export interface FacetasHemeroteca { materia: Faceta[]; camara: Faceta[]; estatus: Faceta[]; anio: Faceta[]; }

export function facetasDe(fichas: FichaHemeroteca[]): FacetasHemeroteca {
  const cuenta = (fn: (f: FichaHemeroteca) => string) => {
    const m = new Map<string, number>();
    for (const f of fichas) { const v = fn(f); if (v) m.set(v, (m.get(v) ?? 0) + 1); }
    return [...m.entries()].map(([valor, n]) => ({ valor, n })).sort((a, b) => b.n - a.n);
  };
  return {
    materia: cuenta((f) => materiaDe(f)),
    camara: cuenta((f) => camaraGrupo(f.camara)),
    estatus: cuenta((f) => estatusGrupo(f.estatus)),
    anio: cuenta((f) => anioDe(f.fecha)).sort((a, b) => b.valor.localeCompare(a.valor)),
  };
}

// --- Presentación de las filas (estilo hemeroteca legal) ---

export type Tono = 'green' | 'blue' | 'amber' | 'red' | 'violet' | 'slate';

const DIAS_SIN_ACTUALIZACION = 365;

function diasDesde(fecha?: string): number | null {
  if (!fecha) return null;
  const d = new Date(fecha);
  if (!Number.isFinite(d.getTime())) return null;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

export function estatusLegible(estatus?: string): string {
  const s = (estatus ?? '').trim();
  if (!s) return '';
  const labels: Record<string, string> = {
    aprobada: 'Aprobada',
    archivada: 'Archivada',
    desechada_termino: 'Desechada por término',
    en_comisiones: 'En comisiones',
    en_discusion: 'En discusión',
    en_elaboracion: 'En elaboración',
    en_proceso: 'En proceso',
    presentada: 'Presentada',
    presentado: 'Presentado',
    publicada: 'Publicada',
    recibida: 'Recibida',
    rechazada: 'Rechazada',
    turnada: 'Turnada',
  };
  return labels[s.toLowerCase()] ?? s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function vigenciaDe(estatus?: string, fecha?: string): { label: string; tono: Tono } {
  const s = (estatus ?? '').toLowerCase();
  if (/aprob|publicad|vigente|operando/.test(s)) return { label: 'Vigente', tono: 'green' };
  if (/derog|abrog|rechaz/.test(s)) return { label: 'Derogado', tono: 'red' };
  if (/desech|archiv|abandon|desist/.test(s)) return { label: 'Histórico', tono: 'amber' };
  const dias = diasDesde(fecha);
  if (dias !== null && dias > DIAS_SIN_ACTUALIZACION) return { label: 'Sin actualización reciente', tono: 'slate' };
  return { label: 'En seguimiento', tono: 'blue' };
}

export function organoDe(camara?: string): { label: string; icono: string; tono: Tono } {
  const s = (camara ?? '').toLowerCase();
  if (s.includes('diputad')) return { label: 'Cámara de Diputados', icono: 'landmark', tono: 'green' };
  if (s.includes('senad')) return { label: 'Cámara de Senadores', icono: 'landmark', tono: 'amber' };
  if (s.includes('corte') || s.includes('scjn') || s.includes('judicial') || s.includes('tribunal')) return { label: 'Poder Judicial', icono: 'scale', tono: 'blue' };
  if (s.includes('ejecutiv') || s.includes('presidencia') || s.includes('secretar')) return { label: 'Poder Ejecutivo', icono: 'building', tono: 'violet' };
  if (!s) return { label: 'Legislativo', icono: 'landmark', tono: 'slate' };
  return { label: camara as string, icono: 'map-pin', tono: 'slate' };
}

export function logoDeOrgano(camara?: string): string | undefined {
  const s = (camara ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  if (!s) return undefined;
  if (s.includes('diputad')) return '/logos/camara-diputados.svg';
  if (s.includes('senad')) return '/logos/senado.jpg';
  if (s.includes('cdmx') || s.includes('ciudad de mexico')) return '/logos/congreso-cdmx.svg';
  if (s.includes('michoacan')) return '/logos/congreso-michoacan.png';
  if (s.includes('chihuahua')) return '/logos/congreso-chihuahua.png';
  if (s.includes('queretaro')) return '/logos/congreso-queretaro.png';
  if (s.includes('yucatan')) return '/logos/congreso-yucatan.png';
  if (s.includes('guanajuato')) return '/logos/congreso-guanajuato.png';
  if (s.includes('campeche')) return '/logos/congreso-campeche.png';
  if (s.includes('quintana roo')) return '/logos/congreso-quintana-roo.svg';
  if (s.includes('corte') || s.includes('scjn')) return '/logos/scjn.png';
  if (s.includes('judicial') || s.includes('tribunal') || s.includes('juzgado')) return '/logos/pjf.svg';
  if (s.includes('presidencia')) return '/logos/presidencia.jpg';
  if (s.includes('economia')) return '/logos/economia.png';
  if (s.includes('educacion') || s.includes('sep')) return '/logos/sep.png';
  if (s.includes('cultura')) return '/logos/secretaria-cultura.svg';
  if (s.includes('salud')) return '/logos/secretaria-salud.png';
  if (s.includes('atdt') || s.includes('transformacion digital')) return '/logos/atdt.svg';
  if (s.includes('secihti') || s.includes('ciencia')) return '/logos/secihti.svg';
  return undefined;
}

export function jurisdiccionDe(camara?: string): string {
  const g = camaraGrupo(camara);
  if (g === 'Diputados' || g === 'Senado') return 'Federal';
  if (g === 'Congresos locales') return 'Local';
  return 'Institucional';
}

export function tipoEtiqueta(tipo?: string, estatus?: string): string {
  const t = (tipo ?? '').toLowerCase();
  if (t.includes('punto')) return 'Punto de acuerdo';
  if (t.includes('constitucional')) return 'Reforma constitucional';
  if (/aprob|publicad/.test((estatus ?? '').toLowerCase()) && t.startsWith('ley')) return 'Ley';
  if (t.startsWith('reforma')) return 'Reforma';
  if (t.startsWith('ley')) return 'Iniciativa de ley';
  return 'Iniciativa';
}

export interface ItemHemeroteca {
  id: string; slug: string; titulo: string; resumen: string;
  fecha?: string; anio: string; fechaLegible: string;
  materia: string; camaraGrupo: string;
  jurisdiccion: string;
  organoLabel: string; organoIcono: string; organoTono: Tono; organoLogo?: string;
  tipoLabel: string; vigenciaLabel: string; vigenciaTono: Tono;
  estatusFuente?: string; estatusFuenteLabel?: string;
  proponente?: string; camara?: string; numero?: number;
  tags: string[]; tagsExtra: number;
  urlGaceta?: string; copiaRespaldo?: string; texto: string;
}

const _norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function toItem(f: FichaHemeroteca): ItemHemeroteca {
  const org = organoDe(f.camara);
  const vig = vigenciaDe(f.estatus, f.fecha);
  const temas = (f.tematicas ?? []).map((t) => t.replace(/_/g, ' '));
  let fechaLegible = '';
  try { if (f.fecha) fechaLegible = new Date(f.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { /* */ }
  return {
    id: f.id, slug: f.slug, titulo: f.titulo, resumen: f.resumen,
    fecha: f.fecha, anio: anioDe(f.fecha), fechaLegible,
    materia: materiaDe(f), camaraGrupo: camaraGrupo(f.camara),
    jurisdiccion: jurisdiccionDe(f.camara),
    organoLabel: org.label, organoIcono: org.icono, organoTono: org.tono, organoLogo: logoDeOrgano(f.camara),
    tipoLabel: tipoEtiqueta(f.tipo, f.estatus),
    vigenciaLabel: vig.label, vigenciaTono: vig.tono,
    estatusFuente: f.estatus,
    estatusFuenteLabel: estatusLegible(f.estatus),
    proponente: f.proponente, camara: f.camara, numero: f.numero,
    tags: temas.slice(0, 3), tagsExtra: Math.max(0, temas.length - 3),
    urlGaceta: f.urlGaceta, copiaRespaldo: f.copiaRespaldo,
    texto: _norm([f.titulo, f.resumen, f.proponente, f.camara, temas.join(' ')].filter(Boolean).join(' ')),
  };
}

export function statsDe(fichas: FichaHemeroteca[]) {
  let diputados = 0, senado = 0, locales = 0;
  for (const f of fichas) {
    const g = camaraGrupo(f.camara);
    if (g === 'Diputados') diputados++;
    else if (g === 'Senado') senado++;
    else locales++;
  }
  return { total: fichas.length, diputados, senado, locales };
}
