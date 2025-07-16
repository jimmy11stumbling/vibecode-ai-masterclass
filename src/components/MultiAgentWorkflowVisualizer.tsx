
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play,
  Pause,
  RotateCcw,
  Zap,
  Users,
  Activity,
  Network,
  MessageSquare,
  Settings,
  TrendingUp,
  GitBranch,
  Layers
} from 'lucide-react';
import { enhancedAgentManager } from '@/services/enhancedAgentManager';
import { sovereignOrchestrator } from '@/services/sovereignOrchestrator';
import { a2aProtocol } from '@/services/a2aProtocolCore';

interface MultiAgentWorkflowVisualizerProps {
  onNodeClick?: (nodeId: string) => void;
  onWorkflowControl?: (action: 'play' | 'pause' | 'reset') => void;
  onAgentSelect?: (agentId: string) => void;
}

export const MultiAgentWorkflowVisualizer: React.FC<MultiAgentWorkflowVisualizerProps> = ({
  onNodeClick,
  onWorkflowControl,
  onAgentSelect
}) => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [workflowExecutions, setWorkflowExecutions] = useState([]);
  const [coordinationEvents, setCoordinationEvents] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [systemMetrics, setSystemMetrics] = useState({});
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkflowData();
    const interval = setInterval(loadWorkflowData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadWorkflowData = async () => {
    try {
      setIsLoading(true);
      
      // Load workflow executions
      const executions = sovereignOrchestrator.getAllActiveExecutions();
      setWorkflowExecutions(executions);
      
      // Load coordination events
      const events = enhancedAgentManager.getCoordinationEvents(50);
      setCoordinationEvents(events);
      
      // Load active sessions
      const sessions = enhancedAgentManager.getActiveSessions();
      setActiveSessions(sessions);
      
      // Load system metrics
      const metrics = enhancedAgentManager.getSystemMetrics();
      setSystemMetrics(metrics);
      
    } catch (error) {
      console.error('Failed to load workflow data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWorkflowStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'running': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paused': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCoordinationEventIcon = (type: string) => {
    switch (type) {
      case 'task_assignment': return <Zap className="w-4 h-4" />;
      case 'status_update': return <Activity className="w-4 h-4" />;
      case 'resource_request': return <Settings className="w-4 h-4" />;
      case 'collaboration': return <Users className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const renderWorkflowView = () => (
    <div className="space-y-4">
      {/* Workflow Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Workflows</p>
                <p className="text-2xl font-bold text-white">{workflowExecutions.length}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">System Load</p>
                <p className="text-2xl font-bold text-white">{Math.round(systemMetrics.system_load || 0)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Coordination Events</p>
                <p className="text-2xl font-bold text-white">{coordinationEvents.length}</p>
              </div>
              <Network className="w-8 h-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Workflows */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <GitBranch className="w-5 h-5 mr-2" />
            Active Workflow Executions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            <div className="space-y-3">
              {workflowExecutions.map((workflow) => (
                <div
                  key={workflow.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedWorkflow?.id === workflow.id
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-600 hover:border-slate-500'
                  }`}
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-white">{workflow.id}</h4>
                      <Badge className={getWorkflowStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400">
                      Step {workflow.current_step || 0}/{workflow.total_steps || 0}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={workflow.progress || 0} className="h-2" />
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Progress: {Math.round(workflow.progress || 0)}%</span>
                      <span>Started: {new Date(workflow.started_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  
                  {workflow.error_message && (
                    <div className="mt-2 p-2 bg-red-900/20 border border-red-500/30 rounded text-xs text-red-400">
                      {workflow.error_message}
                    </div>
                  )}
                </div>
              ))}
              
              {workflowExecutions.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active workflows</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderCoordinationView = () => (
    <div className="space-y-4">
      {/* Coordination Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Active Sessions</p>
                <p className="text-2xl font-bold text-white">{activeSessions.length}</p>
              </div>
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Response</p>
                <p className="text-2xl font-bold text-white">{Math.round(systemMetrics.average_response_time || 0)}ms</p>
              </div>
              <Activity className="w-6 h-6 text-green-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Events</p>
                <p className="text-2xl font-bold text-white">{coordinationEvents.length}</p>
              </div>
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Workflows</p>
                <p className="text-2xl font-bold text-white">{systemMetrics.active_workflows || 0}</p>
              </div>
              <Network className="w-6 h-6 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coordination Events Stream */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Coordination Events Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-2">
              {coordinationEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center space-x-3 p-3 bg-slate-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    {getCoordinationEventIcon(event.type)}
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-blue-400">{event.source_agent}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <span className="text-green-400">{event.target_agent || 'broadcast'}</span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {JSON.stringify(event.payload).substring(0, 100)}...
                    </p>
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    {new Date(event.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              
              {coordinationEvents.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No coordination events</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderAgentView = () => {
    const agents = a2aProtocol.getAllAgents();
    
    return (
      <div className="space-y-4">
        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className="bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-600 transition-colors"
              onClick={() => onAgentSelect?.(agent.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bot className="w-6 h-6 text-blue-400" />
                    <div>
                      <CardTitle className="text-white text-sm">{agent.name}</CardTitle>
                      <p className="text-xs text-slate-400">{agent.role}</p>
                    </div>
                  </div>
                  <Badge className={
                    agent.status === 'active' 
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }>
                    {agent.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-xs text-slate-300 mb-3">{agent.description}</p>
                
                <div className="space-y-2">
                  <div className="text-xs text-slate-400">
                    Workload: {enhancedAgentManager.getAgentWorkload(agent.id)} tasks
                  </div>
                  
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.slice(0, 3).map((capability) => (
                      <Badge key={capability} variant="secondary" className="text-xs">
                        {capability}
                      </Badge>
                    ))}
                    {agent.capabilities.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.capabilities.length - 3}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    Last active: {new Date(agent.lastActivity).toLocaleTimeString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Active Sessions */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Multi-Agent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 border border-slate-600 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">Session {session.id}</h4>
                      <Badge className={getWorkflowStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-slate-400">Mode:</span>
                        <span className="ml-2 text-white">{session.coordination_mode}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Participants:</span>
                        <span className="ml-2 text-white">{session.participants.length}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Started:</span>
                        <span className="ml-2 text-white">{new Date(session.started_at).toLocaleTimeString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Tasks:</span>
                        <span className="ml-2 text-white">{session.active_tasks.length}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xs text-slate-400 mb-1">Participants:</div>
                      <div className="flex flex-wrap gap-1">
                        {session.participants.map((participantId) => (
                          <Badge key={participantId} variant="outline" className="text-xs">
                            {participantId}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                
                {activeSessions.length === 0 && (
                  <div className="text-center py-8 text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No active sessions</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white rounded-xl border border-slate-700">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layers className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-semibold">Multi-Agent Workflow</h3>
            <Badge variant="outline" className="text-xs">
              {isLoading ? 'Loading...' : 'Live'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onWorkflowControl?.('play')}
              className="bg-green-500/10 text-green-400 border-green-500/20"
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onWorkflowControl?.('pause')}
              className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
            >
              <Pause className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onWorkflowControl?.('reset')}
              className="bg-slate-500/10 text-slate-400 border-slate-500/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="flex-shrink-0 border-b border-slate-700 px-4">
            <TabsList className="bg-slate-800">
              <TabsTrigger value="workflow" className="data-[state=active]:bg-slate-700">
                <GitBranch className="w-4 h-4 mr-2" />
                Workflows
              </TabsTrigger>
              <TabsTrigger value="coordination" className="data-[state=active]:bg-slate-700">
                <Network className="w-4 h-4 mr-2" />
                Coordination
              </TabsTrigger>
              <TabsTrigger value="agents" className="data-[state=active]:bg-slate-700">
                <Bot className="w-4 h-4 mr-2" />
                Agents
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="workflow" className="h-full m-0 p-4">
              {renderWorkflowView()}
            </TabsContent>

            <TabsContent value="coordination" className="h-full m-0 p-4">
              {renderCoordinationView()}
            </TabsContent>

            <TabsContent value="agents" className="h-full m-0 p-4">
              {renderAgentView()}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
