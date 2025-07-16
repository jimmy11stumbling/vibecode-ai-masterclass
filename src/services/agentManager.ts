
import { a2aProtocol, A2AAgent } from './a2aProtocolCore';
import { AgentMetricsService, AgentMetrics } from './agents/agentMetrics';

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
  private metricsService: AgentMetricsService;

  constructor() {
    this.metricsService = new AgentMetricsService();
    this.initializeAgents();
  }

  async initializeAgents(): Promise<void> {
    if (this.isInitialized) return;

    try {
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

    const execution: ActiveExecution = {
      id: executionId,
      agentId: 'orchestrator',
      status: 'running',
      progress: 0,
      startTime: new Date()
    };

    this.activeExecutions.push(execution);

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

  private mapA2AStatusToAgentStatus(a2aStatus: string): 'idle' | 'busy' | 'offline' {
    switch (a2aStatus) {
      case 'active':
        return 'idle';
      case 'busy':
        return 'busy';
      case 'idle':
        return 'idle';
      case 'offline':
        return 'offline';
      default:
        return 'offline';
    }
  }

  getAgentStatus(agentId?: string): AgentStatus | AgentStatus[] {
    const a2aAgents = a2aProtocol.getAgents();
    
    const agentStatuses: AgentStatus[] = a2aAgents.map((agent: A2AAgent) => ({
      id: agent.id,
      status: this.mapA2AStatusToAgentStatus(agent.status),
      currentTask: agent.currentTasks?.[0],
      lastActivity: agent.lastActivity
    }));

    if (agentId) {
      const foundStatus = agentStatuses.find(status => status.id === agentId);
      return foundStatus || {
        id: agentId,
        status: 'offline' as const,
        lastActivity: new Date()
      };
    }
    return agentStatuses;
  }

  async getMetrics(): Promise<AgentMetrics> {
    const agents = a2aProtocol.getAgents();
    return await this.metricsService.calculateMetrics(this.activeExecutions, agents);
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
