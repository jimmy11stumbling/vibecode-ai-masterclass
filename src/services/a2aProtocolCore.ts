
import { AgentRegistry } from './a2a/agentRegistry';
import { MessageHandler } from './a2a/messageHandler';
import { A2AAgent, A2AMessage } from './a2a/types';

class A2AProtocolCore {
  private agentRegistry: AgentRegistry;
  private messageHandler: MessageHandler;
  private isInitialized = false;

  constructor() {
    this.agentRegistry = new AgentRegistry();
    this.messageHandler = new MessageHandler(this.agentRegistry);
  }

  async initialize() {
    if (this.isInitialized) return;

    console.log('🤝 A2A Protocol: Initializing Sovereign AI Agent Swarm');
    
    await this.agentRegistry.initializeDefaultAgents();
    
    this.isInitialized = true;
    console.log('🤝 A2A Protocol: Sovereign AI Agent Swarm initialized with 7 specialized agents');
  }

  async registerAgent(agentData: Omit<A2AAgent, 'id' | 'lastActivity'>): Promise<string> {
    return await this.agentRegistry.registerAgent(agentData);
  }

  async sendMessage(messageData: Omit<A2AMessage, 'id' | 'timestamp'>): Promise<void> {
    return await this.messageHandler.sendMessage(messageData);
  }

  async coordinateTask(taskDescription: string, requiredCapabilities: string[]): Promise<string[]> {
    return await this.messageHandler.coordinateTask(taskDescription, requiredCapabilities);
  }

  getAgents(): A2AAgent[] {
    return this.agentRegistry.getAgents();
  }

  getAllAgents(): A2AAgent[] {
    return this.getAgents();
  }

  getAgent(agentId: string): A2AAgent | undefined {
    return this.agentRegistry.getAgent(agentId);
  }

  getMessageHistory(): A2AMessage[] {
    return this.messageHandler.getMessageHistory();
  }

  async updateAgentStatus(agentId: string, status: A2AAgent['status']): Promise<void> {
    return await this.agentRegistry.updateAgentStatus(agentId, status);
  }
}

export const a2aProtocol = new A2AProtocolCore();

// Re-export types for convenience
export type { A2AAgent, A2AMessage } from './a2a/types';
