import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluarPlazo, aFecha, leyendaPlazo } from './plazo-verificacion.ts';

const HOY = new Date('2026-08-31T00:00:00Z');
const ts = (iso) => ({ _seconds: Math.floor(new Date(iso).getTime() / 1000) });

test('sin fecha prometida no hay señal', () => {
  const e = evaluarPlazo({}, HOY);
  assert.equal(e.vencido, false);
  assert.equal(e.sinVerificar, false);
  assert.equal(leyendaPlazo(e), null);
});

test('plazo futuro no está vencido', () => {
  const e = evaluarPlazo({ fechaPrometida: ts('2026-12-01') }, HOY);
  assert.equal(e.vencido, false);
  assert.equal(e.sinVerificar, false);
});

test('plazo vencido sin ninguna revisión se marca sin verificar', () => {
  const e = evaluarPlazo({ fechaPrometida: ts('2026-07-15'), actualizaciones: [] }, HOY);
  assert.equal(e.vencido, true);
  assert.equal(e.diasVencido, 47);
  assert.equal(e.sinVerificar, true);
});

test('una revisión POSTERIOR al plazo apaga la señal', () => {
  const e = evaluarPlazo(
    { fechaPrometida: ts('2026-07-15'), actualizaciones: [{ fecha: ts('2026-08-02') }] },
    HOY,
  );
  assert.equal(e.vencido, true);
  assert.equal(e.sinVerificar, false);
});

test('una revisión ANTERIOR al plazo no cuenta como verificación', () => {
  const e = evaluarPlazo(
    { fechaPrometida: ts('2026-07-15'), actualizaciones: [{ fecha: ts('2026-05-01') }] },
    HOY,
  );
  assert.equal(e.sinVerificar, true, 'revisar antes del plazo no dice si se cumplió');
});

test('toma la revisión más reciente, no la primera', () => {
  const e = evaluarPlazo(
    {
      fechaPrometida: ts('2026-07-15'),
      actualizaciones: [{ fecha: ts('2026-08-20') }, { fecha: ts('2026-01-01') }],
    },
    HOY,
  );
  assert.equal(e.sinVerificar, false);
  assert.equal(e.ultimaRevision.toISOString().slice(0, 10), '2026-08-20');
});

test('aFecha acepta Timestamp de la API, ISO y Date', () => {
  assert.equal(aFecha(ts('2026-07-15')).toISOString().slice(0, 10), '2026-07-15');
  assert.equal(aFecha('2026-07-15T00:00:00.000Z').toISOString().slice(0, 10), '2026-07-15');
  assert.equal(aFecha(new Date('2026-07-15')).toISOString().slice(0, 10), '2026-07-15');
  assert.equal(aFecha(null), null);
  assert.equal(aFecha('no es fecha'), null);
});

test('la leyenda es honesta: no afirma incumplimiento', () => {
  const e = evaluarPlazo({ fechaPrometida: ts('2026-08-30') }, HOY);
  const es = leyendaPlazo(e, 'es');
  assert.match(es, /sin verificar/);
  assert.doesNotMatch(es, /incumpl/i, 'no debe afirmar incumplimiento');
  assert.equal(leyendaPlazo(e, 'en'), 'Deadline passed 1 day ago · not verified since');
});
