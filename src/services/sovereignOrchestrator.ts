
import { supabase } from '@/integrations/supabase/client';
import { ragDatabase } from './ragDatabaseCore';
import { a2aProtocol } from './a2aProtocolCore';
import { createDeepSeekReasonerCore } from './deepSeekReasonerCore';
import { mcpHub } from './mcpHubCore';
import { v4 as uuidv4 } from 'uuid';

export interface ProjectSpec {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  configuration?: any;
  techStack: string[];
}

export interface SovereignTask {
  id: string;
  projectId: string;
  name: string;
  description: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'running' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  ownerId: string;
  priority: number;
  taskSpec?: any;
  result?: any;
  progress: number;
  assignedAgent?: string;
  type: string;
}

export interface TaskUpdate {
  status?: SovereignTask['status'];
  progress?: number;
  result?: any;
  startedAt?: Date;
}

export class SovereignOrchestrator {
  private deepSeekReasoner: any = null;
  private apiKey: string = '';
  private activeTasks = new Map<string, SovereignTask>();
  private activeProjects = new Map<string, ProjectSpec>();
  private taskQueue: SovereignTask[] = [];
  private isProcessing = false;

  constructor() {
    console.log('🏛️ Sovereign Orchestrator: Initializing command center');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    if (apiKey) {
      this.deepSeekReasoner = createDeepSeekReasonerCore(apiKey);
      console.log('🔑 Sovereign Orchestrator: DeepSeek API key configured');
    }
  }

  getTasks(): SovereignTask[] {
    return Array.from(this.activeTasks.values());
  }

  getActiveProjects(): ProjectSpec[] {
    return Array.from(this.activeProjects.values());
  }

  async processUserRequest(userPrompt: string): Promise<string> {
    const executionId = uuidv4();
    console.log(`🚀 Processing user request: ${userPrompt}`);
    
    // Create a project from the user request
    const project: ProjectSpec = {
      id: uuidv4(),
      name: 'Generated Application',
      description: userPrompt,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: 'system',
      techStack: ['React', 'TypeScript', 'Tailwind CSS'],
    };

    this.activeProjects.set(project.id, project);

    // Create some sample tasks
    const tasks: Omit<SovereignTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress' | 'result' | 'startedAt' | 'completedAt'>[] = [
      {
        projectId: project.id,
        name: 'Architecture Planning',
        description: 'Design application architecture and component structure',
        ownerId: 'system',
        priority: 1,
        type: 'planning',
        assignedAgent: 'ArchitectAgent',
      },
      {
        projectId: project.id,
        name: 'Frontend Development',
        description: 'Implement user interface components',
        ownerId: 'system',
        priority: 2,
        type: 'development',
        assignedAgent: 'FrontendAgent',
      },
      {
        projectId: project.id,
        name: 'Backend Integration',
        description: 'Set up backend services and API integration',
        ownerId: 'system',
        priority: 3,
        type: 'integration',
        assignedAgent: 'BackendAgent',
      }
    ];

    // Create tasks
    for (const taskSpec of tasks) {
      await this.createTask(taskSpec);
    }

    return executionId;
  }

  async createProject(projectSpec: Omit<ProjectSpec, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProjectSpec> {
    const projectId = uuidv4();
    const newProject: ProjectSpec = {
      id: projectId,
      ...projectSpec,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.activeProjects.set(projectId, newProject);
    console.log(`✨ Sovereign Orchestrator: Project created - ${newProject.name} (${projectId})`);
    return newProject;
  }

  async getProject(projectId: string): Promise<ProjectSpec | undefined> {
    return this.activeProjects.get(projectId);
  }

  async updateProject(projectId: string, updates: Partial<ProjectSpec>): Promise<ProjectSpec | undefined> {
    const project = this.activeProjects.get(projectId);
    if (!project) {
      console.warn(`Sovereign Orchestrator: Project not found - ${projectId}`);
      return undefined;
    }

    const updatedProject: ProjectSpec = {
      ...project,
      ...updates,
      updatedAt: new Date(),
    };

    this.activeProjects.set(projectId, updatedProject);
    console.log(`🔄 Sovereign Orchestrator: Project updated - ${updatedProject.name} (${projectId})`);
    return updatedProject;
  }

  async createTask(taskSpec: Omit<SovereignTask, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'progress' | 'result' | 'startedAt' | 'completedAt'>): Promise<SovereignTask> {
    const taskId = uuidv4();
    const newTask: SovereignTask = {
      id: taskId,
      status: 'pending',
      progress: 0,
      result: null,
      startedAt: undefined,
      completedAt: undefined,
      ...taskSpec,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.taskQueue.push(newTask);
    this.activeTasks.set(taskId, newTask);
    console.log(`🚀 Sovereign Orchestrator: Task created - ${newTask.name} (${taskId})`);
    
    this.processTaskQueue();
    return newTask;
  }

  async getTask(taskId: string): Promise<SovereignTask | undefined> {
    return this.activeTasks.get(taskId);
  }

  async updateTask(taskId: string, updates: TaskUpdate): Promise<SovereignTask | undefined> {
    const task = this.activeTasks.get(taskId);
    if (!task) {
      console.warn(`Sovereign Orchestrator: Task not found - ${taskId}`);
      return undefined;
    }

    const updatedTask: SovereignTask = {
      ...task,
      ...updates,
      updatedAt: new Date(),
    };

    this.activeTasks.set(taskId, updatedTask);
    console.log(`🔄 Sovereign Orchestrator: Task updated - ${updatedTask.name} (${taskId})`);
    return updatedTask;
  }

  private async processTaskQueue(): Promise<void> {
    if (this.isProcessing) {
      console.log('🚦 Sovereign Orchestrator: Task queue processing already in progress');
      return;
    }

    if (this.taskQueue.length === 0) {
      console.log('📭 Sovereign Orchestrator: Task queue is empty');
      return;
    }

    this.isProcessing = true;
    console.log('⚙️ Sovereign Orchestrator: Starting task queue processing');

    while (this.taskQueue.length > 0) {
      const task = this.taskQueue.shift();
      if (!task) continue;

      try {
        console.log(`▶️ Sovereign Orchestrator: Starting task - ${task.name} (${task.id})`);
        await this.runTask(task);
        console.log(`✅ Sovereign Orchestrator: Task completed - ${task.name} (${task.id})`);
      } catch (error) {
        console.error(`🔥 Sovereign Orchestrator: Task failed - ${task.name} (${task.id})`, error);
        await this.updateTask(task.id, { status: 'failed', progress: 100, result: { error: error instanceof Error ? error.message : 'Unknown error' } });
      }
    }

    this.isProcessing = false;
    console.log('⏹️ Sovereign Orchestrator: Task queue processing complete');
  }

  private async runTask(task: SovereignTask): Promise<void> {
    await this.updateTask(task.id, { status: 'running', startedAt: new Date() });

    // Simulate task execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update task to completed
    await this.updateTask(task.id, { 
      status: 'completed', 
      progress: 100, 
      result: { message: `Task ${task.name} completed successfully` } 
    });

    const updatedTask = this.activeTasks.get(task.id);
    if (updatedTask) {
      updatedTask.completedAt = new Date();
    }
  }

  // Save project spec to database
  async saveProjectSpec(spec: ProjectSpec): Promise<void> {
    try {
      const { error } = await supabase
        .from('saved_project_specs')
        .insert({
          name: spec.name,
          description: spec.description,
          spec_data: spec as any,
          user_id: spec.ownerId,
        });

      if (error) {
        console.error('Error saving project spec:', error);
        throw error;
      }

      console.log('✅ Project spec saved to database');
    } catch (error) {
      console.error('Failed to save project spec:', error);
      throw error;
    }
  }

  // Load project specs from database
  async loadProjectSpecs(userId: string): Promise<ProjectSpec[]> {
    try {
      const { data, error } = await supabase
        .from('saved_project_specs')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error loading project specs:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item.spec_data as ProjectSpec,
        id: item.id,
      }));
    } catch (error) {
      console.error('Failed to load project specs:', error);
      return [];
    }
  }
}

export const sovereignOrchestrator = new SovereignOrchestrator();
