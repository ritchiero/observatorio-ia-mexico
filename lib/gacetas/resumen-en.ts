// Traducción al inglés del resumen que publica el agente de legislación.
//
// El resumen lo arma `resumenRastreo` como UNA sola cadena y se guarda así en la
// bitácora, de modo que /en no puede regenerarlo: hay que traducirlo. Se hace por
// reemplazo de las frases fijas que esa función produce, en orden, conservando
// todos los números. Si apareciera una frase que no está aquí, se queda en
// español: preferible a inventar una traducción.
//
// Cada entrada corresponde a un fragmento literal de `resumenRastreo`; al cambiar
// esa función hay que cambiar también esta tabla (los tests lo verifican).

type Regla = [RegExp, string];

const REGLAS: Regla[] = [
  [/^Gacetas revisadas del (\S+) al (\S+):/, 'Gazettes reviewed from $1 to $2:'],
  [/Diputados (\d+) sesión\(es\)/, 'Chamber of Deputies: $1 session(s)'],
  [/Senado (\d+) sesión\(es\)/, 'Senate: $1 session(s)'],
  [/(\d+) asuntos leídos/g, '$1 items read'],
  [/Anexo II: (\d+) partes en HTML/, 'Annex II: $1 parts in HTML'],
  [/ y (\d+) en PDF/, ' and $1 in PDF'],
  [/, (\d+) de ellas con el articulado escaneado y sólo el título legible/, ', $1 of them with scanned articles and only the title legible'],
  [/; (\d+) PDF sin leer por exceder el tope de descarga/, '; $1 PDF(s) not read for exceeding the download limit'],
  // Redacción anterior al 11-sep-2026: la bitácora conserva las corridas viejas y
  // también hay que poder leerlas en inglés.
  [/; (\d+) PDF pesados sin leer, probablemente escaneos/, '; $1 heavy PDF(s) left unread, probably scans'],
  [/; (\d+) PDF escaneados sin texto/, '; $1 scanned PDF(s) with no text'],
  [/; (\d+) PDF sin capa de texto alguna/, '; $1 PDF(s) with no text layer at all'],
  [/; (\d+) PDF con varios asuntos sin separar, sólo título evaluado/, '; $1 PDF(s) with several items that could not be split, title only'],
  [/(\d+) documentos abiertos/, '$1 documents opened'],
  [/ \((\d+) candidatos sin abrir por la protección anti-bots del Senado; de ésos sólo se evaluó el título\)/, ' ($1 candidates left unopened by the Senate anti-bot protection; only their titles were assessed)'],
  [/; (\d+) día\(s\) en que la gaceta misma quedó bloqueada/, '; $1 day(s) on which the gazette itself was blocked'],
  [/(\d+) de IA/g, '$1 about AI'],
  [/Nuevas en el corpus: (\d+); ya registradas: (\d+)\./, 'New in the corpus: $1; already recorded: $2.'],
  [/ (\d+) página\(s\) no se pudieron leer por tiempo agotado o error de red \(se reintentarán en la siguiente corrida\)\./, ' $1 page(s) could not be read due to a timeout or network error (they will be retried on the next run).'],
  [/ Presupuesto de tiempo agotado: (\d+) día\(s\) de la ventana sin revisar\./, ' Time budget exhausted: $1 day(s) of the window were not reviewed.'],
  [/ (\d+) ficha\(s\) retirada\(s\) al releer la gaceta: la IA sólo se mencionaba de paso\./, ' $1 record(s) withdrawn after re-reading the gazette: AI was only mentioned in passing.'],
];

/** Traduce el resumen del rastreo de gacetas; deja intacto lo que no reconoce. */
export function traducirResumenGacetas(texto: string): string {
  let out = texto || '';
  for (const [re, en] of REGLAS) out = out.replace(re, en);
  return out;
}
