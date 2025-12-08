import { NextRequest, NextResponse } from 'next/server';
import { ejecutarAgenteLegislativoAPI } from '@/lib/agenteLegislativo';

export async function POST(request: NextRequest) {
  try {
    const adminKey = request.headers.get('x-admin-key');
    
    if (!adminKey) {
      return NextResponse.json(
        { error: 'Admin key requerida' },
        { status: 401 }
      );
    }
    
    const result = await ejecutarAgenteLegislativoAPI(adminKey);
    
    return NextResponse.json({
      success: true,
      result
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error ejecutando agente legislativo' },
      { status: 500 }
    );
  }
}
