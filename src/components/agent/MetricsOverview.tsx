import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock,
  Activity
} from 'lucide-react';

interface Metrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  totalTasksCompleted: number;
  successRate: number;
  averageTaskDuration: number;
  currentStats: {
    activeAgents: number;
    queuedTasks: number;
  };
  agentUtilization: number;
}

interface MetricsOverviewProps {
  metrics: Metrics;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics }) => {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalTasks}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.currentStats.queuedTasks} queued
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Math.round(metrics.successRate * 100)}%</div>
          <Progress value={metrics.successRate * 100} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.currentStats.activeAgents}</div>
          <p className="text-xs text-muted-foreground">
            {Math.round(metrics.agentUtilization)}% utilization
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatDuration(metrics.averageTaskDuration)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.completedTasks} completed
          </p>
        </CardContent>
      </Card>
    </div>
  );
};