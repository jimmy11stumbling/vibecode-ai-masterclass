
import { TaskDelegationStrategy, AgentCapability } from './types';
import { BaseAgent } from '../specializedAgents';

export class DelegationManager {
  private delegationStrategies: Map<string, TaskDelegationStrategy> = new Map();
  private performanceMetrics: Map<string, any> = new Map();
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.initializeDelegationStrategies();
  }

  private initializeDelegationStrategies() {
    this.delegationStrategies.set('capability_based', {
      strategy_name: 'Capability-Based Assignment',
      criteria: {
        primary_match: 'exact_capability',
        secondary_match: 'related_capability',
        workload_consideration: true,
        performance_weighting: 0.3
      },
      fallback_agents: ['orchestrator', 'architect'],
      optimization_rules: ['minimize_handoffs', 'balance_workload', 'respect_dependencies']
    });

    this.delegationStrategies.set('performance_optimized', {
      strategy_name: 'Performance-Optimized Assignment',
      criteria: {
        success_rate_threshold: 0.85,
        avg_time_weight: 0.4,
        current_load_weight: 0.3,
        specialization_weight: 0.3
      },
      fallback_agents: ['optimizer', 'validator'],
      optimization_rules: ['fastest_completion', 'highest_success_rate', 'minimal_dependencies']
    });

    console.log('📋 Delegation strategies initialized');
  }

  async findOptimalAgent(taskDefinition: any) {
    const strategy = this.delegationStrategies.get('capability_based');
    if (!strategy) return null;

    const suitableAgents = Array.from(this.agents.values()).filter(agent => {
      return this.agentHasCapability(agent, taskDefinition.type);
    });

    if (suitableAgents.length === 0) return null;

    const rankedAgents = suitableAgents.map(agent => {
      const metrics = this.performanceMetrics.get(agent.id) || {};
      const score = this.calculateAgentScore(agent, taskDefinition, metrics);
      return { agent, score };
    }).sort((a, b) => b.score - a.score);

    return rankedAgents[0]?.agent;
  }

  private agentHasCapability(agent: any, taskType: string): boolean {
    const capabilityMapping = {
      architecture: ['system_architecture', 'database_design', 'api_contracts'],
      frontend: ['react_development', 'ui_implementation', 'component_creation'],
      backend: ['api_development', 'database_operations', 'server_logic'],
      integration: ['api_integration', 'service_integration', 'external_apis'],
      validation: ['code_validation', 'testing', 'quality_assurance']
    };

    const requiredCapabilities = capabilityMapping[taskType] || [];
    return requiredCapabilities.some(capability => 
      agent.capabilities?.includes(capability)
    );
  }

  private calculateAgentScore(agent: any, taskDefinition: any, metrics: any): number {
    let score = 0;

    score += this.agentHasCapability(agent, taskDefinition.type) ? 50 : 0;
    score += (metrics.success_rate || 0) * 30;
    score += Math.max(0, 20 - (metrics.current_load || 0)) * 2;

    if (agent.type === taskDefinition.type) score += 20;

    return score;
  }

  updatePerformanceMetrics(agentId: string, metrics: any) {
    this.performanceMetrics.set(agentId, metrics);
  }

  getAgentPerformanceMetrics(agentId?: string) {
    if (agentId) {
      return this.performanceMetrics.get(agentId);
    }
    return Object.fromEntries(this.performanceMetrics);
  }

  getDelegationStrategies() {
    return Array.from(this.delegationStrategies.values());
  }
}
