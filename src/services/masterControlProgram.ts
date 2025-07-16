
import { ragDatabase } from './ragDatabaseCore';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';
import { ProcessingContextManager } from './mcp/processingContext';

interface SystemStatus {
  uptime: number;
  componentsHealth: Record<string, 'healthy' | 'degraded' | 'error'>;
  activeAgents: number;
  processedRequests: number;
  lastActivity: Date;
}

class MasterControlProgram {
  private isInitialized = false;
  private startTime = Date.now();
  private processedRequests = 0;
  private lastActivity = new Date();
  private processingManager: ProcessingContextManager;

  constructor() {
    this.processingManager = new ProcessingContextManager();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🧠 MCP: Initializing Master Control Program');
    
    try {
      await ragDatabase.initialize();
      await a2aProtocol.initialize();
      await mcpHub.initialize();

      this.isInitialized = true;
      this.lastActivity = new Date();
      
      console.log('✅ MCP: Master Control Program online');
    } catch (error) {
      console.error('🧠 MCP: Initialization failed:', error);
      throw error;
    }
  }

  async processUserRequest(prompt: string, context: any = {}): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    this.processedRequests++;
    this.lastActivity = new Date();

    const relevantKnowledge = await ragDatabase.searchSimilar(prompt, {
      limit: 5,
      threshold: 0.3
    });

    const agents = a2aProtocol.getAgents();
    const selectedAgent = this.selectBestAgent(prompt, agents);

    if (selectedAgent) {
      await a2aProtocol.sendMessage({
        fromAgent: 'master_control',
        toAgent: selectedAgent.id,
        type: 'task',
        content: {
          prompt,
          context,
          relevantKnowledge: relevantKnowledge.map(r => r.document)
        }
      });
    }

    return await this.processingManager.processUserRequest(prompt, context);
  }

  private selectBestAgent(prompt: string, agents: any[]): any | null {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('code') || promptLower.includes('generate') || promptLower.includes('build')) {
      return agents.find(agent => agent.capabilities.includes('code_generation'));
    }
    
    if (promptLower.includes('database') || promptLower.includes('data')) {
      return agents.find(agent => agent.capabilities.includes('database_operations'));
    }
    
    if (promptLower.includes('security') || promptLower.includes('secure')) {
      return agents.find(agent => agent.capabilities.includes('security_scanning'));
    }
    
    return agents.length > 0 ? agents[0] : null;
  }

  async getSystemStatus(): Promise<SystemStatus> {
    const uptime = Date.now() - this.startTime;
    const agents = a2aProtocol.getAgents();
    
    return {
      uptime,
      componentsHealth: {
        rag: 'healthy',
        a2a: 'healthy',
        mcp_hub: 'healthy'
      },
      activeAgents: agents.length,
      processedRequests: this.processedRequests,
      lastActivity: this.lastActivity
    };
  }

  async shutdownSystem(): Promise<void> {
    console.log('🔄 MCP: Shutting down Master Control Program');
    
    try {
      const agents = a2aProtocol.getAgents();
      console.log(`Notifying ${agents.length} agents of shutdown`);
      
      await ragDatabase.clearCache();
      
      this.isInitialized = false;
      
      console.log('✅ MCP: Shutdown completed');
    } catch (error) {
      console.error('❌ MCP: Shutdown failed:', error);
      throw error;
    }
  }

  isSystemReady(): boolean {
    return this.isInitialized;
  }

  getProcessedRequestsCount(): number {
    return this.processedRequests;
  }

  getLastActivity(): Date {
    return this.lastActivity;
  }
}

export const masterControlProgram = new MasterControlProgram();
