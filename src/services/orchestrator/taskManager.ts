
import { supabase } from '@/integrations/supabase/client';
import { SovereignTask } from './types';

export class TaskManager {
  private taskQueue: Map<string, SovereignTask[]> = new Map();

  async createAndDelegateTasks(executionId: string, reasoningResult: any, userId: string): Promise<SovereignTask[]> {
    const taskDefinitions = this.extractTaskDefinitions(reasoningResult);
    const tasks: SovereignTask[] = [];

    for (const taskDef of taskDefinitions) {
      const task: SovereignTask = {
        id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        execution_id: executionId,
        type: taskDef.type,
        description: taskDef.description,
        status: 'pending',
        priority: taskDef.priority || 'medium',
        dependencies: taskDef.dependencies || [],
        estimated_duration: taskDef.estimated_duration || 300000,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {
          reasoning_context: reasoningResult,
          delegation_strategy: 'capability_based',
          complexity_score: taskDef.complexity || 1
        }
      };

      tasks.push(task);
    }

    // Store tasks in database
    const { error } = await supabase
      .from('sovereign_tasks')
      .insert(tasks.map(task => ({
        ...task,
        result: task.result || {},
        metadata: task.metadata || {}
      })));

    if (error) throw error;

    this.taskQueue.set(executionId, tasks);
    console.log(`📝 Created and delegated ${tasks.length} tasks`);
    return tasks;
  }

  private extractTaskDefinitions(reasoningResult: any) {
    return [
      {
        type: 'architecture',
        description: 'Design system architecture and data models',
        priority: 'high' as const,
        dependencies: [],
        estimated_duration: 600000,
        complexity: 3
      },
      {
        type: 'frontend',
        description: 'Build user interface components',
        priority: 'medium' as const,
        dependencies: ['architecture'],
        estimated_duration: 900000,
        complexity: 2
      },
      {
        type: 'backend',
        description: 'Implement backend services and APIs',
        priority: 'medium' as const,
        dependencies: ['architecture'],
        estimated_duration: 1200000,
        complexity: 3
      },
      {
        type: 'integration',
        description: 'Set up external service integrations',
        priority: 'medium' as const,
        dependencies: ['frontend', 'backend'],
        estimated_duration: 600000,
        complexity: 2
      },
      {
        type: 'validation',
        description: 'Validate and test implementation',
        priority: 'low' as const,
        dependencies: ['integration'],
        estimated_duration: 400000,
        complexity: 1
      }
    ];
  }

  async updateTaskStatus(taskId: string, status: SovereignTask['status'], result?: any): Promise<void> {
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (result) {
      updateData.result = result;
    }

    const { error } = await supabase
      .from('sovereign_tasks')
      .update(updateData)
      .eq('id', taskId);

    if (error) throw error;
  }

  getTaskQueue(executionId: string): SovereignTask[] {
    return this.taskQueue.get(executionId) || [];
  }
}
