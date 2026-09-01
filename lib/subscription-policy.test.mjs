import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeSubscriptionRequest,
  SubscriptionValidationError,
} from './subscription-policy.ts';

test('normaliza el alta con nombre, correo, teléfono y consentimientos', () => {
  assert.deepEqual(
    normalizeSubscriptionRequest({
      email: ' Persona@Ejemplo.mx ',
      nombre: ' Ada Lovelace ',
      telefono: '+52 55 1234 5678',
      consentimientoEmail: true,
      consentimientoWhatsApp: true,
    }),
    {
      email: 'persona@ejemplo.mx',
      nombre: 'Ada Lovelace',
      telefono: '525512345678',
      consentimientoEmail: true,
      consentimientoWhatsApp: true,
      origen: 'sitio-web',
      honeypotTriggered: false,
    }
  );
});

test('normaliza nombre, teléfono internacional y origen', () => {
  const normalized = normalizeSubscriptionRequest({
    email: 'persona@ejemplo.mx',
    nombre: ' Ada Lovelace ',
    telefono: '+52 55 1234 5678',
    consentimientoEmail: true,
    consentimientoWhatsApp: true,
    origen: '/grafo',
  });
  assert.equal(normalized.nombre, 'Ada Lovelace');
  assert.equal(normalized.telefono, '525512345678');
  assert.equal(normalized.consentimientoWhatsApp, true);
  assert.equal(normalized.origen, '/grafo');
});

test('rechaza altas sin nombre, sin teléfono o sin consentimientos', () => {
  for (const payload of [
    {
      email: 'no-es-correo',
      nombre: 'Ada Lovelace',
      telefono: '5512345678',
      consentimientoEmail: true,
      consentimientoWhatsApp: true,
    },
    {
      email: 'persona@ejemplo.mx',
      telefono: '5512345678',
      consentimientoEmail: true,
      consentimientoWhatsApp: true,
    },
    {
      email: 'persona@ejemplo.mx',
      nombre: 'Ada Lovelace',
      consentimientoEmail: true,
      consentimientoWhatsApp: true,
    },
    {
      email: 'persona@ejemplo.mx',
      nombre: 'Ada Lovelace',
      consentimientoEmail: true,
      telefono: '5512345678',
    },
    {
      email: 'persona@ejemplo.mx',
      nombre: 'Ada Lovelace',
      telefono: '5512345678',
      consentimientoWhatsApp: true,
    },
    {
      email: 'persona@ejemplo.mx',
      nombre: 'Ada Lovelace',
      telefono: '123',
      consentimientoEmail: true,
      consentimientoWhatsApp: true,
    },
  ]) {
    assert.throws(
      () => normalizeSubscriptionRequest(payload),
      (error) => error instanceof SubscriptionValidationError
    );
  }
});

test('detecta el honeypot sin alterar la respuesta pública', () => {
  const normalized = normalizeSubscriptionRequest({
    email: 'bot@ejemplo.mx',
    nombre: 'Bot de prueba',
    telefono: '5512345678',
    consentimientoEmail: true,
    consentimientoWhatsApp: true,
    website: 'https://spam.test',
  });
  assert.equal(normalized.honeypotTriggered, true);
});
