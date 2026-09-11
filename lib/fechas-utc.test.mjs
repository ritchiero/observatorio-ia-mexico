import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate, formatDateShort, ZONA_FECHAS } from './fechas.ts';

// Las fichas del corpus guardan la fecha del asunto como día de calendario en
// UTC. Leerlas en la zona de México (UTC-6) restaba un día a las 102 fichas
// guardadas a medianoche; y como el servidor corre en UTC y el navegador no,
// la misma ficha se pintaba con dos días distintos según quién la renderizara.
test('formatDate lee la fecha como día de calendario, no como instante local', () => {
  assert.equal(ZONA_FECHAS, 'UTC');
  assert.equal(formatDate(new Date('2026-08-05T00:00:00.000Z')), '5 de agosto de 2026');
  assert.equal(formatDate(new Date('2026-01-01T00:00:00.000Z')), '1 de enero de 2026');
  assert.equal(formatDate(new Date('2026-09-02T12:00:00.000Z')), '2 de septiembre de 2026');
  assert.equal(formatDate(null), 'No especificada');
});

test('formatDateShort respeta la misma zona', () => {
  assert.equal(formatDateShort(new Date('2026-03-01T00:00:00.000Z')), 'mar 2026');
  assert.equal(formatDateShort(null), 'N/A');
});

test('el último instante del día UTC sigue cayendo en su propio día', () => {
  assert.equal(formatDate(new Date('2026-12-31T23:59:59.000Z')), '31 de diciembre de 2026');
});
