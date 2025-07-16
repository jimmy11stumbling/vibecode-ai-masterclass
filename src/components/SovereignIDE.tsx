
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sovereignOrchestrator, type SovereignTask, type ProjectSpec } from '@/services/sovereignOrchestrator';
import { a2aProtocol } from '@/services/a2aProtocolCore';
import { mcpHub } from '@/services/mcpHubCore';
import { ragDatabase } from '@/services/ragDatabaseCore';

interface SovereignIDEProps {
  onProjectGenerated?: (project: any) => void;
}

export const SovereignIDE: React.FC<SovereignIDEProps> = ({
  onProjectGenerated
}) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectSpec | null>(null);
  const [tasks, setTasks] = useState<SovereignTask[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState({
    orchestrator: 'active',
    a2aProtocol: 'active',
    mcpHub: 'active',
    ragDatabase: 'active',
    deepSeekReasoner: 'pending'
  });
  const { toast } = useToast();

  useEffect(() => {
    initializeSystem();
    const interval = setInterval(refreshStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const initializeSystem = async () => {
    console.log('👑 Initializing Sovereign IDE System');
    
    // Check API key
    const apiKey = localStorage.getItem('deepseek_api_key');
    if (apiKey) {
      sovereignOrchestrator.setApiKey(apiKey);
      setSystemStatus(prev => ({ ...prev, deepSeekReasoner: 'active' }));
    }

    // Load initial data
    await refreshStatus();
    
    toast({
      title: "Sovereign IDE Ready",
      description: "All systems initialized and ready for autonomous development",
    });
  };

  const refreshStatus = async () => {
    try {
      const projectTasks = await sovereignOrchestrator.getTasks();
      const activeAgents = a2aProtocol.getAllAgents();
      const activeProjects = await sovereignOrchestrator.getActiveProjects();

      setTasks(projectTasks);
      setAgents(activeAgents);
      
      if (activeProjects.length > 0 && !currentProject) {
        setCurrentProject(activeProjects[0]);
      }
    } catch (error) {
      console.error('Status refresh failed:', error);
    }
  };

  const handleGenerateApplication = async () => {
    if (!userPrompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe the application you want to create",
        variant: "destructive"
      });
      return;
    }

    if (!localStorage.getItem('deepseek_api_key')) {
      toast({
        title: "API Key Required",
        description: "Please configure your DeepSeek API key in settings",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      console.log('👑 Sovereign IDE: Starting autonomous application generation');
      
      const executionId = await sovereignOrchestrator.processUserRequest(userPrompt);
      
      toast({
        title: "Generation Started",
        description: `Autonomous development initiated. Execution ID: ${executionId}`,
      });

      // Start monitoring
      const monitorInterval = setInterval(async () => {
        await refreshStatus();
        
        const projectTasks = await sovereignOrchestrator.getTasks(executionId);
        const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
        
        if (completedTasks === projectTasks.length && projectTasks.length > 0) {
          clearInterval(monitorInterval);
          setIsProcessing(false);
          
          toast({
            title: "Application Generated",
            description: "Autonomous development completed successfully!",
          });

          if (onProjectGenerated) {
            onProjectGenerated({
              executionId,
              tasks: projectTasks,
              project: currentProject
            });
          }
        }
      }, 3000);

      // Auto-stop monitoring after 30 minutes
      setTimeout(() => {
        clearInterval(monitorInterval);
        setIsProcessing(false);
      }, 30 * 60 * 1000);

    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTaskStatusColor = (status: SovereignTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const samplePrompts = [
    "Create a modern task management application with real-time collaboration, user authentication, and project organization features",
    "Build a comprehensive e-commerce platform with product catalog, shopping cart, payment processing, and admin dashboard",
    "Develop a social media dashboard that aggregates content from multiple platforms with analytics and scheduling capabilities",
    "Create a knowledge management system with document upload, AI-powered search, and collaborative editing features"
  ];

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
              <h1 className="text-xl font-bold">Sovereign IDE</h1>
              <p className="text-sm text-slate-400">Autonomous AI Development Environment</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* System Status */}
            <div className="flex items-center space-x-2">
              {Object.entries(systemStatus).map(([system, status]) => (
                <div key={system} className="flex items-center space-x-1">
                  {getStatusIcon(status)}
                  <span className="text-xs text-slate-400 capitalize">
                    {system.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="generation" className="h-full flex flex-col">
          <TabsList className="w-full bg-slate-800 border-b border-slate-700">
            <TabsTrigger value="generation" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Generation</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Tasks ({tasks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="agents" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Agents ({agents.length})</span>
            </TabsTrigger>
            <TabsTrigger value="systems" className="flex items-center space-x-2">
              <Server className="w-4 h-4" />
              <span>Systems</span>
            </TabsTrigger>
          </TabsList>

          {/* Generation Tab */}
          <TabsContent value="generation" className="flex-1 p-6 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
              {/* Input Panel */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <span>Application Specification</span>
                  </CardTitle>
                  <CardDescription>
                    Describe your application in natural language. The Sovereign IDE will autonomously architect, develop, and deploy it.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Describe the application you want to create..."
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    className="min-h-[200px] bg-slate-700 border-slate-600 text-white"
                    disabled={isProcessing}
                  />

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-300">Quick Start Examples:</p>
                    <div className="grid grid-cols-1 gap-2">
                      {samplePrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="text-left justify-start h-auto p-3 text-slate-400 hover:text-white"
                          onClick={() => setUserPrompt(prompt)}
                          disabled={isProcessing}
                        >
                          {prompt}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateApplication}
                    disabled={isProcessing || !userPrompt.trim()}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    {isProcessing ? (
                      <>
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
                        Generating Autonomously...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Generate Application
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Real-time Status Panel */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-green-400" />
                    <span>Real-time Development Monitor</span>
                  </CardTitle>
                  <CardDescription>
                    Live monitoring of autonomous development progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    {currentProject && (
                      <div className="space-y-4">
                        <div className="p-3 bg-slate-700 rounded-lg">
                          <h3 className="font-medium text-white">{currentProject.name}</h3>
                          <p className="text-sm text-slate-400">{currentProject.description}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {currentProject.tech_stack && currentProject.tech_stack.map(tech => (
                              <Badge key={tech} variant="secondary" className="text-xs">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium text-white">Active Tasks</h4>
                          {tasks.length > 0 ? (
                            tasks.map(task => (
                              <div key={task.id} className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                                <div className={`w-3 h-3 rounded-full ${getTaskStatusColor(task.status)}`} />
                                <div className="flex-1">
                                  <p className="text-sm text-white">{task.description}</p>
                                  <p className="text-xs text-slate-400">
                                    {task.assigned_agent ? `Assigned to: ${task.assigned_agent}` : 'Unassigned'}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {task.status}
                                </Badge>
                              </div>
                            ))
                          ) : (
                            <p className="text-slate-400 text-sm">No active tasks</p>
                          )}
                        </div>
                      </div>
                    )}

                    {!currentProject && !isProcessing && (
                      <div className="flex items-center justify-center h-full text-slate-400">
                        <div className="text-center">
                          <Crown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Ready for autonomous development</p>
                          <p className="text-sm">Describe your application to begin</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="flex-1 p-6">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tasks.map(task => (
                  <Card key={task.id} className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">{task.type}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {task.priority}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-300 mb-3">{task.description}</p>
                      <div className="flex items-center justify-between">
                        <div className={`w-3 h-3 rounded-full ${getTaskStatusColor(task.status)}`} />
                        <span className="text-xs text-slate-400">
                          {task.assigned_agent || 'Unassigned'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents" className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {agents.map(agent => (
                <Card key={agent.id} className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">{agent.name}</CardTitle>
                    <CardDescription className="text-xs">{agent.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Status</span>
                        <Badge 
                          variant={agent.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {agent.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">Tasks</span>
                        <span className="text-xs text-white">{agent.currentTasks?.length || 0}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(agent.capabilities || []).slice(0, 3).map((cap: string) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Systems Tab */}
          <TabsContent value="systems" className="flex-1 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Database className="w-5 h-5 text-blue-400" />
                    <span>System Architecture</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries({
                    'DeepSeek Reasoner': 'Core AI reasoning engine',
                    'A2A Protocol': 'Agent-to-agent communication',
                    'MCP Hub': 'Tool coordination and execution',
                    'RAG Database': 'Knowledge base and context'
                  }).map(([system, description]) => (
                    <div key={system} className="flex items-center space-x-3">
                      {getStatusIcon(systemStatus[system.toLowerCase().replace(/\s+/g, '')] || 'active')}
                      <div>
                        <p className="text-sm font-medium text-white">{system}</p>
                        <p className="text-xs text-slate-400">{description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-green-400" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{tasks.length}</p>
                      <p className="text-xs text-slate-400">Total Tasks</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {tasks.filter(t => t.status === 'completed').length}
                      </p>
                      <p className="text-xs text-slate-400">Completed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-400">{agents.length}</p>
                      <p className="text-xs text-slate-400">Active Agents</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-400">
                        {agents.filter(a => a.status === 'active').length}
                      </p>
                      <p className="text-xs text-slate-400">Online</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
