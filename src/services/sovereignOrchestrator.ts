
import { supabase } from '@/integrations/supabase/client';
import { deepSeekReasonerCore } from './deepSeekReasonerCore';
import { BaseAgent } from './specializedAgents';
import type { Tables } from '@/integrations/supabase/types';

// Define types based on Supabase tables
export type SovereignTask = Tables<'sovereign_tasks'>;
export type ProjectSpec = Tables<'project_specs'>;
export type AgentCapability = Tables<'agent_capabilities'>;

// Define insert types for new records
export type SovereignTaskInsert = {
  user_id: string;
  execution_id: string;
  type: string;
  description: string;
  status?: string;
  priority?: string;
  assigned_agent?: string | null;
  result?: any;
  metadata?: any;
};

export type ProjectSpecInsert = {
  user_id: string;
  execution_id: string;
  name: string;
  description?: string;
  tech_stack?: string[];
  requirements?: any;
  status?: string;
};

export class SovereignOrchestrator {
  private apiKey: string | null = null;
  private activeTasks: Map<string, SovereignTask> = new Map();
  private activeProjects: Map<string, ProjectSpec> = new Map();
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    this.initializeAgents();
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    deepSeekReasonerCore.setApiKey(apiKey);
  }

  private async initializeAgents() {
    try {
      const { data: agentCapabilities } = await supabase
        .from('agent_capabilities')
        .select('*');

      console.log('👑 Sovereign Orchestrator: Initialized with capabilities:', agentCapabilities?.length || 0);
    } catch (error) {
      console.error('Failed to initialize agents:', error);
    }
  }

  async processUserRequest(userPrompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('👑 Sovereign Orchestrator: Processing request with execution ID:', executionId);

    try {
      // Step 1: Generate project specification using DeepSeek
      const projectPrompt = `
        Based on this user request, create a detailed project specification:
        "${userPrompt}"
        
        Provide a JSON response with:
        - name: Project name
        - description: Detailed description
        - techStack: Array of technologies needed
        - requirements: Detailed requirements object
        - features: List of key features
      `;

      const projectSpecResponse = await deepSeekReasonerCore.generateResponse(projectPrompt);
      
      let projectSpec: any;
      try {
        projectSpec = JSON.parse(projectSpecResponse);
      } catch {
        // If parsing fails, create a basic spec
        projectSpec = {
          name: 'AI Generated Application',
          description: userPrompt,
          techStack: ['React', 'TypeScript', 'Tailwind CSS'],
          requirements: { userRequest: userPrompt },
          features: ['User Interface', 'Core Functionality']
        };
      }

      // Step 2: Save project specification to database
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const { data: savedProjectSpec, error: projectError } = await supabase
        .from('project_specs')
        .insert({
          user_id: currentUser.id,
          execution_id: executionId,
          name: projectSpec.name,
          description: projectSpec.description,
          tech_stack: projectSpec.techStack || [],
          requirements: projectSpec,
          status: 'active'
        } as ProjectSpecInsert)
        .select()
        .single();

      if (projectError) {
        throw new Error(`Failed to save project spec: ${projectError.message}`);
      }

      // Step 3: Break down into tasks
      const tasks = await this.generateTasks(projectSpec, executionId);
      
      // Step 4: Create tasks in database
      for (const task of tasks) {
        const { error: taskError } = await supabase
          .from('sovereign_tasks')
          .insert({
            user_id: currentUser.id,
            execution_id: executionId,
            type: task.type,
            description: task.description,
            status: 'pending',
            priority: task.priority || 'medium',
            metadata: { projectSpec }
          } as SovereignTaskInsert);

        if (taskError) {
          console.error('Failed to create task:', taskError);
        }
      }

      // Step 5: Start processing tasks
      await this.processTasks(executionId);

      return executionId;

    } catch (error) {
      console.error('Sovereign orchestration failed:', error);
      throw error;
    }
  }

  private async generateTasks(projectSpec: any, executionId: string) {
    const taskPrompt = `
      Based on this project specification, create a list of development tasks:
      ${JSON.stringify(projectSpec, null, 2)}
      
      Generate tasks for:
      1. Architecture planning
      2. UI/UX design
      3. Frontend development
      4. Backend development (if needed)
      5. Integration and testing
      6. Deployment preparation
      
      Return a JSON array of tasks with: type, description, priority (high/medium/low)
    `;

    try {
      const tasksResponse = await deepSeekReasonerCore.generateResponse(taskPrompt);
      const tasks = JSON.parse(tasksResponse);
      return Array.isArray(tasks) ? tasks : [];
    } catch (error) {
      console.error('Failed to generate tasks:', error);
      // Return default tasks if AI generation fails
      return [
        { type: 'architecture', description: 'Plan application architecture', priority: 'high' },
        { type: 'ui_design', description: 'Design user interface', priority: 'high' },
        { type: 'frontend', description: 'Implement frontend components', priority: 'medium' },
        { type: 'integration', description: 'Integrate components and test', priority: 'medium' },
        { type: 'deployment', description: 'Prepare for deployment', priority: 'low' }
      ];
    }
  }

  private async processTasks(executionId: string) {
    try {
      const { data: tasks } = await supabase
        .from('sovereign_tasks')
        .select('*')
        .eq('execution_id', executionId)
        .eq('status', 'pending')
        .order('priority', { ascending: false });

      if (!tasks || tasks.length === 0) {
        console.log('No pending tasks found for execution:', executionId);
        return;
      }

      console.log(`👑 Processing ${tasks.length} tasks for execution:`, executionId);

      // Process tasks sequentially for now
      for (const task of tasks) {
        await this.processTask(task);
      }

    } catch (error) {
      console.error('Failed to process tasks:', error);
    }
  }

  private async processTask(task: SovereignTask) {
    try {
      // Update task status to in_progress
      await supabase
        .from('sovereign_tasks')
        .update({ status: 'in_progress' })
        .eq('id', task.id);

      // Generate task-specific code/solution
      const taskPrompt = `
        Execute this development task:
        Type: ${task.type}
        Description: ${task.description}
        
        Project Context: ${JSON.stringify(task.metadata || {}, null, 2)}
        
        Provide the solution, code, or detailed implementation plan.
      `;

      const result = await deepSeekReasonerCore.generateResponse(taskPrompt);

      // Update task with result
      const updateData = {
        status: 'completed',
        result: typeof result === 'string' ? { output: result } : result
      };

      await supabase
        .from('sovereign_tasks')
        .update(updateData)
        .eq('id', task.id);

      console.log(`✅ Task completed: ${task.description}`);

    } catch (error) {
      console.error(`❌ Task failed: ${task.description}`, error);
      
      await supabase
        .from('sovereign_tasks')
        .update({ 
          status: 'failed',
          result: { error: error instanceof Error ? error.message : 'Unknown error' }
        })
        .eq('id', task.id);
    }
  }

  async getTasks(executionId?: string): Promise<SovereignTask[]> {
    try {
      let query = supabase.from('sovereign_tasks').select('*');
      
      if (executionId) {
        query = query.eq('execution_id', executionId);
      }
      
      const { data: tasks, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch tasks:', error);
        return [];
      }
      
      return tasks || [];
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  }

  async getActiveProjects(): Promise<ProjectSpec[]> {
    try {
      const { data: projects, error } = await supabase
        .from('project_specs')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch active projects:', error);
        return [];
      }
      
      return projects || [];
    } catch (error) {
      console.error('Failed to fetch active projects:', error);
      return [];
    }
  }

  async getExecutionStatus(executionId: string) {
    try {
      const [tasksResult, projectResult] = await Promise.all([
        supabase.from('sovereign_tasks').select('*').eq('execution_id', executionId),
        supabase.from('project_specs').select('*').eq('execution_id', executionId).single()
      ]);

      const tasks = tasksResult.data || [];
      const project = projectResult.data;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      const failedTasks = tasks.filter(t => t.status === 'failed').length;
      const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;

      return {
        executionId,
        project,
        tasks,
        progress: {
          total: totalTasks,
          completed: completedTasks,
          failed: failedTasks,
          inProgress: inProgressTasks,
          percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Failed to get execution status:', error);
      return null;
    }
  }
}

// Export singleton instance
export const sovereignOrchestrator = new SovereignOrchestrator();
