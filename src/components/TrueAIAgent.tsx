import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Brain,
  Bot,
  MessageSquare,
  Send,
  RefreshCw
} from 'lucide-react';
import { a2aProtocol, A2AAgent } from '@/services/a2aProtocolCore';
import { useToast } from '@/hooks/use-toast';
import { DeepSeekAgentDashboard } from './DeepSeekAgentDashboard';
import { deepSeekAgentCore } from '@/services/deepSeekAgentCore';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface TrueAIAgentProps {
  projectFiles: ProjectFile[];
  onFilesChange: (files: ProjectFile[]) => void;
  onCodeGenerated?: (code: string) => void;
  onAgentSelect?: (agent: A2AAgent) => void;
  onTaskAssign?: (agentId: string, taskDescription: string) => void;
}

interface AgentMessage {
  id: string;
  content: string;
  sender: 'user' | 'agent';
  timestamp: Date;
  agentId: string;
}

export const TrueAIAgent: React.FC<TrueAIAgentProps> = ({
  projectFiles,
  onFilesChange,
  onCodeGenerated,
  onAgentSelect,
  onTaskAssign
}) => {
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [agents, setAgents] = useState<A2AAgent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadAgents = async () => {
      setIsLoading(true);
      try {
        const agentList = a2aProtocol.getAgents();
        setAgents(agentList);
        console.log('🤖 Loaded agents:', agentList.length);
      } catch (error) {
        console.error('Failed to load agents:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAgents();
  }, []);

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedAgent) return;

    const agent = agents.find(a => a.id === selectedAgent);
    if (!agent) return;

    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
      agentId: selectedAgent
    }]);

    try {
      // Use DeepSeek Agent Core for processing
      if (messageContent.toLowerCase().includes('create') || messageContent.toLowerCase().includes('build')) {
        console.log('🚀 Starting DeepSeek-powered application creation');
        
        const sessionId = await deepSeekAgentCore.createFullStackApplication(messageContent, {
          projectFiles,
          framework: 'React',
          styling: 'Tailwind CSS'
        });

        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          content: `I've started creating your application using DeepSeek reasoning. Session ID: ${sessionId}. The specialized agents are now working on your request.`,
          sender: 'agent',
          timestamp: new Date(),
          agentId: selectedAgent
        }]);

        onCodeGenerated?.(messageContent);
      } else {
        // Regular agent response
        setMessages(prev => [...prev, {
          id: (Date.now() + 1).toString(),
          content: `${agent.role} received your message: "${messageContent}". I'm processing this with my specialized capabilities: ${agent.capabilities.join(', ')}.`,
          sender: 'agent',
          timestamp: new Date(),
          agentId: selectedAgent
        }]);
      }

      onTaskAssign?.(selectedAgent, messageContent);
      setMessageContent('');

      toast({
        title: "Message Sent",
        description: `${agent.name} is processing your request`,
      });

    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message to agent",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center">
              <Brain className="w-6 h-6 mr-2 text-blue-400" />
              DeepSeek AI Agent Swarm
            </h2>
            <p className="text-sm text-slate-400">Powered by DeepSeek Reasoner for advanced AI development</p>
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
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="agents" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-b border-slate-700">
          <TabsTrigger value="agents" className="data-[state=active]:bg-slate-700">Agent Swarm</TabsTrigger>
          <TabsTrigger value="chat" className="data-[state=active]:bg-slate-700">Agent Chat</TabsTrigger>
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-slate-700">Dashboard</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="agents" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading DeepSeek agents...</p>
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No agents available</p>
                  </div>
                ) : (
                  agents.map((agent) => (
                    <Card 
                      key={agent.id} 
                      className={`bg-slate-800 border-slate-700 hover:border-slate-600 cursor-pointer transition-all ${
                        selectedAgent === agent.id ? 'border-blue-500 bg-blue-500/10' : ''
                      }`}
                      onClick={() => {
                        setSelectedAgent(agent.id);
                        onAgentSelect?.(agent);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                              <Bot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-white">{agent.name}</h3>
                              <p className="text-sm text-slate-400">{agent.role}</p>
                            </div>
                          </div>
                          <Badge 
                            className={
                              agent.status === 'active' 
                                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                            }
                          >
                            {agent.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-300 mt-2">{agent.description}</p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {agent.capabilities.slice(0, 4).map((capability, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {capability}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chat" className="h-full m-0">
            <div className="h-full flex flex-col">
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400">No messages yet</p>
                      <p className="text-sm text-slate-500">Select an agent and start a conversation</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.sender === 'user'
                              ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-100 border border-slate-600'
                          }`}
                        >
                          <div className="text-sm">{message.content}</div>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-slate-700">
                {selectedAgent ? (
                  <div className="space-y-3">
                    <div className="text-sm text-slate-400">
                      Chatting with: {agents.find(a => a.id === selectedAgent)?.name}
                    </div>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={messageContent}
                        onChange={(e) => setMessageContent(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Describe what you want to build..."
                        className="flex-1 p-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                      />
                      <Button onClick={handleSendMessage} disabled={!messageContent.trim()}>
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400">
                    Select an agent to start chatting
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="dashboard" className="h-full m-0">
            <DeepSeekAgentDashboard onCodeGenerated={onCodeGenerated} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
