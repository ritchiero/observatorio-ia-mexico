import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';
import {
  assertSafeRemoteUrl,
  fetchValidatedPdf,
  isHostnameAllowed,
  isPrivateOrReservedIp,
  MAX_PDF_BYTES,
  parseAllowedHostRules,
  PdfBackupValidationError,
} from './pdf-backup-security.ts';

const publicDns = async () => ['203.0.114.10'];

async function rejectsWithCode(promise, code) {
  await assert.rejects(
    promise,
    (error) => error instanceof PdfBackupValidationError && error.code === code,
  );
}

test('la allowlist es exacta y no acepta sufijos engañosos', () => {
  const rules = parseAllowedHostRules('gaceta.diputados.gob.mx');
  assert.equal(isHostnameAllowed('gaceta.diputados.gob.mx', rules), true);
  assert.equal(isHostnameAllowed('evil-gaceta.diputados.gob.mx', rules), false);
  assert.equal(isHostnameAllowed('gaceta.diputados.gob.mx.evil.test', rules), false);
});

test('los comodines sólo aceptan subdominios con límite de etiqueta', () => {
  const rules = parseAllowedHostRules('*.documentos.gob.mx');
  assert.equal(isHostnameAllowed('cdn.documentos.gob.mx', rules), true);
  assert.equal(isHostnameAllowed('documentos.gob.mx', rules), false);
  assert.equal(isHostnameAllowed('falsodocumentos.gob.mx', rules), false);
});

test('una variable explícitamente vacía desactiva todos los hosts', () => {
  assert.deepEqual(parseAllowedHostRules(''), []);
  assert.ok(parseAllowedHostRules(undefined).length > 0);
});

test('se bloquean rangos IPv4 e IPv6 privados o reservados', () => {
  for (const address of [
    '0.0.0.0',
    '10.1.2.3',
    '100.64.0.1',
    '127.0.0.1',
    '169.254.169.254',
    '172.16.0.1',
    '192.168.1.1',
    '198.51.100.4',
    '203.0.113.8',
    '::1',
    'fc00::1',
    'fe80::1',
    '2001:db8::1',
    '::ffff:127.0.0.1',
  ]) {
    assert.equal(isPrivateOrReservedIp(address), true, address);
  }

  assert.equal(isPrivateOrReservedIp('8.8.8.8'), false);
  assert.equal(isPrivateOrReservedIp('2606:4700:4700::1111'), false);
});

test('la URL exige HTTPS, host permitido, puerto estándar y DNS público', async () => {
  const rules = parseAllowedHostRules('docs.gob.mx');
  const ok = await assertSafeRemoteUrl('https://docs.gob.mx/a.pdf', rules, publicDns);
  assert.equal(ok.href, 'https://docs.gob.mx/a.pdf');

  await rejectsWithCode(
    assertSafeRemoteUrl('http://docs.gob.mx/a.pdf', rules, publicDns),
    'https_required',
  );
  await rejectsWithCode(
    assertSafeRemoteUrl('https://user:pass@docs.gob.mx/a.pdf', rules, publicDns),
    'credentials_forbidden',
  );
  await rejectsWithCode(
    assertSafeRemoteUrl('https://docs.gob.mx:8443/a.pdf', rules, publicDns),
    'port_forbidden',
  );
  await rejectsWithCode(
    assertSafeRemoteUrl('https://otro.gob.mx/a.pdf', rules, publicDns),
    'host_not_allowed',
  );
  await rejectsWithCode(
    assertSafeRemoteUrl('https://docs.gob.mx/a.pdf', rules, async () => ['127.0.0.1']),
    'private_address',
  );
});

test('valida MIME, firma PDF, tamaño y calcula SHA-256', async () => {
  const bytes = Buffer.from('%PDF-1.7\ncontenido de prueba');
  const result = await fetchValidatedPdf('https://docs.gob.mx/a.pdf', {
    allowedHosts: parseAllowedHostRules('docs.gob.mx'),
    resolveHost: publicDns,
    fetchImpl: async () =>
      new Response(bytes, {
        headers: {
          'content-type': 'application/pdf; charset=binary',
          'content-length': String(bytes.length),
        },
      }),
  });

  assert.equal(result.byteLength, bytes.length);
  assert.equal(result.declaredMime, 'application/pdf');
  assert.equal(result.detectedMime, 'application/pdf');
  assert.equal(result.sha256, createHash('sha256').update(bytes).digest('hex'));
});

test('rechaza HTML disfrazado y MIME no PDF', async () => {
  const common = {
    allowedHosts: parseAllowedHostRules('docs.gob.mx'),
    resolveHost: publicDns,
  };

  await rejectsWithCode(
    fetchValidatedPdf('https://docs.gob.mx/a.pdf', {
      ...common,
      fetchImpl: async () =>
        new Response('%PDF-1.7', { headers: { 'content-type': 'text/html' } }),
    }),
    'mime_mismatch',
  );
  await rejectsWithCode(
    fetchValidatedPdf('https://docs.gob.mx/a.pdf', {
      ...common,
      fetchImpl: async () =>
        new Response('<html>no es PDF</html>', {
          headers: { 'content-type': 'application/pdf' },
        }),
    }),
    'magic_mismatch',
  );
});

test('rechaza por Content-Length antes de leer más de 25 MB', async () => {
  await rejectsWithCode(
    fetchValidatedPdf('https://docs.gob.mx/a.pdf', {
      allowedHosts: parseAllowedHostRules('docs.gob.mx'),
      resolveHost: publicDns,
      fetchImpl: async () =>
        new Response('%PDF-1.7', {
          headers: {
            'content-type': 'application/pdf',
            'content-length': String(MAX_PDF_BYTES + 1),
          },
        }),
    }),
    'file_too_large',
  );
});

test('el límite también se aplica a respuestas chunked sin Content-Length', async () => {
  await rejectsWithCode(
    fetchValidatedPdf('https://docs.gob.mx/a.pdf', {
      allowedHosts: parseAllowedHostRules('docs.gob.mx'),
      resolveHost: publicDns,
      maxBytes: 7,
      fetchImpl: async () =>
        new Response('%PDF-1.7', {
          headers: { 'content-type': 'application/pdf' },
        }),
    }),
    'file_too_large',
  );
});

test('revalida la allowlist antes de seguir una redirección', async () => {
  let requests = 0;
  await rejectsWithCode(
    fetchValidatedPdf('https://docs.gob.mx/a.pdf', {
      allowedHosts: parseAllowedHostRules('docs.gob.mx'),
      resolveHost: publicDns,
      fetchImpl: async () => {
        requests += 1;
        return new Response(null, {
          status: 302,
          headers: { location: 'https://evil.test/payload.pdf' },
        });
      },
    }),
    'host_not_allowed',
  );
  assert.equal(requests, 1);
});

test('revalida DNS en cada salto permitido y bloquea el destino privado', async () => {
  let requests = 0;
  const resolver = async (hostname) =>
    hostname === 'cdn.docs.gob.mx' ? ['169.254.169.254'] : ['203.0.114.10'];

  await rejectsWithCode(
    fetchValidatedPdf('https://docs.gob.mx/a.pdf', {
      allowedHosts: parseAllowedHostRules('docs.gob.mx,cdn.docs.gob.mx'),
      resolveHost: resolver,
      fetchImpl: async () => {
        requests += 1;
        return new Response(null, {
          status: 302,
          headers: { location: 'https://cdn.docs.gob.mx/a.pdf' },
        });
      },
    }),
    'private_address',
  );
  assert.equal(requests, 1);
});
