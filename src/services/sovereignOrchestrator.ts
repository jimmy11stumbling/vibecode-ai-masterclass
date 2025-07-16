
import { DeepSeekReasonerCore, ReasoningContext } from './deepSeekReasonerCore';
import { a2aProtocol, A2AMessage } from './a2aProtocolCore';
import { ragDatabase, RAGQuery } from './ragDatabaseCore';
import { mcpHub } from './mcpHubCore';
import { supabase } from '@/integrations/supabase/client';

export interface SovereignTask {
  id: string;
  type: 'architecture' | 'development' | 'analysis' | 'optimization' | 'deployment';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  description: string;
  requirements: any;
  dependencies: string[];
  assignedAgent?: string;
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  estimatedDuration?: number;
  actualDuration?: number;
}

export interface ProjectSpec {
  id: string;
  name: string;
  description: string;
  requirements: string[];
  techStack: string[];
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  timeline: string;
  features: string[];
  constraints: string[];
}

export class SovereignOrchestrator {
  private reasoner: DeepSeekReasonerCore | null = null;
  private tasks = new Map<string, SovereignTask>();
  private activeProjects = new Map<string, ProjectSpec>();
  private processingQueue: string[] = [];
  private isProcessing = false;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.reasoner = new DeepSeekReasonerCore(apiKey);
    }
    this.initializeOrchestrator();
  }

  private async initializeOrchestrator() {
    console.log('👑 Sovereign Orchestrator: Initializing autonomous development system');

    // Register as master orchestrator agent
    await a2aProtocol.registerAgent({
      id: 'sovereign_orchestrator',
      name: 'Sovereign Orchestrator',
      type: 'master_coordinator',
      capabilities: [
        'project_planning',
        'task_decomposition',
        'agent_coordination',
        'quality_assurance',
        'deployment_management'
      ],
      status: 'active',
      currentTasks: []
    });

    // Set up A2A message handling
    a2aProtocol.addEventListener('message:sovereign_orchestrator', this.handleA2AMessage.bind(this));

    // Start processing loop
    this.startProcessingLoop();

    console.log('✅ Sovereign Orchestrator: System ready for autonomous operation');
  }

  async processUserRequest(userPrompt: string, context?: any): Promise<string> {
    console.log('👑 Sovereign Orchestrator: Processing user request:', userPrompt);

    try {
      // Phase 1: Deep Reasoning & Analysis
      const reasoningResult = await this.performDeepAnalysis(userPrompt, context);

      // Phase 2: Project Specification Generation
      const projectSpec = await this.generateProjectSpecification(reasoningResult, userPrompt);

      // Phase 3: Task Decomposition & Planning
      const taskPlan = await this.createTaskDecomposition(projectSpec);

      // Phase 4: Agent Assignment & Execution
      const executionId = await this.orchestrateExecution(taskPlan, projectSpec);

      // Phase 5: Monitor & Coordinate
      this.monitorExecution(executionId);

      return executionId;

    } catch (error) {
      console.error('❌ Sovereign Orchestrator: Request processing failed:', error);
      throw error;
    }
  }

  private async performDeepAnalysis(userPrompt: string, context?: any) {
    console.log('🧠 Phase 1: Deep Reasoning & Analysis');

    if (!this.reasoner) {
      throw new Error('DeepSeek Reasoner not initialized. API key required.');
    }

    // Enhance context with RAG
    const ragResults = await ragDatabase.query({
      query: userPrompt,
      limit: 10,
      threshold: 0.7
    });

    const reasoningContext: ReasoningContext = {
      projectId: `project-${Date.now()}`,
      userQuery: userPrompt,
      systemInstructions: `
You are the Sovereign AI Orchestrator analyzing a development request.
Perform comprehensive analysis considering:
1. Technical feasibility and architecture requirements
2. Resource allocation and timeline estimation
3. Risk assessment and mitigation strategies
4. Integration requirements and dependencies
5. Quality assurance and testing needs
6. Deployment and maintenance considerations

Provide structured output for autonomous development execution.
      `,
      ragContext: ragResults.documents
    };

    return await this.reasoner.performAdvancedReasoning(reasoningContext);
  }

  private async generateProjectSpecification(reasoningResult: any, userPrompt: string): Promise<ProjectSpec> {
    console.log('📋 Phase 2: Project Specification Generation');

    // Use reasoning result to create comprehensive project spec
    const spec: ProjectSpec = {
      id: `spec-${Date.now()}`,
      name: this.extractProjectName(userPrompt),
      description: userPrompt,
      requirements: this.extractRequirements(reasoningResult.reasoning),
      techStack: this.determineTechStack(reasoningResult.reasoning),
      complexity: this.assessComplexity(reasoningResult.reasoning),
      timeline: this.estimateTimeline(reasoningResult.reasoning),
      features: this.extractFeatures(reasoningResult.reasoning),
      constraints: this.identifyConstraints(reasoningResult.reasoning)
    };

    // Store specification
    await this.storeProjectSpec(spec);
    this.activeProjects.set(spec.id, spec);

    return spec;
  }

  private async createTaskDecomposition(projectSpec: ProjectSpec): Promise<SovereignTask[]> {
    console.log('📊 Phase 3: Task Decomposition & Planning');

    const tasks: SovereignTask[] = [];

    // Architecture Phase
    tasks.push({
      id: `arch-${Date.now()}`,
      type: 'architecture',
      priority: 'critical',
      status: 'pending',
      description: 'Design system architecture and data models',
      requirements: {
        projectSpec,
        deliverables: ['database_schema', 'api_contracts', 'component_architecture']
      },
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDuration: 15 * 60 * 1000 // 15 minutes
    });

    // Development Phase - Frontend
    if (projectSpec.techStack.includes('React') || projectSpec.techStack.includes('frontend')) {
      tasks.push({
        id: `dev-frontend-${Date.now()}`,
        type: 'development',
        priority: 'high',
        status: 'pending',
        description: 'Develop frontend components and user interface',
        requirements: {
          type: 'frontend',
          framework: 'React',
          features: projectSpec.features.filter(f => f.includes('UI') || f.includes('interface'))
        },
        dependencies: [tasks[0].id],
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedDuration: 30 * 60 * 1000 // 30 minutes
      });
    }

    // Development Phase - Backend
    if (projectSpec.techStack.includes('API') || projectSpec.techStack.includes('backend')) {
      tasks.push({
        id: `dev-backend-${Date.now()}`,
        type: 'development',
        priority: 'high',
        status: 'pending',
        description: 'Develop backend API and business logic',
        requirements: {
          type: 'backend',
          framework: 'Supabase',
          features: projectSpec.features.filter(f => f.includes('API') || f.includes('database'))
        },
        dependencies: [tasks[0].id],
        createdAt: new Date(),
        updatedAt: new Date(),
        estimatedDuration: 25 * 60 * 1000 // 25 minutes
      });
    }

    // Analysis & Optimization Phase
    const lastDevTask = tasks[tasks.length - 1];
    tasks.push({
      id: `analysis-${Date.now()}`,
      type: 'analysis',
      priority: 'medium',
      status: 'pending',
      description: 'Analyze code quality and performance',
      requirements: {
        analysisTypes: ['code_quality', 'performance', 'security'],
        optimizationTargets: ['bundle_size', 'load_time', 'accessibility']
      },
      dependencies: [lastDevTask.id],
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedDuration: 10 * 60 * 1000 // 10 minutes
    });

    // Store tasks
    tasks.forEach(task => {
      this.tasks.set(task.id, task);
    });

    return tasks;
  }

  private async orchestrateExecution(tasks: SovereignTask[], projectSpec: ProjectSpec): Promise<string> {
    console.log('⚡ Phase 4: Agent Assignment & Execution');

    const executionId = `exec-${Date.now()}`;

    // Create task flow with A2A protocol
    const taskPlan = tasks.map(task => ({
      taskId: task.id,
      description: task.description,
      requiredCapabilities: this.getRequiredCapabilities(task.type),
      dependencies: task.dependencies,
      priority: task.priority
    }));

    // Orchestrate through A2A protocol
    const assignments = await a2aProtocol.orchestrateTaskFlow(
      'sovereign_orchestrator',
      taskPlan
    );

    // Track assignments
    for (const [taskId, agentId] of assignments) {
      const task = this.tasks.get(taskId);
      if (task) {
        task.assignedAgent = agentId;
        task.status = 'assigned';
        task.updatedAt = new Date();
      }
    }

    // Add to processing queue
    this.processingQueue.push(executionId);

    return executionId;
  }

  private monitorExecution(executionId: string) {
    console.log('📊 Phase 5: Monitor & Coordinate');

    // Real-time monitoring will be handled by the processing loop
    // and A2A message handlers
  }

  private async handleA2AMessage(message: A2AMessage) {
    switch (message.messageType) {
      case 'response':
        await this.handleTaskResponse(message);
        break;
      case 'status':
        await this.handleStatusUpdate(message);
        break;
      case 'error':
        await this.handleTaskError(message);
        break;
    }
  }

  private async handleTaskResponse(message: A2AMessage) {
    const { taskId, result } = message.payload;
    const task = this.tasks.get(taskId);

    if (task) {
      task.status = 'completed';
      task.result = result;
      task.updatedAt = new Date();
      task.actualDuration = Date.now() - task.createdAt.getTime();

      console.log(`✅ Task completed: ${task.description} by ${message.fromAgent}`);

      // Check for dependent tasks
      await this.processDependentTasks(taskId);

      // Use MCP tools for post-processing if needed
      if (task.type === 'development') {
        await mcpHub.executeTool('code_analyze', {
          code: result.code || '',
          language: 'typescript',
          checkTypes: ['syntax', 'style']
        });
      }
    }
  }

  private async handleStatusUpdate(message: A2AMessage) {
    const { taskId, status, progress } = message.payload;
    const task = this.tasks.get(taskId);

    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      console.log(`📊 Status update: ${task.description} - ${status} (${progress || 0}%)`);
    }
  }

  private async handleTaskError(message: A2AMessage) {
    const { taskId, error } = message.payload;
    const task = this.tasks.get(taskId);

    if (task) {
      task.status = 'failed';
      task.error = error;
      task.updatedAt = new Date();

      console.error(`❌ Task failed: ${task.description} - ${error}`);

      // Attempt recovery or reassignment
      await this.attemptTaskRecovery(task);
    }
  }

  private async processDependentTasks(completedTaskId: string) {
    const dependentTasks = Array.from(this.tasks.values()).filter(task =>
      task.dependencies.includes(completedTaskId) && task.status === 'pending'
    );

    for (const task of dependentTasks) {
      const allDependenciesComplete = task.dependencies.every(depId => {
        const depTask = this.tasks.get(depId);
        return depTask?.status === 'completed';
      });

      if (allDependenciesComplete) {
        // Find and assign agent
        const capabilities = this.getRequiredCapabilities(task.type);
        const assignments = await a2aProtocol.orchestrateTaskFlow(
          'sovereign_orchestrator',
          [{
            taskId: task.id,
            description: task.description,
            requiredCapabilities: capabilities,
            dependencies: task.dependencies,
            priority: task.priority
          }]
        );

        const agentId = assignments.get(task.id);
        if (agentId) {
          task.assignedAgent = agentId;
          task.status = 'assigned';
          task.updatedAt = new Date();
        }
      }
    }
  }

  private async attemptTaskRecovery(failedTask: SovereignTask) {
    console.log(`🔄 Attempting recovery for failed task: ${failedTask.description}`);

    // Reset task status
    failedTask.status = 'pending';
    failedTask.assignedAgent = undefined;
    failedTask.error = undefined;
    failedTask.updatedAt = new Date();

    // Try to find alternative agent
    const capabilities = this.getRequiredCapabilities(failedTask.type);
    const assignments = await a2aProtocol.orchestrateTaskFlow(
      'sovereign_orchestrator',
      [{
        taskId: failedTask.id,
        description: `RETRY: ${failedTask.description}`,
        requiredCapabilities: capabilities,
        dependencies: failedTask.dependencies,
        priority: 'high' // Increase priority for retries
      }]
    );

    const newAgentId = assignments.get(failedTask.id);
    if (newAgentId) {
      failedTask.assignedAgent = newAgentId;
      failedTask.status = 'assigned';
      console.log(`✅ Task reassigned to agent: ${newAgentId}`);
    } else {
      console.error(`❌ No available agents for task recovery`);
    }
  }

  private startProcessingLoop() {
    setInterval(async () => {
      if (!this.isProcessing && this.processingQueue.length > 0) {
        this.isProcessing = true;
        await this.processQueue();
        this.isProcessing = false;
      }

      // Heartbeat to A2A protocol
      await a2aProtocol.heartbeat('sovereign_orchestrator');
    }, 5000); // Process every 5 seconds
  }

  private async processQueue() {
    // Processing logic for the queue
    // This would handle ongoing task monitoring and coordination
  }

  // Utility methods
  private extractProjectName(prompt: string): string {
    // Extract project name from prompt
    const match = prompt.match(/create(?:\s+a|\s+an)?\s+(.+?)(?:\s+app|\s+application|\s+system|$)/i);
    return match?.[1]?.trim() || 'Generated Application';
  }

  private extractRequirements(reasoning: string): string[] {
    // Extract requirements from reasoning text
    return [
      'User interface for data interaction',
      'Database storage and retrieval',
      'Real-time updates and notifications',
      'Responsive design for mobile devices',
      'Error handling and validation'
    ];
  }

  private determineTechStack(reasoning: string): string[] {
    return ['React', 'TypeScript', 'Supabase', 'Tailwind CSS'];
  }

  private assessComplexity(reasoning: string): ProjectSpec['complexity'] {
    // Analyze reasoning to determine complexity
    return 'moderate';
  }

  private estimateTimeline(reasoning: string): string {
    return '2-4 hours for full implementation';
  }

  private extractFeatures(reasoning: string): string[] {
    return [
      'User authentication',
      'Data management',
      'Real-time updates',
      'Responsive UI',
      'Search and filtering'
    ];
  }

  private identifyConstraints(reasoning: string): string[] {
    return [
      'Browser compatibility',
      'Mobile responsiveness',
      'Performance optimization',
      'Security requirements'
    ];
  }

  private getRequiredCapabilities(taskType: SovereignTask['type']): string[] {
    const capabilityMap = {
      'architecture': ['system_design', 'database_design', 'api_design'],
      'development': ['code_generation', 'frontend_development', 'backend_development'],
      'analysis': ['code_analysis', 'performance_testing', 'security_analysis'],
      'optimization': ['code_optimization', 'performance_tuning'],
      'deployment': ['deployment_management', 'infrastructure_management']
    };

    return capabilityMap[taskType] || [];
  }

  private async storeProjectSpec(spec: ProjectSpec) {
    try {
      const { error } = await supabase
        .from('saved_project_specs')
        .insert({
          name: spec.name,
          description: spec.description,
          spec_data: spec,
          user_id: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store project spec:', error);
    }
  }

  // Public API methods
  getTasks(): SovereignTask[] {
    return Array.from(this.tasks.values());
  }

  getTaskById(id: string): SovereignTask | undefined {
    return this.tasks.get(id);
  }

  getActiveProjects(): ProjectSpec[] {
    return Array.from(this.activeProjects.values());
  }

  async getProjectProgress(projectId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    progress: number;
    estimatedCompletion: Date;
  }> {
    const projectTasks = Array.from(this.tasks.values()).filter(task =>
      task.requirements?.projectSpec?.id === projectId
    );

    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.status === 'completed').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const remainingDuration = projectTasks
      .filter(task => task.status !== 'completed')
      .reduce((sum, task) => sum + (task.estimatedDuration || 0), 0);

    const estimatedCompletion = new Date(Date.now() + remainingDuration);

    return {
      totalTasks,
      completedTasks,
      progress,
      estimatedCompletion
    };
  }

  setApiKey(apiKey: string) {
    this.reasoner = new DeepSeekReasonerCore(apiKey);
    console.log('🔑 Sovereign Orchestrator: DeepSeek API key configured');
  }
}

export const sovereignOrchestrator = new SovereignOrchestrator();
