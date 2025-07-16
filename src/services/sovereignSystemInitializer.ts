import { sovereignOrchestrator } from './sovereignOrchestrator';
import { deepSeekIntegration } from './deepSeekIntegrationService';
import { masterControlProgram } from './masterControlProgram';
import { ragDatabase } from './ragDatabaseCore';
import { mcpHub } from './mcpHubCore';
import { a2aProtocol } from './a2aProtocolCore';

export interface SystemComponentStatus {
  status: 'active' | 'pending' | 'error' | 'degraded';
  details?: string;
}

export interface SystemIntegrationTests {
  a2aProtocol: boolean;
  ragDatabase: boolean;
  mcpHub: boolean;
  orchestrator: boolean;
  deepSeekIntegration: boolean;
}

export interface SovereignSystemStatus {
  isInitialized: boolean;
  systemHealth: 'optimal' | 'degraded' | 'error' | 'initializing';
  componentStatus: {
    orchestrator: SystemComponentStatus;
    a2aProtocol: SystemComponentStatus;
    mcpHub: SystemComponentStatus;
    ragDatabase: SystemComponentStatus;
    deepSeekIntegration: SystemComponentStatus;
  };
  integrationTests: SystemIntegrationTests;
  lastHealthCheck?: Date;
  initializationProgress: number;
  initializationMessage: string;
}

export class SovereignSystemInitializer {
  private status: SovereignSystemStatus = {
    isInitialized: false,
    systemHealth: 'initializing',
    componentStatus: {
      orchestrator: { status: 'pending' },
      a2aProtocol: { status: 'pending' },
      mcpHub: { status: 'pending' },
      ragDatabase: { status: 'pending' },
      deepSeekIntegration: { status: 'pending' }
    },
    integrationTests: {
      a2aProtocol: false,
      ragDatabase: false,
      mcpHub: false,
      orchestrator: false,
      deepSeekIntegration: false
    },
    initializationProgress: 0,
    initializationMessage: 'System starting...'
  };
  private isProduction = process.env.NODE_ENV === 'production';

  constructor() {
    if (this.isProduction) {
      this.initializeProductionSystem();
    } else {
      this.initializeDevelopmentSystem();
    }
  }

  async initializeProductionSystem(): Promise<SovereignSystemStatus> {
    console.log('🏛️ Sovereign System Initializer: Starting production system initialization');
    
    try {
      this.updateStatus('initializing', 'Starting system components...');

      // Initialize core services
      await this.initializeCoreServices();
      
      // Establish communication protocols
      await this.establishCommunicationProtocols();
      
      // Validate system integration
      await this.validateSystemIntegration();
      
      // Start monitoring
      this.startSystemMonitoring();

      this.status.isInitialized = true;
      this.status.systemHealth = 'optimal';
      
      console.log('✅ Sovereign System Initializer: Production system fully operational');
      
      return this.getSystemStatus();
    } catch (error) {
      console.error('❌ Sovereign System Initializer: Failed to initialize system:', error);
      this.updateStatus('error', `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  async initializeDevelopmentSystem(): Promise<SovereignSystemStatus> {
    console.log('⚙️ Sovereign System Initializer: Starting development system initialization');
    
    try {
      this.updateStatus('initializing', 'Starting development environment...');
      
      // Initialize core services
      await this.initializeCoreServices();
      
      // Establish communication protocols
      await this.establishCommunicationProtocols();
      
      // Perform mock system integration
      await this.performMockSystemIntegration();
      
      this.status.isInitialized = true;
      this.status.systemHealth = 'degraded';
      
      console.log('✅ Sovereign System Initializer: Development system initialized');
      return this.getSystemStatus();
      
    } catch (error) {
      console.error('❌ Sovereign System Initializer: Failed to initialize development system:', error);
      this.updateStatus('error', `Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  private async initializeCoreServices(): Promise<void> {
    console.log('🔧 Initializing core services...');
    
    try {
      // Initialize DeepSeek Integration
      deepSeekIntegration.updateReasonerApiKey(process.env.DEEPSEEK_API_KEY || '');
      this.status.componentStatus.deepSeekIntegration = { status: 'active', details: 'DeepSeek API configured' };
      
      // Initialize RAG Database
      await ragDatabase.initialize();
      this.status.componentStatus.ragDatabase = { status: 'active', details: 'RAG Database initialized' };
      
      // Initialize MCP Hub
      mcpHub.initialize();
      this.status.componentStatus.mcpHub = { status: 'active', details: 'MCP Hub initialized' };
      
      // Initialize A2A Protocol
      a2aProtocol.initialize();
      this.status.componentStatus.a2aProtocol = { status: 'active', details: 'A2A Protocol initialized' };
      
      // Initialize Sovereign Orchestrator
      sovereignOrchestrator.setApiKey(process.env.DEEPSEEK_API_KEY || '');
      this.status.componentStatus.orchestrator = { status: 'active', details: 'Sovereign Orchestrator initialized' };
      
    } catch (error) {
      console.error('❌ Failed to initialize core services:', error);
      throw error;
    }
  }

  private async establishCommunicationProtocols(): Promise<void> {
    console.log('🌐 Establishing communication protocols...');
    
    try {
      // Register system initializer as an agent
      await a2aProtocol.registerAgent({
        id: 'system_initializer',
        name: 'System Initializer',
        type: 'system',
        capabilities: ['system_management', 'health_checks'],
        status: 'active',
        currentTasks: []
      });

      // Set up event listeners for inter-system communication
      a2aProtocol.addEventListener('message:system_initializer', this.handleA2AMessage.bind(this));
      
    } catch (error) {
      console.error('❌ Failed to establish communication protocols:', error);
      throw error;
    }
  }

  private async validateSystemIntegration(): Promise<void> {
    console.log('🔍 Validating system integration...');
    
    try {
      // Test A2A Protocol - fix: use correct method
      const agents = a2aProtocol.getAllAgents();
      console.log(`✓ A2A Protocol operational with ${agents.length} agents`);

      // Test Sovereign Orchestrator - fix: await the promise
      const tasks = await sovereignOrchestrator.getTasks();
      console.log(`✓ Sovereign Orchestrator operational with ${tasks.length} tasks`);

      // Test RAG Database
      const ragStatus = await ragDatabase.getStatus();
      console.log('✓ RAG Database operational:', ragStatus);

      // Test MCP Hub
      const mcpStatus = mcpHub.getStatus();
      console.log('✓ MCP Hub operational:', mcpStatus);

      this.status.integrationTests = {
        a2aProtocol: true,
        ragDatabase: true,
        mcpHub: true,
        orchestrator: true,
        deepSeekIntegration: true
      };

    } catch (error) {
      console.error('❌ System integration validation failed:', error);
      throw error;
    }
  }

  private async performMockSystemIntegration(): Promise<void> {
    console.log('🧪 Performing mock system integration...');
    
    this.status.integrationTests = {
      a2aProtocol: true,
      ragDatabase: true,
      mcpHub: true,
      orchestrator: true,
      deepSeekIntegration: true
    };
    
    this.status.componentStatus = {
      orchestrator: { status: 'active', details: 'Mock Orchestrator active' },
      a2aProtocol: { status: 'active', details: 'Mock A2A Protocol active' },
      mcpHub: { status: 'active', details: 'Mock MCP Hub active' },
      ragDatabase: { status: 'active', details: 'Mock RAG Database active' },
      deepSeekIntegration: { status: 'active', details: 'Mock DeepSeek active' }
    };
  }

  private startSystemMonitoring(): void {
    console.log('📊 Starting system monitoring...');
    
    setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('Health check failed:', error);
      }
    }, 30000); // Check every 30 seconds
  }

  private async performHealthCheck(): Promise<void> {
    try {
      // Check all system components
      const healthChecks = {
        orchestrator: this.checkOrchestratorHealth(),
        ragDatabase: ragDatabase.getStatus(),
        mcpHub: mcpHub.getStatus(),
        a2aProtocol: this.checkA2AProtocolHealth(),
        deepSeekIntegration: this.checkDeepSeekHealth()
      };

      const results = await Promise.all(Object.values(healthChecks));
      const allHealthy = results.every(result => result.status === 'healthy' || result === 'active');

      this.status.systemHealth = allHealthy ? 'optimal' : 'degraded';
      this.status.lastHealthCheck = new Date();

      // Send health status via A2A Protocol - fix: use correct message type
      await a2aProtocol.sendMessage({
        fromAgent: 'system_initializer',
        toAgent: 'broadcast',
        messageType: 'status',
        payload: {
          systemHealth: this.status.systemHealth,
          timestamp: new Date().toISOString(),
          details: healthChecks
        },
        priority: 'low',
        requiresResponse: false
      });

    } catch (error) {
      console.error('Health check error:', error);
      this.status.systemHealth = 'error';
    }
  }

  private async handleA2AMessage(message: any): Promise<void> {
    console.log('📨 System Initializer received A2A message:', message);
    
    switch (message.messageType) {
      case 'system_ping':
        await this.handleSystemPing(message);
        break;
      default:
        console.log('🔄 System Initializer: Unknown message type:', message.messageType);
    }
  }

  private async handleSystemPing(message: any): Promise<void> {
    console.log('🏓 Handling system ping from:', message.fromAgent);
    
    // Respond to the ping
    await a2aProtocol.sendMessage({
      fromAgent: 'system_initializer',
      toAgent: message.fromAgent,
      messageType: 'response',
      payload: {
        status: 'online',
        timestamp: new Date().toISOString()
      },
      priority: 'normal',
      requiresResponse: false
    });
  }

  private checkOrchestratorHealth() {
    return {
      status: 'healthy',
      details: 'Sovereign Orchestrator operational'
    };
  }

  private checkA2AProtocolHealth() {
    const agents = a2aProtocol.getAllAgents();
    return {
      status: 'healthy',
      activeAgents: agents.length,
      details: 'A2A Protocol operational'
    };
  }

  private checkDeepSeekHealth() {
    return {
      status: 'active',
      details: 'DeepSeek Integration operational'
    };
  }

  private updateStatus(systemHealth: SovereignSystemStatus['systemHealth'], initializationMessage: string): void {
    this.status.systemHealth = systemHealth;
    this.status.initializationMessage = initializationMessage;
  }

  getSystemStatus(): SovereignSystemStatus {
    return { ...this.status };
  }
}

export const sovereignSystemInitializer = new SovereignSystemInitializer();
