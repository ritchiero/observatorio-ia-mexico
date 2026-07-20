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
  urlGaceta?: string;
  copiaRespaldo?: string;
}

interface IniciativaRecord {
  id: string;
  titulo?: string;
  fecha?: string;
  camara?: string;
  proponente?: string;
  partido?: string;
  status?: string;
  estatus?: string;
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
    urlGaceta: i.urlGaceta,
    copiaRespaldo: i.urlPDFBackup,
  };
}

/** Todas las fichas que tienen artículo, más recientes primero. */
export async function getFichas(): Promise<FichaHemeroteca[]> {
  try {
    const r = await fetch(`${CANONICAL_BASE}/api/iniciativas`, { next: { revalidate: 600 } });
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
