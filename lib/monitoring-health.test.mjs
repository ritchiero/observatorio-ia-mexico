import assert from 'node:assert/strict';
import test from 'node:test';

import {
  selectMonitoringCandidates,
  summarizeMonitoringRun,
} from './monitoring-health.ts';

const timestamp = (iso) => ({ toDate: () => new Date(iso) });

test('rota los expedientes aunque una revision valida no encuentre cambios', () => {
  const announcements = Array.from({ length: 13 }, (_, index) => ({
    id: String(index + 1).padStart(2, '0'),
    status: 'en_desarrollo',
    updatedAt: timestamp('2026-01-01T00:00:00Z'),
  }));

  const firstBatch = selectMonitoringCandidates(announcements, 12);
  assert.equal(firstBatch.length, 12);
  assert.equal(firstBatch.some((item) => item.id === '13'), false);

  for (const item of firstBatch) item.ultimaVerificacionAt = timestamp('2026-08-31T09:00:00Z');
  const secondBatch = selectMonitoringCandidates(announcements, 12);
  assert.equal(secondBatch[0].id, '13');
});

test('vuelve a revisar incumplidos y excluye fichas ocultas u operando', () => {
  const selected = selectMonitoringCandidates([
    { id: 'incumplido', status: 'incumplido' },
    { id: 'prometido', status: 'prometido' },
    { id: 'oculto', status: 'prometido', oculto: true },
    { id: 'operando', status: 'operando' },
  ], 10);

  assert.deepEqual(selected.map((item) => item.id), ['incumplido', 'prometido']);
});

test('distingue una corrida vacia valida de un fallo total o parcial', () => {
  assert.deepEqual(
    summarizeMonitoringRun({ candidates: 12, successfulChecks: 12, failedChecks: 0 }),
    { success: true, partial: false, totalChecks: 12 },
  );
  assert.deepEqual(
    summarizeMonitoringRun({ candidates: 12, successfulChecks: 0, failedChecks: 12 }),
    { success: false, partial: false, totalChecks: 12 },
  );
  assert.deepEqual(
    summarizeMonitoringRun({ candidates: 12, successfulChecks: 10, failedChecks: 2 }),
    { success: true, partial: true, totalChecks: 12 },
  );
});
