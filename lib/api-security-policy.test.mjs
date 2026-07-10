import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import ts from 'typescript';

const projectRoot = path.resolve(import.meta.dirname, '..');
const HTTP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS', 'POST', 'PUT', 'PATCH', 'DELETE']);
const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

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

function exportedRouteHandlers(contents, fileName = 'route.ts') {
  const sourceFile = ts.createSourceFile(
    fileName,
    contents,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const handlers = [];

  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement) && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        if (HTTP_METHODS.has(element.name.text)) {
          handlers.push({
            method: element.name.text,
            body: null,
            delegatedFrom: element.propertyName?.text ?? element.name.text,
            sourceFile,
          });
        }
      }
      continue;
    }

    const exported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!exported) continue;

    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name &&
      statement.body &&
      HTTP_METHODS.has(statement.name.text)
    ) {
      handlers.push({
        method: statement.name.text,
        body: statement.body,
        sourceFile,
      });
      continue;
    }

    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (!ts.isIdentifier(declaration.name) || !HTTP_METHODS.has(declaration.name.text)) {
          continue;
        }

        if (
          declaration.initializer &&
          (ts.isArrowFunction(declaration.initializer) ||
            ts.isFunctionExpression(declaration.initializer)) &&
          ts.isBlock(declaration.initializer.body)
        ) {
          handlers.push({
            method: declaration.name.text,
            body: declaration.initializer.body,
            sourceFile,
          });
        } else {
          handlers.push({
            method: declaration.name.text,
            body: null,
            delegatedFrom: declaration.initializer?.getText(sourceFile) ?? 'unknown',
            sourceFile,
          });
        }
      }
    }
  }

  return handlers;
}

function callName(call) {
  if (ts.isIdentifier(call.expression)) return call.expression.text;
  if (ts.isPropertyAccessExpression(call.expression)) return call.expression.name.text;
  return null;
}

function callReceiverName(call) {
  if (!ts.isPropertyAccessExpression(call.expression)) return null;
  const receiver = call.expression.expression;
  return ts.isIdentifier(receiver) ? receiver.text : null;
}

function callPositions(handler, predicate) {
  const positions = [];
  if (!handler.body) return positions;
  const visit = (node) => {
    if (ts.isCallExpression(node) && predicate(node)) {
      positions.push(node.getStart(handler.sourceFile));
    }
    ts.forEachChild(node, visit);
  };
  visit(handler.body);
  return positions.sort((a, b) => a - b);
}

function isSensitiveEffect(call) {
  const name = callName(call);
  const receiver = callReceiverName(call);
  if (['getAdminDb', 'getAdminStorage', 'fetch'].includes(name)) return true;
  if (
    receiver === 'request' &&
    ['json', 'text', 'formData', 'arrayBuffer', 'blob'].includes(name)
  ) {
    return true;
  }
  return false;
}

function guardBeforeEffects(handler, allowedGuards) {
  if (!handler.body) {
    return {
      ok: false,
      reason: `handler delegado a ${handler.delegatedFrom ?? 'otro símbolo'}`,
    };
  }

  const effectPositions = callPositions(handler, isSensitiveEffect);
  const firstEffect = effectPositions[0] ?? Number.POSITIVE_INFINITY;
  let sawUnawaitedAdmin = false;

  for (let index = 0; index < handler.body.statements.length; index += 1) {
    const statement = handler.body.statements[index];
    if (!ts.isVariableStatement(statement)) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;

      const awaited = ts.isAwaitExpression(declaration.initializer);
      const candidate = awaited ? declaration.initializer.expression : declaration.initializer;
      if (!ts.isCallExpression(candidate)) continue;

      const guardName = callName(candidate);
      if (!allowedGuards.has(guardName)) continue;
      if (guardName === 'requireAdmin' && !awaited) {
        sawUnawaitedAdmin = true;
        continue;
      }

      const guardPosition = candidate.getStart(handler.sourceFile);
      if (guardPosition > firstEffect) {
        return { ok: false, reason: 'guarda posterior al primer efecto' };
      }

      const variableName = declaration.name.text;
      for (const nextStatement of handler.body.statements.slice(index + 1)) {
        if (nextStatement.getStart(handler.sourceFile) > firstEffect) break;
        if (!ts.isIfStatement(nextStatement)) continue;

        const conditionUsesGuard =
          ts.isIdentifier(nextStatement.expression) &&
          nextStatement.expression.text === variableName;

        const directReturn = ts.isBlock(nextStatement.thenStatement)
          ? nextStatement.thenStatement.statements.length === 1
            ? nextStatement.thenStatement.statements[0]
            : null
          : nextStatement.thenStatement;
        const returnsGuard = Boolean(
          directReturn &&
          ts.isReturnStatement(directReturn) &&
          directReturn.expression &&
          ts.isIdentifier(directReturn.expression) &&
          directReturn.expression.text === variableName,
        );

        if (conditionUsesGuard && returnsGuard) return { ok: true };
      }
    }
  }

  return {
    ok: false,
    reason: sawUnawaitedAdmin
      ? 'requireAdmin sin await'
      : 'sin asignación y retorno temprano de la guarda',
  };
}

test('el analizador distingue handlers y exige una guarda efectiva', () => {
  const handlers = exportedRouteHandlers(`
    export async function GET() {
      const auth = await requireAdmin();
      if (auth) return auth;
      const db = getAdminDb();
      return db;
    }
    export const POST = async (request: Request) => {
      const body = await request.json();
      const auth = await requireAdmin();
      return { auth, body };
    };
    export async function PUT() {
      const auth = requireAdmin();
      if (auth) return auth;
      return getAdminDb();
    }
    export async function PATCH() {
      await requireAdmin();
      return getAdminDb();
    }
    export async function HEAD() {
      const auth = await requireAdmin();
      if (auth) { if (false) return auth; }
      return getAdminDb();
    }
    const nextAuthHandler = () => null;
    export { nextAuthHandler as DELETE };
  `);

  assert.equal(handlers.length, 6);
  assert.deepEqual(
    guardBeforeEffects(handlers[0], new Set(['requireAdmin'])),
    { ok: true },
  );
  assert.deepEqual(
    guardBeforeEffects(handlers[1], new Set(['requireAdmin'])),
    { ok: false, reason: 'guarda posterior al primer efecto' },
  );
  assert.deepEqual(
    guardBeforeEffects(handlers[2], new Set(['requireAdmin'])),
    { ok: false, reason: 'requireAdmin sin await' },
  );
  assert.equal(guardBeforeEffects(handlers[3], new Set(['requireAdmin'])).ok, false);
  assert.equal(guardBeforeEffects(handlers[4], new Set(['requireAdmin'])).ok, false);
  assert.match(
    guardBeforeEffects(handlers[5], new Set(['requireAdmin'])).reason,
    /handler delegado/,
  );
});

test('cada handler de /api/admin autoriza antes de leer cuerpo, DB o red', async () => {
  const files = await routeFiles(path.join(projectRoot, 'app/api/admin'));
  const missing = [];

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    for (const handler of exportedRouteHandlers(contents, file)) {
      const result = guardBeforeEffects(handler, new Set(['requireAdmin']));
      if (!result.ok) {
        missing.push(`${path.relative(projectRoot, file)}#${handler.method}: ${result.reason}`);
      }
    }
  }

  assert.deepEqual(missing, []);
});

test('cada handler cron falla cerrado antes de DB o red', async () => {
  const files = await routeFiles(path.join(projectRoot, 'app/api/cron'));
  const missing = [];
  const directSecretComparisons = [];

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    const relative = path.relative(projectRoot, file);
    for (const handler of exportedRouteHandlers(contents, file)) {
      const result = guardBeforeEffects(handler, new Set(['requireCron']));
      if (!result.ok) missing.push(`${relative}#${handler.method}: ${result.reason}`);
    }
    if (/authorization[^\n]+CRON_SECRET|CRON_SECRET[^\n]+authorization/i.test(contents)) {
      directSecretComparisons.push(relative);
    }
  }

  assert.deepEqual(missing, []);
  assert.deepEqual(directSecretComparisons, []);
});

test('los APIs públicos sensibles no exponen lectura PII ni mutaciones anónimas', async () => {
  const subscriptions = await source('app/api/suscripciones/route.ts');
  const subscriptionHandlers = exportedRouteHandlers(subscriptions);
  assert.equal(
    subscriptionHandlers.some((handler) => handler.method === 'GET'),
    false,
    'suscripciones no debe exportar GET de ninguna forma',
  );
  const subscriptionPost = subscriptionHandlers.find((handler) => handler.method === 'POST');
  assert.ok(subscriptionPost, 'suscripciones debe conservar POST');
  const limiterPosition = callPositions(
    subscriptionPost,
    (call) => callName(call) === 'enforceSubscriptionRateLimit',
  )[0];
  const firstCollectionAccess = callPositions(
    subscriptionPost,
    (call) => callName(call) === 'collection',
  )[0];
  assert.ok(Number.isFinite(limiterPosition), 'el alta debe usar un límite distribuido');
  assert.ok(
    limiterPosition < firstCollectionAccess,
    'el límite debe ejecutarse antes de consultar o escribir suscripciones',
  );

  for (const relative of [
    'app/api/anuncios/route.ts',
    'app/api/anuncios/[id]/route.ts',
    'app/api/casos-ia/route.ts',
    'app/api/casos-ia/[id]/route.ts',
  ]) {
    const contents = await source(relative);
    for (const handler of exportedRouteHandlers(contents, relative)) {
      if (!MUTATING_METHODS.has(handler.method)) continue;
      assert.deepEqual(
        guardBeforeEffects(handler, new Set(['requireAdmin'])),
        { ok: true },
        `${relative}#${handler.method} debe exigir admin de forma efectiva`,
      );
    }
  }
});

test('toda mutación HTTP está autorizada o declarada pública de forma explícita', async () => {
  const publicMutationAllowlist = new Set([
    // Alta pública voluntaria; tiene su propia validación y política antiabuso.
    'app/api/suscripciones/route.ts#POST',
    // Consulta pública del mapa; debe conservar límites de entrada/costo.
    'app/api/grafo/buscar/route.ts#POST',
    // NextAuth implementa su propia autenticación y exporta un handler delegado.
    'app/api/auth/[...nextauth]/route.ts#POST',
  ]);
  const files = await routeFiles(path.join(projectRoot, 'app/api'));
  const unauthorized = [];

  for (const file of files) {
    const contents = await readFile(file, 'utf8');
    const relative = path.relative(projectRoot, file);
    for (const handler of exportedRouteHandlers(contents, file)) {
      if (
        !MUTATING_METHODS.has(handler.method) ||
        publicMutationAllowlist.has(`${relative}#${handler.method}`)
      ) {
        continue;
      }
      const result = guardBeforeEffects(
        handler,
        new Set(['requireAdmin', 'requireCron', 'requireServiceToken']),
      );
      if (!result.ok) unauthorized.push(`${relative}#${handler.method}: ${result.reason}`);
    }
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

  const parserScript = await source('scripts/import-iniciativas.ts');
  assert.doesNotMatch(parserScript, /x-admin-key|observatorio2025/);
  for (const removedScript of [
    'scripts/import-to-firestore.js',
    'scripts/import-via-api-local.js',
  ]) {
    await assert.rejects(
      readFile(path.join(projectRoot, removedScript), 'utf8'),
      (error) => error?.code === 'ENOENT',
    );
  }
});

test('la importación administrativa no escribe Firestore desde el navegador', async () => {
  const contents = await source('app/admin/import-legislacion/page.tsx');
  assert.doesNotMatch(contents, /from ['"]firebase\/firestore['"]/);
  assert.doesNotMatch(contents, /\b(addDoc|setDoc|updateDoc|deleteDoc)\s*\(/);
  assert.match(contents, /fetch\(['"]\/api\/admin\/import-iniciativas['"]/);
});

test('Firestore cliente queda cerrado y el agente legislativo usa Admin SDK', async () => {
  const rules = await source('firestore.rules');
  const agent = await source('lib/agenteLegislativo.ts');
  assert.match(rules, /allow read, write:\s*if false/);
  assert.doesNotMatch(rules, /allow\s+(read|write):\s*if true/);
  assert.doesNotMatch(agent, /from ['"]firebase\/firestore['"]/);
  assert.match(agent, /getAdminDb\s*\(/);
  await assert.rejects(
    readFile(path.join(projectRoot, 'lib/firebase.ts'), 'utf8'),
    (error) => error?.code === 'ENOENT',
  );
});

test('los candidatos PDF no pueden caer al bucket público por omisión', async () => {
  const backupRoute = await source('app/api/backup-pdfs/route.ts');

  assert.match(backupRoute, /PRIVATE_FIREBASE_STORAGE_BUCKET/);
  assert.match(backupRoute, /requirePrivateBackupBucketName/);
  assert.match(
    backupRoute,
    /if \(!parsed\.dryRun\) \{[\s\S]*?PRIVATE_FIREBASE_STORAGE_BUCKET/,
  );
  assert.doesNotMatch(backupRoute, /storage\.bucket\(\)/);
  assert.equal(
    [...backupRoute.matchAll(/storage\.bucket\(bucketName\)/g)].length,
    2,
  );
  assert.doesNotMatch(backupRoute, /makePublic\(/);

  const scripts = await readdir(path.join(projectRoot, 'scripts'));
  assert.equal(scripts.includes('backup-pdfs-to-storage.ts'), false);
});

test('el fallback público de iniciativas aplica el mismo saneamiento que Firestore', async () => {
  const contents = await source('app/api/iniciativas/route.ts');
  assert.match(contents, /sanitizePublicRecords\s*\(fallback\.data\.data\)/);
});
