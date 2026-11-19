// Piezas puras del agente de hemeroteca: localizar el texto de una iniciativa
// dentro de la página de la Gaceta, armar el Markdown del artículo y validar lo
// que devuelve el modelo. Sin red ni Firestore para poder probarlas.

export const CANONICAL_BASE = 'https://www.observatorio-ia-mexico.com';

/** Mínimo de texto fuente para escribir un artículo sin inventar. */
export const MIN_TEXTO_FUENTE = 1500;
/** Tope de texto fuente que se manda al modelo (~20k tokens). */
export const MAX_TEXTO_FUENTE = 60_000;

export interface DatosIniciativa {
  id: string;
  titulo: string;
  fecha?: string; // YYYY-MM-DD
  camara?: string;
  proponente?: string;
  partido?: string;
  estatus?: string;
  tipo?: string;
  urlGaceta?: string;
  urlPDFBackup?: string;
}

export interface BorradorArticulo {
  titulo: string;
  resumen: string;
  cuerpo: string;
  esSobreIA: boolean;
}

export function slugify(texto: string, max = 80): string {
  const base = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (base.length <= max) return base;
  const corte = base.slice(0, max);
  const ultimo = corte.lastIndexOf('-');
  return (ultimo > 20 ? corte.slice(0, ultimo) : corte).replace(/-+$/g, '');
}

/** Slug que no choca con los existentes: agrega -2, -3… si hace falta. */
export function slugUnico(texto: string, existentes: ReadonlySet<string>): string {
  const base = slugify(texto) || 'iniciativa';
  if (!existentes.has(base)) return base;
  for (let n = 2; ; n++) {
    const candidato = `${base}-${n}`;
    if (!existentes.has(candidato)) return candidato;
  }
}

function escaparRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function patronDePalabras(texto: string, n: number): RegExp | null {
  const palabras = texto
    .replace(/[«»"“”'’()]/g, ' ')
    .split(/\s+/)
    .map((p) => p.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
    .filter(Boolean)
    .slice(0, n);
  if (palabras.length < 5) return null;
  return new RegExp(palabras.map(escaparRegex).join('[\\s\\W]+'), 'iu');
}

/**
 * Busca la iniciativa dentro del texto plano de la página de la Gaceta (que
 * suele traer todas las iniciativas del día) y devuelve el tramo que empieza
 * en ella. null si no aparece: mejor no escribir que escribir sobre otra.
 */
export function localizarTexto(
  textoPagina: string,
  titulo: string,
  descripcion = '',
  max = MAX_TEXTO_FUENTE,
): string | null {
  const intentos = [patronDePalabras(titulo, 14), patronDePalabras(descripcion, 14)];
  for (const patron of intentos) {
    if (!patron) continue;
    const m = patron.exec(textoPagina);
    if (m) return textoPagina.slice(m.index, m.index + max);
  }
  return null;
}

function yaml(valor: string): string {
  return JSON.stringify(valor);
}

function limpiarProponente(p = ''): string {
  return p.replace(/^(del?|de la|de las|de los)\s+(diputad[oa]s?|senador(a|es|as)?)\s+/i, '').trim();
}

/** Markdown final: frontmatter + título + cuerpo del modelo + fuentes deterministas. */
export function ensamblarArticulo(ini: DatosIniciativa, b: BorradorArticulo, slug: string): string {
  const proponente = limpiarProponente(ini.proponente);
  const fm: Array<[string, string | undefined]> = [
    ['title', yaml(b.titulo)],
    ['description', yaml(b.resumen)],
    ['slug', slug],
    ['poder', 'legislativo'],
    ['tipo', 'iniciativa'],
    ['camara', ini.camara],
    ['proponente', proponente ? `${proponente}${ini.partido ? ` (${ini.partido})` : ''}` : undefined],
    ['fecha', ini.fecha],
    ['estatus', ini.estatus],
    ['fuenteOficial', ini.urlGaceta],
    ['copiaRespaldo', ini.urlPDFBackup],
    ['canonical', `${CANONICAL_BASE}/hemeroteca/${slug}`],
    ['generadoPor', 'agente-hemeroteca'],
  ];
  const frontmatter = fm
    .filter(([, v]) => v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const fuentes: string[] = [];
  if (ini.urlGaceta) fuentes.push(`- [Publicación oficial en la Gaceta](${ini.urlGaceta})`);
  if (ini.urlPDFBackup) fuentes.push(`- [Texto íntegro de la iniciativa (PDF, respaldo en la hemeroteca)](${ini.urlPDFBackup})`);
  fuentes.push(`- [Ficha en el Observatorio](${CANONICAL_BASE}/legislacion/${ini.id})`);

  return [
    '---',
    frontmatter,
    '---',
    '',
    `# ${b.titulo}`,
    '',
    b.cuerpo.trim(),
    '',
    '## Fuentes',
    '',
    ...fuentes,
    '',
    '*Artículo redactado de forma automatizada a partir del texto publicado en la Gaceta. Puede contener errores; la fuente oficial prevalece.*',
    '',
  ].join('\n');
}

/** Limpia y valida el borrador del modelo. Devuelve el motivo si no sirve. */
export function validarBorrador(b: BorradorArticulo): { ok: true; borrador: BorradorArticulo } | { ok: false; motivo: string } {
  if (!b || typeof b !== 'object') return { ok: false, motivo: 'respuesta sin objeto' };
  if (!b.esSobreIA) return { ok: false, motivo: 'no_es_ia' };
  const titulo = String(b.titulo ?? '').replace(/\s+/g, ' ').trim();
  const resumen = String(b.resumen ?? '').replace(/\s+/g, ' ').trim();
  let cuerpo = String(b.cuerpo ?? '').trim();
  // El título y las fuentes los pone el código.
  cuerpo = cuerpo.replace(/^#\s+.*\n+/, '');
  cuerpo = cuerpo.replace(/\n##\s+Fuentes[\s\S]*$/i, '').trim();
  if (titulo.length < 10 || titulo.length > 160) return { ok: false, motivo: `título de ${titulo.length} caracteres` };
  if (resumen.length < 40 || resumen.length > 400) return { ok: false, motivo: `resumen de ${resumen.length} caracteres` };
  if (cuerpo.length < 600) return { ok: false, motivo: `cuerpo de ${cuerpo.length} caracteres` };
  if (cuerpo.length > 9000) return { ok: false, motivo: `cuerpo de ${cuerpo.length} caracteres` };
  if (!cuerpo.startsWith('**Qué es.**')) return { ok: false, motivo: 'el cuerpo no abre con **Qué es.**' };
  if (cuerpo.startsWith('---')) return { ok: false, motivo: 'el cuerpo trae frontmatter' };
  return { ok: true, borrador: { titulo, resumen, cuerpo, esSobreIA: true } };
}
