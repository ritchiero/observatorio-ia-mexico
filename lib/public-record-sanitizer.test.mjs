import assert from 'node:assert/strict';
import test from 'node:test';

import { sanitizePublicRecord } from './public-record-sanitizer.ts';

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
