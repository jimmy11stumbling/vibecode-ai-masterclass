import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { LivePreview } from '@/components/LivePreview';
import { Terminal } from '@/components/Terminal';
import { 
  Bot, 
  Play, 
  Save, 
  Zap,
  Brain,
  Code,
  Eye,
  Terminal as TerminalIcon,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const AIBuilderPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to the AI Builder! I can help you build amazing applications. What would you like to create today?',
      timestamp: new Date()
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState('preview');
  
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you want to: "${prompt}". I'm working on generating the code for your request. This is a powerful AI-driven development environment that can create full applications!`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      toast({
        title: "AI Response Generated",
        description: "Your request has been processed successfully",
      });
    } catch (error) {
      console.error('AI Generation error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error processing your request. Please try again.`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Generation Failed",
        description: "Please try rephrasing your request",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleRunApp = () => {
    toast({
      title: "App Running",
      description: "Your application is now live in the preview",
    });
  };

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-foreground">AI App Builder</h1>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>DeepSeek AI</span>
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunApp}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Run App</span>
            </Button>
            
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* AI Chat Panel */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
            <div className="h-full flex flex-col bg-card border-r border-border">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold text-foreground flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-primary" />
                  AI Assistant
                </h3>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg border ${
                        message.role === 'user' 
                          ? 'bg-primary/10 border-primary/20' 
                          : 'bg-muted border-border'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {message.role === 'user' ? (
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground text-xs font-bold">U</span>
                          </div>
                        ) : (
                          <Bot className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium capitalize text-foreground">{message.role}</span>
                        <span className="text-xs text-muted-foreground">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{message.content}</p>
                    </div>
                  ))}
                  
                  {isGenerating && (
                    <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-yellow-700">AI is generating code...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t border-border">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Tell the AI what to build... (e.g., 'Create a todo app with React')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Preview & Tools Panel */}
          <ResizablePanel defaultSize={70} minSize={50}>
            <div className="h-full flex flex-col">
              <div className="bg-card border-b border-border">
                <div className="flex space-x-1 p-1">
                  <Button
                    variant={activeView === 'preview' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('preview')}
                    className="flex items-center space-x-2"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Live Preview</span>
                  </Button>
                  <Button
                    variant={activeView === 'code' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('code')}
                    className="flex items-center space-x-2"
                  >
                    <Code className="h-4 w-4" />
                    <span>Code Editor</span>
                  </Button>
                  <Button
                    variant={activeView === 'terminal' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveView('terminal')}
                    className="flex items-center space-x-2"
                  >
                    <TerminalIcon className="h-4 w-4" />
                    <span>Terminal</span>
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                {activeView === 'preview' && (
                  <div className="h-full bg-background">
                    <LivePreview files={[]} />
                  </div>
                )}
                
                {activeView === 'code' && (
                  <div className="h-full flex items-center justify-center bg-muted">
                    <div className="text-center text-muted-foreground">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Code Editor</p>
                      <p className="text-sm">Your generated code will appear here</p>
                    </div>
                  </div>
                )}
                
                {activeView === 'terminal' && (
                  <div className="h-full">
                    <Terminal />
                  </div>
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};