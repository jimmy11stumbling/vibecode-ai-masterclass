import { supabase } from '@/integrations/supabase/client';
import { DeepSeekReasonerCore } from './deepSeekReasonerCore';
import { SpecializedAgents } from './specializedAgents';
import type { ProjectSpec, SovereignTask, AgentCapability } from '@/integrations/supabase/types';

interface ProjectFile {
  path: string;
  content: string;
  type: 'file' | 'folder';
}

interface ProjectContext {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  files: ProjectFile[];
}

interface TaskResult {
  success: boolean;
  message: string;
  details?: any;
}

export class SovereignOrchestrator {
  private deepSeekReasoner: DeepSeekReasonerCore;
  private specializedAgents: SpecializedAgents;
  private availableCapabilities: AgentCapability[] = [];

  constructor() {
    this.deepSeekReasoner = new DeepSeekReasonerCore();
    this.specializedAgents = new SpecializedAgents();
    this.loadCapabilities();
  }

  private async loadCapabilities(): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('agent_capabilities')
        .select('*');

      if (error) {
        console.error('Error loading agent capabilities:', error);
        return;
      }

      this.availableCapabilities = data;
      console.log('Agent capabilities loaded successfully.');
    } catch (err) {
      console.error('Unexpected error loading agent capabilities:', err);
    }
  }

  private suggestTechStack(userPrompt: string): string[] {
    const prompt = userPrompt.toLowerCase();
    const suggestedStack: string[] = [];

    if (prompt.includes('react') || prompt.includes('frontend')) {
      suggestedStack.push('react');
    }
    if (prompt.includes('typescript')) {
      suggestedStack.push('typescript');
    }
    if (prompt.includes('node') || prompt.includes('backend')) {
      suggestedStack.push('node.js');
    }
    if (prompt.includes('python')) {
      suggestedStack.push('python');
    }
    if (prompt.includes('database')) {
      suggestedStack.push('postgresql');
    }
    if (prompt.includes('mobile')) {
      suggestedStack.push('react-native');
    }

    return suggestedStack;
  }

  public async processUserRequest(userPrompt: string, projectContext?: any): Promise<string> {
    const executionId = `exec-${Date.now()}`;
    
    // Step 1: Use DeepSeek reasoning to analyze the request
    const reasoning = await this.deepSeekReasoner.generateResponse(
      `Analyze this request and create a project plan: ${userPrompt}`
    );

    // Step 2: Create project specification
    const projectSpec: ProjectSpec = {
      id: executionId,
      name: `Project-${Date.now()}`,
      description: userPrompt,
      status: 'planning',
      techStack: this.suggestTechStack(userPrompt),
      requirements: reasoning,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Step 3: Store project specification in the database
    const { error: specError } = await supabase
      .from('project_specs')
      .insert([projectSpec]);

    if (specError) {
      console.error('Error saving project spec:', specError);
      throw new Error('Failed to save project specification');
    }

    // Step 4: Break down the project into smaller tasks
    const tasks = [
      {
        id: `task-${Date.now()}-1`,
        projectId: executionId,
        type: 'analysis',
        description: 'Analyze user requirements',
        status: 'pending',
        priority: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${Date.now()}-2`,
        projectId: executionId,
        type: 'design',
        description: 'Design the application architecture',
        status: 'pending',
        priority: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${Date.now()}-3`,
        projectId: executionId,
        type: 'implementation',
        description: 'Implement the core features',
        status: 'pending',
        priority: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${Date.now()}-4`,
        projectId: executionId,
        type: 'testing',
        description: 'Test the implemented features',
        status: 'pending',
        priority: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: `task-${Date.now()}-5`,
        projectId: executionId,
        type: 'deployment',
        description: 'Deploy the application',
        status: 'pending',
        priority: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Step 5: Store tasks in the database
    const { error: taskError } = await supabase
      .from('sovereign_tasks')
      .insert(tasks);

    if (taskError) {
      console.error('Error saving tasks:', taskError);
      throw new Error('Failed to save tasks');
    }

    // Step 6: Orchestrate task execution
    tasks.forEach(task => {
      this.executeTask(task);
    });

    return executionId;
  }

  private async notifyTaskCompletion(task: SovereignTask): Promise<void> {
    try {
      const { error } = await supabase
        .from('sovereign_tasks')
        .update(task)
        .eq('id', task.id);

      if (error) {
        console.error(`Error updating task ${task.id}:`, error);
      } else {
        console.log(`Task ${task.id} updated successfully.`);
      }
    } catch (err) {
      console.error(`Unexpected error updating task ${task.id}:`, err);
    }
  }

  private async executeTask(task: SovereignTask): Promise<void> {
    console.log(`Executing task: ${task.type} - ${task.description}`);
    
    // Update task status to in progress
    task.status = 'in_progress';
    task.updatedAt = new Date();
    
    // Simulate task execution based on type
    setTimeout(async () => {
      try {
        switch (task.type) {
          case 'analysis':
            await this.executeAnalysisTask(task);
            break;
          case 'design':
            await this.executeDesignTask(task);
            break;
          case 'implementation':
            await this.executeImplementationTask(task);
            break;
          case 'testing':
            await this.executeTestingTask(task);
            break;
          case 'deployment':
            await this.executeDeploymentTask(task);
            break;
          default:
            console.warn(`Unknown task type: ${task.type}`);
        }
        
        // Try to use specialized agents if available
        try {
          // Use DeepSeek for task-specific reasoning if available
          if (this.deepSeekReasoner) {
            const taskReasoning = await this.deepSeekReasoner.generateResponse(
              `Execute ${task.type} task: ${task.description}`
            );
            
            task.result = taskReasoning;
          } else {
            task.result = `Completed ${task.type} task successfully`;
          }
          
          task.status = 'completed';
        } catch (error) {
          console.error(`Error in specialized execution for task ${task.id}:`, error);
          task.status = 'failed';
          task.result = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      } catch (error) {
        console.error(`Error executing task ${task.id}:`, error);
        task.status = 'failed';
        task.result = `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      } finally {
        task.updatedAt = new Date();
        this.notifyTaskCompletion(task);
      }
    }, Math.random() * 2000 + 1000); // Random delay 1-3 seconds
  }

  private async executeAnalysisTask(task: SovereignTask): Promise<void> {
    console.log(`Executing analysis task: ${task.description}`);
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  private async executeDesignTask(task: SovereignTask): Promise<void> {
    console.log(`Executing design task: ${task.description}`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  private async executeImplementationTask(task: SovereignTask): Promise<void> {
    console.log(`Executing implementation task: ${task.description}`);
    await new Promise(resolve => setTimeout(resolve, 2500));
  }

  private async executeTestingTask(task: SovereignTask): Promise<void> {
    console.log(`Executing testing task: ${task.description}`);
    await new Promise(resolve => setTimeout(resolve, 1800));
  }

  private async executeDeploymentTask(task: SovereignTask): Promise<void> {
    console.log(`Executing deployment task: ${task.description}`);
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
}
