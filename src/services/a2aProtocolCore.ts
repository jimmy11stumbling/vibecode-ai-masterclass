
import { supabase } from '@/integrations/supabase/client';

interface A2AAgent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'busy' | 'offline';
  currentTasks: string[];
}

interface A2AMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  messageType: 'task' | 'response' | 'notification' | 'coordination';
  payload: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requiresResponse: boolean;
  timestamp: Date;
}

class A2AProtocolCore {
  private agents: Map<string, A2AAgent> = new Map();
  private messageQueue: A2AMessage[] = [];
  private messageHandlers: Map<string, Function[]> = new Map();
  private isInitialized = false;
  private processingInterval: NodeJS.Timeout | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      console.log('🤝 A2A Protocol: Initializing...');
      
      // Load agents from database
      await this.loadAgentsFromDatabase();
      
      // Initialize default agents
      await this.initializeDefaultAgents();
      
      // Start message processing
      this.startMessageProcessing();
      
      this.isInitialized = true;
      console.log('✅ A2A Protocol: Initialized successfully');
    } catch (error) {
      console.error('❌ A2A Protocol: Initialization failed:', error);
      throw error;
    }
  }

  private async loadAgentsFromDatabase() {
    const { data: agentsData, error } = await supabase
      .from('agents')
      .select('*')
      .eq('status', 'active');

    if (error) {
      console.warn('Warning: Could not load agents from database:', error);
      return;
    }

    if (agentsData) {
      agentsData.forEach(agent => {
        // Generate proper UUID for agent ID
        const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.agents.set(agentId, {
          id: agentId,
          name: agent.name,
          type: agent.type,
          capabilities: agent.capabilities || [],
          status: agent.status,
          currentTasks: []
        });
      });
    }
  }

  private async initializeDefaultAgents() {
    const defaultAgents: A2AAgent[] = [
      {
        id: 'orchestrator',
        name: 'Orchestrator Agent',
        type: 'coordination',
        capabilities: ['task_planning', 'agent_coordination', 'progress_monitoring'],
        status: 'active',
        currentTasks: []
      },
      {
        id: 'architect',
        name: 'Architect Agent',
        type: 'design',
        capabilities: ['system_design', 'database_schema', 'api_design', 'file_structure'],
        status: 'active',
        currentTasks: []
      },
      {
        id: 'frontend_builder',
        name: 'Frontend Builder Agent',
        type: 'development',
        capabilities: ['react_development', 'ui_components', 'styling', 'state_management'],
        status: 'active',
        currentTasks: []
      },
      {
        id: 'backend_builder',
        name: 'Backend Builder Agent',
        type: 'development',
        capabilities: ['api_development', 'database_operations', 'authentication', 'business_logic'],
        status: 'active',
        currentTasks: []
      },
      {
        id: 'validator',
        name: 'Validator Agent',
        type: 'qa',
        capabilities: ['code_validation', 'testing', 'quality_assurance', 'error_detection'],
        status: 'active',
        currentTasks: []
      },
      {
        id: 'optimizer',
        name: 'Optimizer Agent',
        type: 'enhancement',
        capabilities: ['performance_optimization', 'code_refactoring', 'security_analysis', 'best_practices'],
        status: 'active',
        currentTasks: []
      }
    ];

    for (const agent of defaultAgents) {
      if (!this.agents.has(agent.id)) {
        this.agents.set(agent.id, agent);
        
        // Try to register in database with proper UUID
        try {
          const agentId = crypto.randomUUID();
          await supabase.from('agents').insert({
            id: agentId,
            name: agent.name,
            type: agent.type,
            capabilities: agent.capabilities,
            status: agent.status,
            description: `Default ${agent.name}`,
            config: {}
          });
        } catch (error) {
          console.warn(`Could not register agent ${agent.id} in database:`, error);
        }
      }
    }
  }

  async registerAgent(agent: A2AAgent) {
    this.agents.set(agent.id, agent);
    
    try {
      const agentId = crypto.randomUUID();
      await supabase.from('agents').insert({
        id: agentId,
        name: agent.name,
        type: agent.type,
        capabilities: agent.capabilities,
        status: agent.status,
        description: agent.name,
        config: {}
      });
    } catch (error) {
      console.warn(`Could not register agent ${agent.id} in database:`, error);
    }
    
    console.log(`🤖 A2A: Registered agent ${agent.id}`);
  }

  async sendMessage(message: Omit<A2AMessage, 'id' | 'timestamp'>) {
    const fullMessage: A2AMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.messageQueue.push(fullMessage);
    console.log(`📨 A2A: Queued message from ${message.fromAgent} to ${message.toAgent}`);
    
    return fullMessage.id;
  }

  private startMessageProcessing() {
    if (this.processingInterval) return;
    
    this.processingInterval = setInterval(() => {
      this.processMessageQueue();
    }, 100);
  }

  private async processMessageQueue() {
    if (this.messageQueue.length === 0) return;

    // Sort by priority
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const message = this.messageQueue.shift();
    if (!message) return;

    try {
      await this.deliverMessage(message);
    } catch (error) {
      console.error(`❌ A2A: Failed to deliver message ${message.id}:`, error);
    }
  }

  private async deliverMessage(message: A2AMessage) {
    const targetAgent = this.agents.get(message.toAgent);
    if (!targetAgent) {
      console.warn(`⚠️ A2A: Target agent ${message.toAgent} not found`);
      return;
    }

    // Update agent status
    if (message.messageType === 'task') {
      targetAgent.status = 'busy';
      targetAgent.currentTasks.push(message.id);
    }

    // Emit to message handlers
    const handlers = this.messageHandlers.get(message.toAgent) || [];
    handlers.forEach(handler => {
      try {
        handler(message);
      } catch (error) {
        console.error(`Error in message handler for ${message.toAgent}:`, error);
      }
    });

    console.log(`✅ A2A: Delivered message ${message.id} to ${message.toAgent}`);

    // Auto-generate response for simulation
    if (message.requiresResponse) {
      setTimeout(() => {
        this.generateAutoResponse(message);
      }, 1000 + Math.random() * 2000);
    }
  }

  private async generateAutoResponse(originalMessage: A2AMessage) {
    const responseMessage: Omit<A2AMessage, 'id' | 'timestamp'> = {
      fromAgent: originalMessage.toAgent,
      toAgent: originalMessage.fromAgent,
      messageType: 'response',
      payload: {
        originalMessageId: originalMessage.id,
        status: 'completed',
        result: `Task completed by ${originalMessage.toAgent}`,
        executionTime: 1000 + Math.random() * 2000
      },
      priority: 'medium',
      requiresResponse: false
    };

    await this.sendMessage(responseMessage);

    // Update agent status
    const agent = this.agents.get(originalMessage.toAgent);
    if (agent) {
      agent.status = 'idle';
      agent.currentTasks = agent.currentTasks.filter(taskId => taskId !== originalMessage.id);
    }
  }

  addMessageHandler(agentId: string, handler: (message: A2AMessage) => void) {
    if (!this.messageHandlers.has(agentId)) {
      this.messageHandlers.set(agentId, []);
    }
    this.messageHandlers.get(agentId)!.push(handler);
  }

  removeMessageHandler(agentId: string, handler: (message: A2AMessage) => void) {
    const handlers = this.messageHandlers.get(agentId);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  getAgents(): A2AAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(id: string): A2AAgent | undefined {
    return this.agents.get(id);
  }

  getAgentsByType(type: string): A2AAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  getAgentsByCapability(capability: string): A2AAgent[] {
    return Array.from(this.agents.values()).filter(agent => 
      agent.capabilities.includes(capability)
    );
  }

  getMessageQueue(): A2AMessage[] {
    return [...this.messageQueue];
  }

  getAgentStats() {
    const agents = Array.from(this.agents.values());
    return {
      total: agents.length,
      active: agents.filter(a => a.status === 'active').length,
      busy: agents.filter(a => a.status === 'busy').length,
      idle: agents.filter(a => a.status === 'idle').length,
      offline: agents.filter(a => a.status === 'offline').length,
      queuedMessages: this.messageQueue.length
    };
  }

  destroy() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
    this.agents.clear();
    this.messageQueue.length = 0;
    this.messageHandlers.clear();
    this.isInitialized = false;
  }
}

export const a2aProtocol = new A2AProtocolCore();
