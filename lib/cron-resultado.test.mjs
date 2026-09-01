import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluarAgente, evaluarCorrida, hallazgosDe } from './cron-resultado.ts';

const ok = (agente, cuerpo) => ({ agente, alcanzado: true, httpOk: true, status: 200, cuerpo });

test('EL BUG: HTTP 200 con success:false es FALLO, no éxito', () => {
  const e = evaluarAgente(ok('deteccion', {
    success: false,
    anunciosEncontrados: 0,
    errores: ['Error general: 404 model not found'],
  }));
  assert.equal(e.estado, 'fallo');
  assert.match(e.motivo, /model not found/);
});

test('corrida con un agente en success:false NO es ok global', () => {
  const c = evaluarCorrida([
    ok('deteccion', { success: false, anunciosEncontrados: 0, errores: ['boom'] }),
    ok('legislacion', { success: true, iniciativasEncontradas: 2 }),
  ]);
  assert.equal(c.ok, false);
  assert.deepEqual(c.fallidos, ['deteccion']);
});

test('corrida totalmente sana sí es ok', () => {
  const c = evaluarCorrida([
    ok('deteccion', { success: true, anunciosEncontrados: 1 }),
    ok('monitoreo', { success: true, actualizacionesDetectadas: 3 }),
  ]);
  assert.equal(c.ok, true);
  assert.deepEqual(c.fallidos, []);
  assert.equal(c.hallazgosTotales, 4);
});

test('cero hallazgos con success:true es ok — sin novedad es un resultado válido', () => {
  const c = evaluarCorrida([ok('deteccion', { success: true, anunciosEncontrados: 0 })]);
  assert.equal(c.ok, true);
  assert.equal(c.hallazgosTotales, 0);
});

test('HTTP 500 es fallo y toma el detalle como motivo', () => {
  const e = evaluarAgente({
    agente: 'casos', alcanzado: true, httpOk: false, status: 500,
    cuerpo: { error: 'Error al ejecutar', detalle: 'timeout de Firestore' },
  });
  assert.equal(e.estado, 'fallo');
  assert.equal(e.motivo, 'timeout de Firestore');
});

test('fetch caído (agente inalcanzable) es fallo', () => {
  const e = evaluarAgente({ agente: 'monitoreo', alcanzado: false, errorRed: 'ECONNRESET' });
  assert.equal(e.estado, 'fallo');
  assert.equal(e.motivo, 'ECONNRESET');
});

test('respuesta sin `success` queda indeterminada, no ok', () => {
  const e = evaluarAgente(ok('legislacion', { mensaje: 'algo' }));
  assert.equal(e.estado, 'indeterminado');
  const c = evaluarCorrida([ok('legislacion', { mensaje: 'algo' })]);
  assert.equal(c.ok, false, 'lo indeterminado NO cuenta como éxito');
});

test('hallazgosDe suma los contadores de cada tipo de agente', () => {
  assert.equal(hallazgosDe({ anunciosEncontrados: 2 }), 2);
  assert.equal(hallazgosDe({ iniciativasEncontradas: 3 }), 3);
  assert.equal(hallazgosDe({ casosEncontrados: 1 }), 1);
  assert.equal(hallazgosDe({ actualizacionesDetectadas: 5 }), 5);
  assert.equal(hallazgosDe({ mensaje: 'sin contadores' }), null);
  assert.equal(hallazgosDe(null), null);
});

test('el resumen nombra a cada agente con su resultado semántico', () => {
  const c = evaluarCorrida([
    ok('deteccion', { success: true, anunciosEncontrados: 2 }),
    ok('casos', { success: false, errores: ['sin credencial'] }),
  ]);
  assert.match(c.resumen, /deteccion: 2/);
  assert.match(c.resumen, /casos: FALLO \(sin credencial\)/);
});
