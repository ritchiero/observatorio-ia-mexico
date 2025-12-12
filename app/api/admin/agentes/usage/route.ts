/**
 * API: Uso y Métricas de Agentes
 * ===============================
 * GET: Obtener métricas de uso
 */

import { NextRequest, NextResponse } from 'next/server';
import { usageTracker } from '@/lib/agents/usage-tracker';
import type { AgentUsageResponse } from '@/types/agents';

// ============================================
// GET - Obtener métricas de uso
// ============================================

export async function GET(request: NextRequest) {
  try {
    // Verificar autorización
    const authKey = 
      request.headers.get('x-admin-key') ||
      request.nextUrl.searchParams.get('key');

    const validKey = process.env.ADMIN_KEY || process.env.CRON_SECRET;

    if (!validKey || authKey !== validKey) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener datos en paralelo
    const [master, todayUsage, monthlyUsage, recentCalls] = await Promise.all([
      usageTracker.getMasterConfig(),
      usageTracker.getTodayUsage(),
      usageTracker.getMonthUsage(),
      usageTracker.getRecentCalls(20),
    ]);

    const response: AgentUsageResponse = {
      today: todayUsage,
      recentCalls,
      budgetStatus: {
        dailyUsed: todayUsage.estimatedCostUsd,
        dailyLimit: master.dailyBudgetUsd,
        dailyPercentage: master.dailyBudgetUsd > 0
          ? Math.round((todayUsage.estimatedCostUsd / master.dailyBudgetUsd) * 100)
          : 0,
        monthlyUsed: monthlyUsage,
        monthlyLimit: master.monthlyBudgetUsd,
        monthlyPercentage: master.monthlyBudgetUsd > 0
          ? Math.round((monthlyUsage / master.monthlyBudgetUsd) * 100)
          : 0,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[api/agentes/usage] Error:', error);
    return NextResponse.json(
      { error: 'Error al obtener métricas' },
      { status: 500 }
    );
  }
}
