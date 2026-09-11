import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCamara, esFederal, entidadDe, etiquetaCamara } from './camaras.ts';

// Valores reales medidos en el corpus el 11-sep-2026.
test('normalizarCamara reconoce las variantes que conviven en el corpus', () => {
  for (const v of ['Diputados', 'diputados', 'Cámara de Diputados']) assert.equal(normalizarCamara(v), 'Diputados', v);
  for (const v of ['Senado', 'senadores', 'Cámara de Senadores']) assert.equal(normalizarCamara(v), 'Senado', v);
  for (const v of ['Congreso de la CDMX', 'congreso_cdmx', 'Congreso local', 'congreso_local',
                   'Congreso del Estado de México', 'congreso_edomex', 'Congreso del Estado de Michoacán',
                   'Congreso del Estado de San Luis Potosí', 'Congreso del Estado de Quintana Roo']) {
    assert.equal(normalizarCamara(v), 'Local', v);
  }
  assert.equal(normalizarCamara(''), null);
  assert.equal(normalizarCamara(undefined), null);
});

test('esFederal distingue el Congreso de la Unión de los congresos estatales', () => {
  assert.equal(esFederal('diputados'), true);
  assert.equal(esFederal('Senado'), true);
  assert.equal(esFederal('Congreso de la CDMX'), false);
  assert.equal(esFederal(null), false);
});

test('entidadDe prefiere el campo explícito y si no lo deduce', () => {
  assert.equal(entidadDe({ camara: 'diputados', entidadFederativa: 'Federal' }), 'Federal');
  assert.equal(entidadDe({ camara: 'diputados' }), 'Federal', 'las nuevas fichas del cron guardan la cámara en minúscula');
  assert.equal(entidadDe({ camara: 'senadores' }), 'Federal');
  assert.equal(entidadDe({ camara: 'Congreso de la CDMX' }), 'Ciudad de México');
  assert.equal(entidadDe({ camara: 'congreso_edomex' }), 'Estado de México');
  assert.equal(entidadDe({ camara: 'Congreso local', legislatura: 'LXIII SLP' }), 'San Luis Potosí');
  assert.equal(entidadDe({ camara: 'Congreso del Estado de Michoacán' }), 'Michoacán');
  assert.equal(entidadDe({ camara: '' }), null);
  assert.equal(entidadDe({ camara: 'Congreso local' }), null, 'sin pista del estado no se inventa');
});

test('etiquetaCamara conserva el nombre de la fuente en los congresos locales', () => {
  assert.equal(etiquetaCamara('diputados'), 'Cámara de Diputados');
  assert.equal(etiquetaCamara('Diputados'), 'Cámara de Diputados');
  assert.equal(etiquetaCamara('senadores'), 'Senado');
  assert.equal(etiquetaCamara('congreso_cdmx'), 'Congreso CDMX');
  assert.equal(etiquetaCamara('Congreso del Estado de Oaxaca'), 'Congreso del Estado de Oaxaca');
  assert.equal(etiquetaCamara(''), 'No especificada');
});
