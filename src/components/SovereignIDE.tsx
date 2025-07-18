import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Crown, 
  Sparkles, 
  Users, 
  Activity, 
  CheckCircle, 
  Clock,
  Code,
  Brain,
  Zap,
  MessageSquare,
  Settings
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { sovereignOrchestrator } from '@/services/sovereignOrchestrator';
import { AgentCommunicationPanel } from './AgentCommunicationPanel';

interface SovereignIDEProps {
  onProjectGenerated?: (project: any) => void;
}

interface WorkflowExecution {
  id: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  current_step: number;
  total_steps: number;
}

interface Task {
  id: string;
  type: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: string;
}

export const SovereignIDE: React.FC<SovereignIDEProps> = ({ onProjectGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeExecution, setActiveExecution] = useState<WorkflowExecution | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [systemStatus, setSystemStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const { toast } = useToast();

  useEffect(() => {
    initializeSovereignSystem();
    const interval = setInterval(updateSystemStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  const initializeSovereignSystem = async () => {
    try {
      console.log('👑 Initializing Sovereign IDE System');
      
      // Initialize without accessing process.env directly
      // The API key will be handled by the orchestrator when needed
      
      setSystemStatus('ready');
      
      toast({
        title: "Sovereign IDE Ready",
        description: "All systems initialized and ready for autonomous development",
      });
      
    } catch (error) {
      console.error('Failed to initialize Sovereign IDE:', error);
      setSystemStatus('error');
      toast({
        title: "Initialization Failed",
        description: "Failed to initialize Sovereign IDE system",
        variant: "destructive"
      });
    }
  };

  const updateSystemStatus = async () => {
    if (activeExecution) {
      const execution = sovereignOrchestrator.getWorkflowExecution(activeExecution.id);
      if (execution) {
        setActiveExecution(execution);
        
        // Update tasks
        const executionTasks = await sovereignOrchestrator.getTasks(execution.id);
        setTasks(executionTasks);
      }
    }
  };

  const handleGenerateApplication = async () => {
    if (!prompt.trim()) {
      toast({
        title: "No Prompt Provided",
        description: "Please describe what you want to build",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('👑 Sovereign IDE: Starting autonomous application generation');
      
      const executionId = await sovereignOrchestrator.processUserRequest(prompt);
      
      const execution = sovereignOrchestrator.getWorkflowExecution(executionId);
      if (execution) {
        setActiveExecution(execution);
        
        toast({
          title: "Generation Started",
          description: "AI agents are now collaborating to build your application",
        });
        
        // Monitor execution progress
        const progressInterval = setInterval(async () => {
          const currentExecution = sovereignOrchestrator.getWorkflowExecution(executionId);
          if (currentExecution) {
            setActiveExecution(currentExecution);
            
            if (currentExecution.status === 'completed') {
              clearInterval(progressInterval);
              setIsGenerating(false);
              
              toast({
                title: "Generation Complete",
                description: "Your application has been built successfully!",
              });
              
              onProjectGenerated?.({
                id: executionId,
                name: 'AI Generated Project',
                files: []
              });
            } else if (currentExecution.status === 'failed') {
              clearInterval(progressInterval);
              setIsGenerating(false);
              
              toast({
                title: "Generation Failed",
                description: "There was an error generating your application",
                variant: "destructive"
              });
            }
          }
        }, 2000);
      }
      
    } catch (error) {
      console.error('Generation failed:', error);
      setIsGenerating(false);
      
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'initializing': return <Activity className="w-4 h-4 animate-spin" />;
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <Crown className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full bg-slate-900 text-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sovereign AI IDE</h1>
              <p className="text-slate-400">Autonomous Development Environment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {getStatusIcon(systemStatus)}
            <Badge variant={systemStatus === 'ready' ? 'default' : 'secondary'}>
              {systemStatus}
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="generator" className="space-y-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="communication" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Agent Communication
            </TabsTrigger>
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Workflow Monitor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-4">
            {/* Main Generator Interface */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Autonomous Application Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe the application you want to build... (e.g., 'Create a modern task management application with real-time collaboration, user authentication, and project organization features')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24 bg-slate-700 border-slate-600 text-white"
                  disabled={isGenerating}
                />
                
                <Button
                  onClick={handleGenerateApplication}
                  disabled={isGenerating || systemStatus !== 'ready'}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  {isGenerating ? (
                    <>
                      <Activity className="w-4 h-4 mr-2 animate-spin" />
                      Agents are collaborating...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Application
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Active Execution Status */}
            {activeExecution && (
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Workflow Execution
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{Math.round(activeExecution.progress)}%</span>
                    </div>
                    <Progress value={activeExecution.progress} className="h-2" />
                    <div className="text-sm text-slate-400">
                      Step {activeExecution.current_step} of {activeExecution.total_steps}
                    </div>
                  </div>
                  
                  <Badge variant={activeExecution.status === 'running' ? 'default' : 'secondary'}>
                    {activeExecution.status}
                  </Badge>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="communication">
            <AgentCommunicationPanel />
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4">
            {/* Task List */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Active Tasks ({tasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {tasks.length === 0 ? (
                      <div className="text-center text-slate-400 py-8">
                        No active tasks. Start by generating an application.
                      </div>
                    ) : (
                      tasks.map(task => (
                        <div 
                          key={task.id}
                          className="flex items-center justify-between p-3 border border-slate-600 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${getTaskStatusColor(task.status)}`} />
                            <div>
                              <div className="font-medium text-sm">{task.description}</div>
                              <div className="text-xs text-slate-400">
                                {task.assignedAgent || 'Unassigned'} • {task.type}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {task.status}
                          </Badge>
                        </div>
                      ))
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
