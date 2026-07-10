import assert from 'node:assert/strict';
import test from 'node:test';

import {
  hasAdminRole,
  isValidBearerAuthorization,
} from './auth-policy.ts';

test('la política administrativa falla cerrada y sólo acepta el rol exacto', () => {
  assert.equal(hasAdminRole(undefined), false);
  assert.equal(hasAdminRole(null), false);
  assert.equal(hasAdminRole({}), false);
  assert.equal(hasAdminRole({ user: null }), false);
  assert.equal(hasAdminRole({ user: { role: 'Admin' } }), false);
  assert.equal(hasAdminRole({ user: { role: 'editor' } }), false);
  assert.equal(hasAdminRole({ user: { role: 'admin' } }), true);
});

test('el token de servicio exige Authorization Bearer y secreto no vacío', () => {
  assert.equal(isValidBearerAuthorization(null, 'secreto'), false);
  assert.equal(isValidBearerAuthorization('Bearer secreto', undefined), false);
  assert.equal(isValidBearerAuthorization('Bearer secreto', ''), false);
  assert.equal(isValidBearerAuthorization('Bearer secreto', '   '), false);
  assert.equal(isValidBearerAuthorization('Basic secreto', 'secreto'), false);
  assert.equal(isValidBearerAuthorization('Bearer incorrecto', 'secreto'), false);
  assert.equal(isValidBearerAuthorization('Bearer secreto extra', 'secreto'), false);
  assert.equal(isValidBearerAuthorization('Bearer secreto', 'secreto'), true);
  assert.equal(isValidBearerAuthorization('bearer secreto', 'secreto'), true);
});
