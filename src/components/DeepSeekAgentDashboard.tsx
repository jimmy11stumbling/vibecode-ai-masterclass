
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  Brain, 
  Code, 
  Zap, 
  Activity,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { deepSeekAgentCore } from '@/services/deepSeekAgentCore';
import { DeepSeekReasonerDashboard } from './DeepSeekReasonerDashboard';
import { ContextAwareCodeGenerator } from './ContextAwareCodeGenerator';
import { useToast } from '@/hooks/use-toast';

interface DeepSeekAgentDashboardProps {
  onCodeGenerated?: (code: string) => void;
}

export const DeepSeekAgentDashboard: React.FC<DeepSeekAgentDashboardProps> = ({
  onCodeGenerated
}) => {
  const [activeTasks, setActiveTasks] = useState([]);
  const [generatedFiles, setGeneratedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tasks, files] = await Promise.all([
        deepSeekAgentCore.getActiveTasks(),
        deepSeekAgentCore.getGeneratedFiles()
      ]);
      
      setActiveTasks(tasks);
      setGeneratedFiles(files);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApp = async () => {
    try {
      const sessionId = await deepSeekAgentCore.createFullStackApplication(
        "Create a modern React application with user authentication, data management, and responsive design",
        {
          projectFiles: [],
          framework: 'React',
          styling: 'Tailwind CSS'
        }
      );

      toast({
        title: "Application Creation Started",
        description: `DeepSeek agents are now building your application. Session: ${sessionId}`,
      });

      // Refresh dashboard data
      loadDashboardData();
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to start application creation",
        variant: "destructive"
      });
    }
  };

  const getTaskStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getTaskStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">DeepSeek Agent Dashboard</h2>
              <p className="text-sm text-slate-400">Advanced AI development with DeepSeek Reasoner</p>
            </div>
          </div>
          
          <Button 
            onClick={handleCreateApp}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            <Zap className="w-4 h-4 mr-2" />
            Create App
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-slate-700">
            Overview
          </TabsTrigger>
          <TabsTrigger value="reasoner" className="data-[state=active]:bg-slate-700">
            Reasoner
          </TabsTrigger>
          <TabsTrigger value="generator" className="data-[state=active]:bg-slate-700">
            Code Gen
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-slate-700">
            Tasks
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="overview" className="h-full m-0 p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Active Tasks</p>
                      <p className="text-2xl font-bold text-white">{activeTasks.length}</p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Generated Files</p>
                      <p className="text-2xl font-bold text-white">{generatedFiles.length}</p>
                    </div>
                    <FileText className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-400">Success Rate</p>
                      <p className="text-2xl font-bold text-white">
                        {activeTasks.length > 0 
                          ? Math.round((activeTasks.filter((t: any) => t.status === 'completed').length / activeTasks.length) * 100)
                          : 0
                        }%
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-400px)]">
              {/* Recent Tasks */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Recent Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-60">
                    {activeTasks.length === 0 ? (
                      <div className="text-center py-8">
                        <Bot className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">No active tasks</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {activeTasks.slice(0, 10).map((task: any, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {getTaskStatusIcon(task.status)}
                              <div>
                                <p className="text-sm text-white font-medium">{task.type}</p>
                                <p className="text-xs text-slate-400">{task.description}</p>
                              </div>
                            </div>
                            <Badge className={`text-xs ${getTaskStatusColor(task.status)}`}>
                              {task.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Generated Files */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Code className="w-5 h-5 mr-2" />
                    Generated Files
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-60">
                    {generatedFiles.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-400">No files generated yet</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {generatedFiles.slice(0, 10).map((file: any, index) => (
                          <div key={index} className="p-3 bg-slate-700 rounded-lg">
                            <p className="text-sm text-white font-medium">{file.path}</p>
                            <p className="text-xs text-slate-400">{file.operation}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reasoner" className="h-full m-0">
            <DeepSeekReasonerDashboard />
          </TabsContent>

          <TabsContent value="generator" className="h-full m-0">
            <ContextAwareCodeGenerator 
              onCodeGenerated={(files) => {
                // Convert files to simple code string for backward compatibility
                const combinedCode = files.map(f => `// ${f.path}\n${f.content}`).join('\n\n');
                onCodeGenerated?.(combinedCode);
              }}
            />
          </TabsContent>

          <TabsContent value="tasks" className="h-full m-0 p-4">
            <Card className="bg-slate-800 border-slate-700 h-full">
              <CardHeader>
                <CardTitle className="text-white">Task Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {activeTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <Bot className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">No tasks running</p>
                      <p className="text-slate-500 text-sm">Start by creating a new application</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activeTasks.map((task: any, index) => (
                        <Card key={index} className="bg-slate-700 border-slate-600">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-start space-x-3">
                                {getTaskStatusIcon(task.status)}
                                <div>
                                  <h4 className="text-sm font-medium text-white">{task.type}</h4>
                                  <p className="text-xs text-slate-400">{task.description}</p>
                                </div>
                              </div>
                              <Badge className={`text-xs ${getTaskStatusColor(task.status)}`}>
                                {task.status}
                              </Badge>
                            </div>
                            
                            <div className="text-xs text-slate-400">
                              <p>Assigned to: {task.assignedAgent}</p>
                              <p>Created: {new Date(task.createdAt).toLocaleString()}</p>
                            </div>
                            
                            {task.result && (
                              <div className="mt-3 p-2 bg-slate-800 rounded text-xs text-slate-300">
                                Result: {task.result.explanation || 'Task completed successfully'}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
