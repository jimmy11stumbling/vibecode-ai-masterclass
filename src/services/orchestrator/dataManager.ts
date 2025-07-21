
import { supabase } from '@/integrations/supabase/client';
import { SovereignTask, ProjectSpec } from './types';

export class DataManager {
  private anonymousMode: boolean = false;

  setAnonymousMode(isAnonymous: boolean): void {
    this.anonymousMode = isAnonymous;
  }

  isAnonymousMode(): boolean {
    return this.anonymousMode;
  }

  async getAgentTasks(agentId: string): Promise<SovereignTask[]> {
    if (this.anonymousMode) {
      return [];
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('sovereign_tasks')
      .select('*')
      .eq('assigned_agent', agentId)
      .eq('user_id', user.id);

    if (error) return [];

    return (data || []).map(task => ({
      ...task,
      status: task.status as SovereignTask['status'],
      priority: task.priority as SovereignTask['priority']
    }));
  }

  async getTasks(executionId?: string): Promise<SovereignTask[]> {
    if (this.anonymousMode) {
      return this.getMockTasks(executionId);
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return this.getMockTasks(executionId);

    let query = supabase
      .from('sovereign_tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (executionId) {
      query = query.eq('execution_id', executionId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(task => ({
      ...task,
      status: task.status as SovereignTask['status'],
      priority: task.priority as SovereignTask['priority']
    }));
  }

  private getMockTasks(executionId?: string): SovereignTask[] {
    const mockTasks: SovereignTask[] = [
      {
        id: 'mock_1',
        execution_id: executionId || 'demo',
        type: 'architecture',
        description: 'Design application architecture',
        status: 'completed',
        priority: 'high',
        assigned_agent: 'architect_agent',
        user_id: 'anonymous',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {},
        result: {}
      },
      {
        id: 'mock_2',
        execution_id: executionId || 'demo',
        type: 'frontend',
        description: 'Implement user interface components',
        status: 'in_progress',
        priority: 'medium',
        assigned_agent: 'frontend_agent',
        user_id: 'anonymous',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        metadata: {},
        result: {}
      }
    ];

    return executionId ? mockTasks.filter(t => t.execution_id === executionId) : mockTasks;
  }

  async getActiveProjects(): Promise<ProjectSpec[]> {
    if (this.anonymousMode) {
      return [{
        id: 'demo_project',
        execution_id: 'demo',
        name: 'Demo Project',
        description: 'Demonstration project for anonymous mode',
        requirements: {},
        tech_stack: ['React', 'TypeScript', 'Tailwind CSS'],
        status: 'active',
        user_id: 'anonymous',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }];
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('project_specs')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
}
