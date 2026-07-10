import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Política mínima de autorización, separada de NextAuth para que el criterio
 * falle cerrado y pueda probarse sin inicializar proveedores ni credenciales.
 */
export function hasAdminRole(session: unknown): boolean {
  if (!session || typeof session !== 'object' || !('user' in session)) {
    return false;
  }

  const user = session.user;
  return Boolean(
    user && typeof user === 'object' && 'role' in user && user.role === 'admin',
  );
}

/**
 * Valida un único token Bearer sin filtrar el secreto por diferencias de
 * longitud. Un secreto ausente o compuesto sólo por espacios nunca autoriza.
 */
export function isValidBearerAuthorization(
  authorization: string | null,
  expectedSecret: string | undefined,
): boolean {
  if (!expectedSecret || expectedSecret.trim().length === 0 || !authorization) {
    return false;
  }

  const match = /^Bearer ([^\s]+)$/i.exec(authorization);
  if (!match) return false;

  const receivedHash = createHash('sha256').update(match[1], 'utf8').digest();
  const expectedHash = createHash('sha256').update(expectedSecret, 'utf8').digest();

  return timingSafeEqual(receivedHash, expectedHash);
}
