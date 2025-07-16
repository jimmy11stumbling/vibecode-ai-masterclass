
import { supabase } from '@/integrations/supabase/client';
import { ragDatabase } from './ragDatabaseCore';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';
import { masterControlProgram } from './masterControlProgram';
import { HealthMonitor } from './system/healthMonitor';
import { SovereignTask } from './system/types';

class SovereignSystemInitializer {
  private isInitialized = false;
  private systemTasks: Map<string, SovereignTask> = new Map();
  private healthMonitor: HealthMonitor;

  constructor() {
    this.healthMonitor = new HealthMonitor();
  }

  async initializeSovereignSystem(): Promise<void> {
    if (this.isInitialized) {
      console.log('🎯 Sovereign System: Already initialized');
      return;
    }

    console.log('🚀 Sovereign System: Beginning initialization sequence...');

    try {
      // Phase 1: Core System Components
      console.log('⚡ Phase 1: Initializing core components');
      await this.initializeCoreComponents();

      // Phase 2: Agent Network (A2A will handle agent registration)
      console.log('🤖 Phase 2: Agent network ready via A2A protocol');

      // Phase 3: Knowledge Systems
      console.log('🧠 Phase 3: Loading knowledge systems');
      await this.initializeKnowledgeSystems();

      // Phase 4: Task Management
      console.log('📋 Phase 4: Setting up task management');
      await this.initializeTaskManagement();

      // Phase 5: Health Monitoring
      console.log('❤️ Phase 5: Starting health monitoring');
      await this.healthMonitor.startHealthMonitoring();

      this.isInitialized = true;
      console.log('✅ Sovereign System: Initialization complete');

    } catch (error) {
      console.error('❌ Sovereign System: Initialization failed:', error);
      throw error;
    }
  }

  private async initializeCoreComponents(): Promise<void> {
    try {
      // Initialize Master Control Program
      await masterControlProgram.initialize();
      
      // Initialize RAG Database
      await ragDatabase.initialize();
      
      // Initialize A2A Protocol (this registers all agents automatically)
      await a2aProtocol.initialize();
      
      // Initialize MCP Hub
      await mcpHub.initialize();

      console.log('✅ Core components initialized');
    } catch (error) {
      console.error('❌ Core component initialization failed:', error);
      throw error;
    }
  }

  private async initializeKnowledgeSystems(): Promise<void> {
    try {
      // Load knowledge base entries
      const knowledgeEntries = [
        {
          title: 'React Best Practices',
          content: 'Comprehensive guide to React development patterns, hooks usage, and performance optimization.',
          category: 'frontend'
        },
        {
          title: 'Database Design Principles',
          content: 'Key principles for designing scalable and maintainable database schemas.',
          category: 'backend'
        },
        {
          title: 'Security Guidelines',
          content: 'Essential security practices for web application development.',
          category: 'security'
        },
        {
          title: 'API Design Standards',
          content: 'RESTful API design patterns and GraphQL implementation guidelines.',
          category: 'api'
        },
        {
          title: 'Performance Optimization',
          content: 'Techniques for optimizing application performance and user experience.',
          category: 'performance'
        }
      ];

      for (const entry of knowledgeEntries) {
        await ragDatabase.addDocument(entry.content, {
          title: entry.title,
          category: entry.category
        });
      }

      console.log(`✅ Loaded ${knowledgeEntries.length} knowledge base entries`);
    } catch (error) {
      console.error('❌ Knowledge system initialization failed:', error);
      throw error;
    }
  }

  private async initializeTaskManagement(): Promise<void> {
    try {
      // Initialize task queue with default tasks
      const defaultTasks: Omit<SovereignTask, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          type: 'system_health_check',
          description: 'Perform comprehensive system health check',
          priority: 'high',
          status: 'pending'
        },
        {
          type: 'knowledge_sync',
          description: 'Synchronize knowledge base with latest updates',
          priority: 'medium',
          status: 'pending'
        },
        {
          type: 'agent_optimization',
          description: 'Optimize agent performance and resource allocation',
          priority: 'low',
          status: 'pending'
        }
      ];

      for (const task of defaultTasks) {
        await this.createTask(task);
      }

      console.log(`✅ Initialized task management with ${defaultTasks.length} default tasks`);
    } catch (error) {
      console.error('❌ Task management initialization failed:', error);
      throw error;
    }
  }

  async createTask(taskData: Omit<SovereignTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const task: SovereignTask = {
      ...taskData,
      id: taskId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.systemTasks.set(taskId, task);

    // Persist to database
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('sovereign_tasks').insert({
          id: taskId,
          user_id: user.id,
          type: task.type,
          description: task.description,
          priority: task.priority,
          status: task.status,
          assigned_agent: task.assignedAgent,
          metadata: task.metadata || {},
          execution_id: `exec_${Date.now()}`
        });
      }
    } catch (error) {
      console.warn('Failed to persist task to database:', error);
    }

    // Send task to A2A protocol for agent assignment
    await a2aProtocol.sendMessage({
      fromAgent: 'sovereign_system',
      toAgent: 'task_dispatcher',
      type: 'task',
      content: { taskId, task }
    });

    console.log(`📋 Created task: ${taskId} - ${task.description}`);
    return taskId;
  }

  async getSystemStatus(): Promise<{
    initialized: boolean;
    metrics: any;
    tasks: SovereignTask[];
    agents: any[];
    tools: any[];
  }> {
    const agents = a2aProtocol.getAgents();
    const tools = mcpHub.getAllTools();

    return {
      initialized: this.isInitialized,
      metrics: this.healthMonitor.getMetrics(),
      tasks: Array.from(this.systemTasks.values()),
      agents,
      tools
    };
  }

  async shutdown(): Promise<void> {
    console.log('🔄 Sovereign System: Beginning shutdown sequence...');
    
    try {
      // Clear caches
      await ragDatabase.clearCache();
      
      // Shutdown MCP
      await masterControlProgram.shutdownSystem();
      
      this.isInitialized = false;
      
      console.log('✅ Sovereign System: Shutdown completed');
    } catch (error) {
      console.error('❌ Sovereign System: Shutdown failed:', error);
      throw error;
    }
  }

  isSystemReady(): boolean {
    return this.isInitialized;
  }

  getMetrics() {
    return this.healthMonitor.getMetrics();
  }
}

export const sovereignSystemInitializer = new SovereignSystemInitializer();
