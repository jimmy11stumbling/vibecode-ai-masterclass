import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  MessageSquare, 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
  Clock,
  Workflow,
  Bot,
  Settings
} from 'lucide-react';
import { advancedMCPIntegration } from '@/services/advancedMCPIntegration';
import { supabase } from '@/integrations/supabase/client';
import type { A2ATask, A2AAgent, A2AMessage } from '@/services/advancedMCPIntegration';

interface A2AProtocolInterfaceProps {
  onTaskSelect?: (task: A2ATask) => void;
  onMessageSend?: (taskId: string, message: string) => void;
}

export const A2AProtocolInterface: React.FC<A2AProtocolInterfaceProps> = ({
  onTaskSelect,
  onMessageSend
}) => {
  const [tasks, setTasks] = useState<A2ATask[]>([]);
  const [selectedTask, setSelectedTask] = useState<A2ATask | null>(null);
  const [activeTab, setActiveTab] = useState<'tasks' | 'create' | 'monitor'>('tasks');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    capabilities: [] as string[]
  });
  const [availableCapabilities] = useState([
    'reasoning', 'code_generation', 'data_analysis', 'testing', 
    'deployment', 'documentation', 'optimization', 'debugging'
  ]);
  const [messageInput, setMessageInput] = useState('');

  // Initialize service
  const service = advancedMCPIntegration.init(supabase);

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadTasks = async () => {
    try {
      const allTasks = await service.getAllTasks();
      setTasks(allTasks);
    } catch (error) {
      console.error('Failed to load A2A tasks:', error);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) return;

    try {
      const task = await service.createTask(
        newTask.title,
        newTask.description,
        newTask.capabilities
      );

      setTasks(prev => [task, ...prev]);
      setSelectedTask(task);
      setNewTask({ title: '', description: '', capabilities: [] });
      setActiveTab('tasks');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleTaskSelect = (task: A2ATask) => {
    setSelectedTask(task);
    onTaskSelect?.(task);
  };

  const handleSendMessage = async () => {
    if (!selectedTask || !messageInput.trim()) return;

    try {
      await service.sendA2AMessage(
        selectedTask.id,
        'user',
        'coordinator-agent',
        messageInput
      );

      setMessageInput('');
      await loadTasks(); // Refresh to get updated messages
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'active': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'cancelled': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'active': return <Play className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      case 'cancelled': return <Square className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-slate-600';
      case 'active': return 'bg-blue-500 animate-pulse';
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-slate-600';
    }
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'reasoning': return <Bot className="w-4 h-4" />;
      case 'execution': return <Play className="w-4 h-4" />;
      case 'coordination': return <Workflow className="w-4 h-4" />;
      case 'specialized': return <Settings className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const calculateTaskProgress = (task: A2ATask) => {
    const completedSteps = task.workflow.steps.filter(s => s.status === 'completed').length;
    return task.workflow.steps.length > 0 ? (completedSteps / task.workflow.steps.length) * 100 : 0;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="w-6 h-6 text-green-400" />
            <h3 className="text-lg font-semibold text-white">A2A Protocol</h3>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              Multi-Agent
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={loadTasks}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="tasks" className="data-[state=active]:bg-slate-700">
              <Workflow className="w-4 h-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-slate-700">
              <Plus className="w-4 h-4 mr-2" />
              Create
            </TabsTrigger>
            <TabsTrigger value="monitor" className="data-[state=active]:bg-slate-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Monitor
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tasks" className="flex-1 m-0">
          <div className="flex h-full">
            {/* Task List */}
            <div className="w-1/2 border-r border-slate-700">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {tasks.map((task) => (
                    <Card 
                      key={task.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTask?.id === task.id 
                          ? 'bg-slate-700 border-green-500' 
                          : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => handleTaskSelect(task)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white text-sm">{task.title}</CardTitle>
                          <Badge className={getTaskStatusColor(task.status)}>
                            {getTaskStatusIcon(task.status)}
                            <span className="ml-1">{task.status}</span>
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-slate-300 text-xs mb-3 line-clamp-2">
                          {task.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>Progress</span>
                            <span>{Math.round(calculateTaskProgress(task))}%</span>
                          </div>
                          <Progress value={calculateTaskProgress(task)} className="h-1" />
                        </div>
                        
                        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                          <span>{task.participants.length} agents</span>
                          <span>{task.messages.length} messages</span>
                          <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {tasks.length === 0 && (
                    <div className="text-center py-8">
                      <Workflow className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">No A2A tasks created</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab('create')}
                        className="mt-2"
                      >
                        Create Task
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Task Details */}
            <div className="flex-1">
              {selectedTask ? (
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    {/* Task Info */}
                    <Card className="bg-slate-800 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white">{selectedTask.title}</CardTitle>
                        <p className="text-slate-400 text-sm">{selectedTask.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-400">Status</p>
                            <Badge className={getTaskStatusColor(selectedTask.status)}>
                              {selectedTask.status}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Progress</p>
                            <p className="text-white">{Math.round(calculateTaskProgress(selectedTask))}%</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-slate-400 mb-2">Participants</p>
                            <div className="flex flex-wrap gap-2">
                              {selectedTask.participants.map((agent) => (
                                <Badge key={agent.id} className="bg-blue-500/20 text-blue-400">
                                  {getAgentTypeIcon(agent.type)}
                                  <span className="ml-1">{agent.name}</span>
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-slate-400 mb-2">Workflow Steps</p>
                            <div className="space-y-2">
                              {selectedTask.workflow.steps.map((step, index) => (
                                <div key={step.id} className="flex items-center space-x-3">
                                  <div className={`w-3 h-3 rounded-full ${getStepStatusColor(step.status)}`} />
                                  <div className="flex-1">
                                    <span className="text-sm text-white">{step.name}</span>
                                    <p className="text-xs text-slate-400">
                                      Assigned to: {step.assignedAgent}
                                    </p>
                                  </div>
                                  <Badge className={getTaskStatusColor(step.status)}>
                                    {step.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>

                          {selectedTask.artifacts.length > 0 && (
                            <div>
                              <p className="text-sm text-slate-400 mb-2">Artifacts</p>
                              <div className="space-y-2">
                                {selectedTask.artifacts.map((artifact) => (
                                  <div key={artifact.id} className="bg-slate-700 p-2 rounded flex items-center justify-between">
                                    <div>
                                      <span className="text-sm text-white">{artifact.name}</span>
                                      <p className="text-xs text-slate-400">{artifact.type}</p>
                                    </div>
                                    <Badge className="text-xs">
                                      {artifact.immutable ? 'Immutable' : 'Mutable'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a task to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create" className="flex-1 m-0">
          <div className="p-4">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Create New A2A Task</CardTitle>
                <p className="text-slate-400 text-sm">Define a multi-agent collaboration task</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Task Title
                  </label>
                  <Input
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Task Description
                  </label>
                  <Textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what you want the agents to accomplish..."
                    className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Required Capabilities
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableCapabilities.map((capability) => (
                      <Badge
                        key={capability}
                        className={`cursor-pointer transition-colors ${
                          newTask.capabilities.includes(capability)
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : 'bg-slate-600/20 text-slate-400 border-slate-600/30 hover:bg-slate-500/20'
                        }`}
                        onClick={() => {
                          setNewTask(prev => ({
                            ...prev,
                            capabilities: prev.capabilities.includes(capability)
                              ? prev.capabilities.filter(c => c !== capability)
                              : [...prev.capabilities, capability]
                          }));
                        }}
                      >
                        {capability}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setNewTask({ title: '', description: '', capabilities: [] })}
                  >
                    Clear
                  </Button>
                  <Button
                    onClick={handleCreateTask}
                    disabled={!newTask.title.trim() || !newTask.description.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="flex-1 m-0">
          <div className="h-full flex flex-col">
            {selectedTask ? (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-hidden">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-3">
                      {selectedTask.messages.map((message) => (
                        <Card key={message.id} className="bg-slate-800 border-slate-600">
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge className="bg-blue-500/20 text-blue-400 text-xs">
                                  {message.from}
                                </Badge>
                                <ArrowRight className="w-3 h-3 text-slate-500" />
                                <Badge className="bg-green-500/20 text-green-400 text-xs">
                                  {message.to}
                                </Badge>
                              </div>
                              <span className="text-xs text-slate-400">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-300">{message.content}</p>
                            {message.parts.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {message.parts.map((part, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {part.type}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}

                      {selectedTask.messages.length === 0 && (
                        <div className="text-center py-8">
                          <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                          <p className="text-slate-400">No messages yet</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-700">
                  <div className="flex space-x-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      placeholder="Send a message to the task agents..."
                      className="flex-1 bg-slate-800 border-slate-600 text-white"
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a task to monitor its communication</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
