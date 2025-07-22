
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useWebSocket } from '@/components/realtime/WebSocketManager';
import { a2aProtocol } from '@/services/a2aProtocolCore';
import { sovereignOrchestrator } from '@/services/sovereignOrchestrator';
import { Bot, Activity, Clock, CheckCircle, AlertCircle, Pause, Play, RotateCcw } from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  currentTask?: string;
  tasksCompleted: number;
  uptime: number;
  lastActivity: Date;
  workload: number;
}

export const AgentOrchestrationDashboard: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [workflowExecutions, setWorkflowExecutions] = useState<any[]>([]);
  const { isConnected, sendMessage, subscribeToMessages } = useWebSocket();

  useEffect(() => {
    // Load initial agent data
    const loadAgents = async () => {
      const a2aAgents = a2aProtocol.getAgents();
      const agentStatuses: AgentStatus[] = a2aAgents.map(agent => ({
        id: agent.id,
        name: agent.name,
        type: agent.type,
        status: agent.status === 'offline' ? 'error' as const : agent.status,
        currentTask: undefined,
        tasksCompleted: Math.floor(Math.random() * 50),
        uptime: Date.now() - new Date(agent.lastActivity).getTime(),
        lastActivity: agent.lastActivity,
        workload: Math.floor(Math.random() * 100)
      }));
      
      setAgents(agentStatuses);
    };

    const loadWorkflowExecutions = () => {
      const executions = sovereignOrchestrator.getAllActiveExecutions();
      setWorkflowExecutions(executions);
    };

    loadAgents();
    loadWorkflowExecutions();

    // Set up real-time updates
    const unsubscribe = subscribeToMessages((message) => {
      if (message.type === 'agent_status_update') {
        setAgents(prev => 
          prev.map(agent => 
            agent.id === message.payload.agentId 
              ? { ...agent, ...message.payload.updates }
              : agent
          )
        );
      } else if (message.type === 'workflow_update') {
        loadWorkflowExecutions();
      }
    });

    // Periodic updates
    const interval = setInterval(() => {
      loadAgents();
      loadWorkflowExecutions();
    }, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [subscribeToMessages]);

  const handleAgentAction = async (agentId: string, action: 'pause' | 'resume' | 'restart') => {
    try {
      if (action === 'pause') {
        await a2aProtocol.sendMessage({
          fromAgent: 'orchestrator',
          toAgent: agentId,
          type: 'coordination',
          content: { action: 'pause' }
        });
      } else if (action === 'resume') {
        await a2aProtocol.sendMessage({
          fromAgent: 'orchestrator',
          toAgent: agentId,
          type: 'coordination',
          content: { action: 'resume' }
        });
      } else if (action === 'restart') {
        await a2aProtocol.sendMessage({
          fromAgent: 'orchestrator',
          toAgent: agentId,
          type: 'coordination',
          content: { action: 'restart' }
        });
      }

      sendMessage({
        type: 'agent_action',
        payload: { agentId, action }
      });
    } catch (error) {
      console.error('Failed to perform agent action:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'idle': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Agent Orchestration Dashboard</h1>
          <p className="text-gray-600">Monitor and manage AI agent performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agents.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {agents.filter(a => a.status === 'active' || a.status === 'busy').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {workflowExecutions.filter(w => w.status === 'running').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {agents.reduce((sum, agent) => sum + agent.tasksCompleted, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <CardTitle className="text-lg">{agent.name}</CardTitle>
                </div>
                <Badge className={`${getStatusColor(agent.status)} text-white`}>
                  {agent.status}
                </Badge>
              </div>
              <CardDescription>{agent.type}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Workload</span>
                  <span>{agent.workload}%</span>
                </div>
                <Progress value={agent.workload} />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>{agent.tasksCompleted} tasks</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>{formatUptime(agent.uptime)}</span>
                </div>
              </div>
              
              {agent.currentTask && (
                <div className="text-sm">
                  <p className="font-medium">Current Task:</p>
                  <p className="text-gray-600 truncate">{agent.currentTask}</p>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAgentAction(agent.id, 'pause')}
                  disabled={agent.status === 'idle'}
                >
                  <Pause className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAgentAction(agent.id, 'resume')}
                  disabled={agent.status === 'active'}
                >
                  <Play className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAgentAction(agent.id, 'restart')}
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Workflows */}
      {workflowExecutions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Workflows</CardTitle>
            <CardDescription>Currently running workflow executions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {workflowExecutions.map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{execution.id}</p>
                    <p className="text-sm text-gray-600">
                      Step {execution.current_step} of {execution.total_steps}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Progress value={execution.progress} className="w-32" />
                    <Badge variant={execution.status === 'running' ? 'default' : 'secondary'}>
                      {execution.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
