/**
 * Tracker de Uso de Agentes
 * ==========================
 * Gestiona el almacenamiento y consulta de:
 * - Logs de llamadas a la API
 * - Uso diario agregado
 * - Configuración del sistema
 */

import { getAdminDb } from '@/lib/firebase-admin';
import type { 
  ApiCallLog, 
  DailyUsage, 
  MasterConfig, 
  AgentConfig,
  AgentType,
  ClaudeModel 
} from '@/types/agents';
import { DEFAULT_MASTER_CONFIG, DEFAULT_AGENT_CONFIGS } from './config';

// ============================================
// COLECCIONES DE FIRESTORE
// ============================================

const COLLECTIONS = {
  apiCalls: 'agent_api_calls',       // Logs individuales de llamadas
  dailyUsage: 'agent_daily_usage',   // Uso agregado por día
  masterConfig: 'agent_config',       // Configuración maestra
  agentConfigs: 'agent_configs',      // Configuración por agente
  queue: 'agent_queue',               // Cola de revisión
};

// ============================================
// LOGGING DE LLAMADAS
// ============================================

class UsageTracker {
  private get db() {
    return getAdminDb();
  }

  /**
   * Registra una llamada a la API
   */
  async logApiCall(log: ApiCallLog): Promise<void> {
    try {
      // Guardar log individual
      await this.db.collection(COLLECTIONS.apiCalls).doc(log.id).set(log);

      // Actualizar uso diario
      await this.updateDailyUsage(log);
    } catch (error) {
      console.error('[usage-tracker] Error logging API call:', error);
      throw error;
    }
  }

  /**
   * Actualiza el uso diario agregado
   */
  private async updateDailyUsage(log: ApiCallLog): Promise<void> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const docRef = this.db.collection(COLLECTIONS.dailyUsage).doc(today);

    await this.db.runTransaction(async (transaction) => {
      const doc = await transaction.get(docRef);
      
      if (!doc.exists) {
        // Crear documento del día
        const newUsage: DailyUsage = {
          date: today,
          totalCalls: 1,
          totalInputTokens: log.usage.inputTokens,
          totalOutputTokens: log.usage.outputTokens,
          totalTokens: log.usage.totalTokens,
          estimatedCostUsd: log.estimatedCostUsd,
          byAgent: {
            detection: { calls: 0, tokens: 0, costUsd: 0 },
            monitoring: { calls: 0, tokens: 0, costUsd: 0 },
            legislation: { calls: 0, tokens: 0, costUsd: 0 },
            judicial_cases: { calls: 0, tokens: 0, costUsd: 0 },
            criteria: { calls: 0, tokens: 0, costUsd: 0 },
          },
          byModel: {} as Record<ClaudeModel, { calls: number; tokens: number; costUsd: number }>,
        };

        // Agregar al agente correspondiente
        newUsage.byAgent[log.agentType] = {
          calls: 1,
          tokens: log.usage.totalTokens,
          costUsd: log.estimatedCostUsd,
        };

        // Agregar al modelo correspondiente
        newUsage.byModel[log.model] = {
          calls: 1,
          tokens: log.usage.totalTokens,
          costUsd: log.estimatedCostUsd,
        };

        transaction.set(docRef, newUsage);
      } else {
        // Actualizar documento existente
        const data = doc.data() as DailyUsage;
        
        const updates: Partial<DailyUsage> = {
          totalCalls: data.totalCalls + 1,
          totalInputTokens: data.totalInputTokens + log.usage.inputTokens,
          totalOutputTokens: data.totalOutputTokens + log.usage.outputTokens,
          totalTokens: data.totalTokens + log.usage.totalTokens,
          estimatedCostUsd: data.estimatedCostUsd + log.estimatedCostUsd,
        };

        // Actualizar por agente
        const agentData = data.byAgent[log.agentType] || { calls: 0, tokens: 0, costUsd: 0 };
        const byAgent = {
          ...data.byAgent,
          [log.agentType]: {
            calls: agentData.calls + 1,
            tokens: agentData.tokens + log.usage.totalTokens,
            costUsd: agentData.costUsd + log.estimatedCostUsd,
          },
        };

        // Actualizar por modelo
        const modelData = data.byModel[log.model] || { calls: 0, tokens: 0, costUsd: 0 };
        const byModel = {
          ...data.byModel,
          [log.model]: {
            calls: modelData.calls + 1,
            tokens: modelData.tokens + log.usage.totalTokens,
            costUsd: modelData.costUsd + log.estimatedCostUsd,
          },
        };

        transaction.update(docRef, {
          ...updates,
          byAgent,
          byModel,
        });
      }
    });
  }

  // ============================================
  // CONSULTAS
  // ============================================

  /**
   * Obtiene el uso del día actual
   */
  async getTodayUsage(): Promise<DailyUsage> {
    const today = new Date().toISOString().split('T')[0];
    const doc = await this.db.collection(COLLECTIONS.dailyUsage).doc(today).get();

    if (!doc.exists) {
      return this.getEmptyDailyUsage(today);
    }

    return doc.data() as DailyUsage;
  }

  /**
   * Obtiene el uso del mes actual
   */
  async getMonthUsage(): Promise<number> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    
    const docs = await this.db
      .collection(COLLECTIONS.dailyUsage)
      .where('date', '>=', startOfMonth)
      .get();

    let totalCost = 0;
    docs.forEach((doc) => {
      const data = doc.data() as DailyUsage;
      totalCost += data.estimatedCostUsd;
    });

    return totalCost;
  }

  /**
   * Obtiene las últimas N llamadas
   */
  async getRecentCalls(limit: number = 20): Promise<ApiCallLog[]> {
    const docs = await this.db
      .collection(COLLECTIONS.apiCalls)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return docs.docs.map((doc) => doc.data() as ApiCallLog);
  }

  /**
   * Obtiene llamadas por agente
   */
  async getCallsByAgent(
    agentType: AgentType,
    limit: number = 10
  ): Promise<ApiCallLog[]> {
    const docs = await this.db
      .collection(COLLECTIONS.apiCalls)
      .where('agentType', '==', agentType)
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return docs.docs.map((doc) => doc.data() as ApiCallLog);
  }

  // ============================================
  // CONFIGURACIÓN
  // ============================================

  /**
   * Obtiene la configuración maestra
   */
  async getMasterConfig(): Promise<MasterConfig> {
    const doc = await this.db
      .collection(COLLECTIONS.masterConfig)
      .doc('master')
      .get();

    if (!doc.exists) {
      // Crear con defaults
      await this.updateMasterConfig(DEFAULT_MASTER_CONFIG);
      return DEFAULT_MASTER_CONFIG;
    }

    return doc.data() as MasterConfig;
  }

  /**
   * Actualiza la configuración maestra
   */
  async updateMasterConfig(
    config: Partial<MasterConfig>,
    updatedBy: string = 'system'
  ): Promise<MasterConfig> {
    const docRef = this.db
      .collection(COLLECTIONS.masterConfig)
      .doc('master');

    const doc = await docRef.get();
    const current = doc.exists
      ? (doc.data() as MasterConfig)
      : DEFAULT_MASTER_CONFIG;

    const updated: MasterConfig = {
      ...current,
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy,
    };

    await docRef.set(updated);

    return updated;
  }

  /**
   * Obtiene configuración de todos los agentes
   */
  async getAgentConfigs(): Promise<AgentConfig[]> {
    const docs = await this.db.collection(COLLECTIONS.agentConfigs).get();

    if (docs.empty) {
      // Inicializar con defaults
      await this.initializeAgentConfigs();
      return DEFAULT_AGENT_CONFIGS;
    }

    return docs.docs.map((doc) => doc.data() as AgentConfig);
  }

  /**
   * Actualiza configuración de un agente
   */
  async updateAgentConfig(
    agentType: AgentType,
    config: Partial<AgentConfig>
  ): Promise<AgentConfig> {
    const docRef = this.db.collection(COLLECTIONS.agentConfigs).doc(agentType);
    const doc = await docRef.get();

    const current = doc.exists
      ? (doc.data() as AgentConfig)
      : DEFAULT_AGENT_CONFIGS.find((a) => a.id === agentType)!;

    const updated: AgentConfig = {
      ...current,
      ...config,
    };

    await docRef.set(updated);
    return updated;
  }

  /**
   * Inicializa configuración de agentes
   */
  private async initializeAgentConfigs(): Promise<void> {
    const batch = this.db.batch();

    for (const config of DEFAULT_AGENT_CONFIGS) {
      const docRef = this.db.collection(COLLECTIONS.agentConfigs).doc(config.id);
      batch.set(docRef, config);
    }

    await batch.commit();
  }

  // ============================================
  // HELPERS
  // ============================================

  private getEmptyDailyUsage(date: string): DailyUsage {
    return {
      date,
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
      byModel: {} as Record<ClaudeModel, { calls: number; tokens: number; costUsd: number }>,
    };
  }

  /**
   * Verifica si se puede ejecutar según presupuesto
   */
  async canExecute(): Promise<{ allowed: boolean; reason?: string }> {
    const [master, todayUsage, monthlyUsage] = await Promise.all([
      this.getMasterConfig(),
      this.getTodayUsage(),
      this.getMonthUsage(),
    ]);

    if (!master.enabled) {
      return { allowed: false, reason: 'Sistema deshabilitado' };
    }

    if (todayUsage.estimatedCostUsd >= master.dailyBudgetUsd) {
      return { 
        allowed: false, 
        reason: `Presupuesto diario excedido ($${todayUsage.estimatedCostUsd.toFixed(2)} / $${master.dailyBudgetUsd})` 
      };
    }

    if (monthlyUsage >= master.monthlyBudgetUsd) {
      return { 
        allowed: false, 
        reason: `Presupuesto mensual excedido ($${monthlyUsage.toFixed(2)} / $${master.monthlyBudgetUsd})` 
      };
    }

    return { allowed: true };
  }
}

// Singleton
export const usageTracker = new UsageTracker();
