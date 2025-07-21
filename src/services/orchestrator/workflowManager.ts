
import { supabase } from '@/integrations/supabase/client';
import { SovereignTask, ProjectSpec, WorkflowExecution } from './types';

export class WorkflowManager {
  private activeExecutions: Map<string, WorkflowExecution> = new Map();

  async updateWorkflowProgress(executionId: string, step: number, phase: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.current_step = step;
      execution.progress = (step / execution.total_steps) * 100;
      console.log(`📊 Workflow ${executionId} - Step ${step}: ${phase} (${Math.round(execution.progress)}%)`);
    }
  }

  async createProjectSpecification(executionId: string, reasoningResult: any, userId: string, isAnonymous: boolean): Promise<ProjectSpec> {
    const projectData = {
      execution_id: executionId,
      name: reasoningResult.conclusion || 'AI Generated Project',
      description: reasoningResult.reasoning || 'Project generated through autonomous AI reasoning',
      requirements: reasoningResult,
      tech_stack: ['React', 'TypeScript', 'Tailwind CSS'],
      status: 'active',
      user_id: userId
    };

    if (isAnonymous) {
      console.log('📝 Anonymous mode: Creating in-memory project spec');
      return {
        id: `proj_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...projectData
      } as ProjectSpec;
    }

    try {
      const { data, error } = await supabase
        .from('project_specs')
        .insert(projectData)
        .select()
        .single();

      if (error) throw error;
      return data as ProjectSpec;
    } catch (error) {
      console.error('Failed to save project spec to database:', error);
      return {
        id: `proj_${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...projectData
      } as ProjectSpec;
    }
  }

  async handleExecutionFailure(executionId: string, error: any): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution) {
      execution.status = 'failed';
      execution.error_message = error.message;
      execution.completed_at = new Date().toISOString();
    }
  }

  getWorkflowExecution(executionId: string): WorkflowExecution | undefined {
    return this.activeExecutions.get(executionId);
  }

  getAllActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  setActiveExecution(executionId: string, execution: WorkflowExecution): void {
    this.activeExecutions.set(executionId, execution);
  }

  async pauseExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'running') {
      execution.status = 'paused';
      console.log(`⏸️ Execution ${executionId} paused`);
    }
  }

  async resumeExecution(executionId: string): Promise<void> {
    const execution = this.activeExecutions.get(executionId);
    if (execution && execution.status === 'paused') {
      execution.status = 'running';
      console.log(`▶️ Execution ${executionId} resumed`);
    }
  }
}
