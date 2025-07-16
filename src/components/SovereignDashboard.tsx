
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Database, 
  Zap, 
  Network, 
  Activity, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { masterControlProgram } from '@/services/masterControlProgram';
import { deepSeekIntegration } from '@/services/deepSeekIntegrationService';

interface SystemMetrics {
  deepSeekStatus: 'active' | 'idle' | 'error';
  ragStatus: 'connected' | 'disconnected' | 'syncing';
  mcpStatus: 'operational' | 'degraded' | 'offline';
  a2aStatus: 'connected' | 'disconnected';
  orchestratorStatus: 'ready' | 'busy' | 'error';
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
}

export const SovereignDashboard: React.FC = () => {
  const [systemStatus, setSystemStatus] = useState<SystemMetrics>({
    deepSeekStatus: 'idle',
    ragStatus: 'disconnected',
    mcpStatus: 'offline',
    a2aStatus: 'disconnected',
    orchestratorStatus: 'ready',
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [reasoningSession, setReasoningSession] = useState<string | null>(null);
  const [reasoningProgress, setReasoningProgress] = useState(0);
  const [reasoningStep, setReasoningStep] = useState('');

  useEffect(() => {
    const updateStatus = () => {
      const status = masterControlProgram.getSystemStatus();
      setSystemStatus(status);
    };

    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'connected':
      case 'operational':
      case 'ready':
        return 'bg-green-500';
      case 'busy':
      case 'syncing':
        return 'bg-yellow-500';
      case 'idle':
      case 'degraded':
        return 'bg-blue-500';
      default:
        return 'bg-red-500';
    }
  };

  const getStatusIcon = (component: string, status: string) => {
    const iconProps = { className: "w-4 h-4" };
    
    switch (component) {
      case 'deepseek':
        return <Brain {...iconProps} />;
      case 'rag':
        return <Database {...iconProps} />;
      case 'mcp':
        return <Zap {...iconProps} />;
      case 'a2a':
        return <Network {...iconProps} />;
      case 'orchestrator':
        return <Activity {...iconProps} />;
      default:
        return <Settings {...iconProps} />;
    }
  };

  const handleTestReasoning = async () => {
    setIsLoading(true);
    setReasoningProgress(0);
    setReasoningStep('Initializing...');

    try {
      const sessionId = await deepSeekIntegration.createReasoningSession({
        query: 'Analyze the current system architecture and suggest optimizations',
        reasoningDepth: 'advanced',
        includeRAG: true,
        domainFocus: ['software-architecture', 'system-optimization']
      });

      setReasoningSession(sessionId);

      await deepSeekIntegration.performAdvancedReasoning(
        sessionId,
        (progress) => {
          setReasoningProgress(progress.progress);
          setReasoningStep(progress.step);
        }
      );

      setReasoningStep('Completed');
      setReasoningProgress(100);

    } catch (error) {
      console.error('Reasoning test failed:', error);
      setReasoningStep('Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const systemComponents = [
    {
      id: 'deepseek',
      name: 'DeepSeek Reasoner',
      status: systemStatus.deepSeekStatus,
      description: 'Advanced AI reasoning engine'
    },
    {
      id: 'rag',
      name: 'RAG 2.0 Database',
      status: systemStatus.ragStatus,
      description: 'Knowledge retrieval and augmentation'
    },
    {
      id: 'mcp',
      name: 'MCP Hub',
      status: systemStatus.mcpStatus,
      description: 'Tool coordination and execution'
    },
    {
      id: 'a2a',
      name: 'A2A Protocol',
      status: systemStatus.a2aStatus,
      description: 'Agent-to-agent communication'
    },
    {
      id: 'orchestrator',
      name: 'Sovereign Orchestrator',
      status: systemStatus.orchestratorStatus,
      description: 'Task management and execution'
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Sovereign AI Control Center
          </h1>
          <p className="text-slate-400 mt-1">Master Control Program - Production Environment</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
            <Activity className="w-3 h-3 mr-1" />
            Systems Operational
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="reasoning">AI Reasoning</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* System Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {systemComponents.map((component) => (
              <Card key={component.id} className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    {component.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(component.id, component.status)}
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(component.status)}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-slate-400 mb-2">
                    {component.description}
                  </div>
                  <Badge variant="outline" className={`${getStatusColor(component.status)}/20 text-xs`}>
                    {component.status.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                  Completed Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {systemStatus.completedTasks}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                  Active Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">
                  {systemStatus.activeTasks}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="w-4 h-4 mr-2 text-blue-400" />
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">
                  {systemStatus.totalTasks}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reasoning" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-purple-400" />
                DeepSeek Advanced Reasoning
              </CardTitle>
              <CardDescription className="text-slate-400">
                Test and monitor the AI reasoning capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={handleTestReasoning}
                  disabled={isLoading}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Reasoning Test
                    </>
                  )}
                </Button>
                
                {reasoningSession && (
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400">
                    Session: {reasoningSession.slice(-8)}
                  </Badge>
                )}
              </div>

              {isLoading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-purple-400">{reasoningProgress}%</span>
                  </div>
                  <Progress value={reasoningProgress} className="w-full" />
                  <div className="text-sm text-slate-400">
                    Current Step: {reasoningStep}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Task Management</CardTitle>
              <CardDescription className="text-slate-400">
                Monitor and manage system tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Task management interface will be implemented here</p>
                <p className="text-sm mt-2">Real-time task monitoring and control</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Live System Monitoring</CardTitle>
              <CardDescription className="text-slate-400">
                Real-time system metrics and performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-400">
                <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Live monitoring dashboard will be implemented here</p>
                <p className="text-sm mt-2">System performance metrics and alerts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
