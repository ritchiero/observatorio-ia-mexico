// Formato de fechas del Observatorio.
//
// Las fechas que publica el sitio son fechas de CALENDARIO —el día en que se
// presentó una iniciativa, en que se hizo un anuncio o en que vencía un
// compromiso—, no instantes. Se guardan en UTC y hay que leerlas en UTC:
// interpretarlas en la zona de México (UTC-6) restaba un día a las 102 fichas
// guardadas a medianoche, y además el servidor (que corre en UTC) y el navegador
// del lector pintaban días distintos para la misma ficha.
//
// Vive aparte de `utils.ts` para poder probarse sin arrastrar los tipos del
// proyecto (los tests corren con el intérprete, sin los alias de TypeScript).

export const ZONA_FECHAS = 'UTC';

export function formatDate(date: Date | null): string {
  if (!date) return 'No especificada';
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: ZONA_FECHAS,
  }).format(date);
}

export function formatDateShort(date: Date | null): string {
  if (!date) return 'N/A';
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    timeZone: ZONA_FECHAS,
  }).format(date);
}
