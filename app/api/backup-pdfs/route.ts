import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getAdminDb, getAdminStorage } from '@/lib/firebase-admin';
import {
  fetchValidatedPdf,
  parseAllowedHostRules,
  PdfBackupValidationError,
  type ValidatedPdf,
} from '@/lib/pdf-backup-security';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_IDS_PER_REQUEST = 50;
const MAX_REQUEST_BYTES = 32 * 1024;

type BackupRequest = {
  ids?: unknown;
  dryRun?: unknown;
};

type ProcessedResult = {
  id: string;
  status: 'validated' | 'candidate_stored' | 'failed';
  sourceUrl?: string;
  finalUrl?: string;
  storageUri?: string;
  sha256?: string;
  byteLength?: number;
  redirectCount?: number;
  errorCode?: string;
  error?: string;
};

function selectedSourceUrl(data: Record<string, unknown>): string | null {
  if (typeof data.urlPDFOriginal === 'string' && data.urlPDFOriginal.trim()) {
    return data.urlPDFOriginal.trim();
  }
  if (typeof data.urlPDF === 'string' && data.urlPDF.trim()) {
    return data.urlPDF.trim();
  }
  return null;
}

function validateIds(value: unknown): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new PdfBackupValidationError(
      'ids_required',
      'ids debe ser un arreglo no vacío de IDs explícitos.',
    );
  }
  if (value.length > MAX_IDS_PER_REQUEST) {
    throw new PdfBackupValidationError(
      'too_many_ids',
      `Se permiten como máximo ${MAX_IDS_PER_REQUEST} IDs por solicitud.`,
    );
  }

  const ids = value.map((item) => {
    if (
      typeof item !== 'string' ||
      !item.trim() ||
      item.length > 256 ||
      item.includes('/')
    ) {
      throw new PdfBackupValidationError(
        'invalid_id',
        'Cada iniciativa debe tener un ID de documento válido.',
      );
    }
    return item.trim();
  });

  return [...new Set(ids)];
}

async function parseRequest(request: Request): Promise<{ ids: string[]; dryRun: boolean }> {
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    throw new PdfBackupValidationError('request_too_large', 'El cuerpo de la solicitud es demasiado grande.');
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) {
    throw new PdfBackupValidationError('request_too_large', 'El cuerpo de la solicitud es demasiado grande.');
  }

  let body: BackupRequest;
  try {
    body = JSON.parse(rawBody) as BackupRequest;
  } catch {
    throw new PdfBackupValidationError('invalid_json', 'El cuerpo debe ser JSON válido.');
  }

  if (body.dryRun !== undefined && typeof body.dryRun !== 'boolean') {
    throw new PdfBackupValidationError('invalid_dry_run', 'dryRun debe ser booleano.');
  }

  return {
    ids: validateIds(body.ids),
    // Deliberately opt-in: writes occur only with an explicit false value.
    dryRun: body.dryRun !== false,
  };
}

async function storeValidatedCandidate(
  pdf: ValidatedPdf,
  initiativeId: string,
): Promise<{ storageUri: string; storagePath: string }> {
  const storage = getAdminStorage();
  const bucket = storage.bucket();
  const encodedId = Buffer.from(initiativeId, 'utf8').toString('base64url');
  const storagePath = `pdfs/iniciativas/${encodedId}/${pdf.sha256}/${randomUUID()}.pdf`;
  const file = bucket.file(storagePath);
  const validatedAt = new Date().toISOString();

  await file.save(pdf.buffer, {
    resumable: false,
    metadata: {
      contentType: 'application/pdf',
      cacheControl: 'private, no-store',
      metadata: {
        initiativeId,
        sourceUrl: pdf.sourceUrl,
        finalUrl: pdf.finalUrl,
        sha256: pdf.sha256,
        validationState: 'technical_valid_pending_content_review',
        contentMatch: 'pending',
        validatedAt,
      },
    },
  });

  return {
    storageUri: `gs://${bucket.name}/${storagePath}`,
    storagePath,
  };
}

async function removeStoredCandidate(storagePath: string): Promise<void> {
  const storage = getAdminStorage();
  await storage.bucket().file(storagePath).delete({ ignoreNotFound: true });
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Método no permitido. Use POST autenticado con IDs explícitos.',
    },
    {
      status: 405,
      headers: { Allow: 'POST' },
    },
  );
}

export async function POST(request: Request) {
  const authError = await requireAdmin();
  if (authError) return authError;

  let parsed: { ids: string[]; dryRun: boolean };
  try {
    parsed = await parseRequest(request);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Solicitud inválida.';
    const code = error instanceof PdfBackupValidationError ? error.code : 'invalid_request';
    const status = code === 'request_too_large' ? 413 : 400;
    return NextResponse.json({ success: false, error: message, errorCode: code }, { status });
  }

  let allowedHosts;
  try {
    allowedHosts = parseAllowedHostRules(process.env.PDF_BACKUP_ALLOWED_HOSTS);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Allowlist inválida.';
    return NextResponse.json(
      { success: false, error: message, errorCode: 'invalid_allowlist' },
      { status: 500 },
    );
  }

  if (allowedHosts.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'No hay hosts autorizados para respaldar PDFs.',
        errorCode: 'empty_allowlist',
      },
      { status: 503 },
    );
  }

  const db = getAdminDb();
  const processed: ProcessedResult[] = [];

  for (const id of parsed.ids) {
    try {
      const documentRef = db.collection('iniciativas').doc(id);
      const snapshot = await documentRef.get();
      if (!snapshot.exists) {
        throw new PdfBackupValidationError('not_found', 'La iniciativa no existe.');
      }

      const sourceUrl = selectedSourceUrl(snapshot.data() ?? {});
      if (!sourceUrl) {
        throw new PdfBackupValidationError('missing_source', 'La iniciativa no tiene URL PDF original.');
      }

      const pdf = await fetchValidatedPdf(sourceUrl, { allowedHosts });

      if (parsed.dryRun) {
        processed.push({
          id,
          status: 'validated',
          sourceUrl: pdf.sourceUrl,
          finalUrl: pdf.finalUrl,
          sha256: pdf.sha256,
          byteLength: pdf.byteLength,
          redirectCount: pdf.redirectCount,
        });
        continue;
      }

      const { storageUri, storagePath } = await storeValidatedCandidate(pdf, id);
      const candidateStoredAt = new Date();

      // Do not attach a candidate to a source that changed while it was downloading.
      try {
        await db.runTransaction(async (transaction) => {
          const currentSnapshot = await transaction.get(documentRef);
          const currentSourceUrl = currentSnapshot.exists
            ? selectedSourceUrl(currentSnapshot.data() ?? {})
            : null;

          if (currentSourceUrl !== sourceUrl) {
            throw new PdfBackupValidationError(
              'source_changed',
              'La URL original cambió durante el respaldo; no se modificó Firestore.',
            );
          }

          transaction.update(documentRef, {
            // This is a private review candidate, not a public backup. The
            // urlPDF, urlPDFOriginal and urlPDFBackup fields remain untouched.
            pdfBackupCandidate: {
              sourceUrl: pdf.sourceUrl,
              finalUrl: pdf.finalUrl,
              storageUri,
              storagePath,
              sha256: pdf.sha256,
              byteLength: pdf.byteLength,
              declaredMime: pdf.declaredMime,
              detectedMime: pdf.detectedMime,
              redirectCount: pdf.redirectCount,
              validationState: 'technical_valid_pending_content_review',
              contentMatch: 'pending',
              validatedAt: candidateStoredAt,
              storedAt: candidateStoredAt,
            },
          });
        });
      } catch (error) {
        await removeStoredCandidate(storagePath).catch(() => undefined);
        throw error;
      }

      processed.push({
        id,
        status: 'candidate_stored',
        sourceUrl: pdf.sourceUrl,
        finalUrl: pdf.finalUrl,
        storageUri,
        sha256: pdf.sha256,
        byteLength: pdf.byteLength,
        redirectCount: pdf.redirectCount,
      });
    } catch (error) {
      processed.push({
        id,
        status: 'failed',
        errorCode: error instanceof PdfBackupValidationError ? error.code : 'backup_failed',
        error: error instanceof Error ? error.message : 'Error desconocido durante el respaldo.',
      });
    }
  }

  const failed = processed.filter(({ status }) => status === 'failed').length;
  return NextResponse.json({
    success: failed === 0,
    dryRun: parsed.dryRun,
    results: {
      requested: parsed.ids.length,
      validated: processed.filter(({ status }) => status === 'validated').length,
      candidatesStored: processed.filter(({ status }) => status === 'candidate_stored').length,
      failed,
      processed,
    },
  });
}
