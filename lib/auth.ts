import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextResponse } from 'next/server';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function isAdmin() {
  const session = await getSession();
  return session?.user && (session.user as any).role === 'admin';
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
