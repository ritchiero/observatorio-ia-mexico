import { NextResponse } from 'next/server';

export async function GET() {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  
  return NextResponse.json({
    projectId,
    projectIdLength: projectId?.length,
    projectIdTrimmed: projectId?.trim(),
    projectIdTrimmedLength: projectId?.trim().length,
    hasLeadingSpace: projectId !== projectId?.trimStart(),
    hasTrailingSpace: projectId !== projectId?.trimEnd(),
    charCodes: projectId?.split('').map(c => c.charCodeAt(0)),
  });
}
