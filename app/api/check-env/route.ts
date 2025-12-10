import { NextResponse } from 'next/server';

export async function GET() {
  const envCheck = {
    NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    ADMIN_USERNAME: !!process.env.ADMIN_USERNAME,
    ADMIN_PASSWORD_HASH: !!process.env.ADMIN_PASSWORD_HASH,
    NEXTAUTH_URL_value: process.env.NEXTAUTH_URL || 'NOT_SET',
    NODE_ENV: process.env.NODE_ENV,
  };

  return NextResponse.json(envCheck);
}
