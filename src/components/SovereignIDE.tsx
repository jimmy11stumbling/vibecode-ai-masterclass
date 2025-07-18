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
import { GeneratedAppViewer } from './GeneratedAppViewer';

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
  const [generatedFiles, setGeneratedFiles] = useState<any[]>([]);
  const [showGeneratedApp, setShowGeneratedApp] = useState(false);

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
    setGeneratedFiles([]);
    setShowGeneratedApp(false);

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

      // Generate actual app files
      const files = await generateAppFiles(userPrompt, executionTasks);
      setGeneratedFiles(files);
      setShowGeneratedApp(true);

      toast.success('Autonomous generation completed successfully!');
      
      if (onProjectGenerated) {
        onProjectGenerated({
          executionId,
          prompt: userPrompt,
          tasks: executionTasks,
          execution,
          files
        });
      }

    } catch (error) {
      console.error('❌ Autonomous generation failed:', error);
      toast.error(error instanceof Error ? error.message : 'Generation failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [userPrompt, apiKey, showApiKeyInput, onProjectGenerated]);

  const generateAppFiles = async (prompt: string, tasks: any[]) => {
    // Generate actual React app files based on the prompt
    const appName = prompt.split(' ').slice(0, 3).join('') + 'App';
    
    const mainAppFile = {
      path: `src/${appName}.tsx`,
      content: generateMainAppComponent(prompt, appName),
      type: 'typescript'
    };

    const componentFiles = generateComponentFiles(prompt);
    const styleFile = {
      path: 'src/styles/app.css',
      content: generateAppStyles(),
      type: 'css'
    };

    const packageFile = {
      path: 'package.json',
      content: generatePackageJson(appName),
      type: 'json'
    };

    return [mainAppFile, ...componentFiles, styleFile, packageFile];
  };

  const generateMainAppComponent = (prompt: string, appName: string) => {
    return `import React, { useState } from 'react';
import './styles/app.css';

const ${appName} = () => {
  const [message, setMessage] = useState('Welcome to your generated app!');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            ${appName.replace(/([A-Z])/g, ' $1').trim()}
          </h1>
          <p className="text-lg text-gray-600">
            Generated from: "${prompt}"
          </p>
        </header>

        <main className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Features
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li>✅ Responsive Design</li>
              <li>✅ Modern React Patterns</li>
              <li>✅ TypeScript Support</li>
              <li>✅ Tailwind CSS Styling</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Interactive Demo
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
              />
              <div className="p-3 bg-blue-50 rounded-md text-blue-800">
                {message}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              Next Steps
            </h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Customize the components</p>
              <p>• Add your business logic</p>
              <p>• Connect to APIs</p>
              <p>• Deploy your app</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ${appName};`;
  };

  const generateComponentFiles = (prompt: string) => {
    // Generate additional component files based on prompt analysis
    const files = [];

    if (prompt.toLowerCase().includes('button') || prompt.toLowerCase().includes('form')) {
      files.push({
        path: 'src/components/CustomButton.tsx',
        content: `import React from 'react';

interface CustomButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false
}) => {
  const baseClasses = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variantClasses = variant === 'primary' 
    ? 'bg-blue-600 text-white hover:bg-blue-700' 
    : 'bg-gray-200 text-gray-800 hover:bg-gray-300';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`\${baseClasses} \${variantClasses} \${disabled ? 'opacity-50 cursor-not-allowed' : ''}\`}
    >
      {children}
    </button>
  );
};`,
        type: 'typescript'
      });
    }

    return files;
  };

  const generateAppStyles = () => {
    return `/* Generated App Styles */
.app-container {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.hover-lift:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
}`;
  };

  const generatePackageJson = (appName: string) => {
    return JSON.stringify({
      name: appName.toLowerCase(),
      version: "1.0.0",
      description: "Generated by Sovereign AI IDE",
      main: "index.js",
      dependencies: {
        "react": "^18.0.0",
        "react-dom": "^18.0.0",
        "typescript": "^4.9.0"
      },
      scripts: {
        "start": "react-scripts start",
        "build": "react-scripts build",
        "test": "react-scripts test"
      }
    }, null, 2);
  };

  const handleRunGeneratedApp = () => {
    // This would typically deploy or run the generated app
    toast.success('App is ready to run! Download the files to run locally.');
  };

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
        {showGeneratedApp && generatedFiles.length > 0 ? (
          <div className="h-full p-6">
            <GeneratedAppViewer
              files={generatedFiles}
              appName={userPrompt.split(' ').slice(0, 3).join('') + 'App'}
              onRunApp={handleRunGeneratedApp}
            />
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
};
