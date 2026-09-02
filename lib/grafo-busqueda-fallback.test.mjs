import { test } from 'node:test';
import assert from 'node:assert/strict';
import { terminos, puntuar, buscarPorTerminos, respuestaRespaldo } from './grafo-busqueda-fallback.ts';

const N = [
  { id: 'a', label: 'Ley para regular deepfakes', type: 'iniciativa', desc: 'contenido sintético', fecha: '2026-03-01' },
  { id: 'b', label: 'Reforma laboral', type: 'iniciativa', desc: 'menciona deepfakes de pasada', fecha: '2026-05-01' },
  { id: 'c', label: 'Coatlicue supercomputadora', type: 'anuncio', desc: '', fecha: '2026-06-01' },
];

test('terminos quita stopwords y acentos, y deduplica', () => {
  assert.deepEqual(terminos('¿Qué hay sobre los deepfakes y la IA?'), ['deepfakes', 'ia'].filter((t) => t.length >= 3));
});

test('el título pesa más que la memoria', () => {
  const t = terminos('deepfakes');
  assert.ok(puntuar(N[0], t) > puntuar(N[1], t));
  assert.equal(puntuar(N[2], t), 0);
});

test('buscarPorTerminos ordena por puntaje y excluye los que no coinciden', () => {
  const r = buscarPorTerminos(N, 'deepfakes');
  assert.deepEqual(r.map((n) => n.id), ['a', 'b']);
});

test('sin coincidencias devuelve vacío y la respuesta lo dice con honestidad', () => {
  assert.deepEqual(buscarPorTerminos(N, 'zzz'), []);
  assert.match(respuestaRespaldo([], 'es'), /ninguna entrada/);
  assert.match(respuestaRespaldo([], 'en'), /no catalog entry/);
});

test('la respuesta de respaldo nunca se presenta como respuesta redactada', () => {
  const r = respuestaRespaldo(buscarPorTerminos(N, 'deepfakes'), 'es');
  assert.match(r, /coincidencia literal/);
  assert.match(r, /no una respuesta redactada/);
});
