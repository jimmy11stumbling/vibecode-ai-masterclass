
import { OrchestratorAgent } from './orchestratorAgent';
import { 
  BaseAgent, 
  ArchitectAgent, 
  BuilderAgent, 
  ValidatorAgent, 
  OptimizerAgent, 
  LibrarianAgent 
} from './specializedAgents';
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
}

interface ActiveExecution {
  id: string;
  agentId: string;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
}

type AgentType = 'architect' | 'frontend-builder' | 'backend-builder' | 'validator' | 'optimizer' | 'librarian';

class AgentManager {
  private agents: Map<AgentType, BaseAgent> = new Map();
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private activeExecutions: ActiveExecution[] = [];
  private agentStatuses: Map<string, AgentStatus> = new Map();

  constructor() {
    this.initializeAgents();
  }

  async initializeAgents(): Promise<void> {
    try {
      // Initialize specialized agents
      this.agents.set('architect', new ArchitectAgent('architect', 'Creates application architecture and design'));
      this.agents.set('frontend-builder', new BuilderAgent('frontend-builder', 'Builds frontend components and UI'));
      this.agents.set('backend-builder', new BuilderAgent('backend-builder', 'Builds backend APIs and services'));
      this.agents.set('validator', new ValidatorAgent('validator', 'Validates code quality and functionality'));
      this.agents.set('optimizer', new OptimizerAgent('optimizer', 'Optimizes code performance and structure'));
      this.agents.set('librarian', new LibrarianAgent('librarian', 'Manages knowledge base and documentation'));

      // Initialize agent statuses
      this.agents.forEach((agent, type) => {
        this.agentStatuses.set(agent.id, {
          id: agent.id,
          status: 'idle',
          lastActivity: new Date()
        });
      });

      console.log('Agent swarm initialized successfully');
    } catch (error) {
      console.error('Failed to initialize agents:', error);
      throw error;
    }
  }

  async processUserRequest(prompt: string, projectContext: ProjectContext): Promise<string> {
    const executionId = `execution_${Date.now()}`;

    // Create mock execution
    const execution: ActiveExecution = {
      id: executionId,
      agentId: 'architect',
      status: 'running',
      progress: 0,
      startTime: new Date()
    };

    this.activeExecutions.push(execution);

    // Simulate agent processing
    setTimeout(() => {
      const result: ExecutionResult = {
        success: true,
        message: 'Project updated successfully',
        details: {
          filesUpdated: ['src/App.tsx', 'src/components/Button.tsx'],
          newComponents: ['src/components/Header.tsx']
        }
      };

      // Update execution status
      execution.status = 'completed';
      execution.progress = 100;

      this.dispatchEvent('executionCompleted', { executionId, result });
    }, 5000);

    return executionId;
  }

  getAgentStatus(agentId: string): AgentStatus | null {
    return this.agentStatuses.get(agentId) || null;
  }

  getMetrics(): AgentMetrics {
    return {
      totalTasks: this.activeExecutions.length,
      completedTasks: this.activeExecutions.filter(e => e.status === 'completed').length,
      failedTasks: this.activeExecutions.filter(e => e.status === 'failed').length,
      avgExecutionTime: 5000 // Mock average
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
