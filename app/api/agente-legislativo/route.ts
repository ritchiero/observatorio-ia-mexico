import { NextRequest, NextResponse } from 'next/server';
import { ejecutarAgenteLegislativo } from '@/lib/agenteLegislativo';
import { requireServiceToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const authError = requireServiceToken(request, process.env.ADMIN_KEY);
  if (authError) return authError;

  try {
    const result = await ejecutarAgenteLegislativo();
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: unknown) {
    console.error('Error ejecutando agente legislativo:', error);
    return NextResponse.json(
      { error: 'Error ejecutando agente legislativo' },
      { status: 500 }
    );
  }
}
