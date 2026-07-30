// Catálogo de estados y buckets — fuente única de verdad (auditoría OIA-001/OIA-009).
// Lo importan la portada (conteos), el buscador determinista, el grafo y las
// pruebas de integridad: el total mostrado SIEMPRE debe ser la suma de estos
// estados + "sin clasificar" (que se muestra, nunca se oculta).

export const STATUS_ANUNCIO = [
  'operando',
  'en_desarrollo',
  'prometido',
  'incumplido',
  'concluido',
  'abandonado',
] as const;
export type StatusAnuncio = (typeof STATUS_ANUNCIO)[number];

// bucket de segmentación (mismo criterio en grafo y buscador)
export function bucketDe(status: string): 'vigente' | 'tramite' | 'inactivo' {
  const s = status.toLowerCase();
  if (/(operando|publicada|vigente|aprobada|resuelto|sentencia|concluido)/.test(s)) return 'vigente';
  if (/(desechad|archivad|abandonad|incumplid|rechazad|desistid)/.test(s)) return 'inactivo';
  return 'tramite';
}
