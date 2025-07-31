import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Activity } from 'lucide-react';
import { agentManager } from '@/services/agentManager';
import { AgentStatusList } from './agent/AgentStatusList';
import { MetricsOverview } from './agent/MetricsOverview';
import { ExecutionList } from './agent/ExecutionList';

interface ExecutionInfo {
  id: string;
  status: string;
  progress: number;
  startTime: Date;
  tasksTotal: number;
  tasksCompleted: number;
  tasksFailed: number;
}

export const AgentDashboard: React.FC = () => {
  const [agentStatuses, setAgentStatuses] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    totalTasksCompleted: 0,
    successRate: 0,
    averageTaskDuration: 0,
    currentStats: {
      activeAgents: 0,
      queuedTasks: 0
    },
    agentUtilization: 0
  });
  const [executions, setExecutions] = useState<ExecutionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data - replace with actual agent manager calls
      const mockAgents = [
        { id: '1', name: 'Architect Agent', status: 'active', currentTask: 'Designing system architecture', progress: 75, lastActivity: '2 min ago' },
        { id: '2', name: 'Frontend Agent', status: 'busy', currentTask: 'Building React components', progress: 45, lastActivity: '5 min ago' },
        { id: '3', name: 'Backend Agent', status: 'idle', lastActivity: '1 hour ago' },
        { id: '4', name: 'Validator Agent', status: 'active', currentTask: 'Running tests', progress: 90, lastActivity: '1 min ago' }
      ];

      const mockMetrics = {
        totalTasks: 142,
        completedTasks: 128,
        failedTasks: 6,
        totalTasksCompleted: 128,
        successRate: 0.92,
        averageTaskDuration: 245,
        currentStats: {
          activeAgents: 4,
          queuedTasks: 8
        },
        agentUtilization: 0.75
      };

      const mockExecutions = [
        {
          id: 'exec_1',
          status: 'running',
          progress: 65,
          startTime: new Date(Date.now() - 1800000),
          tasksTotal: 12,
          tasksCompleted: 8,
          tasksFailed: 1
        }
      ];

      setAgentStatuses(mockAgents);
      setMetrics(mockMetrics);
      setExecutions(mockExecutions);
    } catch (error) {
      console.error('Failed to load agent dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecutionAction = (id: string, action: 'pause' | 'resume' | 'stop') => {
    console.log(`Action ${action} on execution ${id}`);
    // Implement execution control logic
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Activity className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        <Button onClick={loadDashboardData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <MetricsOverview metrics={metrics} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Agent Status</h2>
          <AgentStatusList agents={agentStatuses} />
        </div>
        <div>
          <ExecutionList 
            executions={executions} 
            onExecutionAction={handleExecutionAction}
          />
        </div>
      </div>
    </div>
  );
};