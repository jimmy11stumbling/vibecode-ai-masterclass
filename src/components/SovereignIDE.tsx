import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { toast } from 'sonner';
import { sovereignOrchestrator } from '@/services/sovereignOrchestrator';
import type { SovereignTask, WorkflowExecution } from '@/services/sovereignOrchestrator';
import { SovereignRealTimeProgress } from './SovereignRealTimeProgress';
import { ApiKeyInput } from './ApiKeyInput';
import { GeneratedAppViewer } from './GeneratedAppViewer';
import { SovereignHeader } from './sovereign/SovereignHeader';
import { PromptInput } from './sovereign/PromptInput';
import { TaskPipeline } from './sovereign/TaskPipeline';
import { EmptyState } from './sovereign/EmptyState';

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
      
      const execution = sovereignOrchestrator.getWorkflowExecution(executionId);
      if (execution) {
        setCurrentExecution(execution);
        setExecutionHistory(prev => [execution, ...prev]);
      }

      const executionTasks = await sovereignOrchestrator.getTasks(executionId);
      setTasks(executionTasks);

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
      <div className="flex-shrink-0 p-6 border-b border-slate-700">
        <SovereignHeader
          currentExecution={currentExecution}
          onPause={pauseExecution}
          onResume={resumeExecution}
          onReset={resetExecution}
          onSettings={() => setShowApiKeyInput(true)}
        />

        <PromptInput
          userPrompt={userPrompt}
          setUserPrompt={setUserPrompt}
          isProcessing={isProcessing}
          onStartGeneration={startAutonomousGeneration}
        />
      </div>

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
            {(isProcessing || currentExecution) && (
              <div className="p-6 border-b border-slate-700">
                <SovereignRealTimeProgress
                  execution={currentExecution}
                  tasks={tasks}
                  isProcessing={isProcessing}
                />
              </div>
            )}

            {tasks.length > 0 ? (
              <div className="flex-1 overflow-auto p-6">
                <TaskPipeline tasks={tasks} />
              </div>
            ) : (
              !isProcessing && !currentExecution && <EmptyState />
            )}
          </>
        )}
      </div>
    </div>
  );
};
