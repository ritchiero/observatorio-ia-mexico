import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizarCamara, esFederal, entidadDe, etiquetaCamara, nombreCongresoDe } from './camaras.ts';

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

// El mapa agrupa por cámara: sin canon pintaba el Senado dos veces («Senado» y
// «senadores») y la CDMX otras dos («Congreso de la CDMX» y «congreso_cdmx»).
test('las variantes del corpus colapsan en una sola identidad de nodo para el mapa', () => {
  const claveNodo = (i) => {
    const canon = normalizarCamara(i.camara);
    const entidad = canon === 'Local' ? entidadDe(i) : null;
    return canon === 'Diputados' || canon === 'Senado' ? canon : (entidad ?? String(i.camara));
  };
  assert.equal(claveNodo({ camara: 'Senado' }), claveNodo({ camara: 'senadores' }));
  assert.equal(claveNodo({ camara: 'Diputados' }), claveNodo({ camara: 'diputados' }));
  assert.equal(claveNodo({ camara: 'Congreso de la CDMX' }), claveNodo({ camara: 'congreso_cdmx' }));
  assert.equal(claveNodo({ camara: 'Congreso del Estado de México' }), claveNodo({ camara: 'congreso_edomex' }));
  // Y dos congresos distintos NO pueden colapsar.
  assert.notEqual(claveNodo({ camara: 'Congreso de la CDMX' }), claveNodo({ camara: 'Congreso del Estado de Michoacán' }));
  assert.notEqual(claveNodo({ camara: 'Diputados' }), claveNodo({ camara: 'Senado' }));
});

test('nombreCongresoDe pone el artículo correcto', () => {
  assert.equal(nombreCongresoDe('Ciudad de México'), 'Congreso de la Ciudad de México');
  assert.equal(nombreCongresoDe('Estado de México'), 'Congreso del Estado de México');
  assert.equal(nombreCongresoDe('Michoacán'), 'Congreso de Michoacán');
  assert.equal(nombreCongresoDe('San Luis Potosí'), 'Congreso de San Luis Potosí');
  assert.equal(nombreCongresoDe(''), 'Congreso local');
});
