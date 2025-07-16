
import { supabase } from '@/integrations/supabase/client';
import { deepSeekReasonerCore, createDeepSeekReasonerCore } from './deepSeekReasonerCore';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';
import { ragDatabase } from './ragDatabaseCore';
import { 
  ArchitectAgent, 
  BuilderAgent, 
  ValidatorAgent, 
  OptimizerAgent,
  LibrarianAgent,
  BaseAgent 
} from './specializedAgents';

// Agent registry for managing specialized agents
const AgentRegistry = {
  ArchitectAgent,
  BuilderAgent, 
  ValidatorAgent,
  OptimizerAgent,
  LibrarianAgent,
  BaseAgent
};

export interface SovereignTask {
  id: string;
  execution_id: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_agent?: string;
  result?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface ProjectSpec {
  id: string;
  name: string;
  description: string;
  requirements?: any;
  tech_stack?: string[];
  status: string;
  execution_id: string;
  created_at: string;
  updated_at: string;
}

export class SovereignOrchestrator {
  private deepSeekCore: any = null;
  private apiKey: string | null = null;

  constructor() {
    this.initializeSystem();
  }

  private async initializeSystem() {
    console.log('🤖 Sovereign Orchestrator: Initializing autonomous system');
    
    // Initialize A2A Protocol (no initialize method needed, constructor handles it)
    console.log('✅ A2A Protocol initialized');
    
    // Initialize MCP Hub
    await mcpHub.initialize();
    console.log('✅ MCP Hub initialized');
    
    // Initialize RAG Database
    await ragDatabase.initialize();
    console.log('✅ RAG Database initialized');
    
    console.log('👑 Sovereign Orchestrator: System initialization complete');
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
    this.deepSeekCore = createDeepSeekReasonerCore(apiKey);
    console.log('🔑 Sovereign Orchestrator: API key configured');
  }

  async processUserRequest(userPrompt: string): Promise<string> {
    if (!this.apiKey || !this.deepSeekCore) {
      throw new Error('DeepSeek API key not configured');
    }

    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`🚀 Processing user request with execution ID: ${executionId}`);

    try {
      // Step 1: Analyze user requirements using DeepSeek
      const analysisPrompt = `
        Analyze this user request for application development and create a comprehensive project specification:
        
        User Request: ${userPrompt}
        
        Please provide:
        1. Project name and description
        2. Technical requirements breakdown
        3. Recommended technology stack
        4. Development tasks with priorities
        5. Agent assignments for each task
        
        Format your response as a structured analysis.
      `;

      const analysis = await this.deepSeekCore.processRequest(analysisPrompt);
      
      // Step 2: Create project specification
      const projectSpec = await this.createProjectSpec(executionId, analysis, userPrompt);
      
      // Step 3: Generate development tasks
      const tasks = await this.generateTasks(executionId, analysis);
      
      // Step 4: Assign agents to tasks
      await this.assignAgentsToTasks(tasks);
      
      console.log(`✅ User request processed successfully: ${executionId}`);
      return executionId;
      
    } catch (error) {
      console.error('❌ Error processing user request:', error);
      throw error;
    }
  }

  private async createProjectSpec(executionId: string, analysis: any, userPrompt: string): Promise<ProjectSpec> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Extract project details from analysis
    const projectName = `Generated Project ${Date.now()}`;
    const description = userPrompt.slice(0, 200) + (userPrompt.length > 200 ? '...' : '');
    
    const { data, error } = await supabase
      .from('project_specs')
      .insert({
        execution_id: executionId,
        name: projectName,
        description,
        requirements: { userPrompt, analysis },
        tech_stack: ['React', 'TypeScript', 'Tailwind CSS'],
        status: 'active',
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private async generateTasks(executionId: string, analysis: any): Promise<SovereignTask[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('User not authenticated');

    // Generate standard development tasks
    const taskTemplates = [
      { type: 'architecture', description: 'Design application architecture and structure', priority: 'high' },
      { type: 'frontend', description: 'Develop user interface components', priority: 'high' },
      { type: 'backend', description: 'Implement backend logic and APIs', priority: 'high' },
      { type: 'database', description: 'Design and implement database schema', priority: 'medium' }, 
      { type: 'validation', description: 'Test and validate application functionality', priority: 'medium' },
      { type: 'optimization', description: 'Optimize performance and user experience', priority: 'low' }
    ];

    const tasks = [];
    for (const template of taskTemplates) {
      const { data, error } = await supabase
        .from('sovereign_tasks')
        .insert({
          execution_id: executionId,
          type: template.type,
          description: template.description,
          status: 'pending',
          priority: template.priority,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      tasks.push(data);
    }

    return tasks;
  }

  private async assignAgentsToTasks(tasks: SovereignTask[]) {
    // Agent assignment logic
    const agentAssignments = {
      'architecture': 'ArchitectAgent',
      'frontend': 'BuilderAgent', 
      'backend': 'BuilderAgent',
      'database': 'BuilderAgent',
      'validation': 'ValidatorAgent',
      'optimization': 'OptimizerAgent'
    };

    for (const task of tasks) {
      const agentType = agentAssignments[task.type as keyof typeof agentAssignments];
      if (agentType) {
        // Register agent with A2A protocol
        await a2aProtocol.registerAgent({
          id: `${agentType}-${task.id}`,
          name: agentType,
          type: task.type,
          capabilities: [task.type],
          status: 'idle',
          currentTasks: [task.id]
        });

        // Update task with assigned agent
        await supabase
          .from('sovereign_tasks')
          .update({ 
            assigned_agent: `${agentType}-${task.id}`,
            status: 'in_progress'
          })
          .eq('id', task.id);
      }
    }
  }

  async getTasks(executionId?: string): Promise<SovereignTask[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];

    let query = supabase
      .from('sovereign_tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (executionId) {
      query = query.eq('execution_id', executionId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data || [];
  }

  async getActiveProjects(): Promise<ProjectSpec[]> {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
      .from('project_specs')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return data || [];
  }

  async updateTaskStatus(taskId: string, status: SovereignTask['status'], result?: any) {
    const updateData: any = { 
      status,
      updated_at: new Date().toISOString()
    };

    if (result) {
      // Convert result to JSON-serializable format
      updateData.result = {
        ...result,
        timestamp: result.timestamp ? result.timestamp.toISOString() : new Date().toISOString()
      };
    }

    const { error } = await supabase
      .from('sovereign_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) {
      console.error('Error updating task status:', error);
      throw error;
    }
  }

  async executeTask(task: SovereignTask): Promise<any> {
    if (!this.deepSeekCore) {
      throw new Error('DeepSeek core not initialized');
    }

    console.log(`🎯 Executing task: ${task.description}`);
    
    try {
      // Update task status to in_progress
      await this.updateTaskStatus(task.id, 'in_progress');

      // Execute task based on type
      let result;
      switch (task.type) {
        case 'architecture':
          result = await this.executeArchitectureTask(task);
          break;
        case 'frontend':
        case 'backend':
        case 'database':
          result = await this.executeBuildTask(task);
          break;
        case 'validation':
          result = await this.executeValidationTask(task);
          break;
        case 'optimization':
          result = await this.executeOptimizationTask(task);
          break;
        default:
          result = await this.executeGenericTask(task);
      }

      // Update task status to completed
      await this.updateTaskStatus(task.id, 'completed', result);
      
      console.log(`✅ Task completed: ${task.description}`);
      return result;
      
    } catch (error) {
      console.error(`❌ Task failed: ${task.description}`, error);
      await this.updateTaskStatus(task.id, 'failed', { error: error.message });
      throw error;
    }
  }

  private async executeArchitectureTask(task: SovereignTask) {
    const prompt = `Design the application architecture for: ${task.description}`;
    return await this.deepSeekCore.processRequest(prompt);
  }

  private async executeBuildTask(task: SovereignTask) {
    const prompt = `Implement the following requirement: ${task.description}`;
    return await this.deepSeekCore.processRequest(prompt);
  }

  private async executeValidationTask(task: SovereignTask) {
    const prompt = `Validate and test: ${task.description}`;
    return await this.deepSeekCore.processRequest(prompt);
  }

  private async executeOptimizationTask(task: SovereignTask) {
    const prompt = `Optimize performance for: ${task.description}`;
    return await this.deepSeekCore.processRequest(prompt);
  }

  private async executeGenericTask(task: SovereignTask) {
    const prompt = `Complete the following task: ${task.description}`;
    return await this.deepSeekCore.processRequest(prompt);
  }
}

export const sovereignOrchestrator = new SovereignOrchestrator();
