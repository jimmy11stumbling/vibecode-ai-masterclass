
import { supabase } from '@/integrations/supabase/client';
import { a2aProtocol } from './a2aProtocolCore';
import { DeepSeekReasonerCore } from './deepSeekReasonerCore';
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

export interface SovereignTask {
  id: string;
  execution_id: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assigned_agent?: string;
  result?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ProjectSpec {
  id: string;
  name: string;
  description?: string;
  requirements?: any;
  tech_stack?: string[];
  status: string;
  execution_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface AgentResponse {
  success: boolean;
  result: any;
  timestamp: Date;
  agentId: string;
}

// Agent Registry for managing specialized agents
const AgentRegistry = {
  architect: ArchitectAgent,
  builder: BuilderAgent,
  validator: ValidatorAgent,
  optimizer: OptimizerAgent,
  librarian: LibrarianAgent,
  base: BaseAgent
};

class SovereignOrchestrator {
  private deepSeekCore: DeepSeekReasonerCore | null = null;
  private apiKey: string | null = null;

  constructor() {
    console.log('🏛️ SovereignOrchestrator: Initializing autonomous development orchestrator');
  }

  async initialize(): Promise<void> {
    try {
      console.log('🏛️ SovereignOrchestrator: Starting system initialization');
      
      // Initialize core systems - they handle their own initialization in constructors
      console.log('🔗 A2A Protocol initialized');
      console.log('🔧 MCP Hub initialized');
      console.log('🗃️ RAG Database initialized');

      console.log('✅ SovereignOrchestrator: All systems initialized successfully');
    } catch (error) {
      console.error('❌ SovereignOrchestrator: Initialization failed:', error);
      throw error;
    }
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.deepSeekCore = new DeepSeekReasonerCore(apiKey);
    console.log('🔑 SovereignOrchestrator: API key configured');
  }

  async processUserRequest(userPrompt: string): Promise<string> {
    if (!this.deepSeekCore) {
      throw new Error('DeepSeek API key not configured');
    }

    console.log('🚀 SovereignOrchestrator: Processing user request:', userPrompt);

    try {
      const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Analyze request and create project spec
      const projectSpec = await this.analyzeAndCreateProjectSpec(userPrompt, executionId);
      
      // Break down into tasks
      const tasks = await this.createExecutionTasks(projectSpec, executionId);
      
      // Start autonomous execution
      this.startAutonomousExecution(executionId, tasks);
      
      return executionId;
    } catch (error) {
      console.error('❌ SovereignOrchestrator: Request processing failed:', error);
      throw error;
    }
  }

  private async analyzeAndCreateProjectSpec(userPrompt: string, executionId: string): Promise<ProjectSpec> {
    if (!this.deepSeekCore) {
      throw new Error('DeepSeek core not initialized');
    }

    console.log('🧠 Analyzing user request with DeepSeek Reasoner');
    
    const analysisPrompt = `Analyze this application request and create a detailed project specification:

${userPrompt}

Please provide:
1. Project name (short, descriptive)
2. Detailed description
3. Key requirements and features
4. Recommended technology stack
5. Architecture overview

Format as JSON with fields: name, description, requirements, tech_stack, architecture.`;

    const analysis = await this.deepSeekCore.processRequest(analysisPrompt);
    
    let projectData;
    try {
      projectData = JSON.parse(analysis.content);
    } catch {
      // Fallback if AI doesn't return valid JSON
      projectData = {
        name: 'AI Generated Application',
        description: userPrompt,
        requirements: { prompt: userPrompt },
        tech_stack: ['React', 'TypeScript', 'Tailwind CSS'],
        architecture: 'Standard web application'
      };
    }

    // Store in database
    const { data, error } = await supabase
      .from('project_specs')
      .insert({
        execution_id: executionId,
        name: projectData.name,
        description: projectData.description,
        requirements: projectData.requirements || {},
        tech_stack: projectData.tech_stack || [],
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    return data;
  }

  private async createExecutionTasks(projectSpec: ProjectSpec, executionId: string): Promise<SovereignTask[]> {
    console.log('📋 Creating execution tasks for project:', projectSpec.name);

    const tasks = [
      {
        execution_id: executionId,
        type: 'architecture',
        description: `Design system architecture for ${projectSpec.name}`,
        status: 'pending' as const,
        priority: 'high' as const,
        assigned_agent: 'architect'
      },
      {
        execution_id: executionId,
        type: 'setup',
        description: 'Initialize project structure and dependencies',
        status: 'pending' as const,
        priority: 'high' as const,
        assigned_agent: 'builder'
      },
      {
        execution_id: executionId,
        type: 'implementation',
        description: 'Implement core features and functionality',
        status: 'pending' as const,
        priority: 'medium' as const,
        assigned_agent: 'builder'
      },
      {
        execution_id: executionId,
        type: 'validation',
        description: 'Test and validate implementation',
        status: 'pending' as const,
        priority: 'medium' as const,
        assigned_agent: 'validator'
      },
      {
        execution_id: executionId,
        type: 'optimization',
        description: 'Optimize performance and user experience',
        status: 'pending' as const,
        priority: 'low' as const,
        assigned_agent: 'optimizer'
      }
    ];

    const { data, error } = await supabase
      .from('sovereign_tasks')
      .insert(tasks)
      .select();

    if (error) {
      console.error('Task creation error:', error);
      throw error;
    }

    return data;
  }

  private async startAutonomousExecution(executionId: string, tasks: SovereignTask[]): Promise<void> {
    console.log('🤖 Starting autonomous execution for:', executionId);
    
    // Process tasks asynchronously
    setTimeout(() => {
      this.processTasksSequentially(tasks);
    }, 1000);
  }

  private async processTasksSequentially(tasks: SovereignTask[]): Promise<void> {
    for (const task of tasks) {
      try {
        console.log(`🔄 Processing task: ${task.description}`);
        
        await this.updateTaskStatus(task.id, 'in_progress');
        
        const result = await this.executeTask(task);
        
        await this.updateTaskStatus(task.id, 'completed', result);
        
        console.log(`✅ Task completed: ${task.description}`);
        
        // Brief delay between tasks
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (error) {
        console.error(`❌ Task failed: ${task.description}`, error);
        await this.updateTaskStatus(task.id, 'failed', { error: error.message });
      }
    }
  }

  private async executeTask(task: SovereignTask): Promise<any> {
    const agentType = task.assigned_agent || 'base';
    const AgentClass = AgentRegistry[agentType as keyof typeof AgentRegistry] || AgentRegistry.base;
    
    if (!this.deepSeekCore) {
      throw new Error('DeepSeek core not initialized');
    }

    const agent = new AgentClass(this.deepSeekCore);
    const agentResponse = await agent.processTask(task.description, task.metadata || {});
    
    // Convert AgentResponse to JSON-serializable format
    const jsonSerializableResult = {
      agentResponse: {
        ...agentResponse,
        timestamp: agentResponse.timestamp.toISOString()
      }
    };

    return jsonSerializableResult;
  }

  async updateTaskStatus(taskId: string, status: SovereignTask['status'], result?: any): Promise<void> {
    const { error } = await supabase
      .from('sovereign_tasks')
      .update({ 
        status, 
        result: result || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (error) {
      console.error('Task update error:', error);
      throw error;
    }
  }

  async getTasks(executionId?: string): Promise<SovereignTask[]> {
    let query = supabase
      .from('sovereign_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (executionId) {
      query = query.eq('execution_id', executionId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    // Type assertion to ensure proper typing
    return (data || []).map(task => ({
      ...task,
      status: task.status as SovereignTask['status'],
      priority: task.priority as SovereignTask['priority']
    }));
  }

  async getActiveProjects(): Promise<ProjectSpec[]> {
    const { data, error } = await supabase
      .from('project_specs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      return [];
    }

    return data || [];
  }
}

export const sovereignOrchestrator = new SovereignOrchestrator();
