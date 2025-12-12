/**
 * API: Configuración de Agentes
 * ==============================
 * GET: Obtener configuración actual
 * PUT: Actualizar configuración
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { usageTracker } from '@/lib/agents/usage-tracker';
import { DEFAULT_MASTER_CONFIG, DEFAULT_AGENT_CONFIGS } from '@/lib/agents/config';
import type { AgentConfigResponse, MasterConfig, AgentConfig, AgentType } from '@/types/agents';

// ============================================
// GET - Obtener configuración
// ============================================

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
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
    
    // Devolver configuración por defecto si hay error
    const response: AgentConfigResponse = {
      master: DEFAULT_MASTER_CONFIG,
      agents: DEFAULT_AGENT_CONFIGS,
    };
    
    return NextResponse.json(response);
  }
}

// ============================================
// PUT - Actualizar configuración
// ============================================

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
    const body = await request.json();
    const { type, data } = body as {
      type: 'master' | 'agent';
      data: Partial<MasterConfig> | { agentType: AgentType; config: Partial<AgentConfig> };
    };

    if (type === 'master') {
      const updated = await usageTracker.updateMasterConfig(
        data as Partial<MasterConfig>,
        'admin'
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
      { error: 'Error al actualizar configuración. Verifica las credenciales de Firebase.' },
      { status: 500 }
    );
  }
}
