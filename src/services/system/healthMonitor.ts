
import { a2aProtocol } from '../a2aProtocolCore';
import { mcpHub } from '../mcpHubCore';
import { SystemMetrics } from './types';

export class HealthMonitor {
  private systemMetrics: SystemMetrics = {
    totalAgents: 0,
    activeAgents: 0,
    pendingTasks: 0,
    completedTasks: 0,
    systemUptime: 0,
    lastHealthCheck: new Date()
  };
  private startTime = Date.now();

  async startHealthMonitoring(): Promise<void> {
    try {
      // Start periodic health checks
      setInterval(async () => {
        await this.performHealthCheck();
      }, 30000); // Every 30 seconds

      // Initial health check
      await this.performHealthCheck();

      console.log('✅ Health monitoring started');
    } catch (error) {
      console.error('❌ Health monitoring failed to start:', error);
      throw error;
    }
  }

  async performHealthCheck(): Promise<void> {
    try {
      const agents = a2aProtocol.getAgents();
      const tools = mcpHub.getAllTools();

      this.systemMetrics = {
        totalAgents: agents.length,
        activeAgents: agents.filter(agent => agent.status === 'active').length,
        pendingTasks: 0, // Will be updated by task manager
        completedTasks: 0, // Will be updated by task manager
        systemUptime: Date.now() - this.startTime,
        lastHealthCheck: new Date()
      };

      console.log('🏥 System Health Check:', this.systemMetrics);
    } catch (error) {
      console.error('❌ Health check failed:', error);
    }
  }

  getMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  updateTaskMetrics(pendingTasks: number, completedTasks: number) {
    this.systemMetrics.pendingTasks = pendingTasks;
    this.systemMetrics.completedTasks = completedTasks;
  }
}
