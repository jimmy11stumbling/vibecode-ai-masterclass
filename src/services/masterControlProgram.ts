
import { ragDatabase } from './ragDatabaseCore';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';

interface ProcessingContext {
  projectFiles?: any[];
  activeFile?: any;
  systemContext?: string;
  userPreferences?: Record<string, any>;
}

interface ProcessingResult {
  success: boolean;
  result?: any;
  error?: string;
  metadata?: Record<string, any>;
}

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

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    console.log('🧠 MCP: Initializing Master Control Program');
    
    try {
      // Initialize core dependencies
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

  async processUserRequest(prompt: string, context: ProcessingContext = {}): Promise<ProcessingResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      console.log('🔄 MCP: Processing user request:', prompt.substring(0, 100) + '...');
      
      this.processedRequests++;
      this.lastActivity = new Date();

      // Enhance context with RAG
      const relevantKnowledge = await ragDatabase.searchSimilar(prompt, {
        limit: 5,
        threshold: 0.3
      });

      // Process through specialized agents
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

      // Generate response based on available tools and knowledge
      const result = await this.generateResponse(prompt, context, relevantKnowledge);

      console.log('✅ MCP: Request processed successfully');
      
      return {
        success: true,
        result,
        metadata: {
          agentUsed: selectedAgent?.name,
          knowledgeUsed: relevantKnowledge.length,
          processingTime: Date.now() - this.lastActivity.getTime()
        }
      };

    } catch (error) {
      console.error('❌ MCP: Request processing failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private selectBestAgent(prompt: string, agents: any[]): any | null {
    // Simple agent selection based on prompt keywords
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
    
    // Default to first available agent
    return agents.length > 0 ? agents[0] : null;
  }

  private async generateResponse(prompt: string, context: ProcessingContext, knowledge: any[]): Promise<string> {
    // Simple response generation based on prompt and context
    const response = `Based on your request "${prompt}", I've analyzed the available context and knowledge base. 

Context analysis:
- Project files: ${context.projectFiles?.length || 0}
- System context: ${context.systemContext || 'general'}
- Relevant knowledge items: ${knowledge.length}

Recommendations:
1. Consider the existing project structure
2. Leverage available tools and integrations
3. Follow best practices for maintainability

This is a simulated response from the Master Control Program. In a production environment, this would integrate with actual AI services.`;

    return response;
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
      // Notify all components of shutdown
      const agents = a2aProtocol.getAgents();
      console.log(`Notifying ${agents.length} agents of shutdown`);
      
      // Clear caches
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
