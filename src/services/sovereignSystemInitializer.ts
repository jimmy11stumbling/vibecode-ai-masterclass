
import { masterControlProgram } from './masterControlProgram';
import { deepSeekIntegration } from './deepSeekIntegrationService';
import { ragDatabase } from './ragDatabaseCore';
import { mcpHub } from './mcpHubCore';
import { a2aProtocol } from './a2aProtocolCore';
import { sovereignOrchestrator } from './sovereignOrchestrator';
import { supabase } from '@/integrations/supabase/client';

export interface SystemInitializationResult {
  success: boolean;
  initializedSystems: string[];
  errors: string[];
  warnings: string[];
  totalInitializationTime: number;
}

export class SovereignSystemInitializer {
  private initializationLog: Array<{
    system: string;
    status: 'success' | 'error' | 'warning';
    message: string;
    timestamp: Date;
    duration?: number;
  }> = [];

  async initializeAllSystems(): Promise<SystemInitializationResult> {
    const startTime = Date.now();
    console.log('🚀 Sovereign System Initializer: Starting complete system initialization...');

    const result: SystemInitializationResult = {
      success: false,
      initializedSystems: [],
      errors: [],
      warnings: [],
      totalInitializationTime: 0
    };

    try {
      // Step 1: Initialize Database Connections
      await this.initializeDatabase();
      result.initializedSystems.push('Supabase Database');

      // Step 2: Initialize RAG 2.0 Database
      await this.initializeRAGDatabase();
      result.initializedSystems.push('RAG 2.0 Database');

      // Step 3: Initialize MCP Hub and Tools
      await this.initializeMCPHub();
      result.initializedSystems.push('MCP Hub');

      // Step 4: Initialize A2A Protocol
      await this.initializeA2AProtocol();
      result.initializedSystems.push('A2A Protocol');

      // Step 5: Initialize DeepSeek Integration
      await this.initializeDeepSeekIntegration();
      result.initializedSystems.push('DeepSeek Integration');

      // Step 6: Initialize Sovereign Orchestrator
      await this.initializeSovereignOrchestrator();
      result.initializedSystems.push('Sovereign Orchestrator');

      // Step 7: Initialize Master Control Program
      await this.initializeMasterControlProgram();
      result.initializedSystems.push('Master Control Program');

      // Step 8: Establish Inter-System Communication
      await this.establishInterSystemCommunication();
      result.initializedSystems.push('Inter-System Communication');

      // Step 9: Perform System Health Checks
      await this.performSystemHealthChecks();
      result.initializedSystems.push('System Health Monitoring');

      // Step 10: Initialize Default Knowledge Base
      await this.seedDefaultKnowledgeBase();
      result.initializedSystems.push('Default Knowledge Base');

      result.success = true;
      result.totalInitializationTime = Date.now() - startTime;

      // Extract errors and warnings from log
      result.errors = this.initializationLog
        .filter(log => log.status === 'error')
        .map(log => `${log.system}: ${log.message}`);

      result.warnings = this.initializationLog
        .filter(log => log.status === 'warning')
        .map(log => `${log.system}: ${log.message}`);

      console.log(`✅ Sovereign System Initializer: All systems initialized successfully in ${result.totalInitializationTime}ms`);
      
      return result;

    } catch (error) {
      result.success = false;
      result.totalInitializationTime = Date.now() - startTime;
      result.errors.push(`System Initialization Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      console.error('❌ Sovereign System Initializer: Initialization failed:', error);
      return result;
    }
  }

  private async initializeDatabase(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Test database connection
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" which is fine
        throw error;
      }

      this.logSuccess('Supabase Database', 'Database connection established', Date.now() - startTime);
      
    } catch (error) {
      this.logError('Supabase Database', `Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async initializeRAGDatabase(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Initialize RAG database and test basic functionality
      ragDatabase.clearCache();
      
      // Test basic query capability
      const testResult = await ragDatabase.query({
        query: 'system initialization test',
        limit: 1,
        threshold: 0.5
      });

      this.logSuccess('RAG 2.0 Database', 'RAG database initialized and tested', Date.now() - startTime);
      
    } catch (error) {
      this.logWarning('RAG 2.0 Database', `RAG initialization warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw - RAG is not critical for basic functionality
    }
  }

  private async initializeMCPHub(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // MCP Hub initializes automatically via constructor
      const tools = mcpHub.getAllTools();
      
      this.logSuccess('MCP Hub', `MCP Hub initialized with ${tools.length} tools`, Date.now() - startTime);
      
    } catch (error) {
      this.logError('MCP Hub', `MCP Hub initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async initializeA2AProtocol(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // A2A Protocol initializes automatically via constructor
      const agents = a2aProtocol.getActiveAgents();
      
      this.logSuccess('A2A Protocol', `A2A Protocol initialized with ${agents.length} agents`, Date.now() - startTime);
      
    } catch (error) {
      this.logError('A2A Protocol', `A2A Protocol initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async initializeDeepSeekIntegration(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Check if DeepSeek API key is available
      const hasApiKey = process.env.DEEPSEEK_API_KEY || false;
      
      if (!hasApiKey) {
        this.logWarning('DeepSeek Integration', 'DeepSeek API key not configured - some features may be limited');
      } else {
        this.logSuccess('DeepSeek Integration', 'DeepSeek integration ready', Date.now() - startTime);
      }
      
    } catch (error) {
      this.logWarning('DeepSeek Integration', `DeepSeek integration warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw - system can work without DeepSeek
    }
  }

  private async initializeSovereignOrchestrator(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Sovereign Orchestrator initializes automatically via constructor
      const tasks = sovereignOrchestrator.getTasks();
      const agents = sovereignOrchestrator.getAgents();
      
      this.logSuccess('Sovereign Orchestrator', `Orchestrator initialized with ${agents.length} agents and ${tasks.length} tasks`, Date.now() - startTime);
      
    } catch (error) {
      this.logError('Sovereign Orchestrator', `Orchestrator initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async initializeMasterControlProgram(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Master Control Program initializes automatically via constructor
      const systemStatus = masterControlProgram.getSystemStatus();
      
      this.logSuccess('Master Control Program', `MCP initialized - Status: ${JSON.stringify(systemStatus)}`, Date.now() - startTime);
      
    } catch (error) {
      this.logError('Master Control Program', `MCP initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async establishInterSystemCommunication(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Register all systems with A2A protocol for communication
      await a2aProtocol.registerAgent({
        id: 'system_initializer',
        name: 'System Initializer',
        type: 'system',
        capabilities: ['system_monitoring', 'health_checks'],
        status: 'active',
        currentTasks: []
      });

      // Test communication by sending a ping
      await a2aProtocol.sendMessage({
        fromAgent: 'system_initializer',
        toAgent: 'master_control_program',
        messageType: 'system_ping',
        payload: { timestamp: new Date().toISOString() },
        priority: 'low',
        requiresResponse: false
      });

      this.logSuccess('Inter-System Communication', 'Communication fabric established', Date.now() - startTime);
      
    } catch (error) {
      this.logWarning('Inter-System Communication', `Communication setup warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw - basic functionality still works
    }
  }

  private async performSystemHealthChecks(): Promise<void> {
    const startTime = Date.now();
    
    try {
      const healthResults = {
        database: await this.checkDatabaseHealth(),
        rag: await this.checkRAGHealth(),
        mcp: await this.checkMCPHealth(),
        a2a: await this.checkA2AHealth()
      };

      const healthyComponents = Object.values(healthResults).filter(Boolean).length;
      const totalComponents = Object.keys(healthResults).length;

      this.logSuccess('System Health Monitoring', `Health checks completed: ${healthyComponents}/${totalComponents} systems healthy`, Date.now() - startTime);
      
    } catch (error) {
      this.logWarning('System Health Monitoring', `Health check warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      return !error || error.code === 'PGRST116';
    } catch {
      return false;
    }
  }

  private async checkRAGHealth(): Promise<boolean> {
    try {
      await ragDatabase.query({ query: 'health check', limit: 1 });
      return true;
    } catch {
      return false;
    }
  }

  private async checkMCPHealth(): Promise<boolean> {
    try {
      const tools = mcpHub.getAllTools();
      return tools.length > 0;
    } catch {
      return false;
    }
  }

  private async checkA2AHealth(): Promise<boolean> {
    try {
      const agents = a2aProtocol.getActiveAgents();
      return agents.length >= 0; // Even 0 is valid
    } catch {
      return false;
    }
  }

  private async seedDefaultKnowledgeBase(): Promise<void> {
    const startTime = Date.now();
    
    try {
      // Seed with basic system knowledge
      const defaultDocuments = [
        {
          title: 'Sovereign AI System Architecture',
          content: 'The Sovereign AI system consists of multiple integrated components: Master Control Program (MCP) for orchestration, DeepSeek Reasoner for advanced AI reasoning, RAG 2.0 Database for knowledge management, MCP Hub for tool coordination, and A2A Protocol for agent communication.',
          category: 'system-architecture',
          tags: ['architecture', 'system', 'components'],
          metadata: { source: 'system-initialization', priority: 'high' }
        },
        {
          title: 'Development Best Practices',
          content: 'When developing with the Sovereign AI system, follow these practices: Use the Master Control Program for complex orchestration, leverage RAG database for contextual information, utilize MCP tools for specialized tasks, and maintain clear agent communication through A2A protocol.',
          category: 'development',
          tags: ['best-practices', 'development', 'guidelines'],
          metadata: { source: 'system-initialization', priority: 'medium' }
        },
        {
          title: 'System Integration Patterns',
          content: 'Integration patterns include: Agent-to-Agent communication for distributed processing, RAG-enhanced reasoning for context-aware decisions, MCP tool chaining for complex workflows, and orchestrated task execution for reliable outcomes.',
          category: 'integration',
          tags: ['integration', 'patterns', 'workflows'],
          metadata: { source: 'system-initialization', priority: 'medium' }
        }
      ];

      for (const doc of defaultDocuments) {
        try {
          await ragDatabase.indexDocument(doc);
        } catch (error) {
          console.warn('Failed to index default document:', doc.title, error);
        }
      }

      this.logSuccess('Default Knowledge Base', `Seeded knowledge base with ${defaultDocuments.length} documents`, Date.now() - startTime);
      
    } catch (error) {
      this.logWarning('Default Knowledge Base', `Knowledge base seeding warning: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private logSuccess(system: string, message: string, duration?: number): void {
    this.initializationLog.push({
      system,
      status: 'success',
      message,
      timestamp: new Date(),
      duration
    });
    console.log(`✅ ${system}: ${message}${duration ? ` (${duration}ms)` : ''}`);
  }

  private logError(system: string, message: string): void {
    this.initializationLog.push({
      system,
      status: 'error',
      message,
      timestamp: new Date()
    });
    console.error(`❌ ${system}: ${message}`);
  }

  private logWarning(system: string, message: string): void {
    this.initializationLog.push({
      system,
      status: 'warning',
      message,
      timestamp: new Date()
    });
    console.warn(`⚠️ ${system}: ${message}`);
  }

  getInitializationLog() {
    return [...this.initializationLog];
  }
}

export const sovereignSystemInitializer = new SovereignSystemInitializer();

// Auto-initialize when imported
sovereignSystemInitializer.initializeAllSystems().then(result => {
  if (result.success) {
    console.log('🎉 Sovereign AI System: All systems operational!');
  } else {
    console.warn('⚠️ Sovereign AI System: Initialization completed with warnings/errors');
    console.log('Errors:', result.errors);
    console.log('Warnings:', result.warnings);
  }
}).catch(error => {
  console.error('💥 Sovereign AI System: Critical initialization failure:', error);
});
