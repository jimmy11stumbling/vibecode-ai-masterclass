import { v4 as uuidv4 } from 'uuid';

interface A2AAgent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'busy' | 'offline';
  lastActivity: Date;
  currentTasks?: string[];
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

    console.log('🤝 A2A Protocol: Initializing Agent-to-Agent communication');
    
    // Register default system agents
    await this.registerAgent({
      name: 'Orchestrator Agent',
      type: 'orchestrator',
      capabilities: ['task_coordination', 'resource_management', 'priority_scheduling'],
      status: 'active'
    });

    await this.registerAgent({
      name: 'Code Generator Agent',
      type: 'code_generator',
      capabilities: ['code_generation', 'refactoring', 'testing'],
      status: 'active'
    });

    await this.registerAgent({
      name: 'UI Designer Agent',
      type: 'ui_designer',
      capabilities: ['ui_design', 'component_creation', 'styling'],
      status: 'active'
    });

    this.isInitialized = true;
    console.log('🤝 A2A Protocol: Agent communication system initialized');
  }

  async registerAgent(agentData: Omit<A2AAgent, 'id' | 'lastActivity'>): Promise<string> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const agent: A2AAgent = {
      id: agentId,
      ...agentData,
      lastActivity: new Date()
    };

    this.agents.set(agentId, agent);
    
    console.log(`🤝 A2A Protocol: Registered agent ${agent.name} (${agentId})`);
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
