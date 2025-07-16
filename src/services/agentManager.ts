
import { orchestrator, OrchestratorAgent } from './orchestratorAgent';
import { ArchitectAgent, BuilderAgent, ValidatorAgent, OptimizerAgent } from './specializedAgents';
import { mcpIntegration } from './mcpIntegration';
import { advancedMCPIntegration } from './advancedMCPIntegration';

export interface AgentManagerConfig {
  maxConcurrentTasks: number;
  defaultTimeout: number;
  enableLogging: boolean;
  enableMetrics: boolean;
}

export interface AgentMetrics {
  totalTasksCompleted: number;
  averageTaskDuration: number;
  successRate: number;
  agentUtilization: Record<string, number>;
}

export class AgentManager {
  private agents: Map<string, any> = new Map();
  private orchestrator: OrchestratorAgent;
  private config: AgentManagerConfig;
  private metrics: AgentMetrics;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<AgentManagerConfig> = {}) {
    this.config = {
      maxConcurrentTasks: 10,
      defaultTimeout: 300000, // 5 minutes
      enableLogging: true,
      enableMetrics: true,
      ...config
    };

    this.metrics = {
      totalTasksCompleted: 0,
      averageTaskDuration: 0,
      successRate: 0,
      agentUtilization: {}
    };

    this.orchestrator = orchestrator;
    this.initializeAgents();
    this.setupEventHandlers();
    this.startMetricsCollection();
  }

  private initializeAgents() {
    console.log('🤖 AgentManager: Initializing agent swarm...');

    // Create specialized agents
    const agents = [
      new ArchitectAgent('architect-1'),
      new ArchitectAgent('architect-2'),
      new BuilderAgent('builder-frontend-1', 'builder-frontend'),
      new BuilderAgent('builder-frontend-2', 'builder-frontend'),
      new BuilderAgent('builder-backend-1', 'builder-backend'),
      new BuilderAgent('builder-backend-2', 'builder-backend'),
      new ValidatorAgent('validator-1'),
      new ValidatorAgent('validator-2'),
      new OptimizerAgent('optimizer-1')
    ];

    agents.forEach(agent => {
      this.agents.set(agent.getInfo().id, agent);
      console.log(`✅ Initialized agent: ${agent.getInfo().id} (${agent.getInfo().type})`);
    });

    // Register agents with MCP integration
    agents.forEach(agent => {
      mcpIntegration.registerAgent({
        id: agent.getInfo().id,
        name: agent.getInfo().id,
        type: this.mapAgentTypeToMCP(agent.getInfo().type),
        status: 'active',
        capabilities: agent.getInfo().capabilities,
        config: {}
      });
    });

    console.log(`🎯 AgentManager: Initialized ${agents.length} agents successfully`);
  }

  private mapAgentTypeToMCP(agentType: string): 'conversation' | 'document' | 'rag' | 'router' {
    const typeMap: Record<string, 'conversation' | 'document' | 'rag' | 'router'> = {
      'architect': 'document',
      'builder-frontend': 'conversation',
      'builder-backend': 'conversation',
      'validator': 'document',
      'optimizer': 'rag'
    };
    return typeMap[agentType] || 'conversation';
  }

  private setupEventHandlers() {
    // Listen to orchestrator events
    this.orchestrator.addEventListener('taskCompleted', (data: any) => {
      this.handleTaskCompleted(data);
    });

    // Listen to MCP events
    mcpIntegration.addEventListener('message-processed', (data: any) => {
      this.handleMCPMessage(data);
    });

    // Setup A2A protocol handlers
    this.setupA2AHandlers();
  }

  private setupA2AHandlers() {
    // Agent-to-Agent communication handlers
    this.addEventListener('agentMessage', async (data: any) => {
      const { fromAgent, toAgent, message, taskId } = data;
      await this.routeA2AMessage(fromAgent, toAgent, message, taskId);
    });

    this.addEventListener('taskDelegation', async (data: any) => {
      const { parentTaskId, childTask, targetAgent } = data;
      await this.delegateTask(parentTaskId, childTask, targetAgent);
    });

    this.addEventListener('collaborationRequest', async (data: any) => {
      const { requestingAgent, targetAgents, task, context } = data;
      await this.facilitateCollaboration(requestingAgent, targetAgents, task, context);
    });
  }

  // Main public interface
  async processUserRequest(prompt: string, projectContext: any): Promise<string> {
    console.log('🚀 AgentManager: Processing user request:', prompt.substring(0, 100) + '...');

    try {
      // Use orchestrator to handle the request
      const executionId = await this.orchestrator.processUserPrompt(prompt, projectContext);
      
      // Setup monitoring for this execution
      this.monitorExecution(executionId);
      
      return executionId;
    } catch (error) {
      console.error('❌ AgentManager: Failed to process user request:', error);
      throw error;
    }
  }

  // Agent coordination methods
  private async routeA2AMessage(fromAgent: string, toAgent: string, message: any, taskId: string) {
    console.log(`📨 A2A: Routing message from ${fromAgent} to ${toAgent} for task ${taskId}`);

    const targetAgent = this.agents.get(toAgent);
    if (!targetAgent) {
      console.error(`❌ A2A: Target agent ${toAgent} not found`);
      return;
    }

    // Process the message based on its type
    switch (message.type) {
      case 'task-result':
        await this.handleTaskResult(fromAgent, toAgent, message.data, taskId);
        break;
      case 'collaboration-request':
        await this.handleCollaborationRequest(fromAgent, toAgent, message.data, taskId);
        break;
      case 'error-report':
        await this.handleErrorReport(fromAgent, toAgent, message.data, taskId);
        break;
      case 'status-update':
        await this.handleStatusUpdate(fromAgent, toAgent, message.data, taskId);
        break;
      default:
        console.log(`📋 A2A: Generic message from ${fromAgent} to ${toAgent}:`, message);
    }
  }

  private async handleTaskResult(fromAgent: string, toAgent: string, data: any, taskId: string) {
    console.log(`✅ A2A: Task result from ${fromAgent} to ${toAgent}:`, data);
    
    // Update task status and notify orchestrator
    this.emitEvent('taskResultReceived', {
      fromAgent,
      toAgent,
      data,
      taskId,
      timestamp: new Date()
    });
  }

  private async handleCollaborationRequest(fromAgent: string, toAgent: string, data: any, taskId: string) {
    console.log(`🤝 A2A: Collaboration request from ${fromAgent} to ${toAgent}:`, data);
    
    const targetAgent = this.agents.get(toAgent);
    if (targetAgent && targetAgent.getInfo().status === 'idle') {
      // Accept collaboration
      await this.facilitateCollaboration(fromAgent, [toAgent], data.task, data.context);
    } else {
      // Reject or defer collaboration
      await this.routeA2AMessage(toAgent, fromAgent, {
        type: 'collaboration-response',
        accepted: false,
        reason: 'Agent busy or unavailable'
      }, taskId);
    }
  }

  private async handleErrorReport(fromAgent: string, toAgent: string, data: any, taskId: string) {
    console.log(`🚨 A2A: Error report from ${fromAgent}:`, data);
    
    // Attempt error recovery
    const recoveryPlan = await this.generateErrorRecoveryPlan(data.error, taskId);
    
    if (recoveryPlan.canRecover) {
      console.log(`🔄 A2A: Attempting error recovery for task ${taskId}`);
      await this.executeRecoveryPlan(recoveryPlan, taskId);
    } else {
      console.log(`💥 A2A: Cannot recover from error in task ${taskId}`);
      this.emitEvent('taskFailed', { taskId, error: data.error, fromAgent });
    }
  }

  private async handleStatusUpdate(fromAgent: string, toAgent: string, data: any, taskId: string) {
    console.log(`📊 A2A: Status update from ${fromAgent}:`, data);
    
    // Update metrics and notify monitoring systems
    this.updateAgentMetrics(fromAgent, data);
    this.emitEvent('agentStatusUpdated', { fromAgent, data, taskId });
  }

  private async delegateTask(parentTaskId: string, childTask: any, targetAgent: string) {
    console.log(`📋 Delegating subtask from ${parentTaskId} to agent ${targetAgent}`);

    const agent = this.agents.get(targetAgent);
    if (!agent) {
      console.error(`❌ Target agent ${targetAgent} not found for delegation`);
      return;
    }

    try {
      const result = await agent.execute(childTask);
      
      // Report back to parent task
      this.emitEvent('subtaskCompleted', {
        parentTaskId,
        childTaskId: childTask.id,
        targetAgent,
        result,
        timestamp: new Date()
      });
    } catch (error) {
      console.error(`❌ Subtask delegation failed:`, error);
      this.emitEvent('subtaskFailed', {
        parentTaskId,
        childTaskId: childTask.id,
        targetAgent,
        error,
        timestamp: new Date()
      });
    }
  }

  private async facilitateCollaboration(requestingAgent: string, targetAgents: string[], task: any, context: any) {
    console.log(`🤝 Facilitating collaboration between ${requestingAgent} and [${targetAgents.join(', ')}]`);

    const collaborationId = `collab-${Date.now()}`;
    const collaborativeTask = {
      id: collaborationId,
      type: 'collaborative',
      participants: [requestingAgent, ...targetAgents],
      mainTask: task,
      context,
      status: 'active',
      createdAt: new Date()
    };

    // Create shared workspace for collaboration
    const workspace = await this.createCollaborativeWorkspace(collaborativeTask);
    
    // Notify all participants
    for (const agentId of [requestingAgent, ...targetAgents]) {
      this.emitEvent('collaborationStarted', {
        collaborationId,
        agentId,
        workspace,
        task: collaborativeTask
      });
    }

    return collaborationId;
  }

  private async createCollaborativeWorkspace(task: any) {
    return {
      id: task.id,
      sharedContext: task.context,
      sharedState: {},
      messageHistory: [],
      artifacts: [],
      participants: task.participants
    };
  }

  // Error recovery and resilience
  private async generateErrorRecoveryPlan(error: any, taskId: string) {
    const errorType = this.classifyError(error);
    
    const recoveryStrategies: Record<string, any> = {
      'timeout': {
        canRecover: true,
        strategy: 'retry',
        maxRetries: 3,
        backoffDelay: 2000
      },
      'resource_unavailable': {
        canRecover: true,
        strategy: 'reassign',
        alternativeAgents: []
      },
      'validation_error': {
        canRecover: true,
        strategy: 'fix_and_retry',
        fixActions: ['validate_input', 'sanitize_data']
      },
      'system_error': {
        canRecover: false,
        strategy: 'escalate',
        escalationLevel: 'human_intervention'
      }
    };

    return recoveryStrategies[errorType] || { canRecover: false };
  }

  private classifyError(error: any): string {
    const errorMessage = error.message?.toLowerCase() || '';
    
    if (errorMessage.includes('timeout')) return 'timeout';
    if (errorMessage.includes('unavailable') || errorMessage.includes('busy')) return 'resource_unavailable';
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) return 'validation_error';
    
    return 'system_error';
  }

  private async executeRecoveryPlan(plan: any, taskId: string) {
    switch (plan.strategy) {
      case 'retry':
        await this.retryTask(taskId, plan.maxRetries, plan.backoffDelay);
        break;
      case 'reassign':
        await this.reassignTask(taskId, plan.alternativeAgents);
        break;
      case 'fix_and_retry':
        await this.fixAndRetryTask(taskId, plan.fixActions);
        break;
      case 'escalate':
        await this.escalateTask(taskId, plan.escalationLevel);
        break;
    }
  }

  private async retryTask(taskId: string, maxRetries: number, delay: number) {
    console.log(`🔄 Retrying task ${taskId} (max ${maxRetries} retries)`);
    // Implementation for task retry logic
  }

  private async reassignTask(taskId: string, alternativeAgents: string[]) {
    console.log(`🔄 Reassigning task ${taskId} to alternative agents`);
    // Implementation for task reassignment logic
  }

  private async fixAndRetryTask(taskId: string, fixActions: string[]) {
    console.log(`🔧 Fixing and retrying task ${taskId} with actions:`, fixActions);
    // Implementation for fix and retry logic
  }

  private async escalateTask(taskId: string, escalationLevel: string) {
    console.log(`⚠️ Escalating task ${taskId} to level:`, escalationLevel);
    // Implementation for task escalation logic
  }

  // Monitoring and metrics
  private monitorExecution(executionId: string) {
    const startTime = Date.now();
    
    const checkInterval = setInterval(() => {
      const tasks = this.orchestrator.getTasks();
      const executionTasks = tasks.filter(task => task.id.includes(executionId.split('-')[1]));
      
      const completedTasks = executionTasks.filter(task => task.status === 'completed');
      const failedTasks = executionTasks.filter(task => task.status === 'failed');
      const totalTasks = executionTasks.length;
      
      if (completedTasks.length + failedTasks.length === totalTasks) {
        // Execution completed
        clearInterval(checkInterval);
        
        const duration = Date.now() - startTime;
        const success = failedTasks.length === 0;
        
        this.updateExecutionMetrics(executionId, duration, success);
        
        this.emitEvent('executionCompleted', {
          executionId,
          success,
          duration,
          completedTasks: completedTasks.length,
          failedTasks: failedTasks.length,
          totalTasks
        });
      }
    }, 1000);

    // Set timeout for execution
    setTimeout(() => {
      clearInterval(checkInterval);
      this.emitEvent('executionTimeout', { executionId });
    }, this.config.defaultTimeout);
  }

  private updateExecutionMetrics(executionId: string, duration: number, success: boolean) {
    this.metrics.totalTasksCompleted++;
    this.metrics.averageTaskDuration = (this.metrics.averageTaskDuration + duration) / 2;
    this.metrics.successRate = (this.metrics.successRate * (this.metrics.totalTasksCompleted - 1) + (success ? 1 : 0)) / this.metrics.totalTasksCompleted;
  }

  private updateAgentMetrics(agentId: string, data: any) {
    if (!this.metrics.agentUtilization[agentId]) {
      this.metrics.agentUtilization[agentId] = 0;
    }
    
    // Update utilization based on agent status
    if (data.status === 'busy') {
      this.metrics.agentUtilization[agentId]++;
    }
  }

  private startMetricsCollection() {
    if (!this.config.enableMetrics) return;

    setInterval(() => {
      const currentMetrics = this.collectCurrentMetrics();
      this.emitEvent('metricsUpdate', currentMetrics);
    }, 30000); // Every 30 seconds
  }

  private collectCurrentMetrics() {
    const agents = Array.from(this.agents.values());
    const activeAgents = agents.filter(agent => agent.getInfo().status !== 'offline');
    const busyAgents = agents.filter(agent => agent.getInfo().status === 'busy');
    
    return {
      ...this.metrics,
      currentStats: {
        totalAgents: agents.length,
        activeAgents: activeAgents.length,
        busyAgents: busyAgents.length,
        idleAgents: activeAgents.length - busyAgents.length,
        systemLoad: (busyAgents.length / activeAgents.length) * 100
      },
      timestamp: new Date()
    };
  }

  private handleTaskCompleted(data: any) {
    const { task, agent } = data;
    console.log(`✅ Task completed: ${task.id} by agent ${agent.id}`);
    
    this.updateAgentMetrics(agent.id, { status: 'completed', task: task.id });
    this.emitEvent('taskCompleted', data);
  }

  private handleMCPMessage(data: any) {
    const { message, agent } = data;
    console.log(`📨 MCP message processed:`, message);
    
    // Route MCP messages to appropriate handlers
    this.emitEvent('mcpMessageProcessed', data);
  }

  // Public API methods
  getAgentStatus(): any[] {
    return Array.from(this.agents.values()).map(agent => agent.getInfo());
  }

  getMetrics(): AgentMetrics & { currentStats: any } {
    return this.collectCurrentMetrics();
  }

  getActiveExecutions(): string[] {
    // Return list of active execution IDs
    return []; // Implementation depends on execution tracking
  }

  pauseExecution(executionId: string) {
    console.log(`⏸️ Pausing execution: ${executionId}`);
    // Implementation for pausing execution
  }

  resumeExecution(executionId: string) {
    console.log(`▶️ Resuming execution: ${executionId}`);
    // Implementation for resuming execution
  }

  cancelExecution(executionId: string) {
    console.log(`⏹️ Cancelling execution: ${executionId}`);
    // Implementation for cancelling execution
  }

  // Event system
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Global agent manager instance
export const agentManager = new AgentManager({
  maxConcurrentTasks: 15,
  defaultTimeout: 600000, // 10 minutes
  enableLogging: true,
  enableMetrics: true
});

// Initialize the agent manager
console.log('🚀 Initializing Sovereign AI Agent Manager...');
agentManager;
console.log('✅ Agent Manager initialized successfully');
