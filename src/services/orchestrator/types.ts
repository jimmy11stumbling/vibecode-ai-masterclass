
export interface SovereignTask {
  id: string;
  execution_id: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high';
  assigned_agent?: string;
  result?: any;
  metadata?: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  dependencies?: string[];
  progress?: number;
  estimated_duration?: number;
  actual_duration?: number;
}

export interface ProjectSpec {
  id: string;
  execution_id: string;
  name: string;
  description?: string;
  requirements?: any;
  tech_stack?: string[];
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  execution_id: string;
  workflow_definition: any;
  current_step: number;
  total_steps: number;
  status: 'running' | 'paused' | 'completed' | 'failed';
  progress: number;
  started_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface AgentCapability {
  name: string;
  type: 'tool' | 'reasoning' | 'communication' | 'analysis';
  parameters: Record<string, any>;
  performance_metrics: {
    success_rate: number;
    avg_execution_time: number;
    complexity_rating: number;
  };
}

export interface TaskDelegationStrategy {
  strategy_name: string;
  criteria: Record<string, any>;
  fallback_agents: string[];
  optimization_rules: string[];
}
