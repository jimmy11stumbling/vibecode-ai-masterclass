
import { CoordinationMetrics } from './coordinationTypes';
import { a2aProtocol } from '../a2aProtocolCore';

export class MetricsCalculator {
  private coordinationEvents: any[] = [];

  calculateSystemMetrics(
    activeSessions: number,
    activeWorkflows: number,
    coordinationEvents: number
  ): CoordinationMetrics {
    return {
      active_sessions: activeSessions,
      active_workflows: activeWorkflows,
      coordination_events: coordinationEvents,
      average_response_time: this.calculateAverageResponseTime(),
      system_load: this.calculateSystemLoad()
    };
  }

  private calculateAverageResponseTime(): number {
    // Calculate based on recent coordination events
    const recentEvents = this.coordinationEvents.slice(-100);
    if (recentEvents.length < 2) return 0;

    const intervals = [];
    for (let i = 1; i < recentEvents.length; i++) {
      const interval = recentEvents[i].timestamp.getTime() - recentEvents[i-1].timestamp.getTime();
      intervals.push(interval);
    }

    return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
  }

  private calculateSystemLoad(): number {
    const agents = a2aProtocol.getAllAgents();
    const busyAgents = agents.filter(agent => agent.status === 'busy').length;
    return agents.length > 0 ? (busyAgents / agents.length) * 100 : 0;
  }

  getAgentWorkload(agentId: string, workflowCoordinations: Map<string, any>): number {
    let totalTasks = 0;
    for (const coordination of workflowCoordinations.values()) {
      const agentTasks = coordination.agent_assignments.get(agentId) || [];
      totalTasks += agentTasks.length;
    }
    return totalTasks;
  }
}
