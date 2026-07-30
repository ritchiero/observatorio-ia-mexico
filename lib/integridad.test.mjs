// Pruebas de integridad (auditoría externa 30-jul-2026, punto 6):
// si la taxonomía de entes o el catálogo de estados divergen entre módulos,
// estas pruebas fallan y el CI bloquea el merge. La portada, el grafo, la
// tabla accesible y el buscador importan ESTAS mismas fuentes de verdad.
import test from 'node:test';
import assert from 'node:assert/strict';
import { enteDeLabel, ENTE_NOMBRE } from './entes.ts';
import { STATUS_ANUNCIO, bucketDe } from './estados.ts';

test('taxonomía de entes: dependencias reales clasifican donde deben', () => {
  const casos = [
    ['Secretaría de Educación Pública', 'ejecutivo'],
    ['Agencia de Transformación Digital y Telecomunicaciones (ATDT)', 'ejecutivo'],
    ['Presidencia de la República', 'ejecutivo'],
    ['UNAM — Consejo Coordinador de Inteligencia Artificial (CCOIA)', 'academia'],
    ['Benemérita Universidad Autónoma de Puebla (BUAP)', 'academia'],
    ['Tecnológico Nacional de México', 'academia'],
    ['Senado de la República', 'legislativo'],
    ['Congreso del Estado de México', 'legislativo'],
    ['Cámara de Diputados', 'legislativo'],
    ['Poder Judicial del Estado de México', 'judicial'],
    ['Tribunal Superior de Justicia de Querétaro', 'judicial'],
    ['Clúster de Electrodomésticos de Nuevo León', 'privado'],
    ['UPY / NVIDIA', 'academia'], // universidad primero: el convenio lo encabeza la UPY
  ];
  for (const [label, esperado] of casos) {
    assert.equal(enteDeLabel(label, 'ejecutivo'), esperado, `"${label}" debe ser ${esperado}`);
  }
});

test('taxonomía de entes: todos los entes tienen nombre para la UI', () => {
  for (const ente of ['legislativo', 'ejecutivo', 'judicial', 'privado', 'academia']) {
    assert.ok(ENTE_NOMBRE[ente], `falta nombre de UI para ${ente}`);
  }
});

test('catálogo de estados: los seis estados existen y cada uno tiene bucket', () => {
  assert.deepEqual(
    [...STATUS_ANUNCIO].sort(),
    ['abandonado', 'concluido', 'en_desarrollo', 'incumplido', 'operando', 'prometido'],
  );
  for (const st of STATUS_ANUNCIO) {
    assert.ok(['vigente', 'tramite', 'inactivo'].includes(bucketDe(st)), `bucket indefinido para ${st}`);
  }
});

test('integridad de contadores: concluido cuenta; lo desconocido NO está en el catálogo', () => {
  // OIA-001: si un estado nuevo aparece en la base sin entrar aquí, la portada
  // lo mostrará como "Sin clasificar" (nunca se oculta) y esta lista debe crecer.
  assert.ok(STATUS_ANUNCIO.includes('concluido'), 'concluido debe ser estado de primera clase');
  assert.ok(!STATUS_ANUNCIO.includes('en_proceso'), 'en_proceso no es estado de anuncio');
});

test('buckets: semántica estable (concluido=vigente, incumplido=inactivo)', () => {
  assert.equal(bucketDe('concluido'), 'vigente');
  assert.equal(bucketDe('operando'), 'vigente');
  assert.equal(bucketDe('incumplido'), 'inactivo');
  assert.equal(bucketDe('abandonado'), 'inactivo');
  assert.equal(bucketDe('prometido'), 'tramite');
  assert.equal(bucketDe('en_desarrollo'), 'tramite');
});
