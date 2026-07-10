import { createHmac } from 'node:crypto';
import type { Firestore } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

export const SUBSCRIPTION_CLIENT_WINDOW_MS = 10 * 60 * 1000;
export const SUBSCRIPTION_CLIENT_LIMIT = 5;
export const SUBSCRIPTION_GLOBAL_WINDOW_MS = 60 * 1000;
export const SUBSCRIPTION_GLOBAL_LIMIT = 60;

const RATE_LIMIT_COLLECTION = '_rate_limits';
const TTL_GRACE_MS = 24 * 60 * 60 * 1000;

type RateLimitState = {
  count?: unknown;
  windowStart?: unknown;
};

type RateLimitRule = {
  documentId: string;
  limit: number;
  windowMs: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  count: number;
  retryAfterSeconds: number;
  windowStart: number;
};

export class SubscriptionRateLimitError extends Error {
  readonly status = 429;
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number) {
    super('Demasiadas solicitudes. Intenta de nuevo más tarde.');
    this.name = 'SubscriptionRateLimitError';
    this.retryAfterSeconds = Math.max(1, Math.ceil(retryAfterSeconds));
  }
}

function timestampToMillis(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (
    value &&
    typeof value === 'object' &&
    'toMillis' in value &&
    typeof (value as { toMillis?: unknown }).toMillis === 'function'
  ) {
    const millis = (value as { toMillis: () => number }).toMillis();
    return Number.isFinite(millis) ? millis : null;
  }
  return null;
}

/** Pure fixed-window transition, exported so the fail-closed behavior is testable. */
export function evaluateRateLimit(
  state: RateLimitState | undefined,
  nowMs: number,
  windowMs: number,
  limit: number,
): RateLimitDecision {
  const storedStart = timestampToMillis(state?.windowStart);
  const storedCount =
    typeof state?.count === 'number' && Number.isSafeInteger(state.count) && state.count >= 0
      ? state.count
      : 0;
  const activeWindow = storedStart !== null && nowMs >= storedStart && nowMs < storedStart + windowMs;
  const windowStart = activeWindow ? storedStart : nowMs;
  const count = activeWindow ? storedCount : 0;
  const retryAfterSeconds = Math.max(1, Math.ceil((windowStart + windowMs - nowMs) / 1000));

  if (count >= limit) {
    return { allowed: false, count, retryAfterSeconds, windowStart };
  }

  return { allowed: true, count: count + 1, retryAfterSeconds, windowStart };
}

function firstForwardedAddress(value: string | null): string | null {
  const address = value?.split(',', 1)[0]?.trim();
  if (!address || address.length > 128) return null;
  return address;
}

export function getSubscriptionClientFingerprint(request: Request, secret: string): string {
  const normalizedSecret = secret.trim();
  if (normalizedSecret.length < 32) {
    throw new Error('SUBSCRIPTION_RATE_LIMIT_SECRET debe tener al menos 32 caracteres.');
  }

  // Vercel normaliza x-forwarded-for en producción. The platform-specific
  // header takes precedence when present; an absent address shares a strict
  // anonymous bucket instead of bypassing the limit.
  const address =
    firstForwardedAddress(request.headers.get('x-vercel-forwarded-for')) ??
    firstForwardedAddress(request.headers.get('x-forwarded-for')) ??
    firstForwardedAddress(request.headers.get('x-real-ip')) ??
    'unknown';

  return createHmac('sha256', normalizedSecret)
    .update(`subscription-ip-v1:${address}`)
    .digest('hex');
}

function getRateLimitSecret(): string {
  const secret =
    process.env.SUBSCRIPTION_RATE_LIMIT_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error(
      'Configura SUBSCRIPTION_RATE_LIMIT_SECRET (o NEXTAUTH_SECRET) con al menos 32 caracteres.',
    );
  }
  return secret;
}

export async function enforceSubscriptionRateLimit(
  db: Firestore,
  request: Request,
  nowMs = Date.now(),
): Promise<void> {
  const fingerprint = getSubscriptionClientFingerprint(request, getRateLimitSecret());
  const rules: RateLimitRule[] = [
    {
      documentId: `subscriptions-client-${fingerprint}`,
      limit: SUBSCRIPTION_CLIENT_LIMIT,
      windowMs: SUBSCRIPTION_CLIENT_WINDOW_MS,
    },
    {
      documentId: 'subscriptions-global',
      limit: SUBSCRIPTION_GLOBAL_LIMIT,
      windowMs: SUBSCRIPTION_GLOBAL_WINDOW_MS,
    },
  ];

  await db.runTransaction(async (transaction) => {
    const references = rules.map((rule) => db.collection(RATE_LIMIT_COLLECTION).doc(rule.documentId));
    // Firestore requires every read to finish before the first write.
    const snapshots = await transaction.getAll(...references);
    const decisions = rules.map((rule, index) =>
      evaluateRateLimit(
        snapshots[index].exists ? snapshots[index].data() : undefined,
        nowMs,
        rule.windowMs,
        rule.limit,
      ),
    );
    const rejected = decisions.filter((decision) => !decision.allowed);

    if (rejected.length > 0) {
      throw new SubscriptionRateLimitError(
        Math.max(...rejected.map((decision) => decision.retryAfterSeconds)),
      );
    }

    rules.forEach((rule, index) => {
      const decision = decisions[index];
      transaction.set(
        references[index],
        {
          count: decision.count,
          windowStart: Timestamp.fromMillis(decision.windowStart),
          expiresAt: Timestamp.fromMillis(
            decision.windowStart + rule.windowMs + TTL_GRACE_MS,
          ),
        },
        { merge: true },
      );
    });
  });
}
