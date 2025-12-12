/**
 * API: Uso y Métricas de Agentes
 * ===============================
 * GET: Obtener métricas de uso
 */

import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { usageTracker } from '@/lib/agents/usage-tracker';
import { DEFAULT_MASTER_CONFIG } from '@/lib/agents/config';
import type { AgentUsageResponse, DailyUsage } from '@/types/agents';

// ============================================
// GET - Obtener métricas de uso
// ============================================

export async function GET() {
  const auth = await requireAdmin();
  if (auth) return auth;

  try {
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
    
    // Devolver datos vacíos por defecto
    const emptyUsage: DailyUsage = {
      date: new Date().toISOString().split('T')[0],
      totalCalls: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      estimatedCostUsd: 0,
      byAgent: {
        detection: { calls: 0, tokens: 0, costUsd: 0 },
        monitoring: { calls: 0, tokens: 0, costUsd: 0 },
        legislation: { calls: 0, tokens: 0, costUsd: 0 },
        judicial_cases: { calls: 0, tokens: 0, costUsd: 0 },
        criteria: { calls: 0, tokens: 0, costUsd: 0 },
      },
      byModel: {} as Record<string, { calls: number; tokens: number; costUsd: number }>,
    };

    const response: AgentUsageResponse = {
      today: emptyUsage,
      recentCalls: [],
      budgetStatus: {
        dailyUsed: 0,
        dailyLimit: DEFAULT_MASTER_CONFIG.dailyBudgetUsd,
        dailyPercentage: 0,
        monthlyUsed: 0,
        monthlyLimit: DEFAULT_MASTER_CONFIG.monthlyBudgetUsd,
        monthlyPercentage: 0,
      },
    };

    return NextResponse.json(response);
  }
}
