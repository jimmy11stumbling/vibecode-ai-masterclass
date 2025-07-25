
import { a2aProtocol } from '../a2aProtocolCore';
import { SovereignTask } from './types';
import { TaskManager } from './taskManager';

export class WorkflowExecutor {
  private taskManager: TaskManager;

  constructor(taskManager: TaskManager) {
    this.taskManager = taskManager;
  }

  async executeCoordinatedWorkflow(executionId: string, tasks: SovereignTask[]) {
    console.log(`🤝 Executing coordinated workflow for ${tasks.length} tasks`);

    const dependencyGraph = this.buildDependencyGraph(tasks);
    const executedTasks = new Set<string>();
    const maxConcurrency = 3;
    const activeTasks = new Map<string, Promise<any>>();

    while (executedTasks.size < tasks.length) {
      const readyTasks = tasks.filter(task => 
        !executedTasks.has(task.id) && 
        !activeTasks.has(task.id) &&
        this.areDependenciesMet(task, executedTasks)
      );

      for (const task of readyTasks.slice(0, maxConcurrency - activeTasks.size)) {
        const taskPromise = this.executeTask(task);
        activeTasks.set(task.id, taskPromise);

        taskPromise.then(async (result) => {
          await this.taskManager.updateTaskStatus(task.id, 'completed', result);
          executedTasks.add(task.id);
          activeTasks.delete(task.id);
          console.log(`✅ Task completed: ${task.description}`);
        }).catch(async (error) => {
          await this.taskManager.updateTaskStatus(task.id, 'failed', { error: error.message });
          activeTasks.delete(task.id);
          console.error(`❌ Task failed: ${task.description}`, error);
        });
      }

      if (activeTasks.size >= maxConcurrency) {
        await Promise.race(Array.from(activeTasks.values()));
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    await Promise.allSettled(Array.from(activeTasks.values()));
    console.log(`🏁 Workflow execution completed for ${executionId}`);
  }

  private buildDependencyGraph(tasks: SovereignTask[]) {
    const graph = new Map<string, string[]>();
    tasks.forEach(task => {
      graph.set(task.id, task.dependencies || []);
    });
    return graph;
  }

  private areDependenciesMet(task: SovereignTask, executedTasks: Set<string>): boolean {
    if (!task.dependencies || task.dependencies.length === 0) return true;
    return task.dependencies.every(depId => executedTasks.has(depId));
  }

  private async executeTask(task: SovereignTask): Promise<any> {
    await this.taskManager.updateTaskStatus(task.id, 'in_progress');
    
    const startTime = Date.now();
    
    if (task.assigned_agent) {
      await a2aProtocol.sendMessage({
        fromAgent: 'orchestrator',
        toAgent: task.assigned_agent,
        type: 'task',
        content: {
          taskId: task.id,
          type: task.type,
          description: task.description,
          metadata: task.metadata
        },
        priority: task.priority === 'high' ? 'high' : 'medium'
      });
    }

    const executionTime = (task.estimated_duration || 300000) + (Math.random() * 60000);
    await new Promise(resolve => setTimeout(resolve, executionTime));
    
    const actualDuration = Date.now() - startTime;

    return {
      taskId: task.id,
      type: task.type,
      completedAt: new Date().toISOString(),
      actualDuration,
      success: true
    };
  }
}
