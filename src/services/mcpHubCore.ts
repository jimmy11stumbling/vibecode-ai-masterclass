
import { supabase } from '@/integrations/supabase/client';
import { a2aProtocol } from './a2aProtocolCore';

export interface MCPTool {
  id: string;
  name: string;
  description: string;
  category: 'reasoning' | 'database' | 'code' | 'workflow' | 'communication';
  parameters: {
    [key: string]: {
      type: string;
      description: string;
      required: boolean;
      default?: any;
    };
  };
  handler: (params: any) => Promise<any>;
  version: string;
  enabled: boolean;
}

export interface MCPServer {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  url?: string;
  tools: MCPTool[];
  configuration: any;
}

export class MCPHubCore {
  private tools = new Map<string, MCPTool>();
  private servers = new Map<string, MCPServer>();
  private executionHistory: Array<{
    toolId: string;
    parameters: any;
    result: any;
    timestamp: Date;
    executionTime: number;
  }> = [];

  constructor() {
    this.initializeCore();
  }

  private async initializeCore() {
    console.log('🔧 MCP Hub: Initializing core tools and servers');
    
    await this.registerCoreTools();
    await this.loadServersFromDatabase();
    await this.registerWithA2A();
  }

  private async registerCoreTools() {
    // Database Tools
    await this.registerTool({
      id: 'db_query',
      name: 'Database Query',
      description: 'Execute database queries with full context',
      category: 'database',
      parameters: {
        query: { type: 'string', description: 'SQL query to execute', required: true },
        table: { type: 'string', description: 'Target table name', required: false },
        filters: { type: 'object', description: 'Query filters', required: false }
      },
      handler: this.handleDatabaseQuery.bind(this),
      version: '1.0.0',
      enabled: true
    });

    await this.registerTool({
      id: 'db_insert',
      name: 'Database Insert',
      description: 'Insert data into database tables',
      category: 'database',
      parameters: {
        table: { type: 'string', description: 'Target table name', required: true },
        data: { type: 'object', description: 'Data to insert', required: true }
      },
      handler: this.handleDatabaseInsert.bind(this),
      version: '1.0.0',
      enabled: true
    });

    // Code Tools
    await this.registerTool({
      id: 'code_analyze',
      name: 'Code Analyzer',
      description: 'Analyze code structure and quality',
      category: 'code',
      parameters: {
        code: { type: 'string', description: 'Code to analyze', required: true },
        language: { type: 'string', description: 'Programming language', required: true },
        checkTypes: { type: 'array', description: 'Types of checks to perform', required: false, default: ['syntax', 'style', 'security'] }
      },
      handler: this.handleCodeAnalysis.bind(this),
      version: '1.0.0',
      enabled: true
    });

    await this.registerTool({
      id: 'code_generate',
      name: 'Code Generator',
      description: 'Generate code from specifications',
      category: 'code',
      parameters: {
        specification: { type: 'string', description: 'Code specification', required: true },
        framework: { type: 'string', description: 'Target framework', required: true },
        style: { type: 'string', description: 'Code style preferences', required: false, default: 'typescript' }
      },
      handler: this.handleCodeGeneration.bind(this),
      version: '1.0.0',
      enabled: true
    });

    // Workflow Tools
    await this.registerTool({
      id: 'workflow_create',
      name: 'Workflow Creator',
      description: 'Create and orchestrate complex workflows',
      category: 'workflow',
      parameters: {
        workflow: { type: 'object', description: 'Workflow definition', required: true },
        context: { type: 'object', description: 'Execution context', required: false }
      },
      handler: this.handleWorkflowCreation.bind(this),
      version: '1.0.0',
      enabled: true
    });

    // Reasoning Tools
    await this.registerTool({
      id: 'deep_reason',
      name: 'Deep Reasoning',
      description: 'Perform advanced reasoning with DeepSeek',
      category: 'reasoning',
      parameters: {
        problem: { type: 'string', description: 'Problem to reason about', required: true },
        context: { type: 'array', description: 'Additional context', required: false },
        depth: { type: 'string', description: 'Reasoning depth', required: false, default: 'standard' }
      },
      handler: this.handleDeepReasoning.bind(this),
      version: '1.0.0',
      enabled: true
    });

    console.log(`✅ MCP Hub: Registered ${this.tools.size} core tools`);
  }

  async registerTool(tool: MCPTool): Promise<boolean> {
    try {
      this.tools.set(tool.id, tool);

      // Store in database
      const { error } = await supabase
        .from('mcp_tools')
        .upsert({
          id: tool.id,
          tool_name: tool.name,
          tool_type: tool.category,
          description: tool.description,
          version: tool.version,
          capabilities: Object.keys(tool.parameters),
          configuration: {
            parameters: tool.parameters,
            enabled: tool.enabled
          }
        });

      if (error) throw error;

      console.log(`🔧 MCP Hub: Tool '${tool.name}' registered successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to register tool ${tool.name}:`, error);
      return false;
    }
  }

  async executeTool(toolId: string, parameters: any, requestingAgent?: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      const tool = this.tools.get(toolId);
      if (!tool) {
        throw new Error(`Tool '${toolId}' not found`);
      }

      if (!tool.enabled) {
        throw new Error(`Tool '${toolId}' is disabled`);
      }

      // Validate parameters
      this.validateParameters(tool.parameters, parameters);

      console.log(`🔧 MCP Hub: Executing tool '${tool.name}' for agent '${requestingAgent || 'unknown'}'`);

      // Execute the tool
      const result = await tool.handler(parameters);

      const executionTime = Date.now() - startTime;

      // Record execution history
      this.executionHistory.push({
        toolId,
        parameters,
        result,
        timestamp: new Date(),
        executionTime
      });

      // Notify A2A protocol if agent specified
      if (requestingAgent) {
        await a2aProtocol.sendMessage({
          fromAgent: 'mcp_hub',
          toAgent: requestingAgent,
          messageType: 'response',
          payload: {
            toolId,
            result,
            executionTime
          },
          priority: 'medium',
          requiresResponse: false
        });
      }

      console.log(`✅ MCP Hub: Tool '${tool.name}' completed in ${executionTime}ms`);
      return result;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error(`❌ MCP Hub: Tool execution failed (${executionTime}ms):`, error);

      if (requestingAgent) {
        await a2aProtocol.sendMessage({
          fromAgent: 'mcp_hub',
          toAgent: requestingAgent,
          messageType: 'error',
          payload: {
            toolId,
            error: error instanceof Error ? error.message : 'Unknown error',
            executionTime
          },
          priority: 'high',
          requiresResponse: false
        });
      }

      throw error;
    }
  }

  private validateParameters(schema: MCPTool['parameters'], params: any) {
    for (const [key, definition] of Object.entries(schema)) {
      if (definition.required && !(key in params)) {
        throw new Error(`Required parameter '${key}' missing`);
      }

      if (key in params) {
        const value = params[key];
        const expectedType = definition.type;

        if (expectedType === 'array' && !Array.isArray(value)) {
          throw new Error(`Parameter '${key}' must be an array`);
        }
        if (expectedType === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
          throw new Error(`Parameter '${key}' must be an object`);
        }
        if (expectedType === 'string' && typeof value !== 'string') {
          throw new Error(`Parameter '${key}' must be a string`);
        }
        if (expectedType === 'number' && typeof value !== 'number') {
          throw new Error(`Parameter '${key}' must be a number`);
        }
      }
    }
  }

  // Tool Handlers
  private async handleDatabaseQuery(params: { query?: string; table?: string; filters?: any }): Promise<any> {
    try {
      if (params.table) {
        // Use type assertion for known table names
        const tableName = params.table as any;
        let query = supabase.from(tableName).select('*');
        
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return { data, count: data?.length || 0 };
      }
      
      // For raw queries, we'd need a more secure implementation
      return { error: 'Raw SQL queries not supported for security reasons' };
    } catch (error) {
      throw new Error(`Database query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDatabaseInsert(params: { table: string; data: any }): Promise<any> {
    try {
      // Use type assertion for known table names
      const tableName = params.table as any;
      const { data, error } = await supabase
        .from(tableName)
        .insert(params.data)
        .select();

      if (error) throw error;
      return { data, success: true };
    } catch (error) {
      throw new Error(`Database insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleCodeAnalysis(params: { code: string; language: string; checkTypes: string[] }): Promise<any> {
    // Mock code analysis - in production, this would use actual linting/analysis tools
    const analysis = {
      language: params.language,
      linesOfCode: params.code.split('\n').length,
      complexity: Math.floor(Math.random() * 10) + 1,
      issues: [],
      suggestions: [
        'Consider extracting large functions into smaller ones',
        'Add proper error handling',
        'Improve variable naming consistency'
      ],
      security: {
        vulnerabilities: [],
        score: 85
      },
      performance: {
        suggestions: ['Consider memoization for expensive operations'],
        score: 90
      }
    };

    return analysis;
  }

  private async handleCodeGeneration(params: { specification: string; framework: string; style: string }): Promise<any> {
    // Mock code generation - in production, this would use AI code generation
    const generatedCode = `
// Generated ${params.framework} code for: ${params.specification}
// Style: ${params.style}

import React from 'react';

export const GeneratedComponent: React.FC = () => {
  return (
    <div className="p-4">
      <h1>Generated Component</h1>
      <p>This component was generated based on: {params.specification}</p>
    </div>
  );
};

export default GeneratedComponent;
`;

    return {
      code: generatedCode,
      framework: params.framework,
      files: [
        {
          path: 'src/components/GeneratedComponent.tsx',
          content: generatedCode
        }
      ],
      metadata: {
        specification: params.specification,
        framework: params.framework,
        style: params.style,
        generated_at: new Date().toISOString()
      }
    };
  }

  private async handleWorkflowCreation(params: { workflow: any; context?: any }): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('workflow_definitions')
        .insert({
          name: params.workflow.name || 'Generated Workflow',
          description: params.workflow.description || 'MCP Generated Workflow',
          definition: params.workflow,
          status: 'active',
          user_id: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;

      return {
        workflowId: data.id,
        workflow: params.workflow,
        status: 'created',
        context: params.context
      };
    } catch (error) {
      throw new Error(`Workflow creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async handleDeepReasoning(params: { problem: string; context?: any[]; depth: string }): Promise<any> {
    // This would integrate with DeepSeekReasonerCore
    return {
      problem: params.problem,
      reasoning: `Deep reasoning analysis for: ${params.problem}`,
      conclusions: [
        'Primary analysis indicates multiple solution paths',
        'Context suggests prioritizing efficiency over complexity',
        'Recommend iterative approach with validation checkpoints'
      ],
      confidence: 0.87,
      depth: params.depth,
      context_used: params.context?.length || 0
    };
  }

  private async loadServersFromDatabase() {
    try {
      const { data, error } = await supabase
        .from('mcp_tools')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      console.log(`📚 MCP Hub: Loaded ${data?.length || 0} tools from database`);
    } catch (error) {
      console.error('Failed to load MCP tools from database:', error);
    }
  }

  private async registerWithA2A() {
    await a2aProtocol.registerAgent({
      id: 'mcp_hub',
      name: 'MCP Hub',
      type: 'tool_coordinator',
      capabilities: ['tool_execution', 'workflow_management', 'database_operations'],
      status: 'active',
      currentTasks: []
    });

    // Listen for tool execution requests
    a2aProtocol.addEventListener('message:mcp_hub', async (message: any) => {
      if (message.messageType === 'task' && message.payload.type === 'tool_execution') {
        try {
          const result = await this.executeTool(
            message.payload.toolId,
            message.payload.parameters,
            message.fromAgent
          );
        } catch (error) {
          console.error('A2A tool execution failed:', error);
        }
      }
    });
  }

  getTool(toolId: string): MCPTool | undefined {
    return this.tools.get(toolId);
  }

  getAllTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  getToolsByCategory(category: MCPTool['category']): MCPTool[] {
    return Array.from(this.tools.values()).filter(tool => tool.category === category);
  }

  getExecutionHistory(limit: number = 50): typeof this.executionHistory {
    return this.executionHistory.slice(-limit);
  }

  async enableTool(toolId: string): Promise<boolean> {
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.enabled = true;
      return await this.updateToolInDatabase(toolId, { enabled: true });
    }
    return false;
  }

  async disableTool(toolId: string): Promise<boolean> {
    const tool = this.tools.get(toolId);
    if (tool) {
      tool.enabled = false;
      return await this.updateToolInDatabase(toolId, { enabled: false });
    }
    return false;
  }

  private async updateToolInDatabase(toolId: string, updates: any): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('mcp_tools')
        .update(updates)
        .eq('id', toolId);

      return !error;
    } catch (error) {
      console.error('Failed to update tool in database:', error);
      return false;
    }
  }

  async getServerStatus(): Promise<{ [serverId: string]: any }> {
    return Object.fromEntries(
      Array.from(this.servers.entries()).map(([id, server]) => [
        id,
        {
          name: server.name,
          status: server.status,
          toolCount: server.tools.length,
          activeTools: server.tools.filter(t => t.enabled).length
        }
      ])
    );
  }
}

export const mcpHub = new MCPHubCore();
