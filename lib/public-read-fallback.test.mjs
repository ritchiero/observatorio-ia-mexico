import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasFirebaseAdminCredentials,
  loadPublicReadFallback,
  PublicReadFallbackError,
  shouldUsePublicReadFallback,
} from './public-read-fallback.ts';

const completeCredentials = {
  FIREBASE_ADMIN_PROJECT_ID: 'project',
  FIREBASE_ADMIN_CLIENT_EMAIL: 'service@example.com',
  FIREBASE_ADMIN_PRIVATE_KEY: 'private-key',
};

const isItemsPayload = (payload) =>
  Boolean(
    payload &&
    typeof payload === 'object' &&
    'items' in payload &&
    Array.isArray(payload.items)
  );

test('detecta únicamente el juego completo de credenciales Admin', () => {
  assert.equal(hasFirebaseAdminCredentials(completeCredentials), true);
  assert.equal(
    hasFirebaseAdminCredentials({
      ...completeCredentials,
      FIREBASE_ADMIN_PRIVATE_KEY: '   ',
    }),
    false
  );
});

test('activa el fallback solo en desarrollo y sin credenciales', () => {
  assert.equal(shouldUsePublicReadFallback({ NODE_ENV: 'development' }), true);
  assert.equal(shouldUsePublicReadFallback({ NODE_ENV: 'production' }), false);
  assert.equal(
    shouldUsePublicReadFallback({ NODE_ENV: 'development', ...completeCredentials }),
    false
  );
});

test('carga y valida datos públicos cuando corresponde', async () => {
  let requestedUrl = '';
  const result = await loadPublicReadFallback('/api/items', isItemsPayload, {
    env: {
      NODE_ENV: 'development',
      OBSERVATORIO_PUBLIC_DATA_URL: 'https://example.test/base/',
    },
    fetcher: async (url) => {
      requestedUrl = String(url);
      return Response.json({ items: [{ id: 1 }] });
    },
  });

  assert.deepEqual(result, { used: true, data: { items: [{ id: 1 }] } });
  assert.equal(requestedUrl, 'https://example.test/api/items');
});

test('no consulta la fuente pública fuera del modo fallback', async () => {
  let calls = 0;
  const result = await loadPublicReadFallback('/api/items', isItemsPayload, {
    env: { NODE_ENV: 'production' },
    fetcher: async () => {
      calls += 1;
      return Response.json({ items: [] });
    },
  });

  assert.deepEqual(result, { used: false });
  assert.equal(calls, 0);
});

test('convierte fallas e inconsistencias upstream en un error 502', async (t) => {
  const env = { NODE_ENV: 'development' };

  await t.test('status no exitoso', async () => {
    await assert.rejects(
      loadPublicReadFallback('/api/items', isItemsPayload, {
        env,
        fetcher: async () => new Response('falló', { status: 503 }),
      }),
      (error) => error instanceof PublicReadFallbackError && error.status === 502
    );
  });

  await t.test('forma de JSON inválida', async () => {
    await assert.rejects(
      loadPublicReadFallback('/api/items', isItemsPayload, {
        env,
        fetcher: async () => Response.json({ wrong: [] }),
      }),
      (error) => error instanceof PublicReadFallbackError && error.status === 502
    );
  });
});
