import assert from 'node:assert/strict';
import test from 'node:test';

import {
  sanitizePublicRecord,
  sanitizePublicRecords,
} from './public-record-sanitizer.ts';

test('retira artefactos internos de verificación y preservación', () => {
  const publicRecord = sanitizePublicRecord({
    titulo: 'Iniciativa de prueba',
    estadoVerificacion: 'revision',
    resultadoVerificacion: { model: 'interno' },
    correccionAutomatica: { before: 'x' },
    pdfBackupCandidate: { storageUri: 'gs://private/candidate.pdf' },
    pdfBackupMetadata: { sha256: 'abc' },
    pdfBackedUpAt: new Date('2026-01-01T00:00:00Z'),
  });

  assert.deepEqual(publicRecord, {
    titulo: 'Iniciativa de prueba',
    estadoVerificacion: 'revision',
  });
});

test('sanea cada elemento de un payload fallback sin alterar valores primitivos', () => {
  const records = sanitizePublicRecords([
    {
      id: 'fallback-1',
      resultadoVerificacion: { raw: true },
      correccionAutomatica: { raw: true },
      pdfBackupCandidate: { storageUri: 'gs://private/candidate.pdf' },
      pdfBackupMetadata: { sha256: 'abc' },
      pdfBackedUpAt: '2026-01-01T00:00:00.000Z',
    },
    null,
    'legacy-value',
  ]);

  assert.deepEqual(records, [{ id: 'fallback-1' }, null, 'legacy-value']);
});
