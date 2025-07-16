
export interface SovereignTask {
  id: string;
  type: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: string;
  metadata?: Record<string, any>;
  result?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemMetrics {
  totalAgents: number;
  activeAgents: number;
  pendingTasks: number;
  completedTasks: number;
  systemUptime: number;
  lastHealthCheck: Date;
}
