import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Play, 
  Pause, 
  Square, 
  RefreshCw,
  Plus,
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
import { TaskList } from './a2a/TaskList';
import { TaskDetails } from './a2a/TaskDetails';
import { TaskCreator } from './a2a/TaskCreator';
import { TaskMonitor } from './a2a/TaskMonitor';

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

  const handleCreateTask = async (taskData: { title: string; description: string; capabilities: string[] }) => {
    try {
      const task = await service.createTask(
        taskData.title,
        taskData.description,
        taskData.capabilities
      );

      setTasks(prev => [task, ...prev]);
      setSelectedTask(task);
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

  // Helper functions for styling and status
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
            <TaskList
              tasks={tasks}
              selectedTask={selectedTask}
              onTaskSelect={handleTaskSelect}
              onCreateTask={() => setActiveTab('create')}
              getTaskStatusColor={getTaskStatusColor}
              getTaskStatusIcon={getTaskStatusIcon}
              calculateTaskProgress={calculateTaskProgress}
            />
            <TaskDetails
              selectedTask={selectedTask}
              getTaskStatusColor={getTaskStatusColor}
              getStepStatusColor={getStepStatusColor}
              getAgentTypeIcon={getAgentTypeIcon}
              calculateTaskProgress={calculateTaskProgress}
            />
          </div>
        </TabsContent>

        <TabsContent value="create" className="flex-1 m-0">
          <TaskCreator onCreateTask={handleCreateTask} />
        </TabsContent>

        <TabsContent value="monitor" className="flex-1 m-0">
          <TaskMonitor
            selectedTask={selectedTask}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSendMessage={handleSendMessage}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};