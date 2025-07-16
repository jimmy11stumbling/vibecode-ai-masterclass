
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Pause, 
  Play, 
  Square,
  BarChart3,
  Users,
  Zap,
  Settings,
  MessageSquare,
  GitBranch,
  Target,
  TrendingUp,
  Eye,
  RefreshCw
} from 'lucide-react';
import { agentManager } from '@/services/agentManager';
import { useToast } from '@/hooks/use-toast';

interface AgentInfo {
  id: string;
  type: string;
  status: 'idle' | 'busy' | 'offline';
  capabilities: string[];
  currentTask?: string;
  tasksCompleted: number;
  uptime: string;
}

interface ExecutionInfo {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  startTime: Date;
  estimatedCompletion?: Date;
  tasksTotal: number;
  tasksCompleted: number;
  tasksFailed: number;
}

interface SystemMetrics {
  totalTasks: number;
  successRate: number;
  averageTaskTime: number;
  systemLoad: number;
  agentUtilization: Record<string, number>;
}

interface Task {
  id: string;
  type: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'failed';
  assignedAgent?: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: Date;
  completedAt?: Date;
  duration?: number;
}

export const AgentDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [executions, setExecutions] = useState<ExecutionInfo[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalTasks: 0,
    successRate: 0,
    averageTaskTime: 0,
    systemLoad: 0,
    agentUtilization: {}
  });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    setupRealTimeUpdates();
    
    return () => {
      // Cleanup real-time updates
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsRefreshing(true);
      
      // Load agent status
      const agentStatus = agentManager.getAgentStatus();
      const agentData: AgentInfo[] = agentStatus.map(agent => ({
        id: agent.id,
        type: agent.type,
        status: agent.status,
        capabilities: agent.capabilities,
        tasksCompleted: Math.floor(Math.random() * 50),
        uptime: formatUptime(Math.random() * 86400000) // Random uptime
      }));
      setAgents(agentData);

      // Load system metrics
      const systemMetrics = agentManager.getMetrics();
      setMetrics({
        totalTasks: systemMetrics.totalTasksCompleted,
        successRate: systemMetrics.successRate * 100,
        averageTaskTime: systemMetrics.averageTaskDuration,
        systemLoad: systemMetrics.currentStats?.systemLoad || 0,
        agentUtilization: systemMetrics.agentUtilization
      });

      // Load active executions
      const activeExecutions = agentManager.getActiveExecutions();
      const executionData: ExecutionInfo[] = activeExecutions.map((id, index) => ({
        id,
        status: ['running', 'completed', 'paused'][index % 3] as any,
        progress: Math.floor(Math.random() * 100),
        startTime: new Date(Date.now() - Math.random() * 3600000),
        tasksTotal: Math.floor(Math.random() * 10) + 5,
        tasksCompleted: Math.floor(Math.random() * 8),
        tasksFailed: Math.floor(Math.random() * 2)
      }));
      setExecutions(executionData);

      // Load recent tasks
      const recentTasks = generateMockTasks(20);
      setTasks(recentTasks);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive"
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const setupRealTimeUpdates = () => {
    // Setup event listeners for real-time updates
    agentManager.addEventListener('taskCompleted', (data: any) => {
      toast({
        title: "Task Completed",
        description: `Task ${data.task.id} completed by ${data.agent.id}`,
      });
      loadDashboardData();
    });

    agentManager.addEventListener('executionCompleted', (data: any) => {
      toast({
        title: "Execution Completed",
        description: `Execution ${data.executionId} completed ${data.success ? 'successfully' : 'with errors'}`,
        variant: data.success ? "default" : "destructive"
      });
      loadDashboardData();
    });

    agentManager.addEventListener('agentStatusUpdated', (data: any) => {
      setAgents(prev => prev.map(agent => 
        agent.id === data.fromAgent 
          ? { ...agent, status: data.data.status }
          : agent
      ));
    });
  };

  const generateMockTasks = (count: number): Task[] => {
    const taskTypes = ['architecture', 'build-frontend', 'build-backend', 'validate', 'optimize'];
    const statuses: Task['status'][] = ['pending', 'assigned', 'in-progress', 'completed', 'failed'];
    const priorities: Task['priority'][] = ['high', 'medium', 'low'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `task-${i + 1}`,
      type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      assignedAgent: Math.random() > 0.3 ? `agent-${Math.floor(Math.random() * 5) + 1}` : undefined,
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      createdAt: new Date(Date.now() - Math.random() * 86400000),
      completedAt: Math.random() > 0.6 ? new Date() : undefined,
      duration: Math.random() > 0.6 ? Math.floor(Math.random() * 300000) : undefined
    }));
  };

  const formatUptime = (ms: number): string => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'completed':
      case 'running':
        return 'bg-green-500';
      case 'busy':
      case 'in-progress':
      case 'assigned':
        return 'bg-blue-500';
      case 'idle':
      case 'pending':
        return 'bg-yellow-500';
      case 'failed':
      case 'offline':
        return 'bg-red-500';
      case 'paused':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'running':
      case 'in-progress':
        return <Activity className="w-4 h-4 animate-pulse" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handlePauseExecution = (executionId: string) => {
    agentManager.pauseExecution(executionId);
    toast({
      title: "Execution Paused",
      description: `Execution ${executionId} has been paused`,
    });
  };

  const handleResumeExecution = (executionId: string) => {
    agentManager.resumeExecution(executionId);
    toast({
      title: "Execution Resumed",
      description: `Execution ${executionId} has been resumed`,
    });
  };

  const handleCancelExecution = (executionId: string) => {
    agentManager.cancelExecution(executionId);
    toast({
      title: "Execution Cancelled",
      description: `Execution ${executionId} has been cancelled`,
      variant: "destructive"
    });
  };

  return (
    <div className="h-full bg-slate-900 text-white p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Bot className="w-6 h-6 mr-2 text-purple-400" />
            Agent Dashboard
          </h1>
          <p className="text-sm text-slate-400">Monitor and control your AI agent swarm</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={loadDashboardData}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
              <Users className="w-4 h-4 mr-2 text-blue-400" />
              Active Agents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {agents.filter(a => a.status !== 'offline').length}
            </div>
            <p className="text-xs text-slate-500">
              {agents.filter(a => a.status === 'busy').length} busy, {agents.filter(a => a.status === 'idle').length} idle
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
              <Target className="w-4 h-4 mr-2 text-green-400" />
              Tasks Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTasks}</div>
            <p className="text-xs text-slate-500">
              {metrics.successRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-yellow-400" />
              System Load
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.systemLoad.toFixed(1)}%</div>
            <Progress value={metrics.systemLoad} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-300 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-purple-400" />
              Avg Task Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDuration(metrics.averageTaskTime)}
            </div>
            <p className="text-xs text-slate-500">Per task average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Agent Status Overview */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-purple-400" />
                  Agent Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {agents.slice(0, 8).map((agent) => (
                      <div key={agent.id} className="flex items-center justify-between p-2 bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                          <div>
                            <p className="text-sm font-medium">{agent.id}</p>
                            <p className="text-xs text-slate-400">{agent.type}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {agent.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Recent Executions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GitBranch className="w-5 h-5 mr-2 text-green-400" />
                  Recent Executions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {executions.slice(0, 6).map((execution) => (
                      <div key={execution.id} className="p-2 bg-slate-700 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">{execution.id}</span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(execution.status)}
                            <Badge variant="outline" className="text-xs">
                              {execution.status}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={execution.progress} className="h-1 mb-1" />
                        <p className="text-xs text-slate-400">
                          {execution.tasksCompleted}/{execution.tasksTotal} tasks
                        </p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <Card key={agent.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{agent.id}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                      <Badge variant="outline">{agent.status}</Badge>
                    </div>
                  </div>
                  <CardDescription>{agent.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-400">Capabilities</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {agent.capabilities.slice(0, 3).map((cap) => (
                        <Badge key={cap} variant="secondary" className="text-xs">
                          {cap}
                        </Badge>
                      ))}
                      {agent.capabilities.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{agent.capabilities.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-slate-400">Tasks Completed</p>
                      <p className="font-medium">{agent.tasksCompleted}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Uptime</p>
                      <p className="font-medium">{agent.uptime}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <div className="space-y-4">
            {executions.map((execution) => (
              <Card key={execution.id} className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        {getStatusIcon(execution.status)}
                        <span className="ml-2">{execution.id}</span>
                      </CardTitle>
                      <CardDescription>
                        Started {execution.startTime.toLocaleString()}
                      </CardDescription>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{execution.status}</Badge>
                      {execution.status === 'running' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseExecution(execution.id)}
                          >
                            <Pause className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleCancelExecution(execution.id)}
                          >
                            <Square className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      {execution.status === 'paused' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResumeExecution(execution.id)}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{execution.progress}%</span>
                      </div>
                      <Progress value={execution.progress} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Total Tasks</p>
                        <p className="font-medium">{execution.tasksTotal}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Completed</p>
                        <p className="font-medium text-green-400">{execution.tasksCompleted}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Failed</p>
                        <p className="font-medium text-red-400">{execution.tasksFailed}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle>Task Queue</CardTitle>
              <CardDescription>Recent and active tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(task.status)}`} />
                        <div>
                          <p className="text-sm font-medium">{task.id}</p>
                          <p className="text-xs text-slate-400">{task.type}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {task.assignedAgent && (
                          <Badge variant="secondary" className="text-xs">
                            {task.assignedAgent}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            task.priority === 'high' ? 'border-red-400 text-red-400' :
                            task.priority === 'medium' ? 'border-yellow-400 text-yellow-400' :
                            'border-green-400 text-green-400'
                          }`}
                        >
                          {task.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-blue-400" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Success Rate</span>
                      <span>{metrics.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.successRate} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>System Load</span>
                      <span>{metrics.systemLoad.toFixed(1)}%</span>
                    </div>
                    <Progress value={metrics.systemLoad} className="h-2" />
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-slate-400 mb-2">Agent Utilization</p>
                    <div className="space-y-2">
                      {Object.entries(metrics.agentUtilization).slice(0, 5).map(([agentId, utilization]) => (
                        <div key={agentId} className="flex justify-between items-center">
                          <span className="text-xs">{agentId}</span>
                          <span className="text-xs font-medium">{utilization}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <span className="text-sm">Agent Availability</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-green-400">Healthy</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <span className="text-sm">Task Processing</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-green-400">Normal</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <span className="text-sm">Memory Usage</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      <span className="text-sm text-yellow-400">Moderate</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <span className="text-sm">Error Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm text-green-400">Low</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgentDashboard;
