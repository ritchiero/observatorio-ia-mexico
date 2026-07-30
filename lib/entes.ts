// Clasificador de ENTES — fuente única de verdad (auditoría OIA-013/OIA-002).
// Lo importan el grafo (/api/grafo), la tabla accesible (/grafo/tabla) y las
// pruebas de integridad: si la taxonomía cambia, cambia en un solo lugar.

export type Ente = 'legislativo' | 'ejecutivo' | 'judicial' | 'privado' | 'academia';

export const ENTE_NOMBRE: Record<Ente, string> = {
  legislativo: 'Legislativo',
  ejecutivo: 'Ejecutivo',
  judicial: 'Judicial',
  privado: 'Sector privado',
  academia: 'Academia',
};

// clasifica una etiqueta (dependencia / actor) en uno de los cinco entes.
// El orden importa: academia y privado antes que ejecutivo, porque una universidad
// pública o una empresa también contienen palabras genéricas de institución.
// OJO: NO usar "educaci"/"docente" como señal de academia — "Secretaría de
// Educación Pública" es EJECUTIVO (ver PR #70).
export function enteDeLabel(v: string, fallback?: Ente): Ente | undefined {
  const s = v.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  if (/(universidad|instituto tecnol|tecnologico nacional|tecnm|\bunam\b|\bipn\b|\bbuap\b|\bupy\b|\buam\b|colegio|\bescuela\b|academic|facultad|rector|centro de investigacion|conahcyt|cinvestav)/.test(s)) return 'academia';
  if (/(empresa|cl-?uster|cluster|\bs\.?a\.?\b|nvidia|microsoft|google|\bibm\b|\baws\b|amazon|oracle|intel|\bmeta\b|cisco|salesforce|accenture|kyndryl|ericsson|axity|\btcs\b|\bflex\b|aifod|startup|c[aá]mara de comercio|iniciativa privada|sector privado|consejo coordinador empresarial|\bcce\b|planta|hub de ia)/.test(s)) return 'privado';
  if (/(tribunal|juzgado|\bsala\b|poder judicial|fiscal[ií]a|ministerio p[uú]blico|scjn|suprema corte|judicatura|\btsj\b|magistrad|semanario judicial)/.test(s)) return 'judicial';
  if (/(c[aá]mara de diputados|\bdiputad|\bsenado\b|congreso|legislat|parlament)/.test(s)) return 'legislativo';
  if (/(secretar|agencia|gobierno|municipio|municipal|presidencia|\bimss\b|\bsat\b|\bine\b|\banam\b|\bimpi\b|\batdt\b|secihti|sectei|protecci[oó]n civil|comisi[oó]n|consejo|direcci[oó]n|coordinaci[oó]n|instituto)/.test(s)) return 'ejecutivo';
  return fallback;
}
