import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';
import { hasAdminRole, isValidBearerAuthorization } from '@/lib/auth-policy';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function isAdmin() {
  const session = await getSession();
  return hasAdminRole(session);
}

export async function requireAdmin() {
  const admin = await isAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: 'No autorizado. Se requiere autenticación de administrador.' },
      { status: 401 }
    );
  }
  return null;
}

/**
 * Autoriza integraciones máquina-a-máquina exclusivamente mediante
 * `Authorization: Bearer <token>`. No acepta query params ni headers alternos.
 */
export function requireServiceToken(
  request: Request,
  expectedSecret: string | undefined,
) {
  const authorized = isValidBearerAuthorization(
    request.headers.get('authorization'),
    expectedSecret,
  );

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}

export function requireCron(request: Request) {
  return requireServiceToken(request, process.env.CRON_SECRET);
}
