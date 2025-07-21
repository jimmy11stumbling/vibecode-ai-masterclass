
import { supabase } from '@/integrations/supabase/client';
import { DeepSeekReasonerCore, ReasoningContext } from './deepSeekReasonerCore';
import { a2aProtocol } from './a2aProtocolCore';
import { TaskManager } from './orchestrator/taskManager';
import { WorkflowExecutor } from './orchestrator/workflowExecutor';
import { DelegationManager } from './orchestrator/delegationManager';
import { WorkflowManager } from './orchestrator/workflowManager';
import { DataManager } from './orchestrator/dataManager';
import type { 
  SovereignTask, 
  ProjectSpec, 
  WorkflowExecution,
  AgentCapability,
  TaskDelegationStrategy 
} from './orchestrator/types';

// Re-export types for external use
export type { 
  SovereignTask, 
  ProjectSpec, 
  WorkflowExecution,
  AgentCapability,
  TaskDelegationStrategy 
} from './orchestrator/types';

export class SovereignOrchestrator {
  private deepSeekReasoner: DeepSeekReasonerCore;
  private taskManager: TaskManager;
  private workflowExecutor: WorkflowExecutor;
  private delegationManager: DelegationManager;
  private workflowManager: WorkflowManager;
  private dataManager: DataManager;

  constructor() {
    this.deepSeekReasoner = new DeepSeekReasonerCore('');
    this.taskManager = new TaskManager();
    this.workflowExecutor = new WorkflowExecutor(this.taskManager);
    this.delegationManager = new DelegationManager();
    this.workflowManager = new WorkflowManager();
    this.dataManager = new DataManager();
    this.initializeSystem();
  }

  private async initializeSystem() {
    console.log('🏛️ Initializing Sovereign Orchestrator System');
    
    try {
      await a2aProtocol.initialize();
      console.log('✅ A2A Protocol initialized');
      
      this.startPerformanceMonitoring();
      
      console.log('🏛️ Sovereign Orchestrator fully initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Sovereign Orchestrator:', error);
      throw error;
    }
  }

  private startPerformanceMonitoring() {
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 30000);
  }

  private async updatePerformanceMetrics() {
    const agents = a2aProtocol.getAgents();
    
    for (const agent of agents) {
      const metrics = await this.calculateAgentMetrics(agent.id);
      this.delegationManager.updatePerformanceMetrics(agent.id, metrics);
    }
  }

  private async calculateAgentMetrics(agentId: string) {
    const tasks = await this.dataManager.getAgentTasks(agentId);
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const failedTasks = tasks.filter(t => t.status === 'failed');

    return {
      total_tasks: tasks.length,
      success_rate: tasks.length > 0 ? completedTasks.length / tasks.length : 0,
      avg_execution_time: completedTasks.length > 0 
        ? completedTasks.reduce((sum, t) => sum + (t.actual_duration || 0), 0) / completedTasks.length 
        : 0,
      current_load: tasks.filter(t => t.status === 'in_progress').length,
      reliability_score: tasks.length > 0 ? (completedTasks.length / (completedTasks.length + failedTasks.length)) : 1,
      last_updated: new Date().toISOString()
    };
  }

  setApiKey(apiKey: string) {
    this.deepSeekReasoner.setApiKey(apiKey);
    console.log('🔑 DeepSeek API key configured');
  }

  async processUserRequest(userPrompt: string): Promise<string> {
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🚀 Starting autonomous processing: ${executionId}`);

    try {
      // Check if user is authenticated
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      let userId = 'anonymous';
      
      if (userError || !user) {
        console.log('🔓 Running in anonymous mode');
        this.dataManager.setAnonymousMode(true);
        userId = `anonymous_${Date.now()}`;
      } else {
        this.dataManager.setAnonymousMode(false);
        userId = user.id;
      }

      const workflowExecution: WorkflowExecution = {
        id: executionId,
        execution_id: executionId,
        workflow_definition: { type: 'autonomous_development', prompt: userPrompt },
        current_step: 0,
        total_steps: 6,
        status: 'running',
        progress: 0,
        started_at: new Date().toISOString()
      };

      this.workflowManager.setActiveExecution(executionId, workflowExecution);

      await this.workflowManager.updateWorkflowProgress(executionId, 1, 'reasoning');
      const reasoningResult = await this.performAdvancedReasoning(userPrompt, executionId);

      await this.workflowManager.updateWorkflowProgress(executionId, 2, 'specification');
      const projectSpec = await this.workflowManager.createProjectSpecification(
        executionId, 
        reasoningResult, 
        userId, 
        this.dataManager.isAnonymousMode()
      );

      await this.workflowManager.updateWorkflowProgress(executionId, 3, 'task_decomposition');
      const tasks = await this.taskManager.createAndDelegateTasks(executionId, reasoningResult, userId);

      await this.workflowManager.updateWorkflowProgress(executionId, 4, 'execution');
      await this.workflowExecutor.executeCoordinatedWorkflow(executionId, tasks);

      await this.workflowManager.updateWorkflowProgress(executionId, 5, 'validation');
      await this.performValidationAndOptimization(executionId);

      await this.workflowManager.updateWorkflowProgress(executionId, 6, 'completed');

      console.log(`✅ Autonomous processing completed: ${executionId}`);
      return executionId;

    } catch (error) {
      console.error(`❌ Processing failed for ${executionId}:`, error);
      await this.workflowManager.handleExecutionFailure(executionId, error);
      throw error;
    }
  }

  private async performAdvancedReasoning(userPrompt: string, executionId: string) {
    const reasoningContext: ReasoningContext = {
      projectId: executionId,
      userQuery: userPrompt,
      systemInstructions: `You are the Sovereign AI Orchestrator. Analyze this request and create a comprehensive development plan.`
    };

    console.log('🧠 Initiating DeepSeek advanced reasoning...');
    return await this.deepSeekReasoner.performAdvancedReasoning(reasoningContext);
  }

  private async performValidationAndOptimization(executionId: string) {
    console.log(`🔍 Performing validation and optimization for ${executionId}`);
    
    const tasks = this.taskManager.getTaskQueue(executionId);
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    const aggregatedResults = {
      architecture: completedTasks.filter(t => t.type === 'architecture').map(t => t.result),
      implementation: completedTasks.filter(t => ['frontend', 'backend'].includes(t.type)).map(t => t.result),
      integrations: completedTasks.filter(t => t.type === 'integration').map(t => t.result),
      validation: completedTasks.filter(t => t.type === 'validation').map(t => t.result)
    };

    await this.performCrossAgentValidation(aggregatedResults);
    
    console.log(`✅ Validation and optimization completed for ${executionId}`);
  }

  private async performCrossAgentValidation(results: any) {
    const validationAgents = ['validator', 'optimizer', 'architect'];
    
    for (const agentId of validationAgents) {
      await a2aProtocol.sendMessage({
        fromAgent: 'orchestrator',
        toAgent: agentId,
        type: 'coordination',
        content: {
          action: 'cross_validate',
          results: results,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  // Public API methods - delegate to appropriate managers
  async getTasks(executionId?: string): Promise<SovereignTask[]> {
    return await this.dataManager.getTasks(executionId);
  }

  async getActiveProjects(): Promise<ProjectSpec[]> {
    return await this.dataManager.getActiveProjects();
  }

  getWorkflowExecution(executionId: string): WorkflowExecution | undefined {
    return this.workflowManager.getWorkflowExecution(executionId);
  }

  getAllActiveExecutions(): WorkflowExecution[] {
    return this.workflowManager.getAllActiveExecutions();
  }

  getAgentPerformanceMetrics(agentId?: string) {
    return this.delegationManager.getAgentPerformanceMetrics(agentId);
  }

  getDelegationStrategies() {
    return this.delegationManager.getDelegationStrategies();
  }

  async pauseExecution(executionId: string): Promise<void> {
    return await this.workflowManager.pauseExecution(executionId);
  }

  async resumeExecution(executionId: string): Promise<void> {
    return await this.workflowManager.resumeExecution(executionId);
  }

  isAnonymousMode(): boolean {
    return this.dataManager.isAnonymousMode();
  }
}

export const sovereignOrchestrator = new SovereignOrchestrator();
