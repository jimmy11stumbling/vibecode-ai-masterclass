
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

    // Store tasks in database with proper column mapping
    try {
      const tasksToInsert = tasks.map(task => ({
        id: task.id,
        execution_id: task.execution_id,
        type: task.type,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dependencies: task.dependencies || [],
        estimated_duration: task.estimated_duration,
        user_id: task.user_id,
        assigned_agent: task.assigned_agent || null,
        result: task.result || {},
        metadata: task.metadata || {}
      }));

      const { error } = await supabase
        .from('sovereign_tasks')
        .insert(tasksToInsert);

      if (error) {
        console.error('Failed to insert tasks:', error);
        // Continue without database storage in case of error
      } else {
        console.log(`✅ Successfully stored ${tasks.length} tasks in database`);
      }
    } catch (error) {
      console.error('Database operation failed:', error);
      // Continue without database storage
    }

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
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    };
    
    if (result) {
      updateData.result = result;
    }

    try {
      const { error } = await supabase
        .from('sovereign_tasks')
        .update(updateData)
        .eq('id', taskId);

      if (error) {
        console.error('Failed to update task status:', error);
      }
    } catch (error) {
      console.error('Database update failed:', error);
    }

    // Update local cache
    for (const [executionId, tasks] of this.taskQueue) {
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        tasks[taskIndex].status = status;
        tasks[taskIndex].updated_at = new Date().toISOString();
        if (result) {
          tasks[taskIndex].result = result;
        }
        break;
      }
    }
  }

  getTaskQueue(executionId: string): SovereignTask[] {
    return this.taskQueue.get(executionId) || [];
  }
}
