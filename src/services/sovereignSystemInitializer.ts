
import { supabase } from '@/integrations/supabase/client';
import { masterControlProgram } from './masterControlProgram';
import { ragDatabase } from './ragDatabaseCore';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';

interface InitializationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface SystemInitializationResult {
  success: boolean;
  steps: InitializationStep[];
  totalTime: number;
  errors: string[];
}

class SovereignSystemInitializer {
  private initializationSteps: InitializationStep[] = [
    {
      id: 'database',
      name: 'Database Connection',
      description: 'Establishing connection to Supabase database',
      status: 'pending',
      progress: 0
    },
    {
      id: 'rag',
      name: 'RAG System',
      description: 'Initializing Retrieval-Augmented Generation system',
      status: 'pending',
      progress: 0
    },
    {
      id: 'mcp',
      name: 'Master Control Program',
      description: 'Starting Master Control Program core services',
      status: 'pending',
      progress: 0
    },
    {
      id: 'a2a',
      name: 'Agent-to-Agent Protocol',
      description: 'Setting up inter-agent communication protocols',
      status: 'pending',
      progress: 0
    },
    {
      id: 'tools',
      name: 'MCP Tool Hub',
      description: 'Loading and configuring MCP tools',
      status: 'pending',
      progress: 0
    },
    {
      id: 'agents',
      name: 'Agent Network',
      description: 'Initializing specialized agent network',
      status: 'pending',
      progress: 0
    },
    {
      id: 'verification',
      name: 'System Verification',
      description: 'Running system integrity checks',
      status: 'pending',
      progress: 0
    }
  ];

  private onProgressCallback?: (steps: InitializationStep[]) => void;

  async initialize(onProgress?: (steps: InitializationStep[]) => void): Promise<SystemInitializationResult> {
    const startTime = Date.now();
    this.onProgressCallback = onProgress;
    const errors: string[] = [];

    console.log('🚀 Sovereign System: Beginning initialization sequence');

    try {
      // Step 1: Database Connection
      await this.executeStep('database', async () => {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) throw error;
        console.log('✅ Database connection verified');
      });

      // Step 2: RAG System
      await this.executeStep('rag', async () => {
        await ragDatabase.initialize();
        console.log('✅ RAG system initialized');
      });

      // Step 3: Master Control Program
      await this.executeStep('mcp', async () => {
        await masterControlProgram.initialize();
        console.log('✅ Master Control Program online');
      });

      // Step 4: A2A Protocol
      await this.executeStep('a2a', async () => {
        await a2aProtocol.initialize();
        console.log('✅ Agent-to-Agent protocol initialized');
      });

      // Step 5: MCP Tool Hub
      await this.executeStep('tools', async () => {
        await mcpHub.initialize();
        console.log('✅ MCP Tool Hub initialized');
      });

      // Step 6: Agent Network
      await this.executeStep('agents', async () => {
        // Register core system agents
        await this.registerCoreAgents();
        console.log('✅ Agent network established');
      });

      // Step 7: System Verification
      await this.executeStep('verification', async () => {
        await this.performSystemChecks();
        console.log('✅ System verification completed');
      });

      const totalTime = Date.now() - startTime;
      console.log(`🎉 Sovereign System: Initialization completed in ${totalTime}ms`);

      return {
        success: true,
        steps: this.initializationSteps,
        totalTime,
        errors
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(errorMessage);
      
      console.error('❌ Sovereign System: Initialization failed:', error);
      
      return {
        success: false,
        steps: this.initializationSteps,
        totalTime: Date.now() - startTime,
        errors
      };
    }
  }

  private async executeStep(stepId: string, operation: () => Promise<void>): Promise<void> {
    const step = this.initializationSteps.find(s => s.id === stepId);
    if (!step) return;

    try {
      step.status = 'running';
      step.progress = 0;
      this.notifyProgress();

      // Simulate progressive loading
      const progressInterval = setInterval(() => {
        if (step.progress < 90) {
          step.progress += 10;
          this.notifyProgress();
        }
      }, 100);

      await operation();

      clearInterval(progressInterval);
      step.status = 'completed';
      step.progress = 100;
      this.notifyProgress();

    } catch (error) {
      step.status = 'error';
      step.error = error instanceof Error ? error.message : 'Unknown error';
      this.notifyProgress();
      throw error;
    }
  }

  private notifyProgress(): void {
    if (this.onProgressCallback) {
      this.onProgressCallback([...this.initializationSteps]);
    }
  }

  private async registerCoreAgents(): Promise<void> {
    const coreAgents = [
      {
        name: 'System Monitor',
        type: 'system',
        capabilities: ['monitoring', 'diagnostics', 'performance_tracking'],
        status: 'active' as const
      },
      {
        name: 'Code Architect',
        type: 'development',
        capabilities: ['code_generation', 'architecture_design', 'optimization'],
        status: 'active' as const
      },
      {
        name: 'Database Manager',
        type: 'data',
        capabilities: ['database_operations', 'schema_management', 'optimization'],
        status: 'active' as const
      },
      {
        name: 'Security Guardian',
        type: 'security',
        capabilities: ['security_scanning', 'vulnerability_assessment', 'access_control'],
        status: 'active' as const
      }
    ];

    for (const agentConfig of coreAgents) {
      try {
        await a2aProtocol.registerAgent(agentConfig);
        
        // Send initialization message
        await a2aProtocol.sendMessage({
          fromAgent: 'system',
          toAgent: agentConfig.name,
          type: 'coordination',
          content: {
            command: 'initialize',
            systemContext: 'sovereign_startup'
          }
        });
        
      } catch (error) {
        console.warn(`Failed to register agent ${agentConfig.name}:`, error);
      }
    }
  }

  private async performSystemChecks(): Promise<void> {
    // Check RAG system
    const ragStatus = ragDatabase.getDocumentCount();
    console.log(`RAG Database: ${ragStatus} documents loaded`);

    // Check A2A protocol
    const agents = a2aProtocol.getAgents();
    console.log(`A2A Protocol: ${agents.length} agents registered`);

    // Check MCP tools
    const tools = mcpHub.getRegisteredTools();
    console.log(`MCP Hub: ${tools.length} tools available`);

    // Clear caches to ensure clean state
    await ragDatabase.clearCache();
  }

  async getSystemStatus(): Promise<any> {
    try {
      const status = await masterControlProgram.getSystemStatus();
      return {
        initialized: true,
        components: {
          rag: ragDatabase.getDocumentCount(),
          agents: a2aProtocol.getAgents().length,
          tools: mcpHub.getRegisteredTools().length
        },
        masterControl: status
      };
    } catch (error) {
      return {
        initialized: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async shutdown(): Promise<void> {
    console.log('🔄 Sovereign System: Beginning shutdown sequence');
    
    try {
      // Notify all agents of shutdown
      const agents = a2aProtocol.getAgents();
      for (const agent of agents) {
        await a2aProtocol.sendMessage({
          fromAgent: 'system',
          toAgent: agent.id,
          type: 'coordination',
          content: {
            command: 'shutdown',
            reason: 'system_shutdown'
          }
        });
      }

      // Shutdown master control program
      await masterControlProgram.shutdownSystem();
      
      // Clear all caches
      await ragDatabase.clearCache();
      
      console.log('✅ Sovereign System: Shutdown completed');
    } catch (error) {
      console.error('❌ Sovereign System: Shutdown failed:', error);
      throw error;
    }
  }

  getInitializationSteps(): InitializationStep[] {
    return [...this.initializationSteps];
  }

  resetInitialization(): void {
    this.initializationSteps.forEach(step => {
      step.status = 'pending';
      step.progress = 0;
      step.error = undefined;
    });
  }
}

export const sovereignSystemInitializer = new SovereignSystemInitializer();
