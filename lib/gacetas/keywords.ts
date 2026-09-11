// Detección léxica de relevancia para el Observatorio: ¿este asunto legislativo
// trata de inteligencia artificial? Determinista y sin modelo: es lo que permite
// que el cron siga encontrando iniciativas aunque la API de Anthropic no tenga
// crédito (apagón del 4-sep-2026).

const RE_IA = new RegExp(
  [
    'inteligencia\\s+artificial',
    '\\bIA\\b',
    'deep\\s*fakes?',
    'ultrafalso',
    'algoritm',
    'aprendizaje\\s+(?:autom[aá]tico|de\\s+m[aá]quina)',
    'contenido\\s+sint[eé]tico',
    'sistemas?\\s+automatizad',
    'decisiones?\\s+automatizad',
    'modelos?\\s+generativ',
    'bots?\\s+(?:automatizad|de\\s+ia)',
    'neuroderecho',
  ].join('|'),
  'i',
);

/** Las URLs no cuentan: «condusef.gob.mx/…/IA-ENE-JUN-2025.pdf» disparaba \bIA\b sin hablar de IA. */
function sinUrls(texto: string): string {
  return (texto || '').replace(/(?:https?:\/\/|www\.)\S+/gi, ' ');
}

export function esRelevanteIA(texto: string): boolean {
  return RE_IA.test(sinUrls(texto));
}

/** Número de menciones de IA en un texto (para separar tema central de mención incidental). */
export function conteoIA(texto: string): number {
  const m = sinUrls(texto).match(new RegExp(RE_IA.source, 'gi'));
  return m ? m.length : 0;
}

/** Fragmento alrededor de la primera mención, para dejar evidencia legible en la ficha. */
export function evidenciaIA(texto: string, radio = 160): string {
  const t = sinUrls(texto).replace(/\s+/g, ' ');
  const m = t.match(RE_IA);
  if (!m || m.index === undefined) return '';
  const ini = Math.max(0, m.index - radio);
  const fin = Math.min(t.length, m.index + m[0].length + radio);
  return `${ini > 0 ? '…' : ''}${t.slice(ini, fin).trim()}${fin < t.length ? '…' : ''}`;
}

export const MIN_MENCIONES_CUERPO = 3;
/**
 * Menciones por cada 10 000 caracteres. Medido el 11-sep-2026 sobre las 23 fichas
 * con alguna mención de IA de las sesiones del 2 al 10-sep: las que realmente
 * tratan de IA caen entre 4.0 y 35.4, y las que sólo la citan de paso entre 0.4 y
 * 1.6 — un corte natural sin casos intermedios. El conteo absoluto no bastaba:
 * una iniciativa fiscal de 25 000 caracteres mencionó «el uso ético de la
 * inteligencia artificial» 4 veces en un párrafo retórico y se colaba.
 */
export const MIN_DENSIDAD_CUERPO = 3;

/** Menciones de IA por cada 10 000 caracteres de texto. */
export function densidadIA(texto: string): number {
  const largo = (texto || '').length;
  return largo > 0 ? conteoIA(texto) / (largo / 10000) : 0;
}

/**
 * Relevancia de un asunto con texto completo (Anexo II de Diputados, PDF):
 *  - 'titulo'  : el encabezado (título + proponente) ya habla de IA;
 *  - 'cuerpo'  : el título no, pero la IA es tema del documento — al menos
 *                MIN_MENCIONES_CUERPO menciones Y una densidad de al menos
 *                MIN_DENSIDAD_CUERPO por 10 000 caracteres;
 *  - null      : mención incidental o ninguna.
 * Ambas condiciones hacen falta: el conteo solo deja pasar párrafos retóricos de
 * documentos largos, y la densidad sola dejaría pasar un texto muy corto.
 */
export function relevanciaConCuerpo(encabezado: string, cuerpo: string): 'titulo' | 'cuerpo' | null {
  if (esRelevanteIA(encabezado)) return 'titulo';
  if (conteoIA(cuerpo) < MIN_MENCIONES_CUERPO) return null;
  return densidadIA(cuerpo) >= MIN_DENSIDAD_CUERPO ? 'cuerpo' : null;
}

/** Temáticas derivadas del texto, con el catálogo que ya usa el corpus. */
export function tematicasDe(texto: string): string[] {
  const t = (texto || '').toLowerCase();
  const out = new Set<string>(['inteligencia_artificial']);
  const reglas: Array<[RegExp, string]> = [
    [/deep\s*fake|contenido sint[eé]tico|ultrafalso|simulad[oa]s? mediante/i, 'deepfakes'],
    [/ni[ñn][oa]s?|menores|adolescen|infancia/i, 'proteccion_menores'],
    [/violencia digital|intimidad sexual|contenido [ií]ntimo/i, 'violencia_digital'],
    [/art[ií]culo\s+73\b|facultar? al congreso/i, 'facultades_congreso'],
    [/constituci[oó]n pol[ií]tica/i, 'reforma_constitucional'],
    [/c[oó]digo penal/i, 'sanciones'],
    [/datos personales|privacidad/i, 'privacidad_datos'],
    [/derechos? de autor|propiedad intelectual/i, 'derechos_autor'],
    [/salud/i, 'salud'],
    [/educaci[oó]n|escuela/i, 'educacion'],
    [/trabajo|laboral/i, 'derechos_laborales'],
    [/electoral|campa[ñn]a/i, 'electoral'],
    [/desinformaci[oó]n/i, 'desinformacion'],
    [/expide la ley|nueva ley|ley general|ley federal (?:para|de)/i, 'regulacion_general'],
  ];
  for (const [re, tag] of reglas) if (re.test(t)) out.add(tag);
  return [...out];
}

/** Tipo del catálogo del corpus, derivado del título. */
export function tipoDe(titulo: string): string {
  const t = (titulo || '').toLowerCase();
  if (/constituci[oó]n pol[ií]tica/.test(t)) return 'reforma_constitucional';
  if (/c[oó]digo penal federal/.test(t)) return 'reforma_codigo_penal';
  if (/ley general de educaci[oó]n/.test(t)) return 'reforma_educacion';
  if (/ley general de salud/.test(t)) return 'reforma_salud';
  if (/derecho de autor/.test(t)) return 'reforma_derechos_autor';
  if (/expide la ley general/.test(t)) return 'ley_general';
  if (/expide la ley/.test(t)) return 'ley_federal';
  if (/punto de acuerdo|exhort/.test(t)) return 'punto_acuerdo';
  return 'reforma_otra';
}

/** Siglas de partido a partir del nombre del grupo parlamentario. */
export function partidoDe(grupo: string): string {
  const g = (grupo || '').toLowerCase();
  if (/morena/.test(g)) return 'MORENA';
  if (/acci[oó]n nacional|\bpan\b/.test(g)) return 'PAN';
  if (/revolucionario institucional|\bpri\b/.test(g)) return 'PRI';
  if (/movimiento ciudadano|\bmc\b/.test(g)) return 'MC';
  if (/verde|pvem/.test(g)) return 'PVEM';
  if (/del trabajo|\bpt\b/.test(g)) return 'PT';
  if (/revoluci[oó]n democr[aá]tica|prd/.test(g)) return 'PRD';
  if (/sin partido|independiente/.test(g)) return 'Sin partido';
  return grupo ? grupo.trim() : '';
}

/** Normaliza un título para deduplicar contra el corpus. */
export function claveTitulo(titulo: string): string {
  return (titulo || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\b(iniciativa|con proyecto de decreto|por (?:el|la) que se|que|de la|del|de|la|el|los|las|y|a|en materia de)\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
