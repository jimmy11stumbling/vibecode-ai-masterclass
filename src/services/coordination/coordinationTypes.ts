
export interface AgentCoordinationEvent {
  id: string;
  type: 'task_assignment' | 'status_update' | 'resource_request' | 'collaboration';
  source_agent: string;
  target_agent?: string;
  payload: any;
  timestamp: Date;
  priority: 'low' | 'medium' | 'high';
}

export interface MultiAgentSession {
  id: string;
  participants: string[];
  coordination_mode: 'sequential' | 'parallel' | 'hierarchical';
  shared_context: any;
  active_tasks: string[];
  started_at: Date;
  status: 'active' | 'paused' | 'completed';
}

export interface WorkflowCoordination {
  workflow_id: string;
  execution_plan: any;
  agent_assignments: Map<string, string[]>;
  dependency_graph: Map<string, string[]>;
  coordination_strategy: 'centralized' | 'distributed' | 'hybrid';
  conflict_resolution: 'priority_based' | 'consensus' | 'orchestrator_decides';
}

export interface CoordinationMetrics {
  active_sessions: number;
  active_workflows: number;
  coordination_events: number;
  average_response_time: number;
  system_load: number;
}
