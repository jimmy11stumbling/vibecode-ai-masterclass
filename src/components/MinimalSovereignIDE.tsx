
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Play, 
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sovereignOrchestrator } from '@/services/sovereignOrchestrator';

interface MinimalSovereignIDEProps {
  onProjectGenerated?: (project: any) => void;
}

export const MinimalSovereignIDE: React.FC<MinimalSovereignIDEProps> = ({
  onProjectGenerated
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<'idle' | 'working' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize system silently in background
    initializeSystem();
  }, []);

  const initializeSystem = async () => {
    try {
      // Set API key if available
      const apiKey = localStorage.getItem('deepseek_api_key');
      if (apiKey) {
        sovereignOrchestrator.setApiKey(apiKey);
      }
    } catch (error) {
      console.error('System initialization failed:', error);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "What should I build?",
        description: "Please describe your application idea",
        variant: "destructive"
      });
      return;
    }

    if (!localStorage.getItem('deepseek_api_key')) {
      toast({
        title: "API Key Required", 
        description: "Please add your DeepSeek API key in settings",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setStatus('working');
    setProgress(0);

    try {
      const executionId = await sovereignOrchestrator.processUserRequest(prompt);
      
      // Monitor progress in background
      const progressInterval = setInterval(async () => {
        const execution = sovereignOrchestrator.getWorkflowExecution(executionId);
        if (execution) {
          setProgress(execution.progress || 0);
          
          if (execution.status === 'completed') {
            clearInterval(progressInterval);
            setStatus('complete');
            setIsGenerating(false);
            
            toast({
              title: "Application Generated!",
              description: "Your app is ready to use",
            });

            if (onProjectGenerated) {
              onProjectGenerated({ executionId, execution });
            }
          } else if (execution.status === 'failed') {
            clearInterval(progressInterval);
            setStatus('error');
            setIsGenerating(false);
            
            toast({
              title: "Generation Failed",
              description: "Something went wrong. Please try again.",
              variant: "destructive"
            });
          }
        }
      }, 2000);

      // Auto-stop after 5 minutes
      setTimeout(() => {
        clearInterval(progressInterval);
        if (isGenerating) {
          setIsGenerating(false);
          setStatus('error');
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      setIsGenerating(false);
      setStatus('error');
      toast({
        title: "Failed to Start",
        description: "Unable to begin generation. Check your settings.",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'working': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'complete': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  const quickStartExamples = [
    "Build a todo app with drag & drop",
    "Create a dashboard with charts",
    "Make a chat application",
    "Design a landing page"
  ];

  return (
    <div className="h-full bg-slate-900 text-white flex flex-col">
      {/* Minimal Header */}
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Sovereign IDE</h1>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <p className="text-xs text-slate-400">
                {status === 'working' && `Generating... ${Math.round(progress)}%`}
                {status === 'complete' && 'Ready'}
                {status === 'error' && 'Error occurred'}
                {status === 'idle' && 'AI-Powered Development'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface */}
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="w-full max-w-2xl space-y-6">
          {/* Input Card */}
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="p-6 space-y-4">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  What would you like to build?
                </h2>
                <p className="text-slate-400 text-sm">
                  Describe your app idea and I'll build it for you automatically
                </p>
              </div>

              <Textarea
                placeholder="e.g., Create a task management app with user authentication and real-time updates..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px] bg-slate-700 border-slate-600 text-white resize-none"
                disabled={isGenerating}
              />

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 h-12"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Application...
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

          {/* Quick Examples */}
          {!isGenerating && status === 'idle' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-400 text-center">Or try one of these:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickStartExamples.map((example, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => setPrompt(example)}
                    className="text-left justify-start text-slate-300 hover:text-white hover:bg-slate-700 h-auto p-3"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {isGenerating && (
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Building your application</span>
                    <Badge variant="outline" className="text-blue-400 border-blue-400">
                      {Math.round(progress)}%
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-400 text-center">
                    AI agents are working autonomously to create your application
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
