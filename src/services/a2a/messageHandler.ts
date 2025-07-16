
import { A2AMessage, A2AAgent } from './types';
import { AgentRegistry } from './agentRegistry';

export class MessageHandler {
  private messageQueue: A2AMessage[] = [];
  private agentRegistry: AgentRegistry;

  constructor(agentRegistry: AgentRegistry) {
    this.agentRegistry = agentRegistry;
  }

  async sendMessage(messageData: Omit<A2AMessage, 'id' | 'timestamp'>): Promise<void> {
    const message: A2AMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...messageData,
      timestamp: new Date()
    };

    this.messageQueue.push(message);
    
    // Update sender's last activity
    const sender = this.agentRegistry.getAgent(message.fromAgent);
    if (sender) {
      sender.lastActivity = new Date();
    }

    console.log(`🤝 A2A Protocol: Message sent from ${message.fromAgent} to ${message.toAgent}`);
    
    // Process message immediately for demo purposes
    await this.processMessage(message);
  }

  private async processMessage(message: A2AMessage): Promise<void> {
    const recipient = this.agentRegistry.getAgent(message.toAgent);
    if (!recipient) {
      console.warn(`🤝 A2A Protocol: Recipient agent ${message.toAgent} not found`);
      return;
    }

    // Update recipient's status and last activity
    await this.agentRegistry.updateAgentStatus(message.toAgent, 'busy');

    // Simulate processing time
    setTimeout(async () => {
      await this.agentRegistry.updateAgentStatus(message.toAgent, 'active');
    }, 2000);
  }

  async coordinateTask(taskDescription: string, requiredCapabilities: string[]): Promise<string[]> {
    const agents = this.agentRegistry.getAgents();
    const suitableAgents = agents
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

  getMessageHistory(): A2AMessage[] {
    return [...this.messageQueue];
  }
}
