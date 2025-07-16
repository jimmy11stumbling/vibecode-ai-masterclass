
import { supabase } from '@/integrations/supabase/client';
import { a2aProtocol } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';
import { ragDatabase } from './ragDatabaseCore';

export interface ProjectContext {
  projectFiles?: any[];
  activeFile?: any;
  systemContext?: string;
  userPreferences?: any;
}

export interface TaskPlan {
  id: string;
  description: string;
  steps: string[];
  estimatedTime: number;
  requiredCapabilities: string[];
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface ExecutionResult {
  planId: string;
  success: boolean;
  results: any[];
  completedAt: Date;
  logs: string[];
}

class MasterControlProgram {
  private isInitialized = false;
  private executionHistory: Map<string, ExecutionResult> = new Map();

  async initialize() {
    if (this.isInitialized) return;

    console.log('🧠 MCP: Initializing Master Control Program');
    
    try {
      // Initialize all subsystems
      await Promise.all([
        a2aProtocol.initialize(),
        mcpHub.initialize(),
        ragDatabase.initialize()
      ]);

      this.isInitialized = true;
      console.log('🧠 MCP: Master Control Program initialized successfully');
    } catch (error) {
      console.error('🧠 MCP: Initialization failed:', error);
      throw error;
    }
  }

  async processUserRequest(prompt: string, context?: ProjectContext): Promise<string> {
    await this.initialize();

    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    console.log('🧠 MCP: Processing user request with execution ID:', executionId);

    try {
      // Store initial execution record
      await supabase
        .from('sovereign_tasks')
        .insert({
          execution_id: executionId,
          type: 'user_request',
          description: prompt,
          status: 'pending',
          priority: 'medium',
          metadata: {
            context: context as any,
            logs: []
          },
          user_id: 'system' // Default for now
        });

      // 1. Analyze the request using RAG
      const analysis = await this.analyzeRequest(prompt, context);
      
      // 2. Create execution plan
      const plan = await this.createExecutionPlan(analysis, prompt);
      
      // 3. Execute the plan
      const result = await this.executePlan(plan, executionId);
      
      // 4. Store final results
      await supabase
        .from('sovereign_tasks')
        .update({
          status: 'completed',
          result: {
            planId: plan.id,
            results: result.results,
            completedAt: result.completedAt.toISOString(),
            success: result.success
          } as any,
          metadata: {
            context: context as any,
            logs: result.logs
          } as any
        })
        .eq('execution_id', executionId);

      this.executionHistory.set(executionId, result);
      
      console.log('🧠 MCP: Request processing completed:', executionId);
      return executionId;

    } catch (error) {
      console.error('🧠 MCP: Request processing failed:', error);
      
      // Update with error status
      await supabase
        .from('sovereign_tasks')
        .update({
          status: 'failed',
          metadata: {
            context: context as any,
            logs: [error instanceof Error ? error.message : 'Unknown error']
          } as any
        })
        .eq('execution_id', executionId);

      throw error;
    }
  }

  private async analyzeRequest(prompt: string, context?: ProjectContext): Promise<any> {
    console.log('🧠 MCP: Analyzing request with RAG system');
    
    try {
      // Use RAG to understand the request
      const ragResults = await ragDatabase.searchSimilar(prompt, {
        limit: 5,
        includeMetadata: true
      });

      return {
        intent: this.extractIntent(prompt),
        context: context || {},
        relatedKnowledge: ragResults,
        complexity: this.assessComplexity(prompt),
        timestamp: new Date()
      };
    } catch (error) {
      console.error('🧠 MCP: Request analysis failed:', error);
      return {
        intent: 'unknown',
        context: context || {},
        relatedKnowledge: [],
        complexity: 'medium',
        timestamp: new Date()
      };
    }
  }

  private extractIntent(prompt: string): string {
    const intents = {
      'create': ['create', 'build', 'generate', 'make', 'develop'],
      'modify': ['change', 'update', 'edit', 'modify', 'alter'],
      'analyze': ['analyze', 'examine', 'review', 'check', 'inspect'],
      'deploy': ['deploy', 'publish', 'launch', 'release'],
      'debug': ['fix', 'debug', 'resolve', 'troubleshoot', 'error']
    };

    const lowerPrompt = prompt.toLowerCase();
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerPrompt.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  }

  private assessComplexity(prompt: string): 'low' | 'medium' | 'high' {
    const complexityIndicators = {
      high: ['full-stack', 'database', 'authentication', 'deployment', 'multiple'],
      medium: ['component', 'feature', 'integration', 'api'],
      low: ['button', 'text', 'color', 'style', 'simple']
    };

    const lowerPrompt = prompt.toLowerCase();
    
    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => lowerPrompt.includes(indicator))) {
        return level as 'low' | 'medium' | 'high';
      }
    }
    
    return 'medium';
  }

  private async createExecutionPlan(analysis: any, originalPrompt: string): Promise<TaskPlan> {
    console.log('🧠 MCP: Creating execution plan');
    
    const planId = `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create steps based on analysis
    const steps = this.generateSteps(analysis, originalPrompt);
    
    return {
      id: planId,
      description: originalPrompt,
      steps,
      estimatedTime: steps.length * 30, // 30 seconds per step estimate
      requiredCapabilities: this.determineRequiredCapabilities(analysis),
      priority: analysis.complexity === 'high' ? 'high' : 'medium'
    };
  }

  private generateSteps(analysis: any, prompt: string): string[] {
    const baseSteps = [
      'Initialize task execution',
      'Gather required resources',
      'Execute primary task',
      'Validate results',
      'Finalize execution'
    ];

    // Customize steps based on intent
    switch (analysis.intent) {
      case 'create':
        return [
          'Analyze requirements',
          'Design architecture',
          'Generate code structure',
          'Implement functionality',
          'Test and validate',
          'Document results'
        ];
      case 'modify':
        return [
          'Analyze current state',
          'Identify changes needed',
          'Apply modifications',
          'Test changes',
          'Validate functionality'
        ];
      case 'debug':
        return [
          'Identify error sources',
          'Analyze error patterns',
          'Generate fix solutions',
          'Apply fixes',
          'Verify resolution'
        ];
      default:
        return baseSteps;
    }
  }

  private determineRequiredCapabilities(analysis: any): string[] {
    const capabilities = ['general'];
    
    if (analysis.intent === 'create') {
      capabilities.push('code_generation', 'architecture');
    }
    
    if (analysis.complexity === 'high') {
      capabilities.push('complex_reasoning', 'system_integration');
    }
    
    return capabilities;
  }

  private async executePlan(plan: TaskPlan, executionId: string): Promise<ExecutionResult> {
    console.log('🧠 MCP: Executing plan:', plan.id);
    
    const results: any[] = [];
    const logs: string[] = [];
    const startTime = new Date();

    try {
      // Find suitable agents for execution
      const suitableAgents = await a2aProtocol.coordinateTask(
        plan.description,
        plan.requiredCapabilities
      );

      logs.push(`Found ${suitableAgents.length} suitable agents for execution`);

      // Execute each step
      for (let i = 0; i < plan.steps.length; i++) {
        const step = plan.steps[i];
        logs.push(`Executing step ${i + 1}/${plan.steps.length}: ${step}`);
        
        // Simulate step execution
        await this.executeStep(step, suitableAgents, logs);
        
        results.push({
          stepIndex: i,
          stepDescription: step,
          status: 'completed',
          timestamp: new Date()
        });
      }

      const executionResult: ExecutionResult = {
        planId: plan.id,
        success: true,
        results,
        completedAt: new Date(),
        logs
      };

      console.log('🧠 MCP: Plan execution completed successfully');
      return executionResult;

    } catch (error) {
      logs.push(`Execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return {
        planId: plan.id,
        success: false,
        results,
        completedAt: new Date(),
        logs
      };
    }
  }

  private async executeStep(step: string, agents: string[], logs: string[]): Promise<void> {
    // Simulate step execution with agents
    if (agents.length > 0) {
      const selectedAgent = agents[0]; // Simple selection for now
      
      await a2aProtocol.sendMessage({
        fromAgent: 'master_control',
        toAgent: selectedAgent,
        type: 'task',
        content: {
          step,
          priority: 'high',
          executionId: Date.now()
        }
      });
      
      logs.push(`Delegated step to agent: ${selectedAgent}`);
    } else {
      logs.push(`Executed step locally: ${step}`);
    }
    
    // Simulate execution time
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  getExecutionHistory(): Map<string, ExecutionResult> {
    return this.executionHistory;
  }

  getExecutionResult(executionId: string): ExecutionResult | undefined {
    return this.executionHistory.get(executionId);
  }

  async getActiveExecutions(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('sovereign_tasks')
        .select('*')
        .in('status', ['pending', 'executing'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get active executions:', error);
      return [];
    }
  }
}

export const masterControlProgram = new MasterControlProgram();
