
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Square,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { agentManager } from '@/services/agentManager';

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

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = () => {
    try {
      // Get agent statuses
      const statuses = agentManager.getAgentStatus() as any[];
      setAgentStatuses(Array.isArray(statuses) ? statuses : []);

      // Get metrics
      const currentMetrics = agentManager.getMetrics();
      setMetrics(currentMetrics);

      // Get active executions
      const activeExecutions = agentManager.getActiveExecutions();
      const executionInfo: ExecutionInfo[] = activeExecutions.map(exec => ({
        id: exec.id,
        status: exec.status,
        progress: exec.progress,
        startTime: exec.startTime,
        tasksTotal: 1,
        tasksCompleted: exec.status === 'completed' ? 1 : 0,
        tasksFailed: exec.status === 'failed' ? 1 : 0
      }));
      setExecutions(executionInfo);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'idle': return 'bg-green-500/20 text-green-400';
      case 'busy': return 'bg-yellow-500/20 text-yellow-400';
      case 'offline': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'idle': return <CheckCircle className="w-4 h-4" />;
      case 'busy': return <Activity className="w-4 h-4" />;
      case 'offline': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const handleExecutionAction = async (executionId: string, action: 'pause' | 'resume' | 'cancel') => {
    try {
      switch (action) {
        case 'pause':
          await agentManager.pauseExecution(executionId);
          break;
        case 'resume':
          await agentManager.resumeExecution(executionId);
          break;
        case 'cancel':
          await agentManager.cancelExecution(executionId);
          break;
      }
      loadDashboardData();
    } catch (error) {
      console.error(`Failed to ${action} execution:`, error);
    }
  };

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Agent Dashboard</h3>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-300">Active Agents</CardTitle>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.currentStats.activeAgents}</div>
            <p className="text-xs text-slate-400">Currently online</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-300">Success Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round(metrics.successRate)}%</div>
            <p className="text-xs text-slate-400">Task completion</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-300">Avg Duration</CardTitle>
              <Clock className="w-4 h-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{Math.round(metrics.averageTaskDuration / 1000)}s</div>
            <p className="text-xs text-slate-400">Per task</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-600">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-slate-300">Utilization</CardTitle>
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{metrics.agentUtilization}%</div>
            <p className="text-xs text-slate-400">System capacity</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Status */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white text-sm">Agent Status</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {agentStatuses.map((agent) => (
                <div key={agent.id} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="text-sm text-white capitalize">{agent.id}</span>
                      <p className="text-xs text-slate-400">
                        Last active: {new Date(agent.lastActivity).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(agent.status)}>
                    {getStatusIcon(agent.status)}
                    <span className="ml-1">{agent.status}</span>
                  </Badge>
                </div>
              ))}

              {agentStatuses.length === 0 && (
                <div className="text-center py-4 text-slate-400">
                  <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No agents active</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Active Executions */}
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white text-sm">Active Executions</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-40">
            <div className="space-y-3">
              {executions.map((execution) => (
                <div key={execution.id} className="p-3 bg-slate-700 rounded">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white">Task {execution.id.slice(-8)}</span>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(execution.status)}>
                        {execution.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progress</span>
                      <span>{execution.progress}%</span>
                    </div>
                    <Progress value={execution.progress} className="h-1" />
                  </div>

                  <div className="flex items-center justify-between mt-2">
                    <div className="text-xs text-slate-400">
                      Started: {execution.startTime.toLocaleTimeString()}
                    </div>
                    <div className="flex space-x-1">
                      {execution.status === 'running' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExecutionAction(execution.id, 'pause')}
                          className="h-6 w-6 p-0"
                        >
                          <Pause className="w-3 h-3" />
                        </Button>
                      )}
                      {execution.status === 'paused' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleExecutionAction(execution.id, 'resume')}
                          className="h-6 w-6 p-0"
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleExecutionAction(execution.id, 'cancel')}
                        className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
                      >
                        <Square className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {executions.length === 0 && (
                <div className="text-center py-4 text-slate-400">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No active executions</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
