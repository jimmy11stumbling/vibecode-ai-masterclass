
import { supabase } from '@/integrations/supabase/client';
import { deepSeekIntegration } from './deepSeekIntegrationService';
import { a2aProtocol, A2AAgent } from './a2aProtocolCore';
import { mcpHub } from './mcpHubCore';

export interface AgentTask {
  id: string;
  type: 'code_generation' | 'architecture' | 'validation' | 'optimization' | 'deployment';
  description: string;
  context: {
    projectFiles: any[];
    requirements: string[];
    constraints: string[];
  };
  assignedAgent: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  result?: any;
  createdAt: Date;
}

export interface DeepSeekAgentResponse {
  code?: string;
  files?: Array<{
    path: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
  }>;
  explanation: string;
  nextSteps: string[];
  confidence: number;
}

export class DeepSeekAgentCore {
  private apiKey: string = '';
  private activeTasks: Map<string, AgentTask> = new Map();

  constructor() {
    this.loadApiKey();
  }

  private async loadApiKey() {
    try {
      const { data } = await supabase.functions.invoke('get-deepseek-key');
      if (data?.key) {
        this.apiKey = data.key;
        await deepSeekIntegration.updateReasonerApiKey(data.key);
        console.log('🔑 DeepSeek API key loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load DeepSeek API key:', error);
    }
  }

  async createFullStackApplication(prompt: string, projectContext: any = {}): Promise<string> {
    console.log('🚀 Starting full-stack application creation with DeepSeek');

    try {
      // Create advanced reasoning session
      const sessionId = await deepSeekIntegration.createReasoningSession({
        query: `Create a complete full-stack application: ${prompt}`,
        context: JSON.stringify(projectContext),
        reasoningDepth: 'expert',
        domainFocus: ['frontend', 'backend', 'database', 'deployment']
      });

      // Perform advanced reasoning with progress tracking
      const reasoningResult = await deepSeekIntegration.performAdvancedReasoning(
        sessionId,
        (progress) => {
          console.log(`🧠 DeepSeek Reasoning Progress: ${progress.step} (${progress.progress}%)`);
        }
      );

      // Break down into agent tasks
      const tasks = await this.createAgentTasks(reasoningResult, prompt);

      // Execute tasks through specialized agents
      const results = await this.executeAgentTasks(tasks);

      console.log('✅ Full-stack application creation completed');
      return sessionId;

    } catch (error) {
      console.error('❌ Full-stack application creation failed:', error);
      throw error;
    }
  }

  private async createAgentTasks(reasoningResult: any, originalPrompt: string): Promise<AgentTask[]> {
    const tasks: AgentTask[] = [];

    // Architecture task
    tasks.push({
      id: `arch_${Date.now()}`,
      type: 'architecture',
      description: 'Design system architecture and file structure',
      context: {
        projectFiles: [],
        requirements: [originalPrompt],
        constraints: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase']
      },
      assignedAgent: 'architect-agent',
      status: 'pending',
      createdAt: new Date()
    });

    // Frontend generation task
    tasks.push({
      id: `frontend_${Date.now()}`,
      type: 'code_generation',
      description: 'Generate React components and pages',
      context: {
        projectFiles: [],
        requirements: [originalPrompt, 'Create responsive UI', 'Use modern React patterns'],
        constraints: ['TypeScript', 'Tailwind CSS', 'Accessibility']
      },
      assignedAgent: 'frontend-builder',
      status: 'pending',
      createdAt: new Date()
    });

    // Backend generation task
    tasks.push({
      id: `backend_${Date.now()}`,
      type: 'code_generation',
      description: 'Generate API endpoints and business logic',
      context: {
        projectFiles: [],
        requirements: [originalPrompt, 'RESTful APIs', 'Database integration'],
        constraints: ['Supabase Edge Functions', 'Type safety', 'Error handling']
      },
      assignedAgent: 'backend-builder',
      status: 'pending',
      createdAt: new Date()
    });

    // Validation task
    tasks.push({
      id: `validation_${Date.now()}`,
      type: 'validation',
      description: 'Validate code quality and functionality',
      context: {
        projectFiles: [],
        requirements: ['Type checking', 'Code quality', 'Best practices'],
        constraints: ['ESLint', 'TypeScript', 'Performance']
      },
      assignedAgent: 'validator-agent',
      status: 'pending',
      createdAt: new Date()
    });

    return tasks;
  }

  private async executeAgentTasks(tasks: AgentTask[]): Promise<DeepSeekAgentResponse[]> {
    const results: DeepSeekAgentResponse[] = [];

    for (const task of tasks) {
      try {
        console.log(`🤖 Executing task: ${task.description}`);
        
        this.activeTasks.set(task.id, { ...task, status: 'in_progress' });

        const result = await this.executeAgentTask(task);
        results.push(result);

        this.activeTasks.set(task.id, { ...task, status: 'completed', result });

      } catch (error) {
        console.error(`❌ Task failed: ${task.description}`, error);
        this.activeTasks.set(task.id, { ...task, status: 'failed' });
      }
    }

    return results;
  }

  private async executeAgentTask(task: AgentTask): Promise<DeepSeekAgentResponse> {
    const agent = a2aProtocol.getAgents().find(a => 
      a.type === task.type || a.name.toLowerCase().includes(task.assignedAgent)
    );

    if (!agent) {
      throw new Error(`No agent found for task type: ${task.type}`);
    }

    // Use DeepSeek to generate response based on agent specialization
    const prompt = this.buildAgentPrompt(task, agent);
    
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: [
            {
              role: 'system',
              content: `You are ${agent.role}, an expert AI agent. ${agent.description}`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      return this.parseAgentResponse(content, task);

    } catch (error) {
      console.error(`Agent task execution failed:`, error);
      throw error;
    }
  }

  private buildAgentPrompt(task: AgentTask, agent: A2AAgent): string {
    return `
Task: ${task.description}

Context:
- Requirements: ${task.context.requirements.join(', ')}
- Constraints: ${task.context.constraints.join(', ')}
- Project Files: ${task.context.projectFiles.length} files available

Agent Capabilities: ${agent.capabilities.join(', ')}

Instructions:
1. Analyze the task requirements thoroughly
2. Generate appropriate code/files for this task
3. Provide clear explanations for your decisions
4. Suggest next steps or improvements

Please provide a structured response with:
- Generated code (if applicable)
- File operations needed
- Explanation of approach
- Confidence level (0-1)
- Recommended next steps

Focus on your specialization: ${agent.role}
    `.trim();
  }

  private parseAgentResponse(content: string, task: AgentTask): DeepSeekAgentResponse {
    // Try to extract structured information from the response
    const codeBlocks = this.extractCodeBlocks(content);
    
    return {
      code: codeBlocks.length > 0 ? codeBlocks[0].code : undefined,
      files: codeBlocks.map((block, index) => ({
        path: block.filename || `generated-${task.type}-${index}.tsx`,
        content: block.code,
        operation: 'create' as const
      })),
      explanation: content,
      nextSteps: this.extractNextSteps(content),
      confidence: 0.85 // Default confidence
    };
  }

  private extractCodeBlocks(content: string): Array<{filename?: string; code: string}> {
    const codeBlockRegex = /```(?:(\w+))?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const code = match[2];
      const filenameMatch = code.match(/\/\*\s*filename:\s*([^\s]+)\s*\*\/|\/\/\s*filename:\s*([^\s]+)/);
      const filename = filenameMatch ? (filenameMatch[1] || filenameMatch[2]) : undefined;
      
      blocks.push({ filename, code });
    }

    return blocks;
  }

  private extractNextSteps(content: string): string[] {
    const nextStepsMatch = content.match(/(?:next steps?|recommendations?|suggestions?):\s*(.*?)(?:\n\n|\n$|$)/i);
    if (nextStepsMatch) {
      return nextStepsMatch[1].split(/[,;]\s*/).filter(step => step.trim().length > 0);
    }
    return ['Continue with implementation', 'Test functionality', 'Review and optimize'];
  }

  async getActiveTasks(): Promise<AgentTask[]> {
    return Array.from(this.activeTasks.values());
  }

  async getTaskById(taskId: string): Promise<AgentTask | undefined> {
    return this.activeTasks.get(taskId);
  }
}

export const deepSeekAgentCore = new DeepSeekAgentCore();
