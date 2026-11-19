import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

const { resolverPeriodoRecap } = await import('./recap-periodo.ts');

describe('resolverPeriodoRecap', () => {
  it('sin override cubre el mes anterior', () => {
    assert.deepEqual(resolverPeriodoRecap(new Date('2026-11-01T11:00:00Z')), { mes: 10, anio: 2026 });
  });

  it('en enero cubre diciembre del año anterior', () => {
    assert.deepEqual(resolverPeriodoRecap(new Date('2027-01-01T11:00:00Z')), { mes: 12, anio: 2026 });
  });

  it('acepta un mes atrasado para regenerarlo', () => {
    assert.deepEqual(
      resolverPeriodoRecap(new Date('2026-11-19T03:00:00Z'), { mes: 8, anio: 2026 }),
      { mes: 8, anio: 2026 },
    );
  });

  it('rechaza el mes en curso o futuro', () => {
    const ahora = new Date('2026-11-19T03:00:00Z');
    assert.throws(() => resolverPeriodoRecap(ahora, { mes: 11, anio: 2026 }));
    assert.throws(() => resolverPeriodoRecap(ahora, { mes: 1, anio: 2027 }));
  });

  it('rechaza valores inválidos o incompletos', () => {
    const ahora = new Date('2026-11-19T03:00:00Z');
    assert.throws(() => resolverPeriodoRecap(ahora, { mes: 13, anio: 2026 }));
    assert.throws(() => resolverPeriodoRecap(ahora, { mes: Number.NaN, anio: 2026 }));
    assert.throws(() => resolverPeriodoRecap(ahora, { mes: 8 }));
  });
});
