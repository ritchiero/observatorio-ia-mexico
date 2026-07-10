import assert from 'node:assert/strict';
import test from 'node:test';
import { asignarComunidades, centrosDeComunidades } from './grafo-comunidades.ts';

const nodes = [
  { id: 'i:1', label: 'Uno', type: 'iniciativa' },
  { id: 'i:2', label: 'Dos', type: 'iniciativa' },
  { id: 'i:3', label: 'Tres', type: 'iniciativa' },
  { id: 't:a', label: 'Tema A', type: 'tema' },
  { id: 't:b', label: 'Tema B', type: 'tema' },
  { id: 't:puente', label: 'Puente', type: 'tema' },
];
const links = [
  { source: 'i:1', target: 't:a', kind: 'rel', prim: true },
  { source: 'i:1', target: 't:puente', kind: 'rel' },
  { source: 'i:2', target: 't:a', kind: 'rel', prim: true },
  { source: 'i:2', target: 't:puente', kind: 'rel' },
  { source: 'i:3', target: 't:b', kind: 'rel' },
];

test('la relación primaria define la casa y un hub secundario sigue la mayoría', () => {
  const result = asignarComunidades(nodes, links);
  const byId = new Map(result.map((node) => [node.id, node]));
  assert.equal(byId.get('i:1').community, 't:a');
  assert.equal(byId.get('i:2').community, 't:a');
  assert.equal(byId.get('t:puente').community, 't:a');
  assert.equal(byId.get('t:a').communityLabel, 'Tema A');
});

test('un item sin primaria usa el hub visible con mayor grado', () => {
  const result = asignarComunidades(nodes, links);
  const byId = new Map(result.map((node) => [node.id, node]));
  assert.equal(byId.get('i:3').community, 't:b');
  assert.equal(byId.get('t:b').community, 't:b');
});

test('el empaque de centroides es determinista y no solapa comunidades', () => {
  const result = asignarComunidades(nodes, links);
  const first = centrosDeComunidades(result);
  const second = centrosDeComunidades(result);
  assert.deepEqual([...first], [...second]);

  const centers = [...first.values()];
  for (let i = 0; i < centers.length; i++) {
    for (let j = i + 1; j < centers.length; j++) {
      const a = centers[i];
      const b = centers[j];
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) >= a.radius + b.radius + 27.9);
    }
  }
});

test('barajar nodos y aristas no cambia la asignación', () => {
  const canonical = new Map(asignarComunidades(nodes, links).map((node) => [node.id, node.community]));
  const shuffled = new Map(
    asignarComunidades([...nodes].reverse(), [...links].reverse()).map((node) => [node.id, node.community]),
  );
  assert.deepEqual([...shuffled].sort(), [...canonical].sort());
});
