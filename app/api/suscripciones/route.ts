import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getAdminDb } from '@/lib/firebase-admin';
import {
  normalizeSubscriptionRequest,
  SUBSCRIPTION_CONSENT_VERSION,
  SUBSCRIPTION_SUCCESS_MESSAGE,
  SubscriptionValidationError,
} from '@/lib/subscription-policy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_REQUEST_BYTES = 8 * 1024;
const responseHeaders = { 'Cache-Control': 'no-store' };

function successResponse() {
  return NextResponse.json(
    { message: SUBSCRIPTION_SUCCESS_MESSAGE },
    { status: 200, headers: responseHeaders }
  );
}

async function parseBody(request: Request): Promise<unknown> {
  const declaredLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    throw new SubscriptionValidationError('La solicitud es demasiado grande.');
  }

  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_REQUEST_BYTES) {
    throw new SubscriptionValidationError('La solicitud es demasiado grande.');
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new SubscriptionValidationError('Solicitud inválida.');
  }
}

export async function POST(request: Request) {
  try {
    const subscription = normalizeSubscriptionRequest(await parseBody(request));

    // Honeypot: respond exactly like a valid request, but never touch Firestore.
    if (subscription.honeypotTriggered) return successResponse();

    const db = getAdminDb();
    const existing = await db.collection('suscripciones')
      .where('email', '==', subscription.email)
      .limit(1)
      .get();

    // Idempotent and non-enumerable: existing and new addresses receive the
    // same response. Existing consent is never overwritten anonymously.
    if (!existing.empty) return successResponse();

    const now = new Date();
    const documentId = createHash('sha256').update(subscription.email).digest('hex');
    const documentRef = db.collection('suscripciones').doc(documentId);

    try {
      await documentRef.create({
        email: subscription.email,
        nombre: subscription.nombre ?? null,
        telefono: subscription.telefono ?? null,
        activo: true,
        estadoVerificacion: 'pendiente',
        fechaRegistro: now,
        origen: subscription.origen,
        canales: {
          email: true,
          whatsapp: subscription.consentimientoWhatsApp,
        },
        consentimiento: {
          version: SUBSCRIPTION_CONSENT_VERSION,
          emailAt: now,
          whatsappAt: subscription.consentimientoWhatsApp ? now : null,
        },
      });
    } catch (error) {
      // A concurrent request may have created the deterministic document.
      // Never disclose that state to the caller.
      const code = (error as { code?: string | number } | null)?.code;
      if (code !== 6 && code !== '6' && code !== 'already-exists') throw error;
    }

    return successResponse();
  } catch (error) {
    if (error instanceof SubscriptionValidationError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status, headers: responseHeaders }
      );
    }

    console.error('Error creating suscripcion:', error);
    return NextResponse.json(
      { error: 'No fue posible procesar la suscripción.' },
      { status: 500, headers: responseHeaders }
    );
  }
}
