
import { createDeepSeekReasonerCore } from './deepSeekReasonerCore';
import { a2aProtocol } from './a2aProtocolCore';
import { SpecializedAgents } from './specializedAgents';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Define types based on Supabase tables
export type SovereignTask = Tables<'sovereign_tasks'>;
export type ProjectSpec = Tables<'project_specs'>;
export type AgentCapability = Tables<'agent_capabilities'>;

export class SovereignOrchestrator {
  private deepSeekReasoner: any;
  private specializedAgents: SpecializedAgents;
  private apiKey: string | null = null;

  constructor() {
    this.specializedAgents = new SpecializedAgents();
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.deepSeekReasoner = createDeepSeekReasonerCore();
    this.deepSeekReasoner.setApiKey(apiKey);
    console.log('👑 Sovereign Orchestrator: API key configured');
  }

  async processUserRequest(userPrompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('👑 Sovereign Orchestrator: Processing user request', {
      executionId,
      prompt: userPrompt.substring(0, 100) + '...'
    });

    try {
      // Step 1: Use DeepSeek to analyze and break down the request
      const analysisPrompt = `
You are the Sovereign AI Orchestrator. Analyze this user request and create a detailed project specification:

User Request: "${userPrompt}"

Provide a JSON response with:
1. project_name: A concise name for the project
2. description: Detailed description of what needs to be built
3. tech_stack: Array of technologies needed (React, TypeScript, etc.)
4. tasks: Array of specific development tasks needed
5. complexity: "simple", "medium", or "complex"
6. estimated_time: Rough estimate in hours

Return only valid JSON.`;

      const analysisResponse = await this.deepSeekReasoner.processPrompt(
        analysisPrompt,
        { maxTokens: 1000, temperature: 0.1 }
      );

      let projectSpec;
      try {
        projectSpec = JSON.parse(analysisResponse);
      } catch (e) {
        console.error('Failed to parse DeepSeek response:', analysisResponse);
        throw new Error('Failed to analyze project requirements');
      }

      // Step 2: Store project specification
      const { data: project, error: projectError } = await supabase
        .from('project_specs')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // TODO: Get actual user ID
          execution_id: executionId,
          name: projectSpec.project_name,
          description: projectSpec.description,
          tech_stack: projectSpec.tech_stack || [],
          requirements: projectSpec,
          status: 'active'
        })
        .select()
        .single();

      if (projectError) {
        console.error('Failed to store project spec:', projectError);
        throw new Error('Failed to store project specification');
      }

      // Step 3: Create and assign tasks to specialized agents
      await this.createAndAssignTasks(executionId, projectSpec.tasks || []);

      // Step 4: Start autonomous execution
      this.startAutonomousExecution(executionId);

      return executionId;

    } catch (error) {
      console.error('👑 Sovereign Orchestrator: Request processing failed', error);
      throw error;
    }
  }

  private async createAndAssignTasks(executionId: string, tasks: any[]): Promise<void> {
    console.log('👑 Creating tasks for execution:', executionId);

    for (const task of tasks) {
      // Determine the best agent for this task
      const agentType = this.determineAgentType(task);
      
      const { error } = await supabase
        .from('sovereign_tasks')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // TODO: Get actual user ID
          execution_id: executionId,
          type: agentType,
          description: task.description || task,
          status: 'pending',
          priority: task.priority || 'medium',
          metadata: {
            originalTask: task,
            agentType,
            createdAt: new Date().toISOString()
          }
        });

      if (error) {
        console.error('Failed to create task:', error);
      }
    }
  }

  private determineAgentType(task: any): string {
    const taskStr = typeof task === 'string' ? task : task.description || '';
    const lowerTask = taskStr.toLowerCase();

    if (lowerTask.includes('ui') || lowerTask.includes('interface') || lowerTask.includes('component')) {
      return 'frontend';
    } else if (lowerTask.includes('api') || lowerTask.includes('backend') || lowerTask.includes('server')) {
      return 'backend';
    } else if (lowerTask.includes('database') || lowerTask.includes('data')) {
      return 'database';
    } else if (lowerTask.includes('test') || lowerTask.includes('testing')) {
      return 'testing';
    } else {
      return 'general';
    }
  }

  private async startAutonomousExecution(executionId: string): Promise<void> {
    console.log('👑 Starting autonomous execution for:', executionId);

    // Get pending tasks
    const { data: pendingTasks, error } = await supabase
      .from('sovereign_tasks')
      .select('*')
      .eq('execution_id', executionId)
      .eq('status', 'pending')
      .order('created_at', { ascending: true });

    if (error || !pendingTasks) {
      console.error('Failed to fetch pending tasks:', error);
      return;
    }

    // Process tasks in sequence (could be made parallel later)
    for (const task of pendingTasks) {
      await this.executeTask(task);
    }
  }

  private async executeTask(task: SovereignTask): Promise<void> {
    console.log('👑 Executing task:', task.id, task.description);

    try {
      // Update task status to in_progress
      await supabase
        .from('sovereign_tasks')
        .update({ 
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      // Get the appropriate specialized agent
      const agent = this.specializedAgents.getAgent(task.type);
      
      if (!agent) {
        throw new Error(`No agent available for task type: ${task.type}`);
      }

      // Execute the task using the specialized agent
      const result = await agent.executeTask(task);

      // Update task with results
      await supabase
        .from('sovereign_tasks')
        .update({ 
          status: 'completed',
          result: result,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      console.log('👑 Task completed successfully:', task.id);

    } catch (error) {
      console.error('👑 Task execution failed:', task.id, error);
      
      // Update task status to failed
      await supabase
        .from('sovereign_tasks')
        .update({ 
          status: 'failed',
          result: { error: error instanceof Error ? error.message : 'Unknown error' },
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);
    }
  }

  // Public methods for monitoring and control
  async getTasks(executionId?: string): Promise<SovereignTask[]> {
    let query = supabase.from('sovereign_tasks').select('*');
    
    if (executionId) {
      query = query.eq('execution_id', executionId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }

    return data || [];
  }

  async getActiveProjects(): Promise<ProjectSpec[]> {
    const { data, error } = await supabase
      .from('project_specs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch active projects:', error);
      return [];
    }

    return data || [];
  }

  async getExecutionStatus(executionId: string): Promise<{
    total: number;
    completed: number;
    failed: number;
    pending: number;
    in_progress: number;
  }> {
    const { data: tasks, error } = await supabase
      .from('sovereign_tasks')
      .select('status')
      .eq('execution_id', executionId);

    if (error || !tasks) {
      return { total: 0, completed: 0, failed: 0, pending: 0, in_progress: 0 };
    }

    const status = {
      total: tasks.length,
      completed: 0,
      failed: 0,
      pending: 0,
      in_progress: 0
    };

    tasks.forEach(task => {
      switch (task.status) {
        case 'completed':
          status.completed++;
          break;
        case 'failed':
          status.failed++;
          break;
        case 'pending':
          status.pending++;
          break;
        case 'in_progress':
          status.in_progress++;
          break;
      }
    });

    return status;
  }
}

// Export singleton instance
export const sovereignOrchestrator = new SovereignOrchestrator();
