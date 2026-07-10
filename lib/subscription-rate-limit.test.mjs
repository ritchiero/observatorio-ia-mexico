import assert from 'node:assert/strict';
import test from 'node:test';

import {
  enforceSubscriptionRateLimit,
  evaluateRateLimit,
  getSubscriptionClientFingerprint,
  SubscriptionRateLimitError,
} from './subscription-rate-limit.ts';

function fakeFirestore() {
  const documents = new Map();
  const db = {
    collection(collectionName) {
      return {
        doc(documentId) {
          return { path: `${collectionName}/${documentId}` };
        },
      };
    },
    async runTransaction(callback) {
      const pending = new Map();
      const result = await callback({
        async getAll(...references) {
          return references.map((reference) => ({
            exists: documents.has(reference.path),
            data: () => documents.get(reference.path),
          }));
        },
        set(reference, data) {
          pending.set(reference.path, data);
        },
      });
      for (const [key, value] of pending) documents.set(key, value);
      return result;
    },
  };
  return { db, documents };
}

test('la ventana permite hasta el límite y luego calcula Retry-After', () => {
  const now = 1_000_000;
  const windowMs = 60_000;
  assert.deepEqual(evaluateRateLimit(undefined, now, windowMs, 2), {
    allowed: true,
    count: 1,
    retryAfterSeconds: 60,
    windowStart: now,
  });
  assert.equal(
    evaluateRateLimit({ count: 1, windowStart: now }, now + 10_000, windowMs, 2).allowed,
    true,
  );
  assert.deepEqual(evaluateRateLimit({ count: 2, windowStart: now }, now + 10_000, windowMs, 2), {
    allowed: false,
    count: 2,
    retryAfterSeconds: 50,
    windowStart: now,
  });
});

test('una ventana vencida reinicia el contador', () => {
  const result = evaluateRateLimit(
    { count: 99, windowStart: 1_000 },
    61_000,
    60_000,
    2,
  );
  assert.equal(result.allowed, true);
  assert.equal(result.count, 1);
  assert.equal(result.windowStart, 61_000);
});

test('la huella es estable, no revela la IP y separa clientes', () => {
  const secret = 's'.repeat(32);
  const first = new Request('https://observatorio.test/api/suscripciones', {
    headers: { 'x-vercel-forwarded-for': '203.0.114.8' },
  });
  const same = new Request('https://observatorio.test/api/suscripciones', {
    headers: { 'x-vercel-forwarded-for': '203.0.114.8' },
  });
  const other = new Request('https://observatorio.test/api/suscripciones', {
    headers: { 'x-vercel-forwarded-for': '203.0.114.9' },
  });

  const fingerprint = getSubscriptionClientFingerprint(first, secret);
  assert.equal(fingerprint, getSubscriptionClientFingerprint(same, secret));
  assert.notEqual(fingerprint, getSubscriptionClientFingerprint(other, secret));
  assert.doesNotMatch(fingerprint, /203\.0\.114\.8/);
  assert.match(fingerprint, /^[a-f0-9]{64}$/);
});

test('falla cerrado con un secreto débil', () => {
  assert.throws(
    () => getSubscriptionClientFingerprint(new Request('https://observatorio.test'), 'corto'),
    /32 caracteres/,
  );
});

test('el límite por cliente se comparte entre transacciones y falla cerrado', async () => {
  const previous = process.env.SUBSCRIPTION_RATE_LIMIT_SECRET;
  process.env.SUBSCRIPTION_RATE_LIMIT_SECRET = 'r'.repeat(32);
  const { db } = fakeFirestore();
  const request = new Request('https://observatorio.test/api/suscripciones', {
    headers: { 'x-vercel-forwarded-for': '203.0.114.20' },
  });

  try {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await enforceSubscriptionRateLimit(db, request, 1_000_000);
    }
    await assert.rejects(
      enforceSubscriptionRateLimit(db, request, 1_000_000),
      (error) =>
        error instanceof SubscriptionRateLimitError &&
        error.status === 429 &&
        error.retryAfterSeconds === 600,
    );
  } finally {
    if (previous === undefined) delete process.env.SUBSCRIPTION_RATE_LIMIT_SECRET;
    else process.env.SUBSCRIPTION_RATE_LIMIT_SECRET = previous;
  }
});
