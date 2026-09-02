// Respaldo determinista del buscador del mapa.
//
// El buscador delega la redacción a un modelo (Grok vía OpenRouter). Cuando el
// modelo tarda más de lo tolerable o falla, el usuario no debe quedarse con un
// spinner: se responde con una coincidencia léxica honesta sobre el catálogo,
// que ilumina nodos relevantes y dice explícitamente que es un respaldo.

export interface NodoBusqueda {
  id: string;
  label: string;
  type: string;
  desc?: string;
  communityLabel?: string;
  fecha?: string;
}

const STOP = new Set([
  'a', 'al', 'de', 'del', 'el', 'la', 'las', 'los', 'en', 'y', 'o', 'que', 'qué', 'con', 'por', 'para', 'un', 'una',
  'sobre', 'hay', 'cual', 'cuál', 'cuales', 'cuáles', 'como', 'cómo', 'donde', 'dónde', 'es', 'son', 'se', 'lo',
  'the', 'a', 'an', 'of', 'in', 'on', 'and', 'or', 'what', 'which', 'is', 'are', 'about', 'for', 'to', 'with', 'there',
]);

export function normalizar(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function terminos(pregunta: string): string[] {
  return [...new Set(normalizar(pregunta).split(/[^a-z0-9]+/).filter((t) => t.length >= 3 && !STOP.has(t)))];
}

/** Puntúa un nodo por coincidencia de términos: título pesa más que la memoria. */
export function puntuar(nodo: NodoBusqueda, terms: string[]): number {
  if (!terms.length) return 0;
  const label = normalizar(nodo.label ?? '');
  const desc = normalizar(nodo.desc ?? '');
  let s = 0;
  for (const t of terms) {
    if (label.includes(t)) s += 3;
    else if (desc.includes(t)) s += 1;
  }
  return s;
}

export function buscarPorTerminos(nodos: NodoBusqueda[], pregunta: string, max = 8): NodoBusqueda[] {
  const terms = terminos(pregunta);
  return nodos
    .map((n) => ({ n, s: puntuar(n, terms) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || (b.n.fecha ?? '').localeCompare(a.n.fecha ?? ''))
    .slice(0, max)
    .map((x) => x.n);
}

export function respuestaRespaldo(hits: NodoBusqueda[], lang: 'es' | 'en'): string {
  if (!hits.length) {
    return lang === 'en'
      ? 'The assistant did not answer in time and no catalog entry matches your query literally. Try other words.'
      : 'El asistente no respondió a tiempo y ninguna entrada del catálogo coincide literalmente con tu consulta. Prueba con otras palabras.';
  }
  const lista = hits.slice(0, 4).map((n) => `«${n.label.slice(0, 60)}»`).join(' · ');
  return lang === 'en'
    ? `The assistant did not answer in time, so this is a literal match over the catalog — not a written answer: ${lista}${hits.length > 4 ? ` …and ${hits.length - 4} more` : ''}.`
    : `El asistente no respondió a tiempo, así que esto es una coincidencia literal sobre el catálogo — no una respuesta redactada: ${lista}${hits.length > 4 ? ` …y ${hits.length - 4} más` : ''}.`;
}
