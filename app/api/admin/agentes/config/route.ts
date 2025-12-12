/**
 * API: Configuración de Agentes
 * ==============================
 * GET: Obtener configuración actual
 * PUT: Actualizar configuración
 */

import { NextRequest, NextResponse } from 'next/server';
import { usageTracker } from '@/lib/agents/usage-tracker';
import type { AgentConfigResponse, MasterConfig, AgentConfig, AgentType } from '@/types/agents';

// ============================================
// GET - Obtener configuración
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Verificar autorización
    const authResult = verifyAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const [master, agents] = await Promise.all([
      usageTracker.getMasterConfig(),
      usageTracker.getAgentConfigs(),
    ]);

    const response: AgentConfigResponse = {
      master,
      agents,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[api/agentes/config] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Actualizar configuración
// ============================================

export async function PUT(request: NextRequest) {
  try {
    // Verificar autorización
    const authResult = verifyAuth(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body as {
      type: 'master' | 'agent';
      data: Partial<MasterConfig> | { agentType: AgentType; config: Partial<AgentConfig> };
    };

    if (type === 'master') {
      const updated = await usageTracker.updateMasterConfig(
        data as Partial<MasterConfig>,
        authResult.user || 'admin'
      );
      return NextResponse.json({ success: true, config: updated });
    }

    if (type === 'agent') {
      const { agentType, config } = data as { 
        agentType: AgentType; 
        config: Partial<AgentConfig>;
      };
      const updated = await usageTracker.updateAgentConfig(agentType, config);
      return NextResponse.json({ success: true, config: updated });
    }

    return NextResponse.json(
      { error: 'Tipo de configuración no válido' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[api/agentes/config] Error:', error);
    return NextResponse.json(
      { error: 'Error al actualizar configuración' },
      { status: 500 }
    );
  }
}

// ============================================
// AUTH HELPER
// ============================================

function verifyAuth(request: NextRequest): { authorized: boolean; user?: string } {
  // Verificar por header o query param
  const authKey = 
    request.headers.get('x-admin-key') ||
    request.nextUrl.searchParams.get('key');

  const validKey = process.env.ADMIN_KEY || process.env.CRON_SECRET;

  if (!validKey || authKey !== validKey) {
    return { authorized: false };
  }

  return { authorized: true, user: 'admin' };
}
