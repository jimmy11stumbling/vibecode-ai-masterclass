
import { a2aProtocol, A2AAgent } from './a2aProtocolCore';
import { advancedMCPIntegration } from './advancedMCPIntegration';

interface ProjectContext {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  files: { path: string; content: string; type: 'file' | 'folder' }[];
}

interface ExecutionResult {
  success: boolean;
  message: string;
  details?: any;
}

interface AgentStatus {
  id: string;
  status: 'idle' | 'busy' | 'offline';
  currentTask?: string;
  lastActivity: Date;
}

interface AgentMetrics {
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

interface ActiveExecution {
  id: string;
  agentId: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
}

class AgentManager {
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private activeExecutions: ActiveExecution[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeAgents();
  }

  async initializeAgents(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize A2A protocol first (this will register all agents)
      await a2aProtocol.initialize();
      
      this.isInitialized = true;
      console.log('Agent Manager initialized - using A2A protocol agents');
    } catch (error) {
      console.error('Failed to initialize agents:', error);
      throw error;
    }
  }

  async processUserRequest(prompt: string, projectContext: ProjectContext): Promise<string> {
    const executionId = `execution_${Date.now()}`;

    // Create execution
    const execution: ActiveExecution = {
      id: executionId,
      agentId: 'orchestrator',
      status: 'running',
      progress: 0,
      startTime: new Date()
    };

    this.activeExecutions.push(execution);

    // Simulate agent processing via A2A protocol
    setTimeout(() => {
      const result: ExecutionResult = {
        success: true,
        message: 'Project updated successfully',
        details: {
          filesUpdated: ['src/App.tsx', 'src/components/Button.tsx'],
          newComponents: ['src/components/Header.tsx']
        }
      };

      execution.status = 'completed';
      execution.progress = 100;

      this.dispatchEvent('executionCompleted', { executionId, result });
    }, 5000);

    return executionId;
  }

  getAgentStatus(agentId?: string): AgentStatus | AgentStatus[] {
    // Get agents from A2A protocol instead of maintaining our own
    const a2aAgents = a2aProtocol.getAgents();
    
    const agentStatuses = a2aAgents.map((agent: A2AAgent) => ({
      id: agent.id,
      status: agent.status === 'active' ? 'idle' : agent.status === 'busy' ? 'busy' : 'offline',
      lastActivity: agent.lastActivity
    }));

    if (agentId) {
      return agentStatuses.find(status => status.id === agentId) || null;
    }
    return agentStatuses;
  }

  getMetrics(): AgentMetrics {
    const agents = a2aProtocol.getAgents();
    const completedTasks = this.activeExecutions.filter(e => e.status === 'completed').length;
    const failedTasks = this.activeExecutions.filter(e => e.status === 'failed').length;
    const totalTasks = this.activeExecutions.length;
    
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
        queuedTasks: this.activeExecutions.filter(e => e.status === 'running').length
      },
      agentUtilization: agents.length > 0 ? (agents.filter(agent => agent.status === 'busy').length / agents.length) * 100 : 0
    };
  }

  getActiveExecutions(): ActiveExecution[] {
    return this.activeExecutions.filter(e => e.status === 'running' || e.status === 'paused');
  }

  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.find(e => e.id === executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      console.log(`Execution ${executionId} paused`);
    }
  }

  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.find(e => e.id === executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      console.log(`Execution ${executionId} resumed`);
    }
  }

  async cancelExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.find(e => e.id === executionId);
    if (execution) {
      execution.status = 'failed';
      console.log(`Execution ${executionId} cancelled`);
    }
  }

  addEventListener(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(listener);
  }

  removeEventListener(event: string, listener: (data: any) => void): void {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      if (listeners) {
        this.eventListeners.set(event, listeners.filter(l => l !== listener));
      }
    }
  }

  private dispatchEvent(event: string, data: any): void {
    this.eventListeners.get(event)?.forEach(listener => listener(data));
  }
}

export const agentManager = new AgentManager();
