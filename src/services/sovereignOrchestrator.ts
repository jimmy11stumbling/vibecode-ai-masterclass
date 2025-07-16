
import { supabase } from '@/integrations/supabase/client';
import { createDeepSeekReasonerCore, DeepSeekReasonerCore } from './deepSeekReasonerCore';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';
import { ragDatabase } from './ragDatabaseCore';

export interface SovereignTask {
  id: string;
  type: 'architecture' | 'frontend' | 'backend' | 'integration' | 'validation' | 'deployment';
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';
  priority: 'high' | 'medium' | 'low';
  assignedAgent?: string;
  dependencies: string[];
  result?: any;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
}

export interface ProjectSpec {
  id: string;
  name: string;  
  description: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  techStack: string[];
  requirements: any;
  architecture?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskUpdate {
  taskId: string;
  status: SovereignTask['status'];
  progress?: number;
  result?: any;
  error?: string;
  startedAt?: Date;
}

export class SovereignOrchestrator {
  private deepSeekReasoner: DeepSeekReasonerCore | null = null;
  private tasks: Map<string, SovereignTask> = new Map();
  private projects: Map<string, ProjectSpec> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeSystem();
  }

  private async initializeSystem() {
    console.log('🚀 Sovereign Orchestrator: Initializing system');
    
    // Initialize DeepSeek reasoner if API key is available
    const apiKey = localStorage.getItem('deepseek_api_key');
    if (apiKey) {
      this.deepSeekReasoner = createDeepSeekReasonerCore(apiKey);
    }
  }

  setApiKey(apiKey: string) {
    localStorage.setItem('deepseek_api_key', apiKey);
    this.deepSeekReasoner = createDeepSeekReasonerCore(apiKey);
  }

  async processUserRequest(userPrompt: string): Promise<string> {
    console.log('🧠 Sovereign Orchestrator: Processing user request:', userPrompt);
    
    if (!this.deepSeekReasoner) {
      throw new Error('DeepSeek API key not configured');
    }

    // Create execution ID
    const executionId = `exec-${Date.now()}`;
    
    // Step 1: Use DeepSeek reasoning to analyze the request
    const reasoning = await this.deepSeekReasoner.generateResponse(
      `Analyze this request and create a project plan: ${userPrompt}`,
      { projectId: executionId }
    );

    // Step 2: Create project specification
    const projectSpec: ProjectSpec = {
      id: executionId,
      name: this.extractProjectName(userPrompt),
      description: userPrompt,
      status: 'planning',
      techStack: this.suggestTechStack(userPrompt),
      requirements: reasoning,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.projects.set(executionId, projectSpec);

    // Step 3: Generate task breakdown
    const tasks = this.generateTaskBreakdown(reasoning, projectSpec);
    
    // Store tasks
    tasks.forEach(task => this.tasks.set(task.id, task));

    // Step 4: Start autonomous execution
    this.startAutonomousExecution(executionId);

    return executionId;
  }

  private extractProjectName(prompt: string): string {
    // Simple extraction - could be enhanced with AI
    const words = prompt.split(' ').slice(0, 4);
    return words.join(' ').replace(/[^a-zA-Z0-9\s]/g, '').trim() || 'Generated Project';
  }

  private suggestTechStack(prompt: string): string[] {
    const stack = ['React', 'TypeScript', 'Tailwind CSS'];
    
    if (prompt.toLowerCase().includes('database') || prompt.toLowerCase().includes('data')) {
      stack.push('Supabase');
    }
    if (prompt.toLowerCase().includes('auth') || prompt.toLowerCase().includes('login')) {
      stack.push('Authentication');
    }
    if (prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('chat')) {
      stack.push('AI Integration');
    }
    
    return stack;
  }

  private generateTaskBreakdown(reasoning: any, project: ProjectSpec): SovereignTask[] {
    const tasks: SovereignTask[] = [];
    const baseId = project.id;

    // Architecture task
    tasks.push({
      id: `${baseId}-arch`,
      type: 'architecture',
      description: 'Design system architecture and data flow',
      status: 'pending',
      priority: 'high',
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Frontend task
    tasks.push({
      id: `${baseId}-frontend`,
      type: 'frontend',
      description: 'Build user interface components',
      status: 'pending',
      priority: 'medium',
      dependencies: [`${baseId}-arch`],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Backend task
    tasks.push({
      id: `${baseId}-backend`,
      type: 'backend',
      description: 'Implement server-side logic and APIs',
      status: 'pending',
      priority: 'medium',
      dependencies: [`${baseId}-arch`],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Integration task
    tasks.push({
      id: `${baseId}-integration`,
      type: 'integration',
      description: 'Connect frontend and backend systems',
      status: 'pending',
      priority: 'medium',
      dependencies: [`${baseId}-frontend`, `${baseId}-backend`],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Validation task
    tasks.push({
      id: `${baseId}-validation`,
      type: 'validation',
      description: 'Test and validate application functionality',
      status: 'pending',
      priority: 'high',
      dependencies: [`${baseId}-integration`],
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return tasks;
  }

  private async startAutonomousExecution(executionId: string) {
    console.log('🤖 Starting autonomous execution for:', executionId);
    
    // Simulate autonomous task processing
    setTimeout(() => {
      this.processNextReadyTask(executionId);
    }, 1000);
  }

  private async processNextReadyTask(executionId: string) {
    const projectTasks = Array.from(this.tasks.values())
      .filter(task => task.id.startsWith(executionId));
    
    const readyTask = projectTasks.find(task => 
      task.status === 'pending' && 
      task.dependencies.every(depId => {
        const depTask = this.tasks.get(depId);
        return depTask?.status === 'completed';
      })
    );

    if (readyTask) {
      await this.executeTask(readyTask);
      
      // Continue with next task
      setTimeout(() => {
        this.processNextReadyTask(executionId);
      }, 2000);
    }
  }

  private async executeTask(task: SovereignTask) {
    console.log('🔨 Executing task:', task.id);
    
    // Update task status
    task.status = 'assigned';
    task.assignedAgent = `Agent-${task.type}`;
    task.startedAt = new Date();
    task.updatedAt = new Date();

    // Simulate agent assignment and processing
    setTimeout(async () => {
      task.status = 'in_progress';
      task.updatedAt = new Date();

      // Simulate work completion
      setTimeout(async () => {
        try {
          // Use DeepSeek for task-specific reasoning if available
          if (this.deepSeekReasoner) {
            const taskReasoning = await this.deepSeekReasoner.generateResponse(
              `Execute ${task.type} task: ${task.description}`,
              { projectId: task.id }
            );
            
            task.result = taskReasoning;
          } else {
            task.result = `Completed ${task.type} task successfully`;
          }
          
          task.status = 'completed';
          task.updatedAt = new Date();
          
          console.log('✅ Task completed:', task.id);
          this.emitEvent('taskCompleted', { task });
          
        } catch (error) {
          task.status = 'failed';
          task.error = error instanceof Error ? error.message : 'Task execution failed';
          task.updatedAt = new Date();
          
          console.log('❌ Task failed:', task.id, task.error);
          this.emitEvent('taskFailed', { task });
        }
      }, 3000 + Math.random() * 2000);
    }, 1000);
  }

  // Public API methods
  getTasks(): SovereignTask[] {
    return Array.from(this.tasks.values());
  }

  getActiveProjects(): ProjectSpec[] {
    return Array.from(this.projects.values()).filter(p => p.status === 'active' || p.status === 'planning');
  }

  getTask(taskId: string): SovereignTask | undefined {
    return this.tasks.get(taskId);
  }

  getProject(projectId: string): ProjectSpec | undefined {
    return this.projects.get(projectId);
  }

  updateTask(update: TaskUpdate) {
    const task = this.tasks.get(update.taskId);
    if (task) {
      task.status = update.status;
      task.updatedAt = new Date();
      
      if (update.progress !== undefined) {
        // Store progress in result for now
        task.result = { progress: update.progress, ...(typeof task.result === 'object' && task.result !== null ? task.result : {}) };
      }
      
      if (update.result !== undefined) {
        task.result = update.result;
      }
      
      if (update.error !== undefined) {
        task.error = update.error;
      }

      if (update.startedAt !== undefined) {
        task.startedAt = update.startedAt;
      }

      this.emitEvent('taskUpdated', { task });
    }
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

  async storeProjectInDatabase(project: ProjectSpec): Promise<void> {
    try {
      // Convert to a safe JSON format for database storage
      const safeProjectData = {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        techStack: project.techStack,
        requirements: project.requirements,
        architecture: project.architecture,
        createdAt: project.createdAt.toISOString(),
        updatedAt: project.updatedAt.toISOString()
      };

      const { error } = await supabase
        .from('generation_history')
        .insert({
          task_id: project.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status: project.status,
          project_spec: safeProjectData,
          result: 'Project created',
          progress: 0
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store project in database:', error);
    }
  }

  private isValidProjectSpec(data: any): data is ProjectSpec {
    return (
      data &&
      typeof data === 'object' &&
      typeof data.id === 'string' &&
      typeof data.name === 'string' &&
      typeof data.description === 'string' &&
      ['planning', 'active', 'completed', 'paused'].includes(data.status) &&
      Array.isArray(data.techStack)
    );
  }

  async loadProjectsFromDatabase(): Promise<void> {
    try {
      const { data: generationHistory, error } = await supabase
        .from('generation_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      generationHistory?.forEach(record => {
        try {
          const projectData = record.project_spec;
          
          if (this.isValidProjectSpec(projectData)) {
            const project: ProjectSpec = {
              id: projectData.id,
              name: projectData.name,
              description: projectData.description,
              status: projectData.status,
              techStack: projectData.techStack,
              requirements: projectData.requirements,
              architecture: projectData.architecture,
              createdAt: new Date(projectData.createdAt),
              updatedAt: new Date(projectData.updatedAt)
            };
            
            this.projects.set(project.id, project);
          }
        } catch (error) {
          console.warn('Failed to parse project from database:', error);
        }
      });
    } catch (error) {
      console.error('Failed to load projects from database:', error);
    }
  }
}

// Global orchestrator instance
export const sovereignOrchestrator = new SovereignOrchestrator();
