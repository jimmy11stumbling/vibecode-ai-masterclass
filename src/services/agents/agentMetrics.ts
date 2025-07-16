
import { supabase } from '@/integrations/supabase/client';

export interface AgentMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  avgExecutionTime: number;
  totalTasksCompleted: number;
  successRate: number;
  averageTaskDuration: number;
  currentStats: {
    activeAgents: number;
    queuedTasks: number;
  };
  agentUtilization: number;
}

export class AgentMetricsService {
  async calculateMetrics(activeExecutions: any[], agents: any[]): Promise<AgentMetrics> {
    const completedTasks = activeExecutions.filter(e => e.status === 'completed').length;
    const failedTasks = activeExecutions.filter(e => e.status === 'failed').length;
    const totalTasks = activeExecutions.length;
    
    return {
      totalTasks,
      completedTasks,
      failedTasks,
      avgExecutionTime: 5000,
      totalTasksCompleted: completedTasks,
      successRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      averageTaskDuration: 5000,
      currentStats: {
        activeAgents: agents.filter(agent => agent.status === 'active').length,
        queuedTasks: activeExecutions.filter(e => e.status === 'running').length
      },
      agentUtilization: agents.length > 0 ? (agents.filter(agent => agent.status === 'busy').length / agents.length) * 100 : 0
    };
  }
}
