import test from 'node:test';
import assert from 'node:assert/strict';
import {
  anioDe,
  anioAparicionItem,
  anioHub,
  anioMesh,
  visibleEnAnio,
  PLAYBACK_INICIO,
} from './grafo-tiempo.ts';

test('anioDe: fechas válidas, inválidas y fuera de rango', () => {
  assert.equal(anioDe('2026-05-29'), 2026);
  assert.equal(anioDe('2020-01-01T00:00:00.000Z'), 2020);
  assert.equal(anioDe('sin fecha'), null);
  assert.equal(anioDe(''), null);
  assert.equal(anioDe(null), null);
  assert.equal(anioDe(undefined), null);
  assert.equal(anioDe('1889-01-01'), null); // fuera de rango razonable
  assert.equal(anioDe('3025-01-01'), null);
  assert.equal(anioDe('2025-13-40'), null); // fecha imposible: sin año honesto
  assert.equal(anioDe('2020-00-00'), null);
  assert.equal(anioDe('2025'), 2025); // año solo: válido
});

test('precedencia anuncio: fechaAnuncio gana a createdAt', () => {
  assert.equal(anioAparicionItem('anuncio', { fechaAnuncio: '2025-11-19', createdAt: '2026-01-05' }), 2025);
  assert.equal(anioAparicionItem('anuncio', { createdAt: '2026-01-05' }), 2026);
  assert.equal(anioAparicionItem('anuncio', {}), null);
});

test('precedencia iniciativa: fecha de presentación gana', () => {
  assert.equal(anioAparicionItem('iniciativa', { fecha: '2020-09-15', createdAt: '2025-12-11' }), 2020);
  assert.equal(anioAparicionItem('iniciativa', { fecha: 'basura', createdAt: '2025-12-11' }), 2025);
});

test('precedencia caso: primer evento de trayectoria gana a fechaCreacion', () => {
  const c = {
    trayectoria: [
      { fechaIngreso: '2024-01-01', fechaResolucion: '2025-06-02' },
      { fechaIngreso: '2026-06-01', fechaResolucion: null },
    ],
    fechaCreacion: '2026-03-09',
    fechaActualizacion: '2026-06-01',
  };
  assert.equal(anioAparicionItem('caso', c), 2024);
  assert.equal(anioAparicionItem('caso', { fechaCreacion: '2026-03-09' }), 2026);
  assert.equal(anioAparicionItem('caso', { trayectoria: [] , fechaActualizacion: '2025-12-12' }), 2025);
  assert.equal(anioAparicionItem('caso', {}), null);
});

test('hub aparece con su primer registro; sin fechas -> null', () => {
  assert.equal(anioHub([2024, 2020, null, 2026]), 2020);
  assert.equal(anioHub([null, null]), null);
  assert.equal(anioHub([]), null);
});

test('malla aparece con el SEGUNDO compartido (umbral real)', () => {
  assert.equal(anioMesh([2023, 2020, 2025]), 2023);
  assert.equal(anioMesh([2020, 2020]), 2020);
  assert.equal(anioMesh([2024, null]), null); // un solo año conocido: sin año honesto
  assert.equal(anioMesh([null, null]), null);
});

test('corte acumulativo: visibilidad por año', () => {
  const ACTUAL = 2026;
  // actualidad (corte null o >= actual): todo visible, incluso sin fecha
  assert.equal(visibleEnAnio(null, null, ACTUAL), true);
  assert.equal(visibleEnAnio(null, 2026, ACTUAL), true);
  // playback: acumulativo
  assert.equal(visibleEnAnio(2020, 2019, ACTUAL), false);
  assert.equal(visibleEnAnio(2020, 2020, ACTUAL), true);
  assert.equal(visibleEnAnio(2020, 2025, ACTUAL), true);
  // sin fecha: fuera del playback (jamás se inventa 2026)
  assert.equal(visibleEnAnio(null, 2025, ACTUAL), false);
  // límites del recorrido
  assert.ok(PLAYBACK_INICIO === 2016);
});
