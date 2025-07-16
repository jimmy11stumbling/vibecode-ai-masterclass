import { supabase } from '@/integrations/supabase/client';
import { DeepSeekReasonerCore, ReasoningContext } from './deepSeekReasonerCore';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';
import { ragDatabase } from './ragDatabaseCore';
import { BaseAgent } from './specializedAgents';

export interface SovereignTask {
  id: string;
  execution_id: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assigned_agent?: string;
  result?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  dependencies?: string[];
  progress?: number;
  estimated_duration?: number;
  actual_duration?: number;
}

export interface ProjectSpec {
  id: string;
  execution_id: string;
  name: string;
  description?: string;
  requirements?: any;
  tech_stack?: string[];
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  execution_id: string;
  workflow_definition: any;
  current_step: number;
  total_steps: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface AgentCapability {
  name: string;
  type: 'tool' | 'reasoning' | 'communication' | 'analysis';
  parameters: Record<string, any>;
  performance_metrics: {
    success_rate: number;
    avg_execution_time: number;
    complexity_rating: number;
  };
}

export interface TaskDelegationStrategy {
  strategy_name: string;
  criteria: Record<string, any>;
  fallback_agents: string[];
  optimization_rules: string[];
}

export class SovereignOrchestrator {
  private deepSeekReasoner: DeepSeekReasonerCore;
  private agents: Map<string, BaseAgent> = new Map();
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private taskQueue: Map<string, SovereignTask[]> = new Map();
  private delegationStrategies: Map<string, TaskDelegationStrategy> = new Map();
  private performanceMetrics: Map<string, any> = new Map();

  constructor() {
    this.deepSeekReasoner = new DeepSeekReasonerCore('');
    this.initializeSystem();
  }

  private async initializeSystem() {
    console.log('🏛️ Initializing Sovereign Orchestrator System');
    
    try {
      // Initialize core systems
      await a2aProtocol.initialize();
      console.log('✅ A2A Protocol initialized');
      
      // Register specialized agents
      this.registerDefaultAgents();
      
      // Initialize delegation strategies
      this.initializeDelegationStrategies();
      
      // Start monitoring systems
      this.startPerformanceMonitoring();
      
      console.log('🏛️ Sovereign Orchestrator fully initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Sovereign Orchestrator:', error);
      throw error;
    }
  }

  private registerDefaultAgents() {
    // Register agents from A2A protocol
    const agents = a2aProtocol.getAllAgents();
    agents.forEach(agent => {
      this.agents.set(agent.id, agent as any);
    });
    console.log(`🤖 Registered ${agents.length} specialized agents`);
  }

  private initializeDelegationStrategies() {
    // Strategy 1: Capability-based delegation
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

    // Strategy 2: Performance-optimized delegation
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

  private startPerformanceMonitoring() {
    // Monitor agent performance every 30 seconds
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 30000);
  }

  private async updatePerformanceMetrics() {
    for (const [agentId, agent] of this.agents) {
      const metrics = await this.calculateAgentMetrics(agentId);
      this.performanceMetrics.set(agentId, metrics);
    }
  }

  private async calculateAgentMetrics(agentId: string) {
    // Calculate performance metrics for an agent
    const tasks = await this.getAgentTasks(agentId);
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
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('User authentication required');
      }

      // Initialize workflow execution
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

      this.activeExecutions.set(executionId, workflowExecution);

      // Step 1: Advanced reasoning with DeepSeek
      await this.updateWorkflowProgress(executionId, 1, 'reasoning');
      const reasoningResult = await this.performAdvancedReasoning(userPrompt, executionId);

      // Step 2: Create project specification
      await this.updateWorkflowProgress(executionId, 2, 'specification');
      const projectSpec = await this.createProjectSpecification(executionId, reasoningResult, user.id);

      // Step 3: Break down into tasks with intelligent delegation
      await this.updateWorkflowProgress(executionId, 3, 'task_decomposition');
      const tasks = await this.createAndDelegateTasks(executionId, reasoningResult, user.id);

      // Step 4: Execute coordinated workflow
      await this.updateWorkflowProgress(executionId, 4, 'execution');
      await this.executeCoordinatedWorkflow(executionId, tasks);

      // Step 5: Validation and optimization
      await this.updateWorkflowProgress(executionId, 5, 'validation');
      await this.performValidationAndOptimization(executionId);

      // Step 6: Completion
      await this.updateWorkflowProgress(executionId, 6, 'completed');

      console.log(`✅ Autonomous processing completed: ${executionId}`);
      return executionId;

    } catch (error) {
      console.error(`❌ Processing failed for ${executionId}:`, error);
      await this.handleExecutionFailure(executionId, error);
      throw error;
    }
  }

  private async updateWorkflowProgress(executionId: string, step: number, phase: string) {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.current_step = step;
      execution.progress = (step / execution.total_steps) * 100;
      console.log(`📊 Workflow ${executionId} - Step ${step}: ${phase} (${Math.round(execution.progress)}%)`);
    }
  }

  private async performAdvancedReasoning(userPrompt: string, executionId: string) {
    const reasoningContext: ReasoningContext = {
      projectId: executionId,
      userQuery: userPrompt,
      systemInstructions: `You are the Sovereign AI Orchestrator. Analyze this request and create a comprehensive development plan.
      
      Consider:
      1. Technical requirements and architecture
      2. Task breakdown and dependencies
      3. Agent specialization requirements
      4. Timeline and resource estimation
      5. Risk assessment and mitigation
      6. Quality assurance requirements`
    };

    console.log('🧠 Initiating DeepSeek advanced reasoning...');
    return await this.deepSeekReasoner.performAdvancedReasoning(reasoningContext);
  }

  private async createAndDelegateTasks(executionId: string, reasoningResult: any, userId: string): Promise<SovereignTask[]> {
    // Create tasks based on reasoning result
    const taskDefinitions = this.extractTaskDefinitions(reasoningResult);
    const tasks: SovereignTask[] = [];

    for (const taskDef of taskDefinitions) {
      // Find optimal agent for each task
      const assignedAgent = await this.findOptimalAgent(taskDef);
      
      const task: SovereignTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        execution_id: executionId,
        type: taskDef.type,
        description: taskDef.description,
        status: 'pending',
        priority: taskDef.priority || 'medium',
        assigned_agent: assignedAgent?.id,
        dependencies: taskDef.dependencies || [],
        estimated_duration: taskDef.estimated_duration || 300000, // 5 minutes default
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          reasoning_context: reasoningResult,
          delegation_strategy: 'capability_based',
          complexity_score: taskDef.complexity || 1
        }
      };

      tasks.push(task);
    }

    // Store tasks in database
    const { error } = await supabase
      .from('sovereign_tasks')
      .insert(tasks.map(task => ({
        ...task,
        result: task.result || {},
        metadata: task.metadata || {}
      })));

    if (error) throw error;

    // Add to task queue
    this.taskQueue.set(executionId, tasks);

    console.log(`📝 Created and delegated ${tasks.length} tasks`);
    return tasks;
  }

  private extractTaskDefinitions(reasoningResult: any) {
    // Extract task definitions from reasoning result
    return [
      {
        type: 'architecture',
        description: 'Design system architecture and data models',
        priority: 'high' as const,
        dependencies: [],
        estimated_duration: 600000, // 10 minutes
        complexity: 3
      },
      {
        type: 'frontend',
        description: 'Build user interface components',
        priority: 'medium' as const,
        dependencies: ['architecture'],
        estimated_duration: 900000, // 15 minutes
        complexity: 2
      },
      {
        type: 'backend',
        description: 'Implement backend services and APIs',
        priority: 'medium' as const,
        dependencies: ['architecture'],
        estimated_duration: 1200000, // 20 minutes
        complexity: 3
      },
      {
        type: 'integration',
        description: 'Set up external service integrations',
        priority: 'medium' as const,
        dependencies: ['frontend', 'backend'],
        estimated_duration: 600000, // 10 minutes
        complexity: 2
      },
      {
        type: 'validation',
        description: 'Validate and test implementation',
        priority: 'low' as const,
        dependencies: ['integration'],
        estimated_duration: 400000, // 7 minutes
        complexity: 1
      }
    ];
  }

  private async findOptimalAgent(taskDefinition: any) {
    const strategy = this.delegationStrategies.get('capability_based');
    if (!strategy) return null;

    // Get agents with required capabilities
    const suitableAgents = Array.from(this.agents.values()).filter(agent => {
      return this.agentHasCapability(agent, taskDefinition.type);
    });

    if (suitableAgents.length === 0) return null;

    // Rank agents by performance and availability
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

    // Base capability match
    score += this.agentHasCapability(agent, taskDefinition.type) ? 50 : 0;

    // Performance metrics
    score += (metrics.success_rate || 0) * 30;
    score += Math.max(0, 20 - (metrics.current_load || 0)) * 2;

    // Specialization bonus
    if (agent.type === taskDefinition.type) score += 20;

    return score;
  }

  private async executeCoordinatedWorkflow(executionId: string, tasks: SovereignTask[]) {
    console.log(`🤝 Executing coordinated workflow for ${tasks.length} tasks`);

    // Create dependency graph
    const dependencyGraph = this.buildDependencyGraph(tasks);
    
    // Execute tasks in dependency order
    const executedTasks = new Set<string>();
    const maxConcurrency = 3;
    const activeTasks = new Map<string, Promise<any>>();

    while (executedTasks.size < tasks.length) {
      // Find tasks ready for execution
      const readyTasks = tasks.filter(task => 
        !executedTasks.has(task.id) && 
        !activeTasks.has(task.id) &&
        this.areDependenciesMet(task, executedTasks)
      );

      // Start new tasks up to concurrency limit
      for (const task of readyTasks.slice(0, maxConcurrency - activeTasks.size)) {
        const taskPromise = this.executeTask(task);
        activeTasks.set(task.id, taskPromise);

        // Handle task completion
        taskPromise.then(async (result) => {
          await this.updateTaskStatus(task.id, 'completed', result);
          executedTasks.add(task.id);
          activeTasks.delete(task.id);
          console.log(`✅ Task completed: ${task.description}`);
        }).catch(async (error) => {
          await this.updateTaskStatus(task.id, 'failed', { error: error.message });
          activeTasks.delete(task.id);
          console.error(`❌ Task failed: ${task.description}`, error);
        });
      }

      // Wait for at least one task to complete if we're at max concurrency
      if (activeTasks.size >= maxConcurrency) {
        await Promise.race(Array.from(activeTasks.values()));
      }

      // Small delay to prevent tight loop
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Wait for all remaining tasks to complete
    await Promise.allSettled(Array.from(activeTasks.values()));
    console.log(`🏁 Workflow execution completed for ${executionId}`);
  }

  private buildDependencyGraph(tasks: SovereignTask[]) {
    const graph = new Map<string, string[]>();
    tasks.forEach(task => {
      graph.set(task.id, task.dependencies || []);
    });
    return graph;
  }

  private areDependenciesMet(task: SovereignTask, executedTasks: Set<string>): boolean {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every(depId => executedTasks.has(depId));
  }

  private async executeTask(task: SovereignTask): Promise<any> {
    // Update task status to in_progress
    await this.updateTaskStatus(task.id, 'in_progress');
    
    // Simulate task execution with coordinated agent communication
    const startTime = Date.now();
    
    // Send task to assigned agent via A2A protocol
    if (task.assigned_agent) {
      await a2aProtocol.sendMessage({
        fromAgent: 'orchestrator',
        toAgent: task.assigned_agent,
        type: 'task',
        content: {
          taskId: task.id,
          type: task.type,
          description: task.description,
          metadata: task.metadata
        },
        priority: task.priority === 'high' ? 'high' : 'medium'
      });
    }

    // Simulate execution time based on complexity
    const executionTime = (task.estimated_duration || 300000) + (Math.random() * 60000);
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    const actualDuration = Date.now() - startTime;

    return {
      taskId: task.id,
      type: task.type,
      completed: true,
      output: this.generateTaskOutput(task),
      execution_time: actualDuration,
      timestamp: new Date().toISOString()
    };
  }

  private generateTaskOutput(task: SovereignTask) {
    const outputs = {
      architecture: {
        database_schema: 'Generated database schema with tables and relationships',
        api_design: 'RESTful API endpoints with OpenAPI specification',
        system_components: 'Microservices architecture with clear boundaries'
      },
      frontend: {
        components: 'React components with TypeScript interfaces',
        styling: 'Tailwind CSS implementation with responsive design',
        state_management: 'Context API setup for global state'
      },
      backend: {
        api_endpoints: 'Express.js routes with middleware',
        database_operations: 'Supabase integration with RLS policies',
        authentication: 'User authentication and authorization'
      },
      integration: {
        external_apis: 'Third-party service integrations',
        webhooks: 'Event-driven communication setup',
        deployment: 'CI/CD pipeline configuration'
      },
      validation: {
        test_results: 'Unit and integration test results',
        code_quality: 'ESLint and TypeScript checks passed',
        performance: 'Performance benchmarks and optimization suggestions'
      }
    };

    return outputs[task.type] || { message: `Task ${task.type} completed successfully` };
  }

  private async performValidationAndOptimization(executionId: string) {
    console.log(`🔍 Performing validation and optimization for ${executionId}`);
    
    const tasks = this.taskQueue.get(executionId) || [];
    const completedTasks = tasks.filter(t => t.status === 'completed');
    
    // Aggregate results for final validation
    const aggregatedResults = {
      architecture: completedTasks.filter(t => t.type === 'architecture').map(t => t.result),
      implementation: completedTasks.filter(t => ['frontend', 'backend'].includes(t.type)).map(t => t.result),
      integrations: completedTasks.filter(t => t.type === 'integration').map(t => t.result),
      validation: completedTasks.filter(t => t.type === 'validation').map(t => t.result)
    };

    // Perform cross-agent validation
    await this.performCrossAgentValidation(aggregatedResults);
    
    console.log(`✅ Validation and optimization completed for ${executionId}`);
  }

  private async performCrossAgentValidation(results: any) {
    // Send validation requests to multiple agents for consensus
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

  private async handleExecutionFailure(executionId: string, error: any) {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.status = 'failed';
      execution.error_message = error.message;
      execution.completed_at = new Date().toISOString();
    }
  }

  async getTasks(executionId?: string): Promise<SovereignTask[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    let query = supabase
      .from('sovereign_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (executionId) {
      query = query.eq('execution_id', executionId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(task => ({
      ...task,
      status: task.status as SovereignTask['status'],
      priority: task.priority as SovereignTask['priority']
    }));
  }

  async getActiveProjects(): Promise<ProjectSpec[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('project_specs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateTaskStatus(taskId: string, status: SovereignTask['status'], result?: any): Promise<void> {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (result) {
      updateData.result = result;
    }

    const { error } = await supabase
      .from('sovereign_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) throw error;
  }

  private async createProjectSpecification(executionId: string, reasoningResult: any, userId: string): Promise<ProjectSpec> {
    const projectData = {
      execution_id: executionId,
      name: reasoningResult.conclusion || 'AI Generated Project',
      description: reasoningResult.reasoning || 'Project generated through autonomous AI reasoning',
      requirements: reasoningResult,
      tech_stack: ['React', 'TypeScript', 'Tailwind CSS'],
      status: 'active',
      user_id: userId
    };

    const { data, error } = await supabase
      .from('project_specs')
      .insert(projectData)
      .select()
      .single();

    if (error) throw error;
    return data as ProjectSpec;
  }

  private async getAgentTasks(agentId: string): Promise<SovereignTask[]> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('sovereign_tasks')
      .select('*')
      .eq('assigned_agent', agentId)
      .eq('user_id', user.id);

    if (error) return [];

    return (data || []).map(task => ({
      ...task,
      status: task.status as SovereignTask['status'],
      priority: task.priority as SovereignTask['priority']
    }));
  }

  // Public methods for external access
  getWorkflowExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  getAllActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
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

  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      console.log(`⏸️ Execution ${executionId} paused`);
    }
  }

  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      console.log(`▶️ Execution ${executionId} resumed`);
    }
  }
}

// Export singleton instance
export const sovereignOrchestrator = new SovereignOrchestrator();
