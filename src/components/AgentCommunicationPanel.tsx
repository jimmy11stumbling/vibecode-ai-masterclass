import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Users, Activity, CheckCircle, Clock, AlertCircle, PlayCircle, PauseCircle } from 'lucide-react';
import { a2aProtocol } from '@/services/a2aProtocolCore';
import { useToast } from '@/components/ui/use-toast';
interface AgentMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  content: any;
  timestamp: Date;
  type: string;
}
interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'busy' | 'idle' | 'offline';
  currentTask?: string;
  lastActivity: Date;
}
export const AgentCommunicationPanel: React.FC = () => {
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isActive, setIsActive] = useState(false);
  const {
    toast
  } = useToast();
  useEffect(() => {
    initializeAgentSystem();
    const interval = setInterval(updateAgentStatus, 2000);
    return () => clearInterval(interval);
  }, []);
  const initializeAgentSystem = async () => {
    try {
      await a2aProtocol.initialize();
      updateAgentStatus();
      setIsActive(true);
      toast({
        title: "Agent Communication Active",
        description: "AI agents are now communicating seamlessly"
      });
    } catch (error) {
      console.error('Failed to initialize agent system:', error);
      toast({
        title: "Communication Error",
        description: "Failed to initialize agent communication",
        variant: "destructive"
      });
    }
  };
  const updateAgentStatus = () => {
    const agentData = a2aProtocol.getAgents();
    const statusData: AgentStatus[] = agentData.map(agent => ({
      id: agent.id,
      name: agent.name,
      status: agent.status as 'active' | 'busy' | 'idle' | 'offline',
      currentTask: agent.currentTasks?.[0],
      lastActivity: agent.lastActivity
    }));
    setAgents(statusData);
    const messageHistory = a2aProtocol.getMessageHistory();
    setMessages(messageHistory);
  };
  const triggerAgentCommunication = async () => {
    try {
      // Demonstrate seamless communication
      const activeAgents = agents.filter(a => a.status === 'active');
      if (activeAgents.length >= 2) {
        await a2aProtocol.sendMessage({
          fromAgent: activeAgents[0].id,
          toAgent: activeAgents[1].id,
          type: 'coordination',
          content: {
            action: 'status_sync',
            message: 'Synchronizing agent states for optimal collaboration',
            timestamp: new Date().toISOString()
          },
          priority: 'medium'
        });
        toast({
          title: "Agent Communication Triggered",
          description: `${activeAgents[0].name} → ${activeAgents[1].name}`
        });
      }
    } catch (error) {
      console.error('Failed to trigger communication:', error);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'busy':
        return 'bg-yellow-500';
      case 'idle':
        return 'bg-blue-500';
      case 'offline':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'busy':
        return <Activity className="w-4 h-4 animate-spin" />;
      case 'idle':
        return <Clock className="w-4 h-4" />;
      case 'offline':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };
  return <div className="space-y-4">
      {/* System Status */}
      <Card>
        <CardHeader className="pb-3 bg-slate-400">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Communication Hub
            </CardTitle>
            <div className="flex items-center gap-2">
              {isActive ? <Badge variant="default" className="bg-green-500">
                  <Activity className="w-3 h-3 mr-1" />
                  Active
                </Badge> : <Badge variant="secondary">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Inactive
                </Badge>}
            </div>
          </div>
        </CardHeader>
        <CardContent className="bg-slate-900">
          <div className="flex gap-2">
            <Button onClick={triggerAgentCommunication} disabled={!isActive} size="sm">
              <PlayCircle className="w-4 h-4 mr-2" />
              Test Communication
            </Button>
            <Button onClick={updateAgentStatus} variant="outline" size="sm">
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Agent Status Grid */}
      <Card>
        <CardHeader className="bg-gray-400">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Active Agents ({agents.filter(a => a.status === 'active').length})
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-slate-900">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agents.map(agent => <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(agent.status)}`} />
                  <div>
                    <div className="font-medium text-sm bg-zinc-300">{agent.name}</div>
                    {agent.currentTask && <div className="text-xs text-muted-foreground truncate max-w-32">
                        {agent.currentTask}
                      </div>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {getStatusIcon(agent.status)}
                  <Badge variant="outline" className="text-xs bg-zinc-300">
                    {agent.status}
                  </Badge>
                </div>
              </div>)}
          </div>
        </CardContent>
      </Card>

      {/* Message Stream */}
      <Card>
        <CardHeader className="bg-slate-400">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Live Communication ({messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-slate-900">
          <ScrollArea className="h-64">
            <div className="space-y-2">
              {messages.length === 0 ? <div className="text-center text-muted-foreground py-8">
                  No messages yet. Agents will communicate here.
                </div> : messages.slice(-10).reverse().map(message => <div key={message.id} className="p-3 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">
                        {message.fromAgent} → {message.toAgent}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {message.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {typeof message.content === 'string' ? message.content : message.content?.action || 'System coordination'}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </div>
                  </div>)}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>;
};