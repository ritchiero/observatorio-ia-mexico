export const SUBSCRIPTION_CONSENT_VERSION = '2026-09-01';
export const SUBSCRIPTION_SUCCESS_MESSAGE =
  'Si el correo es válido, recibirás las actualizaciones del Observatorio.';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class SubscriptionValidationError extends Error {
  readonly status = 400;

  constructor(message: string) {
    super(message);
    this.name = 'SubscriptionValidationError';
  }
}

export type NormalizedSubscription = {
  email: string;
  nombre: string;
  telefono: string;
  consentimientoEmail: true;
  consentimientoWhatsApp: true;
  origen: string;
  honeypotTriggered: boolean;
};

function optionalString(value: unknown, maxLength: number): string | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new SubscriptionValidationError('Solicitud inválida.');
  const normalized = value.trim();
  if (!normalized) return undefined;
  if (normalized.length > maxLength) throw new SubscriptionValidationError('Solicitud inválida.');
  return normalized;
}

function requiredString(value: unknown, maxLength: number, message: string): string {
  const normalized = optionalString(value, maxLength);
  if (!normalized) throw new SubscriptionValidationError(message);
  return normalized;
}

export function normalizeSubscriptionRequest(value: unknown): NormalizedSubscription {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new SubscriptionValidationError('Solicitud inválida.');
  }

  const input = value as Record<string, unknown>;
  const email = optionalString(input.email, 254)?.toLowerCase();
  if (!email || !EMAIL_PATTERN.test(email)) {
    throw new SubscriptionValidationError('Ingresa un correo electrónico válido.');
  }
  if (input.consentimientoEmail !== true) {
    throw new SubscriptionValidationError(
      'Necesitamos tu consentimiento para enviarte actualizaciones por correo.'
    );
  }

  const nombre = requiredString(input.nombre, 120, 'Ingresa tu nombre completo.');
  const rawPhone = requiredString(input.telefono, 32, 'Ingresa tu teléfono.');
  const telefono = rawPhone.replace(/\D/g, '');
  if (telefono.length < 10 || telefono.length > 15) {
    throw new SubscriptionValidationError('El teléfono debe tener entre 10 y 15 dígitos.');
  }

  if (input.consentimientoWhatsApp !== true) {
    throw new SubscriptionValidationError(
      'Necesitamos tu consentimiento para enviarte avisos por WhatsApp.'
    );
  }

  const origen = optionalString(input.origen, 100) ?? 'sitio-web';
  const honeypotTriggered = Boolean(optionalString(input.website, 200));

  return {
    email,
    nombre,
    telefono,
    consentimientoEmail: true,
    consentimientoWhatsApp: true,
    origen,
    honeypotTriggered,
  };
}
