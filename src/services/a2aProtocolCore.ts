import { v4 as uuidv4 } from 'uuid';

interface A2AAgent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'busy' | 'offline';
  lastActivity: Date;
  currentTasks?: string[];
  role: string;
  description: string;
}

interface A2AMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  type: 'task' | 'response' | 'coordination' | 'heartbeat';
  content: any;
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high';
}

class A2AProtocolCore {
  private agents: Map<string, A2AAgent> = new Map();
  private messageQueue: A2AMessage[] = [];
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;

    console.log('🤝 A2A Protocol: Initializing Sovereign AI Agent Swarm');
    
    // Register the Sovereign AI Development Environment agents as per the blueprint
    await this.registerAgent({
      name: 'Orchestrator Agent',
      type: 'orchestrator',
      role: '🧠 Project Manager',
      description: 'The project manager. Receives user prompts, uses DeepSeek for high-level reasoning to decompose goals into task trees, and assigns tasks to other agents via A2A.',
      capabilities: [
        'task_decomposition', 
        'deepseek_reasoning', 
        'project_management', 
        'task_assignment', 
        'priority_scheduling',
        'workflow_orchestration'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Architect Agent',
      type: 'architect',
      role: '🏗️ System Designer',
      description: 'Designs application structure. Creates file/folder layouts, defines database schemas, and outlines API contracts.',
      capabilities: [
        'system_architecture', 
        'database_design', 
        'api_contracts', 
        'file_structure_design',
        'schema_creation',
        'component_planning'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Frontend Builder Agent',
      type: 'frontend_builder',
      role: '🛠️ Frontend Coder',
      description: 'Specialized coder for frontend development. Writes, modifies, and deletes React/TypeScript code based on architectural specs.',
      capabilities: [
        'react_development', 
        'typescript_coding', 
        'component_creation', 
        'ui_implementation',
        'frontend_logic',
        'styling_implementation'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Backend Builder Agent',
      type: 'backend_builder',
      role: '🛠️ Backend Coder',
      description: 'Specialized coder for backend development. Creates APIs, database operations, and server-side logic.',
      capabilities: [
        'api_development', 
        'database_operations', 
        'server_logic', 
        'authentication_systems',
        'backend_integration',
        'supabase_integration'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Validator Agent',
      type: 'validator',
      role: '🔎 Quality Assurance Expert',
      description: 'The QA expert. Runs linters, type-checkers, unit tests, and validates code against requirements. Checks for build errors.',
      capabilities: [
        'code_validation', 
        'linting', 
        'type_checking', 
        'unit_testing',
        'build_validation',
        'error_detection'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Optimizer Agent',
      type: 'optimizer',
      role: '✨ Refactoring Specialist',
      description: 'Reviews code for performance improvements, better readability, and security vulnerabilities.',
      capabilities: [
        'performance_optimization', 
        'code_refactoring', 
        'security_analysis', 
        'readability_improvement',
        'best_practices_enforcement',
        'vulnerability_detection'
      ],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Librarian Agent',
      type: 'librarian',
      role: '📚 Knowledge Manager',
      description: 'Manages the RAG knowledge base. Ingests new documentation and provides relevant context to other agents when requested.',
      capabilities: [
        'knowledge_management', 
        'rag_operations', 
        'documentation_analysis', 
        'context_provision',
        'information_retrieval',
        'learning_coordination'
      ],
      status: 'active'
    });

    this.isInitialized = true;
    console.log('🤝 A2A Protocol: Sovereign AI Agent Swarm initialized with 7 specialized agents');
  }

  async registerAgent(agentData: Omit<A2AAgent, 'id' | 'lastActivity'>): Promise<string> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const agent: A2AAgent = {
      id: agentId,
      ...agentData,
      lastActivity: new Date()
    };

    this.agents.set(agentId, agent);
    
    console.log(`🤝 A2A Protocol: Registered ${agent.role} - ${agent.name} (${agentId})`);
    return agentId;
  }

  async sendMessage(messageData: Omit<A2AMessage, 'id' | 'timestamp'>): Promise<void> {
    const message: A2AMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...messageData,
      timestamp: new Date()
    };

    this.messageQueue.push(message);
    
    // Update sender's last activity
    const sender = this.agents.get(message.fromAgent);
    if (sender) {
      sender.lastActivity = new Date();
      this.agents.set(message.fromAgent, sender);
    }

    console.log(`🤝 A2A Protocol: Message sent from ${message.fromAgent} to ${message.toAgent}`);
    
    // Process message immediately for demo purposes
    await this.processMessage(message);
  }

  private async processMessage(message: A2AMessage): Promise<void> {
    const recipient = this.agents.get(message.toAgent);
    if (!recipient) {
      console.warn(`🤝 A2A Protocol: Recipient agent ${message.toAgent} not found`);
      return;
    }

    // Update recipient's status and last activity
    recipient.status = 'busy';
    recipient.lastActivity = new Date();
    this.agents.set(message.toAgent, recipient);

    // Simulate processing time
    setTimeout(() => {
      recipient.status = 'active';
      this.agents.set(message.toAgent, recipient);
    }, 2000);
  }

  async coordinateTask(taskDescription: string, requiredCapabilities: string[]): Promise<string[]> {
    const suitableAgents = Array.from(this.agents.values())
      .filter(agent => 
        agent.status === 'active' && 
        requiredCapabilities.some(capability => 
          agent.capabilities.includes(capability)
        )
      )
      .map(agent => agent.id);

    console.log(`🤝 A2A Protocol: Found ${suitableAgents.length} suitable agents for task coordination`);
    return suitableAgents;
  }

  getAgents(): A2AAgent[] {
    return Array.from(this.agents.values());
  }

  getAllAgents(): A2AAgent[] {
    return this.getAgents();
  }

  getAgent(agentId: string): A2AAgent | undefined {
    return this.agents.get(agentId);
  }

  getMessageHistory(): A2AMessage[] {
    return [...this.messageQueue];
  }

  async updateAgentStatus(agentId: string, status: A2AAgent['status']): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date();
      this.agents.set(agentId, agent);
    }
  }
}

export const a2aProtocol = new A2AProtocolCore();
