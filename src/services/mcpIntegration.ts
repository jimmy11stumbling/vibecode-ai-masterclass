
import { supabase } from '@/integrations/supabase/client';

export interface MCPAgent {
  id: string;
  name: string;
  type: 'conversation' | 'document' | 'rag' | 'router';
  status: 'active' | 'idle' | 'processing' | 'offline';
  capabilities: string[];
  config: Record<string, any>;
}

export interface MCPMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification';
  method?: string;
  params?: any;
  result?: any;
  error?: any;
  timestamp: Date;
}

export interface MCPTool {
  name: string;
  description: string;
  input_schema: any;
  execute: (params: any) => Promise<any>;
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'error';
}

class MCPIntegrationService {
  private agents: Map<string, MCPAgent> = new Map();
  private servers: Map<string, MCPServer> = new Map();
  private messageQueue: MCPMessage[] = [];
  private eventCallbacks: Map<string, Function[]> = new Map();

  constructor() {
    this.initializeDefaultAgents();
    this.startMessageProcessor();
  }

  private initializeDefaultAgents() {
    const defaultAgents: MCPAgent[] = [
      {
        id: 'conversation-agent',
        name: 'Conversation Agent',
        type: 'conversation',
        status: 'active',
        capabilities: ['chat', 'context-understanding', 'response-generation'],
        config: { model: 'deepseek-reasoner', temperature: 0.7 }
      },
      {
        id: 'document-agent',
        name: 'Document Agent',
        type: 'document',
        status: 'active',
        capabilities: ['document-analysis', 'text-extraction', 'summarization'],
        config: { maxDocumentSize: '10MB', supportedFormats: ['pdf', 'docx', 'txt'] }
      },
      {
        id: 'rag-agent',
        name: 'RAG Agent',
        type: 'rag',
        status: 'active',
        capabilities: ['vector-search', 'knowledge-retrieval', 'semantic-matching'],
        config: { embeddingModel: 'text-embedding-ada-002', topK: 5 }
      },
      {
        id: 'router-agent',
        name: 'Router Agent',
        type: 'router',
        status: 'active',
        capabilities: ['request-routing', 'load-balancing', 'task-coordination'],
        config: { routingStrategy: 'capability-based' }
      }
    ];

    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  private startMessageProcessor() {
    setInterval(() => {
      this.processMessageQueue();
    }, 100);
  }

  private async processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        await this.handleMessage(message);
      }
    }
  }

  private async handleMessage(message: MCPMessage) {
    const targetAgent = this.agents.get(message.to);
    if (!targetAgent) {
      console.error(`Agent ${message.to} not found`);
      return;
    }

    // Process message based on agent type and capabilities
    switch (targetAgent.type) {
      case 'conversation':
        await this.handleConversationMessage(message, targetAgent);
        break;
      case 'document':
        await this.handleDocumentMessage(message, targetAgent);
        break;
      case 'rag':
        await this.handleRAGMessage(message, targetAgent);
        break;
      case 'router':
        await this.handleRouterMessage(message, targetAgent);
        break;
    }

    this.emitEvent('message-processed', { message, agent: targetAgent });
  }

  private async handleConversationMessage(message: MCPMessage, agent: MCPAgent) {
    if (message.method === 'generate-response') {
      const response = await this.generateAIResponse(message.params?.prompt, agent.config);
      this.sendMessage({
        from: agent.id,
        to: message.from,
        type: 'response',
        result: { response }
      });
    }
  }

  private async handleDocumentMessage(message: MCPMessage, agent: MCPAgent) {
    if (message.method === 'analyze-document') {
      const analysis = await this.analyzeDocument(message.params?.document);
      this.sendMessage({
        from: agent.id,
        to: message.from,
        type: 'response',
        result: analysis
      });
    }
  }

  private async handleRAGMessage(message: MCPMessage, agent: MCPAgent) {
    if (message.method === 'search-knowledge') {
      const results = await this.searchKnowledgeBase(message.params?.query);
      this.sendMessage({
        from: agent.id,
        to: message.from,
        type: 'response',
        result: { results }
      });
    }
  }

  private async handleRouterMessage(message: MCPMessage, agent: MCPAgent) {
    if (message.method === 'route-request') {
      const targetAgentId = this.selectBestAgent(message.params?.capabilities);
      if (targetAgentId) {
        message.to = targetAgentId;
        this.messageQueue.push(message);
      }
    }
  }

  private async generateAIResponse(prompt: string, config: any): Promise<string> {
    try {
      // In production, this would call the actual DeepSeek API
      // For now, return a simulated response
      return `AI Response to: ${prompt}`;
    } catch (error) {
      console.error('Error generating AI response:', error);
      return 'Error generating response';
    }
  }

  private async analyzeDocument(document: any): Promise<any> {
    try {
      // Document analysis logic would go here
      return {
        summary: 'Document analysis complete',
        keyPoints: ['Point 1', 'Point 2', 'Point 3'],
        metadata: { pages: 5, words: 1000 }
      };
    } catch (error) {
      console.error('Error analyzing document:', error);
      return { error: 'Document analysis failed' };
    }
  }

  private async searchKnowledgeBase(query: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('knowledge_embeddings')
        .select('*')
        .textSearch('chunk_text', query)
        .limit(5);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      return [];
    }
  }

  private selectBestAgent(requiredCapabilities: string[]): string | null {
    for (const [id, agent] of this.agents) {
      if (agent.status === 'active' && 
          requiredCapabilities.every(cap => agent.capabilities.includes(cap))) {
        return id;
      }
    }
    return null;
  }

  // Public API methods
  public sendMessage(message: Omit<MCPMessage, 'id' | 'timestamp'>) {
    const fullMessage: MCPMessage = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    this.messageQueue.push(fullMessage);
  }

  public registerAgent(agent: MCPAgent) {
    this.agents.set(agent.id, agent);
    this.emitEvent('agent-registered', agent);
  }

  public getAgents(): MCPAgent[] {
    return Array.from(this.agents.values());
  }

  public getAgent(id: string): MCPAgent | undefined {
    return this.agents.get(id);
  }

  public registerServer(server: MCPServer) {
    this.servers.set(server.id, server);
    this.emitEvent('server-registered', server);
  }

  public getServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  public addEventListener(event: string, callback: Function) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, []);
    }
    this.eventCallbacks.get(event)!.push(callback);
  }

  public removeEventListener(event: string, callback: Function) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emitEvent(event: string, data: any) {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  public async executeToolOnServer(serverId: string, toolName: string, params: any) {
    const server = this.servers.get(serverId);
    if (!server) {
      throw new Error(`Server ${serverId} not found`);
    }

    const tool = server.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found on server ${serverId}`);
    }

    return await tool.execute(params);
  }
}

export const mcpIntegration = new MCPIntegrationService();
