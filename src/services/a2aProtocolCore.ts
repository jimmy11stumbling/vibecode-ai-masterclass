
import { supabase } from '@/integrations/supabase/client';

export interface A2AAgent {
  id: string;
  name: string;
  type: 'conversation' | 'document' | 'rag' | 'router';
  status: 'active' | 'idle' | 'offline' | 'busy';
  capabilities: string[];
  config?: any;
  currentTasks?: string[];
  lastActivity?: Date;
}

export interface A2AMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  type: 'task' | 'response' | 'notification' | 'coordination';
  content: any;
  metadata?: any;
  timestamp: Date;
}

export interface A2AConversation {
  id: string;
  agents: string[];
  title: string;
  status: 'active' | 'paused' | 'completed';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

class A2AProtocolCore {
  private agents: Map<string, A2AAgent> = new Map();
  private conversations: Map<string, A2AConversation> = new Map();
  private messageHandlers: Map<string, Function[]> = new Map();

  async initialize() {
    console.log('🤖 A2A: Initializing Protocol Core');
    
    try {
      // Load existing agents from database
      const { data: agentsData, error } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'active');

      if (error) {
        console.error('Failed to load agents:', error);
        return;
      }

      // Convert database agents to A2A agents
      if (agentsData) {
        agentsData.forEach(agent => {
          this.agents.set(agent.id, {
            id: agent.id,
            name: agent.name,
            type: agent.type,
            status: agent.status === 'processing' ? 'busy' : agent.status,
            capabilities: agent.capabilities || [],
            config: agent.config,
            currentTasks: [],
            lastActivity: new Date(agent.updated_at || agent.created_at)
          });
        });
      }

      console.log('🤖 A2A: Protocol initialized with', this.agents.size, 'agents');
    } catch (error) {
      console.error('🤖 A2A: Initialization failed:', error);
    }
  }

  async registerAgent(agent: Omit<A2AAgent, 'id' | 'lastActivity'>): Promise<string> {
    const agentId = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Store in database
      const { error } = await supabase
        .from('agents')
        .insert({
          id: agentId,
          name: agent.name,
          type: agent.type,
          status: agent.status === 'busy' ? 'active' : agent.status,
          capabilities: agent.capabilities,
          config: agent.config
        });

      if (error) {
        console.error('Failed to register agent:', error);
        throw error;
      }

      // Store locally
      const fullAgent: A2AAgent = {
        ...agent,
        id: agentId,
        lastActivity: new Date()
      };

      this.agents.set(agentId, fullAgent);
      console.log('🤖 A2A: Registered agent', agent.name);
      
      return agentId;
    } catch (error) {
      console.error('Failed to register agent:', error);
      throw error;
    }
  }

  async unregisterAgent(agentId: string): Promise<void> {
    try {
      // Update status in database
      await supabase
        .from('agents')
        .update({ status: 'offline' })
        .eq('id', agentId);

      // Remove locally
      this.agents.delete(agentId);
      console.log('🤖 A2A: Unregistered agent', agentId);
    } catch (error) {
      console.error('Failed to unregister agent:', error);
    }
  }

  getAgents(): A2AAgent[] {
    return Array.from(this.agents.values());
  }

  getAgent(agentId: string): A2AAgent | undefined {
    return this.agents.get(agentId);
  }

  async sendMessage(message: Omit<A2AMessage, 'id' | 'timestamp'>): Promise<string> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const fullMessage: A2AMessage = {
      ...message,
      id: messageId,
      timestamp: new Date()
    };

    // Notify handlers
    const handlers = this.messageHandlers.get(message.toAgent) || [];
    handlers.forEach(handler => {
      try {
        handler(fullMessage);
      } catch (error) {
        console.error('Message handler error:', error);
      }
    });

    console.log('🤖 A2A: Message sent from', message.fromAgent, 'to', message.toAgent);
    return messageId;
  }

  onMessage(agentId: string, handler: (message: A2AMessage) => void): void {
    if (!this.messageHandlers.has(agentId)) {
      this.messageHandlers.set(agentId, []);
    }
    this.messageHandlers.get(agentId)!.push(handler);
  }

  async createConversation(agents: string[], title: string): Promise<string> {
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversation: A2AConversation = {
      id: conversationId,
      agents,
      title,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.conversations.set(conversationId, conversation);
    console.log('🤖 A2A: Created conversation', title, 'with agents:', agents);
    
    return conversationId;
  }

  getConversations(): A2AConversation[] {
    return Array.from(this.conversations.values());
  }

  async updateAgentStatus(agentId: string, status: A2AAgent['status']): Promise<void> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastActivity = new Date();
      
      // Update in database
      try {
        await supabase
          .from('agents')
          .update({ 
            status: status === 'busy' ? 'active' : status,
            updated_at: new Date().toISOString()
          })
          .eq('id', agentId);
      } catch (error) {
        console.error('Failed to update agent status:', error);
      }
    }
  }

  async broadcastMessage(fromAgent: string, message: any, type: A2AMessage['type'] = 'notification'): Promise<void> {
    const agents = this.getAgents().filter(agent => agent.id !== fromAgent);
    
    for (const agent of agents) {
      await this.sendMessage({
        fromAgent,
        toAgent: agent.id,
        type,
        content: message
      });
    }
  }

  getActiveAgents(): A2AAgent[] {
    return this.getAgents().filter(agent => agent.status === 'active' || agent.status === 'busy');
  }

  async coordinateTask(taskDescription: string, requiredCapabilities: string[]): Promise<string[]> {
    const suitableAgents = this.getAgents().filter(agent => 
      agent.status === 'active' && 
      requiredCapabilities.some(cap => agent.capabilities.includes(cap))
    );

    console.log('🤖 A2A: Found', suitableAgents.length, 'suitable agents for task coordination');
    return suitableAgents.map(agent => agent.id);
  }
}

export const a2aProtocol = new A2AProtocolCore();
