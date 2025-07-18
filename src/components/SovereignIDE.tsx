
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Brain, Zap, Settings, Play, Pause, RotateCcw, Crown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { sovereignOrchestrator } from '@/services/sovereignOrchestrator';
import type { SovereignTask, WorkflowExecution } from '@/services/sovereignOrchestrator';
import { SovereignRealTimeProgress } from './SovereignRealTimeProgress';
import { ApiKeyInput } from './ApiKeyInput';

interface SovereignIDEProps {
  onProjectGenerated?: (project: any) => void;
}

export const SovereignIDE = ({ onProjectGenerated }: SovereignIDEProps) => {
  const [userPrompt, setUserPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentExecution, setCurrentExecution] = useState<WorkflowExecution | null>(null);
  const [tasks, setTasks] = useState<SovereignTask[]>([]);
  const [executionHistory, setExecutionHistory] = useState<WorkflowExecution[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  // Check if we need API key
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        // Try to use the edge function to get the API key
        const response = await fetch('/api/get-deepseek-key');
        if (response.ok) {
          const data = await response.json();
          if (data.key) {
            setApiKey(data.key);
            sovereignOrchestrator.setApiKey(data.key);
          } else {
            setShowApiKeyInput(true);
          }
        } else {
          setShowApiKeyInput(true);
        }
      } catch (error) {
        console.log('Edge function not available, showing API key input');
        setShowApiKeyInput(true);
      }
    };

    checkApiKey();
  }, []);

  const handleApiKeySubmit = (key: string) => {
    setApiKey(key);
    sovereignOrchestrator.setApiKey(key);
    setShowApiKeyInput(false);
    toast.success('API key configured successfully');
  };

  const startAutonomousGeneration = useCallback(async () => {
    if (!userPrompt.trim()) {
      toast.error('Please enter a project description');
      return;
    }

    if (!apiKey && showApiKeyInput) {
      toast.error('Please configure your DeepSeek API key first');
      return;
    }

    setIsProcessing(true);
    setCurrentExecution(null);
    setTasks([]);

    try {
      console.log('🚀 Starting autonomous generation process...');
      
      const executionId = await sovereignOrchestrator.processUserRequest(userPrompt);
      
      // Get the execution details
      const execution = sovereignOrchestrator.getWorkflowExecution(executionId);
      if (execution) {
        setCurrentExecution(execution);
        setExecutionHistory(prev => [execution, ...prev]);
      }

      // Get the tasks
      const executionTasks = await sovereignOrchestrator.getTasks(executionId);
      setTasks(executionTasks);

      toast.success('Autonomous generation completed successfully!');
      
      if (onProjectGenerated) {
        onProjectGenerated({
          executionId,
          prompt: userPrompt,
          tasks: executionTasks,
          execution
        });
      }

    } catch (error) {
      console.error('❌ Autonomous generation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Generation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [userPrompt, apiKey, showApiKeyInput, onProjectGenerated]);

  const pauseExecution = useCallback(async () => {
    if (currentExecution) {
      await sovereignOrchestrator.pauseExecution(currentExecution.id);
      toast.info('Execution paused');
    }
  }, [currentExecution]);

  const resumeExecution = useCallback(async () => {
    if (currentExecution) {
      await sovereignOrchestrator.resumeExecution(currentExecution.id);
      toast.info('Execution resumed');
    }
  }, [currentExecution]);

  const resetExecution = useCallback(() => {
    setCurrentExecution(null);
    setTasks([]);
    setUserPrompt('');
    setIsProcessing(false);
    toast.info('Execution reset');
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (showApiKeyInput) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <CardTitle>Configure DeepSeek API</CardTitle>
            <CardDescription>
              Enter your DeepSeek API key to enable autonomous AI development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApiKeyInput 
              onApiKeySubmit={handleApiKeySubmit}
              placeholder="Enter your DeepSeek API key"
              label="DeepSeek API Key"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sovereign AI Development</h1>
              <p className="text-slate-400">Autonomous code generation and project orchestration</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentExecution && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={pauseExecution}
                  disabled={currentExecution.status !== 'running'}
                  className="border-slate-600"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resumeExecution}
                  disabled={currentExecution.status !== 'paused'}
                  className="border-slate-600"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetExecution}
              className="border-slate-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKeyInput(true)}
              className="border-slate-600"
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Prompt Input */}
        <div className="space-y-4">
          <Textarea
            placeholder="Describe your project... (e.g., 'Create a task management app with user authentication, real-time updates, and a modern dashboard')"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="min-h-[100px] bg-slate-800 border-slate-600 text-white placeholder-slate-400"
            disabled={isProcessing}
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>DeepSeek Reasoner</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4" />
                <span>Multi-Agent System</span>
              </div>
            </div>
            
            <Button
              onClick={startAutonomousGeneration}
              disabled={isProcessing || !userPrompt.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 mr-2" />
                  Start Autonomous Generation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Real-time Progress */}
        {(isProcessing || currentExecution) && (
          <div className="p-6 border-b border-slate-700">
            <SovereignRealTimeProgress
              execution={currentExecution}
              tasks={tasks}
              isProcessing={isProcessing}
            />
          </div>
        )}

        {/* Tasks Overview */}
        {tasks.length > 0 && (
          <div className="flex-1 overflow-auto p-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Task Execution Pipeline</h3>
                <Badge variant="outline" className="border-slate-600">
                  {tasks.filter(t => t.status === 'completed').length} / {tasks.length} Completed
                </Badge>
              </div>

              <div className="grid gap-3">
                {tasks.map((task) => (
                  <Card key={task.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                          <span className="font-medium">{task.description}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getPriorityColor(task.priority)}>
                            {task.priority}
                          </Badge>
                          <Badge variant="outline" className="border-slate-600">
                            {task.type}
                          </Badge>
                        </div>
                      </div>
                      
                      {task.dependencies && task.dependencies.length > 0 && (
                        <div className="text-sm text-slate-400 mb-2">
                          Dependencies: {task.dependencies.join(', ')}
                        </div>
                      )}
                      
                      {task.progress && (
                        <Progress value={task.progress} className="h-2" />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isProcessing && !currentExecution && tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                <Crown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Ready for Autonomous Development</h3>
              <p className="text-slate-400 mb-4">
                Describe your project and let the Sovereign AI system handle the entire development process.
              </p>
              <div className="flex items-center justify-center space-x-4 text-sm text-slate-500">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>AI-Powered Architecture</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>Multi-Agent Coordination</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
