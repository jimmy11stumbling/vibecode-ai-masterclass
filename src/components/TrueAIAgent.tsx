import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Crown, 
  Brain, 
  Code, 
  Database, 
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Play,
  Users,
  Server,
  Eye,
  Settings,
  MessageSquare,
  Plus,
  Edit3,
  Trash2,
  Cpu,
  Shield,
  Search,
  FileText,
  Wrench
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { a2aProtocol } from '@/services/a2aProtocolCore';

interface A2AAgent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'busy' | 'offline';
  lastActivity: Date;
  currentTasks?: string[];
  role: string;
  description: string;
}

interface A2AMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  type: 'task' | 'response' | 'coordination' | 'heartbeat';
  content: any;
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high';
}

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: ProjectFile[];
  path: string;
  size?: number;
  lastModified?: Date;
}

interface TrueAIAgentProps {
  projectFiles: ProjectFile[];
  onFilesChange: (files: ProjectFile[]) => void;
  onCodeGenerated: (code: any) => void;
  onAgentSelect?: (agent: A2AAgent) => void;
  onTaskAssign?: (agentId: string, task: string) => void;
}

export const TrueAIAgent: React.FC<TrueAIAgentProps> = ({
  projectFiles,
  onFilesChange,
  onCodeGenerated,
  onAgentSelect,
  onTaskAssign
}) => {
  const [agents, setAgents] = useState<A2AAgent[]>([]);
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    initializeAgentSwarm();
  }, []);

  const initializeAgentSwarm = async () => {
    try {
      setIsInitializing(true);
      await a2aProtocol.initialize();
      const initialAgents = a2aProtocol.getAgents();
      const initialMessages = a2aProtocol.getMessageHistory();
      setAgents(initialAgents);
      setMessages(initialMessages);
      
      toast({
        title: "Agent Swarm Initialized",
        description: `${initialAgents.length} specialized agents are now active`,
      });
    } catch (error) {
      console.error('Failed to initialize agent swarm:', error);
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize the agent swarm",
        variant: "destructive"
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleAgentSelect = (agent: A2AAgent) => {
    setSelectedAgent(agent.id);
    onAgentSelect?.(agent);
  };

  const handleTaskAssign = async () => {
    if (!selectedAgent || !messageContent.trim()) {
      toast({
        title: "Input Required",
        description: "Please select an agent and enter a task",
        variant: "destructive"
      });
      return;
    }

    try {
      await a2aProtocol.sendMessage({
        fromAgent: 'user',
        toAgent: selectedAgent,
        type: 'task',
        content: messageContent,
        priority: 'medium'
      });

      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        fromAgent: 'user',
        toAgent: selectedAgent,
        type: 'task',
        content: messageContent,
        timestamp: new Date(),
        priority: 'medium'
      }]);

      onTaskAssign?.(selectedAgent, messageContent);
      onCodeGenerated?.(messageContent);
      setMessageContent('');

      toast({
        title: "Task Assigned",
        description: "Task has been sent to the selected agent",
      });
    } catch (error) {
      console.error('Failed to assign task:', error);
      toast({
        title: "Assignment Failed",
        description: "Failed to assign task to agent",
        variant: "destructive"
      });
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'orchestrator': return <Crown className="w-5 h-5 text-purple-400" />;
      case 'architect': return <Cpu className="w-5 h-5 text-blue-400" />;
      case 'frontend_builder': return <Code className="w-5 h-5 text-green-400" />;
      case 'backend_builder': return <Server className="w-5 h-5 text-orange-400" />;
      case 'validator': return <Shield className="w-5 h-5 text-red-400" />;
      case 'optimizer': return <Zap className="w-5 h-5 text-yellow-400" />;
      case 'librarian': return <FileText className="w-5 h-5 text-indigo-400" />;
      default: return <Wrench className="w-5 h-5 text-gray-400" />;
    }
  };

  const getAgentStatusColor = (status: A2AAgent['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-blue-500';
      case 'busy': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedAgentData = agents.find(agent => agent.id === selectedAgent);

  if (isInitializing) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-purple-400 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Initializing Sovereign AI Swarm</h2>
          <p className="text-slate-400">Setting up specialized agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Sovereign AI Agent Swarm</h1>
              <p className="text-sm text-slate-400">Blueprint-defined specialized agents for autonomous development</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {agents.length} Agents Active
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {projectFiles.length} Files
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={initializeAgentSwarm}
              className="text-slate-400 hover:text-white"
            >
              <Activity className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="swarm" className="h-full flex flex-col">
          <TabsList className="w-full bg-slate-800 border-b border-slate-700">
            <TabsTrigger value="swarm" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Agent Swarm</span>
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Task Workflow</span>
            </TabsTrigger>
          </TabsList>

          {/* Agent Swarm Tab */}
          <TabsContent value="swarm" className="flex-1 p-6 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Specialized Agents */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-purple-400" />
                    <span>Specialized Agent Roles</span>
                  </CardTitle>
                  <CardDescription>
                    Blueprint-defined agents for the Sovereign AI Development Environment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {agents.map((agent) => (
                        <Card 
                          key={agent.id}
                          className={`cursor-pointer transition-all ${
                            selectedAgent === agent.id 
                              ? 'bg-slate-700 border-purple-500 ring-1 ring-purple-500/50' 
                              : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                          }`}
                          onClick={() => handleAgentSelect(agent)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                {getAgentIcon(agent.type)}
                                <div>
                                  <h3 className="font-medium text-white">{agent.role}</h3>
                                  <p className="text-sm text-slate-400">{agent.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${getAgentStatusColor(agent.status)}`} />
                                <Badge variant="outline" className="text-xs">
                                  {agent.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-slate-300 mb-3">{agent.description}</p>
                            
                            <div className="flex flex-wrap gap-1">
                              {agent.capabilities.slice(0, 3).map((capability) => (
                                <Badge key={capability} variant="secondary" className="text-xs px-2 py-0">
                                  {capability.replace('_', ' ')}
                                </Badge>
                              ))}
                              {agent.capabilities.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{agent.capabilities.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Agent Details & Task Assignment */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Task Assignment</span>
                  </CardTitle>
                  <CardDescription>
                    Assign tasks to specialized agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedAgentData ? (
                    <div className="space-y-4">
                      <div className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                          {getAgentIcon(selectedAgentData.type)}
                          <div>
                            <h3 className="font-medium text-white">{selectedAgentData.role}</h3>
                            <p className="text-sm text-slate-400">{selectedAgentData.name}</p>
                          </div>
                        </div>
                        <p className="text-sm text-slate-300 mb-3">{selectedAgentData.description}</p>
                        
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-400">Capabilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedAgentData.capabilities.map((capability) => (
                              <Badge key={capability} className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                                {capability.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Textarea
                          placeholder="Describe the task for this agent..."
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                          className="min-h-[120px] bg-slate-700 border-slate-600 text-white"
                        />
                        
                        <Button
                          onClick={handleTaskAssign}
                          disabled={!messageContent.trim()}
                          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Assign Task to Agent
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Crown className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">Select an agent to assign tasks</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Choose from the specialized agents in the Sovereign AI Swarm
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Task Workflow Tab */}
          <TabsContent value="workflow" className="flex-1 p-6 overflow-hidden">
            <Card className="bg-slate-800 border-slate-700 h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  <span>A2A Communication Log</span>
                </CardTitle>
                <CardDescription>
                  Real-time agent-to-agent communication and task coordination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {messages.length > 0 ? (
                      messages.map((message) => (
                        <div key={message.id} className="bg-slate-700 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge className="text-xs bg-purple-500/20 text-purple-400">
                                {message.type}
                              </Badge>
                              <span className="text-sm text-white font-medium">
                                {message.fromAgent} → {message.toAgent}
                              </span>
                            </div>
                            <span className="text-xs text-slate-500">
                              {message.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-slate-300">
                            {typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-400">No agent communications yet</p>
                        <p className="text-sm text-slate-500 mt-2">
                          Assign tasks to agents to see A2A protocol in action
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
