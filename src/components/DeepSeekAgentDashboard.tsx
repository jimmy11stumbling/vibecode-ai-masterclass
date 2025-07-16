import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Code, 
  Database, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Sparkles,
  Cpu,
  Layers,
  FileText
} from 'lucide-react';
import { deepSeekAgentCore, AgentTask } from '@/services/deepSeekAgentCore';
import { a2aProtocol } from '@/services/a2aProtocolCore';
import { useToast } from '@/hooks/use-toast';
import { GeneratedFilesViewer } from './GeneratedFilesViewer';

interface DeepSeekAgentDashboardProps {
  onCodeGenerated?: (code: string) => void;
}

export const DeepSeekAgentDashboard: React.FC<DeepSeekAgentDashboardProps> = ({
  onCodeGenerated
}) => {
  const [activePrompt, setActivePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTasks, setActiveTasks] = useState<AgentTask[]>([]);
  const [agents, setAgents] = useState(a2aProtocol.getAgents());
  const { toast } = useToast();

  useEffect(() => {
    const loadTasks = async () => {
      const tasks = await deepSeekAgentCore.getActiveTasks();
      setActiveTasks(tasks);
    };

    loadTasks();
    const interval = setInterval(loadTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateApplication = async () => {
    if (!activePrompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a description for your application",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      console.log('🚀 Starting DeepSeek-powered application creation');
      
      const sessionId = await deepSeekAgentCore.createFullStackApplication(activePrompt, {
        framework: 'React',
        styling: 'Tailwind CSS',
        backend: 'Supabase',
        features: ['Authentication', 'Database', 'Real-time updates']
      });

      toast({
        title: "Application Created!",
        description: "Your application has been generated successfully. Check the Files tab to view the code.",
      });

      if (onCodeGenerated) {
        onCodeGenerated(`// Application generated successfully!\n// Session ID: ${sessionId}\n// Check the Files tab to view your generated code.`);
      }

      setActivePrompt('');
    } catch (error) {
      console.error('Application creation failed:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const quickPrompts = [
    {
      title: 'E-commerce Store',
      prompt: 'Create a modern e-commerce application with product catalog, shopping cart, user authentication, and payment processing',
      icon: Database,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Task Management App',
      prompt: 'Build a collaborative task management application with project boards, team collaboration, and real-time updates',
      icon: Layers,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Social Media Platform',
      prompt: 'Develop a social media platform with user profiles, posts, comments, likes, and real-time messaging',
      icon: Sparkles,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Analytics Dashboard',
      prompt: 'Create a comprehensive analytics dashboard with data visualization, reporting, and real-time metrics',
      icon: Cpu,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const getTaskStatusIcon = (status: AgentTask['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTaskProgress = (task: AgentTask): number => {
    switch (task.status) {
      case 'completed': return 100;
      case 'in_progress': return 60;
      case 'failed': return 0;
      default: return 0;
    }
  };

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Brain className="w-7 h-7 mr-3 text-blue-400" />
              DeepSeek Agent Swarm
            </h2>
            <p className="text-slate-400 mt-1">AI-powered full-stack development with specialized agents</p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {agents.filter(a => a.status === 'active').length} Active Agents
            </Badge>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              {activeTasks.filter(t => t.status === 'in_progress').length} Running Tasks
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="create" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700">
          <TabsTrigger value="create" className="data-[state=active]:bg-slate-700">Create App</TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-slate-700">Active Tasks</TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-slate-700">Agent Status</TabsTrigger>
          <TabsTrigger value="files" className="data-[state=active]:bg-slate-700">Generated Files</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="create" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-6">
                {/* Application Creation */}
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                      Create Full-Stack Application
                    </CardTitle>
                    <CardDescription>
                      Describe your application and let DeepSeek agents build it for you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <textarea
                      value={activePrompt}
                      onChange={(e) => setActivePrompt(e.target.value)}
                      placeholder="Describe the application you want to create..."
                      className="w-full h-32 p-4 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 resize-none focus:border-blue-500 focus:outline-none"
                    />
                    <Button
                      onClick={handleCreateApplication}
                      disabled={isGenerating || !activePrompt.trim()}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      {isGenerating ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Creating Application...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Create with DeepSeek
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Quick Prompts */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Quick Start Templates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quickPrompts.map((template, index) => (
                      <Card 
                        key={index}
                        className="bg-slate-800 border-slate-700 hover:border-slate-600 cursor-pointer transition-all"
                        onClick={() => setActivePrompt(template.prompt)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${template.color} flex items-center justify-center`}>
                              <template.icon className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-white">{template.title}</h4>
                              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
                                {template.prompt.substring(0, 100)}...
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="tasks" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                {activeTasks.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400">No active tasks</p>
                    <p className="text-sm text-slate-500">Create an application to see tasks in action</p>
                  </div>
                ) : (
                  activeTasks.map((task) => (
                    <Card key={task.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getTaskStatusIcon(task.status)}
                            <span className="font-medium text-white">{task.description}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.assignedAgent}
                          </Badge>
                        </div>
                        <Progress value={getTaskProgress(task)} className="mb-2" />
                        <div className="flex justify-between text-sm text-slate-400">
                          <span>Status: {task.status}</span>
                          <span>{task.createdAt.toLocaleTimeString()}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="agents" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-6 space-y-4">
                {agents.map((agent) => (
                  <Card key={agent.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-white">{agent.name}</h4>
                          <p className="text-sm text-slate-400">{agent.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {agent.capabilities.slice(0, 3).map((capability, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="files" className="h-full m-0">
            <GeneratedFilesViewer />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
