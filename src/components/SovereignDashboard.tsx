
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Crown, 
  Activity, 
  Cpu, 
  Database, 
  Network, 
  Shield, 
  Zap,
  Bot,
  Settings,
  BarChart3,
  Users,
  GitBranch,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Server,
  Eye,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';

interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  throughput: number;
  errorRate: number;
  uptime: number;
}

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'busy' | 'offline';
  tasks: number;
  performance: number;
  lastActivity: Date;
}

interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedToday: number;
  successRate: number;
  avgBuildTime: number;
}

export const SovereignDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'maintenance'>('operational');
  
  const { currentMetrics, historicalData } = useRealTimeMetrics(true, {
    updateInterval: 2000,
    maxDataPoints: 30
  });

  const [agents] = useState<AgentStatus[]>([
    {
      id: 'orchestrator',
      name: 'Orchestrator Agent',
      status: 'active',
      tasks: 12,
      performance: 98.5,
      lastActivity: new Date()
    },
    {
      id: 'architect',
      name: 'Architect Agent',
      status: 'busy',
      tasks: 8,
      performance: 94.2,
      lastActivity: new Date()
    },
    {
      id: 'frontend_builder',
      name: 'Frontend Builder',
      status: 'active',
      tasks: 15,
      performance: 96.8,
      lastActivity: new Date()
    },
    {
      id: 'backend_builder',
      name: 'Backend Builder',
      status: 'active',
      tasks: 11,
      performance: 97.1,
      lastActivity: new Date()
    },
    {
      id: 'validator',
      name: 'Validator Agent',
      status: 'idle',
      tasks: 3,
      performance: 99.2,
      lastActivity: new Date()
    },
    {
      id: 'optimizer',
      name: 'Optimizer Agent',
      status: 'active',
      tasks: 7,
      performance: 95.7,
      lastActivity: new Date()
    }
  ]);

  const [projectStats] = useState<ProjectStats>({
    totalProjects: 147,
    activeProjects: 23,
    completedToday: 8,
    successRate: 96.2,
    avgBuildTime: 4.7
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'operational':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'busy':
      case 'degraded':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'offline':
      case 'maintenance':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'busy':
      case 'degraded':
        return <Activity className="w-4 h-4 text-yellow-500 animate-pulse" />;
      case 'offline':
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatUptime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  return (
    <div className="h-full bg-slate-950 text-white">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="flex-shrink-0 p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              <h2 className="text-xl font-bold">Sovereign Control Center</h2>
              <Badge variant="outline" className={getStatusColor(systemStatus)}>
                {systemStatus}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                <Play className="w-4 h-4 mr-1" />
                Start All
              </Button>
              <Button size="sm" variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20">
                <Square className="w-4 h-4 mr-1" />
                Stop All
              </Button>
              <Button size="sm" variant="outline">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <TabsList className="bg-slate-800 w-full grid grid-cols-4">
            <TabsTrigger value="overview" className="text-sm">
              <Eye className="w-4 h-4 mr-1" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-sm">
              <Bot className="w-4 h-4 mr-1" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="performance" className="text-sm">
              <BarChart3 className="w-4 h-4 mr-1" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="system" className="text-sm">
              <Server className="w-4 h-4 mr-1" />
              System
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-slate-800 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Active Projects</p>
                          <p className="text-2xl font-bold text-white">{projectStats.activeProjects}</p>
                        </div>
                        <GitBranch className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Success Rate</p>
                          <p className="text-2xl font-bold text-green-400">{projectStats.successRate}%</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Avg Build Time</p>
                          <p className="text-2xl font-bold text-white">{projectStats.avgBuildTime}m</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-slate-400">Completed Today</p>
                          <p className="text-2xl font-bold text-white">{projectStats.completedToday}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* System Status */}
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      System Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">CPU Usage</span>
                          <span className="text-sm text-white">{currentMetrics.cpuUsage.toFixed(1)}%</span>
                        </div>
                        <Progress value={currentMetrics.cpuUsage} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Memory</span>
                          <span className="text-sm text-white">{currentMetrics.memoryUsage.toFixed(1)}%</span>
                        </div>
                        <Progress value={currentMetrics.memoryUsage} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Network</span>
                          <span className="text-sm text-white">{currentMetrics.networkLatency.toFixed(0)}ms</span>
                        </div>
                        <Progress value={Math.min(currentMetrics.networkLatency / 2, 100)} className="h-2" />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-400">Throughput</span>
                          <span className="text-sm text-white">{currentMetrics.throughput.toFixed(1)}/s</span>
                        </div>
                        <Progress value={Math.min(currentMetrics.throughput * 2, 100)} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Active Agents Summary */}
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Agent Fleet Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                      {agents.slice(0, 6).map((agent) => (
                        <div key={agent.id} className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(agent.status)}
                            <Bot className="w-4 h-4 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{agent.name}</p>
                            <p className="text-xs text-slate-400">{agent.tasks} tasks • {agent.performance}%</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="agents" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {agents.map((agent) => (
                  <Card key={agent.id} className="bg-slate-800 border-slate-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(agent.status)}
                            <Bot className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-white">{agent.name}</h3>
                            <p className="text-xs text-slate-400">ID: {agent.id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm text-white">{agent.tasks} tasks</p>
                            <p className="text-xs text-slate-400">Performance: {agent.performance}%</p>
                          </div>
                          <Badge variant="outline" className={getStatusColor(agent.status)}>
                            {agent.status}
                          </Badge>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Play className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Pause className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-slate-400">Performance</span>
                          <span className="text-white">{agent.performance}%</span>
                        </div>
                        <Progress value={agent.performance} className="h-1" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="performance" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-800 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-sm">Performance Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Response Time</span>
                            <span className="text-white">{currentMetrics.responseTime.toFixed(0)}ms</span>
                          </div>
                          <Progress value={Math.max(0, 100 - (currentMetrics.responseTime / 10))} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Accuracy</span>
                            <span className="text-white">{currentMetrics.accuracy.toFixed(1)}%</span>
                          </div>
                          <Progress value={currentMetrics.accuracy} className="h-2" />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-400">Tokens/Second</span>
                            <span className="text-white">{currentMetrics.tokensPerSecond.toFixed(1)}</span>
                          </div>
                          <Progress value={Math.min(currentMetrics.tokensPerSecond * 2, 100)} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-800 border-slate-600">
                    <CardHeader>
                      <CardTitle className="text-sm">System Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Uptime:</span>
                          <span className="ml-2 text-white">{formatUptime(168)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Error Rate:</span>
                          <span className="ml-2 text-white">{currentMetrics.errorRate.toFixed(2)}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Connections:</span>
                          <span className="ml-2 text-white">{currentMetrics.activeConnections}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Load:</span>
                          <span className="ml-2 text-white">Normal</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="system" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Database className="w-5 h-5 mr-2" />
                      System Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Version:</span>
                        <span className="ml-2 text-white">Sovereign v2.1.0</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Environment:</span>
                        <span className="ml-2 text-white">Production</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Region:</span>
                        <span className="ml-2 text-white">US-East-1</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Build:</span>
                        <span className="ml-2 text-white">#2024.001</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
