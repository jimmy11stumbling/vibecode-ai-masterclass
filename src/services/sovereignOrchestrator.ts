
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';
import { DeepSeekReasonerCore } from './deepSeekReasonerCore';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';
import { ragDatabase } from './ragDatabaseCore';

export interface ProjectSpec {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  requirements: string[];
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface SovereignTask {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assignedAgent?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

interface TaskUpdate {
  status?: SovereignTask['status'];
  progress?: number;
  metadata?: Record<string, any>;
  startedAt?: Date;
  completedAt?: Date;
}

export class SovereignOrchestrator {
  private deepSeekReasoner: DeepSeekReasonerCore;
  private apiKey: string | null = null;
  private tasks: Map<string, SovereignTask> = new Map();
  private projects: Map<string, ProjectSpec> = new Map();
  private currentExecutions: Map<string, { projectId: string; status: string }> = new Map();

  constructor() {
    this.deepSeekReasoner = new DeepSeekReasonerCore();
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.deepSeekReasoner.setApiKey(apiKey);
  }

  // Get all tasks
  getTasks(): SovereignTask[] {
    return Array.from(this.tasks.values());
  }

  // Get active projects
  getActiveProjects(): ProjectSpec[] {
    return Array.from(this.projects.values()).filter(
      project => project.status === 'in_progress' || project.status === 'planning'
    );
  }

  // Process user request and start autonomous development
  async processUserRequest(userPrompt: string): Promise<string> {
    const executionId = uuidv4();
    
    try {
      console.log('🚀 Starting autonomous development process');
      
      // Create project specification
      const projectSpec = await this.generateProjectSpec(userPrompt);
      this.projects.set(projectSpec.id, projectSpec);
      
      // Save to database
      await this.saveProjectSpec(projectSpec);
      
      // Create development tasks
      const tasks = await this.createDevelopmentTasks(projectSpec);
      
      // Store tasks
      tasks.forEach(task => this.tasks.set(task.id, task));
      
      // Track execution
      this.currentExecutions.set(executionId, {
        projectId: projectSpec.id,
        status: 'running'
      });
      
      // Start autonomous execution
      this.executeTasksAutonomously(tasks, projectSpec);
      
      return executionId;
    } catch (error) {
      console.error('Failed to process user request:', error);
      throw error;
    }
  }

  private async generateProjectSpec(userPrompt: string): Promise<ProjectSpec> {
    console.log('📋 Generating project specification');
    
    // Use DeepSeek to analyze requirements
    const analysis = await this.deepSeekReasoner.generateResponse(
      `Analyze this project request and create a detailed specification: ${userPrompt}`
    );
    
    // Create project spec (simplified for now)
    const projectSpec: ProjectSpec = {
      id: uuidv4(),
      name: this.extractProjectName(userPrompt),
      description: userPrompt,
      techStack: this.inferTechStack(userPrompt),
      requirements: this.extractRequirements(userPrompt),
      status: 'planning',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    return projectSpec;
  }

  private extractProjectName(prompt: string): string {
    // Simple extraction - could be enhanced with AI
    const words = prompt.split(' ').slice(0, 5);
    return words.join(' ').replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Generated Application';
  }

  private inferTechStack(prompt: string): string[] {
    const defaultStack = ['React', 'TypeScript', 'Tailwind CSS'];
    
    // Basic keyword detection
    if (prompt.toLowerCase().includes('mobile')) {
      defaultStack.push('React Native');
    }
    if (prompt.toLowerCase().includes('database')) {
      defaultStack.push('Supabase');
    }
    if (prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('chat')) {
      defaultStack.push('OpenAI API');
    }
    
    return defaultStack;
  }

  private extractRequirements(prompt: string): string[] {
    // Simple requirement extraction
    return [
      'User interface implementation',
      'Core functionality development',
      'Testing and validation',
      'Deployment preparation'
    ];
  }

  private async createDevelopmentTasks(projectSpec: ProjectSpec): Promise<SovereignTask[]> {
    console.log('📝 Creating development tasks');
    
    const tasks: SovereignTask[] = [
      {
        id: uuidv4(),
        type: 'analysis',
        description: 'Analyze project requirements and create detailed architecture',
        status: 'pending',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        type: 'frontend',
        description: 'Implement user interface components',
        status: 'pending',
        priority: 'high',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        type: 'backend',
        description: 'Set up backend services and APIs',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        type: 'integration',
        description: 'Integrate frontend and backend components',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        type: 'testing',
        description: 'Test application functionality and fix issues',
        status: 'pending',
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    return tasks;
  }

  private async executeTasksAutonomously(tasks: SovereignTask[], projectSpec: ProjectSpec) {
    console.log('🤖 Starting autonomous task execution');
    
    // Execute tasks in priority order
    const sortedTasks = tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    for (const task of sortedTasks) {
      try {
        await this.executeTask(task, projectSpec);
        await this.delay(2000); // Simulate processing time
      } catch (error) {
        console.error(`Failed to execute task ${task.id}:`, error);
        this.updateTask(task.id, { status: 'failed' });
      }
    }
  }

  private async executeTask(task: SovereignTask, projectSpec: ProjectSpec) {
    console.log(`🔧 Executing task: ${task.description}`);
    
    // Update task status
    this.updateTask(task.id, { 
      status: 'in_progress',
      startedAt: new Date()
    });
    
    // Simulate task execution with DeepSeek reasoning
    const taskPrompt = `Execute this development task: ${task.description} for project: ${projectSpec.name}`;
    
    try {
      const result = await this.deepSeekReasoner.generateResponse(taskPrompt);
      
      // Mark task as completed
      this.updateTask(task.id, { 
        status: 'completed',
        metadata: { result }
      });
      
      console.log(`✅ Completed task: ${task.description}`);
    } catch (error) {
      this.updateTask(task.id, { status: 'failed' });
      throw error;
    }
  }

  private updateTask(taskId: string, updates: TaskUpdate) {
    const task = this.tasks.get(taskId);
    if (task) {
      Object.assign(task, updates, { updatedAt: new Date() });
      this.tasks.set(taskId, task);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getTask(taskId: string): SovereignTask | undefined {
    return this.tasks.get(taskId);
  }

  // Save project spec to database
  private async saveProjectSpec(projectSpec: ProjectSpec) {
    try {
      const { error } = await supabase
        .from('saved_project_specs')
        .insert({
          name: projectSpec.name,
          description: projectSpec.description,
          spec_data: projectSpec as any, // Convert to JSONB
          user_id: 'system' // This would normally be the authenticated user
        });
      
      if (error) {
        console.error('Failed to save project spec:', error);
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  }

  // Load project specs from database
  async loadProjectSpecs(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('saved_project_specs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Failed to load project specs:', error);
        return;
      }
      
      if (data) {
        data.forEach(record => {
          try {
            // Safely convert spec_data to ProjectSpec
            const specData = record.spec_data;
            if (specData && typeof specData === 'object' && !Array.isArray(specData)) {
              const projectSpec = specData as unknown as ProjectSpec;
              // Validate that it has the required properties
              if (projectSpec.id && projectSpec.name && projectSpec.description) {
                this.projects.set(projectSpec.id, projectSpec);
              }
            }
          } catch (conversionError) {
            console.error('Failed to convert project spec:', conversionError);
          }
        });
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  }
}

// Export singleton instance
export const sovereignOrchestrator = new SovereignOrchestrator();
