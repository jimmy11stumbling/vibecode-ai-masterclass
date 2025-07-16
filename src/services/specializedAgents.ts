import { supabase } from '@/integrations/supabase/client';

// Agent interfaces and types
export interface AgentInfo {
  id: string;
  type: string;
  capabilities: string[];
  status: 'idle' | 'busy' | 'offline' | 'paused';
  maxConcurrentTasks: number;
  activeTasks: any[];
  completedTasks: number;
  failedTasks: number;
  averageExecutionTime: number;
  lastActivity: Date;
}

export interface AgentTask {
  id: string;
  type: string;
  requirements: any;
  status: 'assigned' | 'executing' | 'completed' | 'failed';
  assignedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  result?: any;
  error?: string;
}

export interface AgentMetrics {
  executionTimes: number[];
  successRate: number;
  throughput: number;
}

export class SpecializedAgentsService {
  private agents: Map<string, AgentInfo> = new Map();
  private taskQueues: Map<string, AgentTask[]> = new Map();
  private agentMetrics: Map<string, AgentMetrics> = new Map();

  constructor() {
    this.initializeAgents();
    this.startMetricsCollection();
  }

  private initializeAgents() {
    // Initialize specialized agents
    const agentConfigs = [
      {
        id: 'architect-1',
        type: 'architect',
        capabilities: ['schema-design', 'api-design', 'system-architecture'],
        status: 'idle' as const,
        maxConcurrentTasks: 3
      },
      {
        id: 'frontend-builder-1',
        type: 'frontend-builder',
        capabilities: ['react', 'typescript', 'tailwind', 'component-generation'],
        status: 'idle' as const,
        maxConcurrentTasks: 5
      },
      {
        id: 'backend-builder-1',
        type: 'backend-builder',
        capabilities: ['api-development', 'database-operations', 'authentication'],
        status: 'idle' as const,
        maxConcurrentTasks: 4
      }
    ];

    agentConfigs.forEach(config => {
      this.agents.set(config.id, {
        ...config,
        activeTasks: [],
        completedTasks: 0,
        failedTasks: 0,
        averageExecutionTime: 0,
        lastActivity: new Date()
      });
      
      this.taskQueues.set(config.id, []);
    });
  }

  async assignTask(agentType: string, task: any): Promise<string> {
    const availableAgent = this.findAvailableAgent(agentType);
    
    if (!availableAgent) {
      throw new Error(`No available agent of type ${agentType}`);
    }

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const taskWithId: AgentTask = { 
      ...task, 
      id: taskId, 
      assignedAt: new Date(), 
      status: 'assigned' 
    };
    
    availableAgent.activeTasks.push(taskWithId);
    availableAgent.status = 'busy';
    availableAgent.lastActivity = new Date();
    
    // Start task execution
    this.executeTask(availableAgent.id, taskWithId);
    
    return taskId;
  }

  private findAvailableAgent(agentType: string): AgentInfo | null {
    for (const [id, agent] of this.agents) {
      if (agent.type === agentType && 
          agent.status === 'idle' && 
          agent.activeTasks.length < agent.maxConcurrentTasks) {
        return agent;
      }
    }

    // If no idle agents, find the least busy one
    let leastBusyAgent: AgentInfo | null = null;
    let minTasks = Infinity;

    for (const [id, agent] of this.agents) {
      if (agent.type === agentType && 
          agent.activeTasks.length < agent.maxConcurrentTasks &&
          agent.activeTasks.length < minTasks) {
        leastBusyAgent = agent;
        minTasks = agent.activeTasks.length;
      }
    }

    return leastBusyAgent;
  }

  private async executeTask(agentId: string, task: AgentTask) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    const startTime = Date.now();
    task.status = 'executing';
    task.startedAt = new Date();

    try {
      let result;
      
      switch (agent.type) {
        case 'architect':
          result = await this.executeArchitectTask(task);
          break;
        case 'frontend-builder':
          result = await this.executeFrontendTask(task);
          break;
        case 'backend-builder':
          result = await this.executeBackendTask(task);
          break;
        default:
          throw new Error(`Unknown agent type: ${agent.type}`);
      }

      // Task completed successfully
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = result;
      
      agent.completedTasks++;
      
      const executionTime = Date.now() - startTime;
      this.updateAgentMetrics(agentId, executionTime, true);
      
    } catch (error) {
      // Task failed
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      task.completedAt = new Date();
      
      agent.failedTasks++;
      this.updateAgentMetrics(agentId, Date.now() - startTime, false);
    }

    // Remove task from active tasks
    agent.activeTasks = agent.activeTasks.filter(t => t.id !== task.id);
    
    // Update agent status
    if (agent.activeTasks.length === 0) {
      agent.status = 'idle';
    }
    
    // Process next task in queue if any
    const queue = this.taskQueues.get(agentId);
    if (queue && queue.length > 0) {
      const nextTask = queue.shift()!;
      agent.activeTasks.push(nextTask);
      this.executeTask(agentId, nextTask);
    }
  }

  private async executeArchitectTask(task: AgentTask) {
    // Simulate architecture design work
    await this.simulateWork(2000, 5000);
    
    return {
      type: 'architecture',
      fileStructure: this.generateFileStructure(task.requirements),
      databaseSchema: this.generateDatabaseSchema(task.requirements),
      apiEndpoints: this.generateAPIEndpoints(task.requirements),
      componentHierarchy: this.generateComponentHierarchy(task.requirements)
    };
  }

  private async executeFrontendTask(task: AgentTask) {
    // Simulate frontend development work
    await this.simulateWork(3000, 8000);
    
    return {
      type: 'frontend',
      components: this.generateReactComponents(task.requirements),
      styles: this.generateStyles(task.requirements),
      tests: this.generateTests(task.requirements)
    };
  }

  private async executeBackendTask(task: AgentTask) {
    // Simulate backend development work
    await this.simulateWork(2500, 7000);
    
    return {
      type: 'backend',
      apiRoutes: this.generateAPIRoutes(task.requirements),
      databaseOperations: this.generateDatabaseOperations(task.requirements),
      middleware: this.generateMiddleware(task.requirements)
    };
  }

  private async simulateWork(minTime: number, maxTime: number) {
    const workTime = Math.random() * (maxTime - minTime) + minTime;
    await new Promise(resolve => setTimeout(resolve, workTime));
  }

  private updateAgentMetrics(agentId: string, executionTime: number, success: boolean) {
    const agent = this.agents.get(agentId);
    if (!agent) return;

    // Update average execution time
    const totalTasks = agent.completedTasks + agent.failedTasks;
    if (totalTasks > 0) {
      agent.averageExecutionTime = 
        (agent.averageExecutionTime * (totalTasks - 1) + executionTime) / totalTasks;
    } else {
      agent.averageExecutionTime = executionTime;
    }

    // Store metrics for monitoring
    const metrics = this.agentMetrics.get(agentId) || {
      executionTimes: [],
      successRate: 0,
      throughput: 0
    };

    metrics.executionTimes.push(executionTime);
    
    // Keep only last 100 execution times
    if (metrics.executionTimes.length > 100) {
      metrics.executionTimes = metrics.executionTimes.slice(-100);
    }

    metrics.successRate = agent.completedTasks / (agent.completedTasks + agent.failedTasks);
    metrics.throughput = agent.completedTasks; // Tasks per session

    this.agentMetrics.set(agentId, metrics);
  }

  private generateFileStructure(requirements: any) {
    return {
      src: {
        components: [],
        pages: [],
        hooks: [],
        services: [],
        utils: []
      }
    };
  }

  private generateDatabaseSchema(requirements: any) {
    return {
      tables: [],
      relationships: [],
      indexes: []
    };
  }

  private generateAPIEndpoints(requirements: any) {
    return [
      { path: '/api/users', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
      { path: '/api/auth', methods: ['POST'] }
    ];
  }

  private generateComponentHierarchy(requirements: any) {
    return {
      App: {
        children: ['Router', 'Header', 'Main', 'Footer']
      }
    };
  }

  private generateReactComponents(requirements: any) {
    return [
      {
        name: 'UserForm',
        type: 'functional',
        props: ['onSubmit', 'initialValues'],
        hooks: ['useState', 'useEffect']
      }
    ];
  }

  private generateStyles(requirements: any) {
    return {
      global: 'tailwind base styles',
      components: []
    };
  }

  private generateTests(requirements: any) {
    return [
      {
        file: 'UserForm.test.tsx',
        tests: ['renders correctly', 'handles form submission']
      }
    ];
  }

  private generateAPIRoutes(requirements: any) {
    return [
      {
        method: 'POST',
        path: '/api/users',
        handler: 'createUser',
        middleware: ['auth', 'validation']
      }
    ];
  }

  private generateDatabaseOperations(requirements: any) {
    return [
      {
        operation: 'create',
        table: 'users',
        fields: ['email', 'password', 'name']
      }
    ];
  }

  private generateMiddleware(requirements: any) {
    return [
      { name: 'auth', type: 'authentication' },
      { name: 'cors', type: 'security' }
    ];
  }

  private startMetricsCollection() {
    setInterval(() => {
      this.collectSystemMetrics();
    }, 10000); // Collect metrics every 10 seconds
  }

  private collectSystemMetrics() {
    const systemMetrics = {
      timestamp: new Date(),
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'busy').length,
      totalTasksCompleted: Array.from(this.agents.values()).reduce((sum, a) => sum + a.completedTasks, 0),
      totalTasksFailed: Array.from(this.agents.values()).reduce((sum, a) => sum + a.failedTasks, 0),
      averageResponseTime: this.calculateAverageResponseTime()
    };

    console.log('System Metrics:', systemMetrics);
  }

  private calculateAverageResponseTime(): number {
    const allExecutionTimes: number[] = [];
    
    for (const metrics of this.agentMetrics.values()) {
      allExecutionTimes.push(...metrics.executionTimes);
    }

    if (allExecutionTimes.length === 0) return 0;
    
    const totalTime = allExecutionTimes.reduce((sum: number, time: number) => {
      // Ensure time is a number
      const numericTime = typeof time === 'number' ? time : 0;
      return sum + numericTime;
    }, 0);
    
    return totalTime / allExecutionTimes.length;
  }

  // Public API methods
  public getAgentStatus(agentId: string): AgentInfo | undefined {
    return this.agents.get(agentId);
  }

  public getAllAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  public getAgentMetrics(agentId: string): AgentMetrics | undefined {
    return this.agentMetrics.get(agentId);
  }

  public getSystemOverview() {
    return {
      totalAgents: this.agents.size,
      activeAgents: Array.from(this.agents.values()).filter(a => a.status === 'busy').length,
      idleAgents: Array.from(this.agents.values()).filter(a => a.status === 'idle').length,
      totalCompletedTasks: Array.from(this.agents.values()).reduce((sum, a) => sum + a.completedTasks, 0),
      totalFailedTasks: Array.from(this.agents.values()).reduce((sum, a) => sum + a.failedTasks, 0),
      averageResponseTime: this.calculateAverageResponseTime()
    };
  }

  public async pauseAgent(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = 'paused';
    }
  }

  public async resumeAgent(agentId: string) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = agent.activeTasks.length > 0 ? 'busy' : 'idle';
    }
  }

  public async scaleAgent(agentType: string, count: number) {
    for (let i = 0; i < count; i++) {
      const newAgentId = `${agentType}-${Date.now()}-${i}`;
      const newAgent: AgentInfo = {
        id: newAgentId,
        type: agentType,
        capabilities: this.getCapabilitiesForType(agentType),
        status: 'idle',
        maxConcurrentTasks: 3,
        activeTasks: [],
        completedTasks: 0,
        failedTasks: 0,
        averageExecutionTime: 0,
        lastActivity: new Date()
      };
      
      this.agents.set(newAgentId, newAgent);
      this.taskQueues.set(newAgentId, []);
    }
  }

  private getCapabilitiesForType(agentType: string): string[] {
    const capabilityMap: Record<string, string[]> = {
      'architect': ['schema-design', 'api-design', 'system-architecture'],
      'frontend-builder': ['react', 'typescript', 'tailwind', 'component-generation'],
      'backend-builder': ['api-development', 'database-operations', 'authentication']
    };
    
    return capabilityMap[agentType] || [];
  }
}

export const specializedAgents = new SpecializedAgentsService();
