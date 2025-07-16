import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  type: 'architecture' | 'build-frontend' | 'build-backend' | 'validate' | 'optimize';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  assignedAgent?: string;
  requirements: any;
  dependencies: string[];
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectContext {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  files: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  database?: {
    schema: any;
    migrations: string[];
  };
}

interface AgentInfo {
  id: string;
  type: string;
  status: 'idle' | 'busy' | 'offline';
  capabilities: string[];
}

export class OrchestratorAgent {
  private tasks: Map<string, Task> = new Map();
  private agents: Map<string, AgentInfo> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeAgents();
    this.startTaskProcessor();
  }

  private initializeAgents() {
    const agentTypes = [
      { id: 'architect-1', type: 'architect', status: 'idle' as const, capabilities: ['schema-design', 'file-structure', 'api-contracts'] },
      { id: 'builder-frontend-1', type: 'builder-frontend', status: 'idle' as const, capabilities: ['react', 'typescript', 'tailwind'] },
      { id: 'builder-backend-1', type: 'builder-backend', status: 'idle' as const, capabilities: ['api', 'database', 'authentication'] },
      { id: 'validator-1', type: 'validator', status: 'idle' as const, capabilities: ['linting', 'type-checking', 'testing'] },
      { id: 'optimizer-1', type: 'optimizer', status: 'idle' as const, capabilities: ['performance', 'security', 'refactoring'] }
    ];

    agentTypes.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  async processUserPrompt(prompt: string, projectContext: ProjectContext): Promise<string> {
    console.log('🧠 Orchestrator: Processing user prompt:', prompt);
    
    // Step 1: Analyze prompt using DeepSeek reasoning
    const analysis = await this.analyzePrompt(prompt, projectContext);
    
    // Step 2: Create task decomposition
    const taskPlan = this.createTaskPlan(analysis);
    
    // Step 3: Execute tasks with agent coordination
    const executionId = await this.executeTaskPlan(taskPlan, projectContext);
    
    return executionId;
  }

  private cleanDocument(content: string): string {
    return content
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-_.]/g, '')
      .trim();
  }

  private async analyzePrompt(prompt: string, context: ProjectContext) {
    // Use DeepSeek reasoning to understand requirements
    const analysis = {
      intent: this.extractIntent(prompt),
      components: this.identifyComponents(prompt),
      dependencies: this.identifyDependencies(prompt),
      complexity: this.assessComplexity(prompt),
      techStack: this.suggestTechStack(prompt, context)
    };
    
    console.log('🔍 Analysis result:', analysis);
    return analysis;
  }

  private createTaskPlan(analysis: any): Task[] {
    const tasks: Task[] = [];
    
    // Always start with architecture if creating new components
    if (analysis.components.length > 0) {
      tasks.push({
        id: `arch-${Date.now()}`,
        type: 'architecture',
        priority: 'high',
        status: 'pending',
        requirements: {
          components: analysis.components,
          techStack: analysis.techStack
        },
        dependencies: [],
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Add build tasks based on components
    analysis.components.forEach((component: any, index: number) => {
      if (component.type === 'frontend') {
        tasks.push({
          id: `build-fe-${Date.now()}-${index}`,
          type: 'build-frontend',
          priority: 'medium',
          status: 'pending',
          requirements: component,
          dependencies: tasks.length > 0 ? [tasks[0].id] : [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      } else if (component.type === 'backend') {
        tasks.push({
          id: `build-be-${Date.now()}-${index}`,
          type: 'build-backend',
          priority: 'medium',
          status: 'pending',
          requirements: component,
          dependencies: tasks.length > 0 ? [tasks[0].id] : [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });

    // Add validation task
    tasks.push({
      id: `validate-${Date.now()}`,
      type: 'validate',
      priority: 'high',
      status: 'pending',
      requirements: { validateAll: true },
      dependencies: tasks.filter(t => t.type.startsWith('build')).map(t => t.id),
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return tasks;
  }

  private async executeTaskPlan(tasks: Task[], context: ProjectContext): Promise<string> {
    const executionId = `exec-${Date.now()}`;
    
    // Store tasks
    tasks.forEach(task => this.tasks.set(task.id, task));
    
    // Start execution
    this.processTaskQueue();
    
    return executionId;
  }

  private async processTaskQueue() {
    const readyTasks = Array.from(this.tasks.values())
      .filter(task => task.status === 'pending' && this.areDependenciesMet(task));

    for (const task of readyTasks) {
      const agent = this.findAvailableAgent(task.type);
      if (agent) {
        await this.assignTaskToAgent(task, agent);
      }
    }
  }

  private areDependenciesMet(task: Task): boolean {
    return task.dependencies.every(depId => {
      const depTask = this.tasks.get(depId);
      return depTask?.status === 'completed';
    });
  }

  private findAvailableAgent(taskType: string): AgentInfo | null {
    for (const [id, agent] of this.agents) {
      if (agent.status === 'idle' && this.canHandleTaskType(agent, taskType)) {
        return agent;
      }
    }
    return null;
  }

  private canHandleTaskType(agent: AgentInfo, taskType: string): boolean {
    const typeMap: Record<string, string[]> = {
      'architecture': ['architect'],
      'build-frontend': ['builder-frontend'],
      'build-backend': ['builder-backend'],
      'validate': ['validator'],
      'optimize': ['optimizer']
    };
    
    return typeMap[taskType]?.includes(agent.type) || false;
  }

  private async assignTaskToAgent(task: Task, agent: AgentInfo) {
    console.log(`📋 Assigning task ${task.id} to agent ${agent.id}`);
    
    task.status = 'assigned';
    task.assignedAgent = agent.id;
    agent.status = 'busy';
    
    // Simulate agent work
    setTimeout(async () => {
      await this.simulateAgentWork(task, agent);
    }, 1000 + Math.random() * 3000);
  }

  private async simulateAgentWork(task: Task, agent: AgentInfo) {
    console.log(`🔨 Agent ${agent.id} working on task ${task.id}`);
    
    task.status = 'in-progress';
    
    // Simulate work based on task type
    const result = await this.executeTaskByType(task);
    
    if (result.success) {
      task.status = 'completed';
      task.result = result.data;
      console.log(`✅ Task ${task.id} completed by agent ${agent.id}`);
    } else {
      task.status = 'failed';
      task.error = result.error;
      console.log(`❌ Task ${task.id} failed: ${result.error}`);
    }
    
    agent.status = 'idle';
    task.updatedAt = new Date();
    
    // Continue processing queue
    setTimeout(() => this.processTaskQueue(), 500);
    
    // Emit events
    this.emitEvent('taskCompleted', { task, agent });
  }

  private async executeTaskByType(task: Task): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      switch (task.type) {
        case 'architecture':
          return await this.executeArchitectureTask(task);
        case 'build-frontend':
          return await this.executeFrontendBuildTask(task);
        case 'build-backend':
          return await this.executeBackendBuildTask(task);
        case 'validate':
          return await this.executeValidationTask(task);
        case 'optimize':
          return await this.executeOptimizationTask(task);
        default:
          return { success: false, error: 'Unknown task type' };
      }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Helper methods for code generation
  private generateFileStructure(components: any[]) {
    return components.map(comp => ({
      path: `src/components/${comp.name}`,
      type: 'directory',
      files: [
        `${comp.name}.tsx`,
        `${comp.name}.test.tsx`,
        `${comp.name}.stories.tsx`
      ]
    }));
  }

  private generateDatabaseSchema(components: any[]) {
    return components
      .filter(comp => comp.requiresDatabase)
      .map(comp => ({
        table: comp.name.toLowerCase(),
        columns: comp.fields || []
      }));
  }

  private generateAPIContracts(components: any[]) {
    return components
      .filter(comp => comp.requiresAPI)
      .map(comp => ({
        endpoint: `/api/${comp.name.toLowerCase()}`,
        methods: comp.apiMethods || ['GET', 'POST']
      }));
  }

  private generateComponentSpecs(components: any[]) {
    return components.map(comp => ({
      name: comp.name,
      props: comp.props || [],
      state: comp.state || [],
      methods: comp.methods || []
    }));
  }

  private generateReactComponent(component: any): string {
    return `import React from 'react';

interface ${component.name}Props {
  // Add props here
}

export const ${component.name}: React.FC<${component.name}Props> = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">${component.name}</h1>
      <p>Generated component for ${component.description || 'functionality'}</p>
    </div>
  );
};

export default ${component.name};`;
  }

  private generateComponentStyles(component: any): string {
    return `.${component.name.toLowerCase()} {
  /* Component-specific styles */
}`;
  }

  private generateAPIEndpoint(component: any): string {
    return `import { supabase } from '@/integrations/supabase/client';

export async function handle${component.name}Request(req: Request) {
  try {
    // Implementation for ${component.name} API
    const result = await supabase
      .from('${component.name.toLowerCase()}')
      .select('*');
    
    return new Response(JSON.stringify(result.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}`;
  }

  private generateDatabaseQueries(component: any) {
    return [
      `SELECT * FROM ${component.name.toLowerCase()};`,
      `INSERT INTO ${component.name.toLowerCase()} DEFAULT VALUES;`,
      `UPDATE ${component.name.toLowerCase()} SET updated_at = NOW();`,
      `DELETE FROM ${component.name.toLowerCase()} WHERE id = $1;`
    ];
  }

  // Intent extraction methods
  private extractIntent(prompt: string): string {
    const lowerPrompt = prompt.toLowerCase();
    if (lowerPrompt.includes('create') || lowerPrompt.includes('build') || lowerPrompt.includes('add')) {
      return 'create';
    } else if (lowerPrompt.includes('update') || lowerPrompt.includes('modify') || lowerPrompt.includes('change')) {
      return 'update';
    } else if (lowerPrompt.includes('delete') || lowerPrompt.includes('remove')) {
      return 'delete';
    }
    return 'analyze';
  }

  private identifyComponents(prompt: string) {
    const components = [];
    const lowerPrompt = prompt.toLowerCase();
    
    // Common UI components
    if (lowerPrompt.includes('login') || lowerPrompt.includes('signin')) {
      components.push({
        name: 'LoginForm',
        type: 'frontend',
        description: 'User login functionality',
        requiresDatabase: true,
        requiresAPI: true,
        fields: ['email', 'password']
      });
    }
    
    if (lowerPrompt.includes('dashboard')) {
      components.push({
        name: 'Dashboard',
        type: 'frontend',
        description: 'Main dashboard interface',
        requiresDatabase: true,
        requiresAPI: true
      });
    }
    
    if (lowerPrompt.includes('api') || lowerPrompt.includes('endpoint')) {
      components.push({
        name: 'APIEndpoint',
        type: 'backend',
        description: 'REST API endpoint',
        requiresDatabase: true
      });
    }
    
    return components;
  }

  private identifyDependencies(prompt: string): string[] {
    const dependencies = [];
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('database') || lowerPrompt.includes('table')) {
      dependencies.push('database');
    }
    if (lowerPrompt.includes('auth') || lowerPrompt.includes('login')) {
      dependencies.push('authentication');
    }
    if (lowerPrompt.includes('api')) {
      dependencies.push('api');
    }
    
    return dependencies;
  }

  private assessComplexity(prompt: string): 'low' | 'medium' | 'high' {
    const complexityIndicators = [
      'database', 'authentication', 'api', 'integration', 'real-time',
      'complex', 'multiple', 'advanced', 'enterprise'
    ];
    
    const matches = complexityIndicators.filter(indicator => 
      prompt.toLowerCase().includes(indicator)
    );
    
    if (matches.length >= 4) return 'high';
    if (matches.length >= 2) return 'medium';
    return 'low';
  }

  private suggestTechStack(prompt: string, context: ProjectContext): string[] {
    const suggested = [...context.techStack];
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('react') && !suggested.includes('react')) {
      suggested.push('react');
    }
    if (lowerPrompt.includes('typescript') && !suggested.includes('typescript')) {
      suggested.push('typescript');
    }
    if (lowerPrompt.includes('database') && !suggested.includes('supabase')) {
      suggested.push('supabase');
    }
    
    return suggested;
  }

  private async executeArchitectureTask(task: Task) {
    const { components, techStack } = task.requirements;
    
    const architecture = {
      fileStructure: this.generateFileStructure(components),
      databaseSchema: this.generateDatabaseSchema(components),
      apiContracts: this.generateAPIContracts(components),
      componentSpecs: this.generateComponentSpecs(components)
    };
    
    return { success: true, data: architecture };
  }

  private async executeFrontendBuildTask(task: Task) {
    const component = task.requirements;
    
    const code = this.generateReactComponent(component);
    const styles = this.generateComponentStyles(component);
    
    return {
      success: true,
      data: {
        files: [
          {
            path: `src/components/${component.name}.tsx`,
            content: code,
            type: 'typescript'
          },
          {
            path: `src/styles/${component.name}.css`,
            content: styles,
            type: 'css'
          }
        ]
      }
    };
  }

  private async executeBackendBuildTask(task: Task) {
    const component = task.requirements;
    
    const apiCode = this.generateAPIEndpoint(component);
    const dbQueries = this.generateDatabaseQueries(component);
    
    return {
      success: true,
      data: {
        files: [
          {
            path: `src/api/${component.name}.ts`,
            content: apiCode,
            type: 'typescript'
          }
        ],
        queries: dbQueries
      }
    };
  }

  private async executeValidationTask(task: Task) {
    // Simulate validation checks
    const validationResults = {
      linting: { passed: true, issues: [] },
      typeChecking: { passed: true, errors: [] },
      testing: { passed: true, failures: [] },
      buildCheck: { passed: true, errors: [] }
    };
    
    return { success: true, data: validationResults };
  }

  private async executeOptimizationTask(task: Task) {
    const optimizations = {
      performanceImprovements: [],
      securityFixes: [],
      codeRefactoring: []
    };
    
    return { success: true, data: optimizations };
  }

  private startTaskProcessor() {
    setInterval(() => {
      this.processTaskQueue();
    }, 2000);
  }

  // Event system
  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emitEvent(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Public API methods
  getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  getAgents(): AgentInfo[] {
    return Array.from(this.agents.values());
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  pauseTask(id: string) {
    const task = this.tasks.get(id);
    if (task && task.status === 'in-progress') {
      task.status = 'pending';
      const agent = this.agents.get(task.assignedAgent!);
      if (agent) {
        agent.status = 'idle';
      }
    }
  }

  cancelTask(id: string) {
    const task = this.tasks.get(id);
    if (task) {
      task.status = 'failed';
      task.error = 'Cancelled by user';
      const agent = this.agents.get(task.assignedAgent!);
      if (agent) {
        agent.status = 'idle';
      }
    }
  }

  // Add missing task execution methods
}

// Global orchestrator instance
export const orchestrator = new OrchestratorAgent();
