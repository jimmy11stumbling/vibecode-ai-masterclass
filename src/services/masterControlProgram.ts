import { supabase } from '@/integrations/supabase/client';
import { DeepSeekReasonerCore } from './deepSeekReasonerCore';
import { ragDatabase } from './ragDatabaseCore';
import { mcpHub } from './mcpHubCore';
import { a2aProtocol } from './a2aProtocolCore';
import { sovereignOrchestrator } from './sovereignOrchestrator';

export interface MCPTask {
  id: string;
  type: 'reasoning' | 'generation' | 'analysis' | 'orchestration';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'queued' | 'processing' | 'completed' | 'failed';
  payload: any;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface SystemStatus {
  deepSeekStatus: 'active' | 'idle' | 'error';
  ragStatus: 'connected' | 'disconnected' | 'syncing';
  mcpStatus: 'operational' | 'degraded' | 'offline';
  a2aStatus: 'connected' | 'disconnected';
  orchestratorStatus: 'ready' | 'busy' | 'error';
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
}

export class MasterControlProgram {
  private deepSeekCore: DeepSeekReasonerCore;
  private taskQueue: MCPTask[] = [];
  private activeTasks: Map<string, MCPTask> = new Map();
  private systemMetrics: SystemStatus;
  private isInitialized = false;

  constructor() {
    this.deepSeekCore = new DeepSeekReasonerCore(this.getDeepSeekApiKey());
    this.systemMetrics = {
      deepSeekStatus: 'idle',
      ragStatus: 'disconnected',
      mcpStatus: 'offline',
      a2aStatus: 'disconnected',
      orchestratorStatus: 'ready',
      totalTasks: 0,
      activeTasks: 0,
      completedTasks: 0
    };
    
    this.initialize();
  }

  private async initialize() {
    console.log('🚀 Master Control Program: Initializing sovereign architecture...');
    
    try {
      // Initialize all core systems
      await this.initializeRAGDatabase();
      await this.initializeMCPHub();
      await this.initializeA2AProtocol();
      await this.initializeOrchestrator();
      
      // Establish inter-system communication
      await this.establishCommunicationFabric();
      
      // Start system monitoring
      this.startSystemMonitoring();
      
      this.isInitialized = true;
      this.systemMetrics.deepSeekStatus = 'active';
      this.systemMetrics.ragStatus = 'connected';
      this.systemMetrics.mcpStatus = 'operational';
      this.systemMetrics.a2aStatus = 'connected';
      
      console.log('✅ Master Control Program: All systems operational');
      
    } catch (error) {
      console.error('❌ Master Control Program: Initialization failed:', error);
      throw error;
    }
  }

  private async initializeRAGDatabase() {
    console.log('📚 Initializing RAG 2.0 Database...');
    ragDatabase.clearCache();
    // RAG database is ready for bidirectional integration
  }

  private async initializeMCPHub() {
    console.log('🔧 Initializing MCP Hub...');
    // MCP Hub is automatically initialized in its constructor
  }

  private async initializeA2AProtocol() {
    console.log('🤝 Initializing A2A Protocol...');
    // A2A Protocol is automatically initialized in its constructor
  }

  private async initializeOrchestrator() {
    console.log('🎯 Initializing Sovereign Orchestrator...');
    // Orchestrator is automatically initialized
  }

  private async establishCommunicationFabric() {
    console.log('🌐 Establishing communication fabric...');
    
    // Register MCP as the master coordinator
    await a2aProtocol.registerAgent({
      id: 'master_control_program',
      name: 'Master Control Program',
      type: 'coordinator',
      capabilities: ['task_management', 'system_orchestration', 'reasoning_coordination'],
      status: 'active',
      currentTasks: []
    });

    // Set up inter-system message routing
    a2aProtocol.addEventListener('message:master_control_program', this.handleA2AMessage.bind(this));
  }

  private async handleA2AMessage(message: any) {
    console.log('📨 MCP received A2A message:', message);
    
    switch (message.messageType) {
      case 'task':
        await this.processTaskRequest(message);
        break;
      case 'status':
        await this.sendSystemStatus(message.fromAgent);
        break;
      case 'data':
        await this.processReasoningRequest(message);
        break;
      default:
        console.log('🔄 MCP: Unknown message type:', message.messageType);
    }
  }

  private startSystemMonitoring() {
    setInterval(() => {
      this.updateSystemMetrics();
    }, 5000);
  }

  private updateSystemMetrics() {
    this.systemMetrics.totalTasks = this.taskQueue.length + this.activeTasks.size;
    this.systemMetrics.activeTasks = this.activeTasks.size;
    this.systemMetrics.orchestratorStatus = this.activeTasks.size > 0 ? 'busy' : 'ready';
  }

  async processUserRequest(request: string, context?: any): Promise<string> {
    if (!this.isInitialized) {
      throw new Error('Master Control Program not initialized');
    }

    console.log('🧠 MCP: Processing user request:', request);

    try {
      // Create comprehensive task
      const task: MCPTask = {
        id: `mcp_task_${Date.now()}`,
        type: 'reasoning',
        priority: 'high',
        status: 'queued',
        payload: {
          userRequest: request,
          context: context,
          timestamp: new Date().toISOString()
        },
        createdAt: new Date()
      };

      // Add to task queue
      this.taskQueue.push(task);
      this.systemMetrics.totalTasks++;

      // Process immediately for high priority
      const result = await this.executeTask(task);
      
      return result;

    } catch (error) {
      console.error('❌ MCP: Request processing failed:', error);
      throw error;
    }
  }

  private async executeTask(task: MCPTask): Promise<string> {
    console.log(`🔄 MCP: Executing task ${task.id}`);
    
    task.status = 'processing';
    this.activeTasks.set(task.id, task);

    try {
      let result: string;

      switch (task.type) {
        case 'reasoning':
          result = await this.executeReasoningTask(task);
          break;
        case 'generation':
          result = await this.executeGenerationTask(task);
          break;
        case 'analysis':
          result = await this.executeAnalysisTask(task);
          break;
        case 'orchestration':
          result = await this.executeOrchestrationTask(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }

      task.status = 'completed';
      task.result = result;
      task.completedAt = new Date();
      this.systemMetrics.completedTasks++;

      console.log(`✅ MCP: Task ${task.id} completed successfully`);
      return result;

    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`❌ MCP: Task ${task.id} failed:`, error);
      throw error;
    } finally {
      this.activeTasks.delete(task.id);
    }
  }

  private async executeReasoningTask(task: MCPTask): Promise<string> {
    const { userRequest, context } = task.payload;

    // Step 1: Enhance context with RAG data
    const ragResults = await ragDatabase.query({
      query: userRequest,
      limit: 10,
      threshold: 0.7
    });

    // Step 2: Perform advanced reasoning with DeepSeek
    const reasoningResult = await this.deepSeekCore.performAdvancedReasoning({
      projectId: context?.projectId || 'default',
      userQuery: userRequest,
      previousContext: context?.previousContext,
      systemInstructions: this.getSystemInstructions(),
      ragContext: ragResults.results || []
    });

    // Step 3: Coordinate with orchestrator for implementation
    if (reasoningResult.nextActions && reasoningResult.nextActions.length > 0) {
      await sovereignOrchestrator.processUserRequest(userRequest);
    }

    // Step 4: Generate contextual response
    const response = await ragDatabase.createContextualResponse(
      userRequest,
      ragResults,
      `Based on advanced reasoning analysis:
      
Reasoning: ${reasoningResult.reasoning}
Conclusion: ${reasoningResult.conclusion}
Confidence: ${reasoningResult.confidence}
Next Actions: ${reasoningResult.nextActions?.join(', ') || 'None'}

Please provide a comprehensive response that incorporates this analysis.`
    );

    return response;
  }

  private async executeGenerationTask(task: MCPTask): Promise<string> {
    // Use MCP Hub tools for generation
    const result = await mcpHub.executeTool('code_generate', {
      specification: task.payload.specification,
      framework: task.payload.framework || 'react',
      style: task.payload.style || 'typescript'
    });

    return JSON.stringify(result);
  }

  private async executeAnalysisTask(task: MCPTask): Promise<string> {
    // Use MCP Hub for analysis
    const result = await mcpHub.executeTool('code_analyze', {
      code: task.payload.code,
      language: task.payload.language,
      checkTypes: task.payload.checkTypes || ['syntax', 'style', 'security']
    });

    return JSON.stringify(result);
  }

  private async executeOrchestrationTask(task: MCPTask): Promise<string> {
    // Delegate to sovereign orchestrator
    const executionId = await sovereignOrchestrator.processUserRequest(task.payload.request);
    return `Orchestration task initiated with execution ID: ${executionId}`;
  }

  private async processTaskRequest(message: any) {
    const task: MCPTask = {
      id: `external_${Date.now()}`,
      type: message.payload.taskType || 'reasoning',
      priority: message.payload.priority || 'medium',
      status: 'queued',
      payload: message.payload,
      createdAt: new Date()
    };

    const result = await this.executeTask(task);

    // Send response back via A2A
    await a2aProtocol.sendMessage({
      fromAgent: 'master_control_program',
      toAgent: message.fromAgent,
      messageType: 'response',
      payload: {
        taskId: task.id,
        result: result,
        status: task.status
      },
      priority: 'high',
      requiresResponse: false
    });
  }

  private async processReasoningRequest(message: any) {
    const result = await this.deepSeekCore.performAdvancedReasoning({
      projectId: message.payload.projectId,
      userQuery: message.payload.query,
      previousContext: message.payload.context,
      systemInstructions: this.getSystemInstructions()
    });

    await a2aProtocol.sendMessage({
      fromAgent: 'master_control_program',
      toAgent: message.fromAgent,
      messageType: 'data',
      payload: result,
      priority: 'high',
      requiresResponse: false
    });
  }

  private async sendSystemStatus(toAgent: string) {
    await a2aProtocol.sendMessage({
      fromAgent: 'master_control_program',
      toAgent: toAgent,
      messageType: 'status',
      payload: this.systemMetrics,
      priority: 'medium',
      requiresResponse: false
    });
  }

  private getDeepSeekApiKey(): string {
    // In production, this would be retrieved from secure storage
    return process.env.DEEPSEEK_API_KEY || '';
  }

  private getSystemInstructions(): string {
    return `You are the Master Control Program's reasoning engine. You have access to:
    - Complete RAG 2.0 Database with contextual knowledge
    - MCP Hub with specialized tools
    - A2A Protocol for agent coordination
    - Sovereign Orchestrator for task execution
    
    Your role is to provide advanced reasoning and decision-making for complex software development tasks.
    Always consider the full system architecture and provide actionable insights.`;
  }

  // Public API methods
  getSystemStatus(): SystemStatus {
    return { ...this.systemMetrics };
  }

  getTasks(): MCPTask[] {
    return [...this.taskQueue, ...Array.from(this.activeTasks.values())];
  }

  async shutdownSystem(): Promise<void> {
    console.log('🔄 MCP: Initiating system shutdown...');
    
    // Wait for active tasks to complete
    while (this.activeTasks.size > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('✅ MCP: System shutdown complete');
  }
}

export const masterControlProgram = new MasterControlProgram();
