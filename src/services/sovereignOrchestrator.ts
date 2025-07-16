
import { createDeepSeekReasonerCore } from './deepSeekReasonerCore';
import { a2aProtocol } from './a2aProtocolCore';
import { BaseAgent, ArchitectAgent, BuilderAgent, ValidatorAgent, OptimizerAgent, LibrarianAgent } from './specializedAgents';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

// Type aliases for better readability
export type SovereignTask = Tables<'sovereign_tasks'>;
export type ProjectSpec = Tables<'project_specs'>;
export type AgentCapability = Tables<'agent_capabilities'>;

// Agent registry to manage specialized agents
class AgentRegistry {
  private agents: Map<string, BaseAgent> = new Map();

  constructor() {
    // Initialize specialized agents
    this.agents.set('architect', new ArchitectAgent('architect', 'Designs application architecture'));
    this.agents.set('builder', new BuilderAgent('builder', 'Builds frontend components'));
    this.agents.set('validator', new ValidatorAgent('validator', 'Validates code quality'));
    this.agents.set('optimizer', new OptimizerAgent('optimizer', 'Optimizes performance'));
    this.agents.set('librarian', new LibrarianAgent('librarian', 'Manages knowledge base'));
  }

  getAgent(type: string): BaseAgent | null {
    return this.agents.get(type) || null;
  }

  getAllAgents(): BaseAgent[] {
    return Array.from(this.agents.values());
  }
}

export class SovereignOrchestrator {
  private deepSeekReasoner: any;
  private agentRegistry: AgentRegistry;
  private apiKey: string | null = null;

  constructor() {
    this.agentRegistry = new AgentRegistry();
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.deepSeekReasoner = createDeepSeekReasonerCore(apiKey);
    console.log('👑 Sovereign Orchestrator: API key configured');
  }

  async initialize() {
    console.log('👑 Sovereign Orchestrator: Initializing system...');
    
    try {
      // Initialize A2A protocol for multi-agent communication
      await a2aProtocol.initialize();
      
      // Initialize DeepSeek reasoning core if API key is available
      if (this.apiKey && this.deepSeekReasoner) {
        await this.deepSeekReasoner.initialize();
      }
      
      console.log('👑 Sovereign Orchestrator: System initialized successfully');
      return true;
    } catch (error) {
      console.error('👑 Sovereign Orchestrator: Initialization failed:', error);
      throw error;
    }
  }

  async orchestrateProject(projectSpec: any): Promise<string> {
    console.log('👑 Sovereign Orchestrator: Starting project orchestration...');
    
    if (!this.apiKey) {
      throw new Error('API key not configured. Please set API key before orchestrating projects.');
    }

    try {
      // Store project specification
      const { data: project, error: projectError } = await supabase
        .from('project_specs')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id || '',
          execution_id: `exec_${Date.now()}`,
          name: projectSpec.name || 'Generated Project',
          description: projectSpec.description || '',
          tech_stack: projectSpec.techStack || ['React', 'TypeScript'],
          requirements: projectSpec,
          status: 'active'
        })
        .select()
        .single();

      if (projectError) {
        console.error('Failed to store project spec:', projectError);
        throw projectError;
      }

      // Break down project into tasks using DeepSeek reasoning
      const tasks = await this.breakDownProject(projectSpec);
      
      // Store tasks in database
      const taskPromises = tasks.map(task => this.storeTask(task, project.execution_id));
      await Promise.all(taskPromises);
      
      // Execute tasks using specialized agents
      const results = await this.executeTasks(tasks);
      
      console.log('👑 Sovereign Orchestrator: Project orchestration completed');
      return results;
    } catch (error) {
      console.error('👑 Sovereign Orchestrator: Project orchestration failed:', error);
      throw error;
    }
  }

  private async breakDownProject(projectSpec: any): Promise<any[]> {
    console.log('🧠 DeepSeek Reasoning: Breaking down project...');
    
    if (!this.deepSeekReasoner) {
      // Fallback: Simple task breakdown
      return [
        {
          id: `task_${Date.now()}_1`,
          type: 'architect',
          description: `Design architecture for ${projectSpec.name}`,
          priority: 'high',
          dependencies: []
        },
        {
          id: `task_${Date.now()}_2`,
          type: 'builder',
          description: `Build main components for ${projectSpec.name}`,
          priority: 'medium',
          dependencies: [`task_${Date.now()}_1`]
        }
      ];
    }

    try {
      const reasoning = await this.deepSeekReasoner.reason({
        context: 'project_breakdown',
        input: projectSpec,
        instructions: 'Break down this project into specific, actionable tasks for specialized agents'
      });

      return reasoning.tasks || [];
    } catch (error) {
      console.error('DeepSeek reasoning failed, using fallback:', error);
      return [];
    }
  }

  private async storeTask(task: any, executionId: string): Promise<void> {
    const { error } = await supabase
      .from('sovereign_tasks')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id || '',
        execution_id: executionId,
        type: task.type || this.determineTaskType(task.description),
        description: task.description,
        status: 'pending',
        priority: task.priority || 'medium',
        metadata: { 
          originalTask: task,
          dependencies: task.dependencies || []
        }
      });

    if (error) {
      console.error('Failed to store task:', error);
      throw error;
    }
  }

  private determineTaskType(taskStr: string): string {
    const lowerTask = taskStr.toLowerCase();

    if (lowerTask.includes('ui') || lowerTask.includes('interface') || lowerTask.includes('component')) {
      return 'builder';
    } else if (lowerTask.includes('api') || lowerTask.includes('backend') || lowerTask.includes('server')) {
      return 'backend';
    } else if (lowerTask.includes('database') || lowerTask.includes('data')) {
      return 'database';
    } else if (lowerTask.includes('test') || lowerTask.includes('testing')) {
      return 'validator';
    } else if (lowerTask.includes('architecture') || lowerTask.includes('design')) {
      return 'architect';
    } else {
      return 'general';
    }
  }

  private async executeTasks(tasks: any[]): Promise<string> {
    console.log('🤖 Specialized Agents: Executing tasks...');
    
    const results: string[] = [];
    
    for (const task of tasks) {
      try {
        const result = await this.executeTask(task);
        results.push(result);
      } catch (error) {
        console.error(`Task execution failed for ${task.id}:`, error);
        results.push(`Task ${task.id} failed: ${error}`);
      }
    }
    
    return results.join('\n\n');
  }

  private async executeTask(taskData: any): Promise<string> {
    // Get pending tasks from database
    const { data: tasks, error } = await supabase
      .from('sovereign_tasks')
      .select('*')
      .eq('status', 'pending')
      .limit(1);

    if (error || !tasks || tasks.length === 0) {
      return 'No tasks available for execution';
    }

    const task = tasks[0];

    try {
      // Update task status to in_progress
      await supabase
        .from('sovereign_tasks')
        .update({ status: 'in_progress' })
        .eq('id', task.id);

      // Get the appropriate specialized agent
      const agent = this.agentRegistry.getAgent(task.type);
      
      if (!agent) {
        throw new Error(`No agent available for task type: ${task.type}`);
      }

      // Create a mock project context for the agent
      const projectContext = {
        id: task.execution_id,
        name: 'Generated Project',
        description: task.description,
        techStack: ['React', 'TypeScript'],
        files: []
      };

      // Create agent task from sovereign task
      const agentTask = {
        id: task.id,
        description: task.description,
        context: task.metadata
      };

      // Execute the task using the specialized agent
      const result = await agent.executeTask(agentTask, projectContext);

      // Convert AgentResponse to JSON-serializable format
      const jsonSerializableResult = {
        id: result.id,
        agentId: result.agentId,
        taskId: result.taskId,
        result: result.result,
        timestamp: result.timestamp.toISOString() // Convert Date to string
      };

      // Update task with results
      await supabase
        .from('sovereign_tasks')
        .update({ 
          status: 'completed',
          result: { agentResponse: jsonSerializableResult },
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      return `Task ${task.id} completed successfully: ${result.result}`;
    } catch (error) {
      // Update task status to failed
      await supabase
        .from('sovereign_tasks')
        .update({ 
          status: 'failed',
          result: { error: String(error) },
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      throw error;
    }
  }

  async getTaskStatus(taskId: string): Promise<any> {
    const { data, error } = await supabase
      .from('sovereign_tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  }

  async getAllTasks(): Promise<SovereignTask[]> {
    const { data, error } = await supabase
      .from('sovereign_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  }
}

// Export a singleton instance
export const sovereignOrchestrator = new SovereignOrchestrator();
