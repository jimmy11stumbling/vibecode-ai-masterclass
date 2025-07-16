
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
  Trash2
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
  children?: ProjectFile[];
  parentId?: string;
  path: string;
  size?: number;
  lastModified?: Date;
}

interface TrueAIAgentProps {
  projectFiles?: ProjectFile[];
  onFilesChange?: (files: ProjectFile[]) => void;
  onCodeGenerated?: (code: string) => void;
  onProjectGenerated?: (project: any) => void;
}

export const TrueAIAgent: React.FC<TrueAIAgentProps> = ({
  projectFiles = [],
  onFilesChange,
  onCodeGenerated,
  onProjectGenerated
}) => {
  const [agents, setAgents] = useState<A2AAgent[]>([]);
  const [messages, setMessages] = useState<A2AMessage[]>([]);
  const [newAgent, setNewAgent] = useState({
    name: '',
    type: '',
    capabilities: [] as string[]
  });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [messageContent, setMessageContent] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const initialAgents = a2aProtocol.getAgents();
      const initialMessages = a2aProtocol.getMessageHistory();
      setAgents(initialAgents);
      setMessages(initialMessages);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'capabilities') {
      setNewAgent(prev => ({ ...prev, capabilities: value.split(',').map(s => s.trim()) }));
    } else {
      setNewAgent(prev => ({ ...prev, [name]: value }));
    }
  };

  const registerNewAgent = async (agentData: { name: string; type: string; capabilities: string[] }) => {
    try {
      const agentId = await a2aProtocol.registerAgent({
        name: agentData.name,
        type: agentData.type,
        capabilities: agentData.capabilities,
        status: 'active'
      });

      setAgents(prev => [...prev, {
        id: agentId,
        name: agentData.name,
        type: agentData.type,
        capabilities: agentData.capabilities,
        status: 'active',
        lastActivity: new Date(),
        currentTasks: []
      }]);

      setNewAgent({ name: '', type: '', capabilities: [] });

      toast({
        title: "Agent Registered",
        description: `${agentData.name} has been added to the agent network`,
      });
    } catch (error) {
      console.error('Failed to register agent:', error);
      toast({
        title: "Registration Failed",
        description: "Failed to register new agent",
        variant: "destructive"
      });
    }
  };

  const sendAgentMessage = async (fromAgent: string, toAgent: string, content: any) => {
    try {
      await a2aProtocol.sendMessage({
        fromAgent,
        toAgent,
        type: 'task',
        content,
        priority: 'medium'
      });

      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}`,
        fromAgent,
        toAgent,
        type: 'task',
        content,
        timestamp: new Date(),
        priority: 'medium'
      }]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleAgentSelect = (agentId: string) => {
    setSelectedAgent(agentId);
  };

  const handleMessageSend = () => {
    if (!selectedAgent || !messageContent.trim()) {
      toast({
        title: "Input Required",
        description: "Please select an agent and enter a message",
        variant: "destructive"
      });
      return;
    }

    sendAgentMessage('user', selectedAgent, messageContent);
    setMessageContent('');
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

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">True AI Agents</h1>
              <p className="text-sm text-slate-400">Manage and communicate with AI agents</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="agents" className="h-full flex flex-col">
          <TabsList className="w-full bg-slate-800 border-b border-slate-700">
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Agents ({agents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Messages ({messages.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Agents Tab */}
          <TabsContent value="agents" className="flex-1 p-6 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Agent List */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>Registered Agents</span>
                  </CardTitle>
                  <CardDescription>
                    View and manage registered AI agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {agents.length > 0 ? (
                        agents.map(agent => (
                          <div 
                            key={agent.id} 
                            className={`flex items-center justify-between p-2 bg-slate-700 rounded cursor-pointer hover:bg-slate-600 ${selectedAgent === agent.id ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => handleAgentSelect(agent.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${getAgentStatusColor(agent.status)}`} />
                              <p className="text-sm text-white">{agent.name}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {agent.status}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-sm">No agents registered</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Agent Registration */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5 text-green-400" />
                    <span>Register New Agent</span>
                  </CardTitle>
                  <CardDescription>
                    Register a new AI agent to the network
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      name="name"
                      placeholder="Agent Name"
                      value={newAgent.name}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input
                      type="text"
                      name="type"
                      placeholder="Agent Type (e.g., code_generator)"
                      value={newAgent.type}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Input
                      type="text"
                      name="capabilities"
                      placeholder="Capabilities (comma-separated, e.g., code_generation, testing)"
                      value={newAgent.capabilities.join(', ')}
                      onChange={handleInputChange}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={() => registerNewAgent({
                      name: newAgent.name,
                      type: newAgent.type,
                      capabilities: newAgent.capabilities
                    })}
                    disabled={!newAgent.name || !newAgent.type}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    Register Agent
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="flex-1 p-6 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Message History */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    <span>Message History</span>
                  </CardTitle>
                  <CardDescription>
                    View communication history between agents
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {messages.length > 0 ? (
                        messages.map(message => (
                          <div key={message.id} className="p-3 bg-slate-700 rounded">
                            <p className="text-sm text-white">
                              <span className="font-medium">{message.fromAgent}</span> to <span className="font-medium">{message.toAgent}</span>:
                            </p>
                            <p className="text-sm text-slate-400">{typeof message.content === 'string' ? message.content : JSON.stringify(message.content)}</p>
                            <p className="text-xs text-slate-500">{message.timestamp.toLocaleTimeString()}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-sm">No messages exchanged</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Send Message */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span>Send Message</span>
                  </CardTitle>
                  <CardDescription>
                    Send a message to a selected agent
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <select
                      value={selectedAgent || ''}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded px-3 py-2"
                    >
                      <option value="" disabled>Select Agent</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                    <Textarea
                      placeholder="Enter your message..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      className="min-h-[100px] bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <Button
                    onClick={handleMessageSend}
                    disabled={!selectedAgent || !messageContent.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
