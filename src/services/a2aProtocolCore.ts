
import { supabase } from '@/integrations/supabase/client';

export interface A2AMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  messageType: 'task' | 'response' | 'status' | 'data' | 'error';
  payload: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresResponse: boolean;
  parentMessageId?: string;
}

export interface AgentRegistration {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'busy' | 'idle' | 'offline';
  lastHeartbeat: Date;
  currentTasks: string[];
}

export class A2AProtocolCore {
  private agents = new Map<string, AgentRegistration>();
  private messageQueue = new Map<string, A2AMessage[]>();
  private eventListeners = new Map<string, Function[]>();
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeProtocol();
  }

  private initializeProtocol() {
    console.log('🤖 A2A Protocol: Initializing communication fabric');
    this.startHeartbeatMonitoring();
    this.setupMessageRouting();
  }

  async registerAgent(agent: Omit<AgentRegistration, 'lastHeartbeat'>): Promise<boolean> {
    const registration: AgentRegistration = {
      ...agent,
      lastHeartbeat: new Date()
    };

    this.agents.set(agent.id, registration);
    this.messageQueue.set(agent.id, []);

    // Store in database
    try {
      const { error } = await supabase
        .from('agents')
        .upsert({
          id: agent.id,
          name: agent.name,
          type: agent.type as any,
          capabilities: agent.capabilities,
          status: agent.status as any
        });

      if (error) throw error;

      console.log(`✅ A2A Protocol: Agent ${agent.name} registered successfully`);
      this.emitEvent('agentRegistered', registration);
      return true;
    } catch (error) {
      console.error('Failed to register agent:', error);
      return false;
    }
  }

  async sendMessage(message: Omit<A2AMessage, 'id' | 'timestamp'>): Promise<string> {
    const fullMessage: A2AMessage = {
      ...message,
      id: `a2a-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // Validate recipient exists
    if (!this.agents.has(message.toAgent)) {
      throw new Error(`Agent ${message.toAgent} not found`);
    }

    // Add to message queue
    const queue = this.messageQueue.get(message.toAgent) || [];
    queue.push(fullMessage);
    this.messageQueue.set(message.toAgent, queue);

    // Store in conversation system
    await this.storeMessage(fullMessage);

    // Emit events
    this.emitEvent('messageQueued', fullMessage);
    this.emitEvent(`message:${message.toAgent}`, fullMessage);

    console.log(`📨 A2A Protocol: Message sent from ${message.fromAgent} to ${message.toAgent}`);
    return fullMessage.id;
  }

  async getMessages(agentId: string, limit: number = 10): Promise<A2AMessage[]> {
    const queue = this.messageQueue.get(agentId) || [];
    const messages = queue.slice(-limit);
    
    // Clear retrieved messages from queue
    this.messageQueue.set(agentId, queue.slice(0, -limit));
    
    return messages;
  }

  async broadcastMessage(
    fromAgent: string,
    messageType: A2AMessage['messageType'],
    payload: any,
    targetCapabilities?: string[]
  ): Promise<string[]> {
    const messageIds: string[] = [];
    
    for (const [agentId, agent] of this.agents) {
      if (agentId === fromAgent) continue;
      
      // Filter by capabilities if specified
      if (targetCapabilities && !targetCapabilities.some(cap => agent.capabilities.includes(cap))) {
        continue;
      }

      const messageId = await this.sendMessage({
        fromAgent,
        toAgent: agentId,
        messageType,
        payload,
        priority: 'medium',
        requiresResponse: false
      });
      
      messageIds.push(messageId);
    }

    return messageIds;
  }

  async orchestrateTaskFlow(
    orchestratorId: string,
    taskPlan: {
      taskId: string;
      description: string;
      requiredCapabilities: string[];
      dependencies: string[];
      priority: A2AMessage['priority'];
    }[]
  ): Promise<Map<string, string>> {
    const taskAssignments = new Map<string, string>();

    for (const task of taskPlan) {
      // Find available agent with required capabilities
      const availableAgent = this.findAvailableAgent(task.requiredCapabilities);
      
      if (!availableAgent) {
        console.warn(`No available agent found for task ${task.taskId}`);
        continue;
      }

      // Send task assignment
      const messageId = await this.sendMessage({
        fromAgent: orchestratorId,
        toAgent: availableAgent.id,
        messageType: 'task',
        payload: {
          taskId: task.taskId,
          description: task.description,
          dependencies: task.dependencies,
          deadline: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        },
        priority: task.priority,
        requiresResponse: true
      });

      taskAssignments.set(task.taskId, availableAgent.id);
      
      // Update agent status
      availableAgent.status = 'busy';
      availableAgent.currentTasks.push(task.taskId);
    }

    return taskAssignments;
  }

  private findAvailableAgent(requiredCapabilities: string[]): AgentRegistration | null {
    for (const agent of this.agents.values()) {
      if (agent.status !== 'idle') continue;
      
      const hasCapabilities = requiredCapabilities.every(cap => 
        agent.capabilities.includes(cap)
      );
      
      if (hasCapabilities) return agent;
    }
    
    return null;
  }

  private async storeMessage(message: A2AMessage): Promise<void> {
    try {
      // Find or create conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('title', `A2A:${message.fromAgent}:${message.toAgent}`)
        .single();

      let conversationId = conversation?.id;

      if (!conversationId) {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            title: `A2A:${message.fromAgent}:${message.toAgent}`,
            user_id: (await supabase.auth.getUser()).data.user?.id || '',
            metadata: {
              type: 'a2a_communication',
              participants: [message.fromAgent, message.toAgent]
            }
          })
          .select('id')
          .single();

        if (error) throw error;
        conversationId = newConv.id;
      }

      // Store message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: message.fromAgent,
          sender_type: 'agent' as any,
          content: JSON.stringify(message.payload),
          metadata: {
            messageType: message.messageType,
            priority: message.priority,
            requiresResponse: message.requiresResponse
          }
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store A2A message:', error);
    }
  }

  private startHeartbeatMonitoring() {
    this.heartbeatInterval = setInterval(() => {
      const cutoffTime = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
      
      for (const [agentId, agent] of this.agents) {
        if (agent.lastHeartbeat < cutoffTime && agent.status !== 'offline') {
          agent.status = 'offline';
          this.emitEvent('agentOffline', agent);
          console.warn(`⚠️ A2A Protocol: Agent ${agent.name} went offline`);
        }
      }
    }, 60000); // Check every minute
  }

  private setupMessageRouting() {
    // Setup real-time message routing via Supabase
    const channel = supabase.channel('a2a-messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const message = payload.new;
          if (message.metadata?.type === 'a2a_communication') {
            this.handleIncomingMessage(message);
          }
        }
      )
      .subscribe();
  }

  private handleIncomingMessage(dbMessage: any) {
    try {
      const payload = JSON.parse(dbMessage.content);
      const a2aMessage: A2AMessage = {
        id: dbMessage.id,
        fromAgent: dbMessage.sender_id,
        toAgent: '', // Will be determined from metadata
        messageType: dbMessage.metadata.messageType,
        payload,
        timestamp: new Date(dbMessage.created_at),
        priority: dbMessage.metadata.priority,
        requiresResponse: dbMessage.metadata.requiresResponse
      };

      this.emitEvent('messageReceived', a2aMessage);
    } catch (error) {
      console.error('Failed to process incoming A2A message:', error);
    }
  }

  addEventListener(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  private emitEvent(event: string, data: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  async heartbeat(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.lastHeartbeat = new Date();
      if (agent.status === 'offline') {
        agent.status = 'idle';
        this.emitEvent('agentOnline', agent);
      }
      return true;
    }
    return false;
  }

  getAgentStatus(agentId: string): AgentRegistration | null {
    return this.agents.get(agentId) || null;
  }

  getAllAgents(): AgentRegistration[] {
    return Array.from(this.agents.values());
  }

  async shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Mark all agents as offline
    for (const agent of this.agents.values()) {
      agent.status = 'offline';
    }
    
    console.log('🔌 A2A Protocol: System shutdown complete');
  }
}

export const a2aProtocol = new A2AProtocolCore();
