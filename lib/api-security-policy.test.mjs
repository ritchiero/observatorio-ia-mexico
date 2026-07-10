import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

async function routeFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await routeFiles(absolute));
    if (entry.isFile() && entry.name === 'route.ts') files.push(absolute);
  }
  return files;
}

async function source(relativePath) {
  return readFile(path.join(projectRoot, relativePath), 'utf8');
}

test('todas las rutas /api/admin autorizan en el handler', async () => {
  const files = await routeFiles(path.join(projectRoot, 'app/api/admin'));
  const missing = [];

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    if (!contents.includes('await requireAdmin(')) {
      missing.push(path.relative(projectRoot, file));
    }
  }

  assert.deepEqual(missing, []);
});

test('todos los cron fallan cerrado mediante requireCron', async () => {
  const files = await routeFiles(path.join(projectRoot, 'app/api/cron'));
  const missing = [];
  const directSecretComparisons = [];

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    const relative = path.relative(projectRoot, file);
    if (!contents.includes('requireCron(')) missing.push(relative);
    if (/authorization[^\n]+CRON_SECRET|CRON_SECRET[^\n]+authorization/i.test(contents)) {
      directSecretComparisons.push(relative);
    }
  }

  assert.deepEqual(missing, []);
  assert.deepEqual(directSecretComparisons, []);
});

test('los APIs públicos sensibles no exponen lectura PII ni mutaciones anónimas', async () => {
  const subscriptions = await source('app/api/suscripciones/route.ts');
  assert.doesNotMatch(subscriptions, /export async function GET\s*\(/);

  for (const relative of [
    'app/api/anuncios/route.ts',
    'app/api/anuncios/[id]/route.ts',
    'app/api/casos-ia/route.ts',
    'app/api/casos-ia/[id]/route.ts',
  ]) {
    const contents = await source(relative);
    const hasMutation = /export async function (POST|PUT|PATCH|DELETE)\s*\(/.test(contents);
    if (hasMutation) {
      assert.match(contents, /await requireAdmin\s*\(/, `${relative} debe exigir admin`);
    }
  }
});

test('toda mutación HTTP está autorizada o declarada pública de forma explícita', async () => {
  const publicMutationAllowlist = new Set([
    // Alta pública voluntaria; tiene su propia validación y política antiabuso.
    'app/api/suscripciones/route.ts',
    // Consulta pública del mapa; debe conservar límites de entrada/costo.
    'app/api/grafo/buscar/route.ts',
  ]);
  const files = await routeFiles(path.join(projectRoot, 'app/api'));
  const unauthorized = [];

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    if (!/export async function (POST|PUT|PATCH|DELETE)\s*\(/.test(contents)) continue;

    const relative = path.relative(projectRoot, file);
    const guarded =
      contents.includes('await requireAdmin(') ||
      contents.includes('requireCron(') ||
      contents.includes('requireServiceToken(');
    if (!guarded && !publicMutationAllowlist.has(relative)) unauthorized.push(relative);
  }

  assert.deepEqual(unauthorized, []);
});

test('no reaparece el bypass literal de llave administrativa', async () => {
  const files = await routeFiles(path.join(projectRoot, 'app/api'));
  const offenders = [];

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    if (
      /adminKey\s*!==\s*['"]skip['"]|adminKey\s*===\s*['"]skip['"]/.test(contents) ||
      /headers\.get\(['"]x-admin-key['"]\)/.test(contents) ||
      /searchParams\.get\(['"]key['"]\)/.test(contents)
    ) {
      offenders.push(path.relative(projectRoot, file));
    }
  }

  assert.deepEqual(offenders, []);
});

test('la importación administrativa no escribe Firestore desde el navegador', async () => {
  const contents = await source('app/admin/import-legislacion/page.tsx');
  assert.doesNotMatch(contents, /from ['"]firebase\/firestore['"]/);
  assert.doesNotMatch(contents, /\b(addDoc|setDoc|updateDoc|deleteDoc)\s*\(/);
  assert.match(contents, /fetch\(['"]\/api\/admin\/import-iniciativas['"]/);
});
