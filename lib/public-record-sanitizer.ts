const INTERNAL_FIELDS = new Set([
  'correccionAutomatica',
  'pdfBackedUpAt',
  'pdfBackupCandidate',
  'pdfBackupMetadata',
  'resultadoVerificacion',
]);

/**
 * Public read APIs must omit internal review and preservation artifacts.
 * This is intentionally shallow: all blocked fields live at the document root.
 */
export function sanitizePublicRecord(
  record: Record<string, unknown>,
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(record).filter(([field]) => !INTERNAL_FIELDS.has(field)),
  );
}
