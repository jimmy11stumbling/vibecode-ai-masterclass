
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { deepSeekReasoner } from './deepSeekReasonerCore';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';
import { ragDatabase } from './ragDatabaseCore';

export interface SovereignTask {
  id: string;
  type: 'analysis' | 'design' | 'development' | 'testing' | 'deployment';
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedAgent?: string;
  dependencies: string[];
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSpec {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  features: string[];
  architecture: any;
  requirements: string[];
  timeline: string;
  metadata: any;
}

export interface ExecutionContext {
  id: string;
  projectSpec: ProjectSpec;
  tasks: SovereignTask[];
  status: 'initializing' | 'planning' | 'executing' | 'completed' | 'failed';
  progress: number;
  startTime: Date;
  endTime?: Date;
}

export class SovereignOrchestrator {
  private contexts = new Map<string, ExecutionContext>();
  private apiKey: string | null = null;

  setApiKey(key: string) {
    this.apiKey = key;
    deepSeekReasoner.setApiKey(key);
  }

  async processUserRequest(userPrompt: string): Promise<string> {
    const executionId = uuidv4();
    console.log(`🎯 Sovereign Orchestrator: Processing request - ${executionId}`);

    try {
      // Enhance context with RAG
      const ragContext = await ragDatabase.query({
        query: userPrompt,
        limit: 10,
        threshold: 0.7
      });

      // Generate project specification using DeepSeek
      const projectSpec = await this.generateProjectSpecification(userPrompt, ragContext.contextSummary);
      
      // Create execution context
      const context: ExecutionContext = {
        id: executionId,
        projectSpec,
        tasks: [],
        status: 'initializing',
        progress: 0,
        startTime: new Date()
      };

      this.contexts.set(executionId, context);

      // Decompose into tasks
      const tasks = await this.decomposeIntoTasks(projectSpec);
      context.tasks = tasks;
      context.status = 'planning';

      // Start execution
      this.executeTasksPipeline(executionId);

      return executionId;

    } catch (error) {
      console.error('Sovereign Orchestrator failed:', error);
      throw error;
    }
  }

  getTasks(): SovereignTask[] {
    const allTasks: SovereignTask[] = [];
    this.contexts.forEach(context => {
      allTasks.push(...context.tasks);
    });
    return allTasks;
  }

  getActiveProjects(): ProjectSpec[] {
    return Array.from(this.contexts.values())
      .filter(context => context.status !== 'completed' && context.status !== 'failed')
      .map(context => context.projectSpec);
  }

  getTask(taskId: string): SovereignTask | undefined {
    for (const context of this.contexts.values()) {
      const task = context.tasks.find(t => t.id === taskId);
      if (task) return task;
    }
    return undefined;
  }

  private async generateProjectSpecification(userPrompt: string, ragContext: string): Promise<ProjectSpec> {
    const prompt = `
Based on the user request and available context, generate a comprehensive project specification.

User Request: ${userPrompt}

Context from Knowledge Base: ${ragContext}

Provide a detailed project specification including:
1. Project name and description
2. Recommended technology stack
3. Core features and requirements
4. System architecture overview
5. Development timeline estimate

Respond with a structured JSON format.
`;

    const response = await deepSeekReasoner.processRequest(prompt, [], 'project_analysis');
    
    // Parse the response and create ProjectSpec
    const projectId = uuidv4();
    
    return {
      id: projectId,
      name: `Generated Project ${projectId.slice(0, 8)}`,
      description: userPrompt,
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase'],
      features: this.extractFeatures(userPrompt),
      architecture: { type: 'full-stack', pattern: 'MVC' },
      requirements: [userPrompt],
      timeline: '2-4 weeks',
      metadata: { generatedAt: new Date().toISOString(), source: 'user_prompt' }
    };
  }

  private extractFeatures(userPrompt: string): string[] {
    const features = [];
    
    if (userPrompt.toLowerCase().includes('auth')) features.push('Authentication');
    if (userPrompt.toLowerCase().includes('database')) features.push('Database Integration');
    if (userPrompt.toLowerCase().includes('api')) features.push('API Integration');
    if (userPrompt.toLowerCase().includes('dashboard')) features.push('Dashboard');
    if (userPrompt.toLowerCase().includes('mobile')) features.push('Mobile Responsive');
    if (userPrompt.toLowerCase().includes('chat')) features.push('Real-time Chat');
    if (userPrompt.toLowerCase().includes('payment')) features.push('Payment Processing');
    
    return features.length > 0 ? features : ['Core Functionality', 'User Interface'];
  }

  private async decomposeIntoTasks(projectSpec: ProjectSpec): Promise<SovereignTask[]> {
    const tasks: SovereignTask[] = [];

    // Analysis phase
    tasks.push({
      id: uuidv4(),
      type: 'analysis',
      description: 'Analyze project requirements and create detailed specifications',
      status: 'pending',
      priority: 'high',
      dependencies: [],
      metadata: { phase: 'analysis' },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Design phase
    tasks.push({
      id: uuidv4(),
      type: 'design',
      description: 'Create system architecture and database design',
      status: 'pending',
      priority: 'high',
      dependencies: [],
      metadata: { phase: 'design' },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Development tasks for each feature
    projectSpec.features.forEach(feature => {
      tasks.push({
        id: uuidv4(),
        type: 'development',
        description: `Implement ${feature}`,
        status: 'pending',
        priority: 'medium',
        dependencies: [],
        metadata: { feature, phase: 'development' },
        createdAt: new Date(),
        updatedAt: new Date()
      });
    });

    // Testing phase
    tasks.push({
      id: uuidv4(),
      type: 'testing',
      description: 'Comprehensive testing and quality assurance',
      status: 'pending',
      priority: 'medium',
      dependencies: [],
      metadata: { phase: 'testing' },
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return tasks;
  }

  private async executeTasksPipeline(executionId: string) {
    const context = this.contexts.get(executionId);
    if (!context) return;

    context.status = 'executing';

    try {
      // Simulate task execution
      for (const task of context.tasks) {
        task.status = 'in_progress';
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        task.status = 'completed';
        task.updatedAt = new Date();
        
        context.progress = (context.tasks.filter(t => t.status === 'completed').length / context.tasks.length) * 100;
      }

      context.status = 'completed';
      context.endTime = new Date();

      // Save to database
      await this.saveProjectSpecification(context.projectSpec);

    } catch (error) {
      context.status = 'failed';
      console.error('Task execution failed:', error);
    }
  }

  private async saveProjectSpecification(spec: ProjectSpec): Promise<void> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) return;

      await supabase
        .from('saved_project_specs')
        .insert({
          name: spec.name,
          description: spec.description,
          spec_data: spec as any,
          user_id: user.data.user.id
        });

    } catch (error) {
      console.error('Failed to save project specification:', error);
    }
  }

  getExecutionContext(executionId: string): ExecutionContext | undefined {
    return this.contexts.get(executionId);
  }

  getAllContexts(): ExecutionContext[] {
    return Array.from(this.contexts.values());
  }

  clearContext(executionId: string): boolean {
    return this.contexts.delete(executionId);
  }

  getSystemStatus() {
    return {
      activeContexts: this.contexts.size,
      totalTasks: this.getTasks().length,
      completedTasks: this.getTasks().filter(t => t.status === 'completed').length,
      failedTasks: this.getTasks().filter(t => t.status === 'failed').length
    };
  }
}

export const sovereignOrchestrator = new SovereignOrchestrator();
