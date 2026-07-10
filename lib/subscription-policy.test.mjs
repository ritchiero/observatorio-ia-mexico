import assert from 'node:assert/strict';
import test from 'node:test';

import {
  normalizeSubscriptionRequest,
  SubscriptionValidationError,
} from './subscription-policy.ts';

test('normaliza el alta mínima con correo y consentimiento', () => {
  assert.deepEqual(
    normalizeSubscriptionRequest({
      email: ' Persona@Ejemplo.mx ',
      consentimientoEmail: true,
    }),
    {
      email: 'persona@ejemplo.mx',
      consentimientoEmail: true,
      consentimientoWhatsApp: false,
      origen: 'sitio-web',
      honeypotTriggered: false,
    }
  );
});

test('nombre y WhatsApp son opcionales y WhatsApp exige consentimiento separado', () => {
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

test('rechaza correo, consentimiento y teléfono inconsistentes', () => {
  for (const payload of [
    { email: 'no-es-correo', consentimientoEmail: true },
    { email: 'persona@ejemplo.mx' },
    {
      email: 'persona@ejemplo.mx',
      consentimientoEmail: true,
      telefono: '5512345678',
    },
    {
      email: 'persona@ejemplo.mx',
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
    consentimientoEmail: true,
    website: 'https://spam.test',
  });
  assert.equal(normalized.honeypotTriggered, true);
});
