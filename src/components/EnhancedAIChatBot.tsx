
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Code, Database, Trash2, RefreshCw, Download } from 'lucide-react';
import { AICodeGenerator } from '@/services/aiCodeGenerator';
import { useToast } from '@/components/ui/use-toast';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { RealTimeProgress } from './RealTimeProgress';
import { TypingIndicator } from './TypingIndicator';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  codeChanges?: Array<{
    path: string;
    operation: 'create' | 'update' | 'delete';
    content?: string;
  }>;
}

interface EnhancedAIChatBotProps {
  projectFiles: ProjectFile[];
  onFilesChange: (files: ProjectFile[]) => void;
  onCodeGenerated?: (code: string) => void;
  apiKey?: string;
}

export const EnhancedAIChatBot: React.FC<EnhancedAIChatBotProps> = ({
  projectFiles,
  onFilesChange,
  onCodeGenerated,
  apiKey
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI full-stack development assistant with real-time streaming. I can help you:\n\n• Create React components and pages with live updates\n• Set up database schemas and APIs\n• Generate CRUD operations in real-time\n• Add authentication and authorization\n• Create responsive UI designs\n• Handle state management\n• Set up real-time features\n\nWhat would you like to build today?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  // Use the enhanced streaming hook
  const { streamChatResponse, streamingStats } = useDeepSeekAPI();
  const aiGenerator = apiKey ? new AICodeGenerator(apiKey) : null;

  const flattenFiles = (files: ProjectFile[]): Array<{name: string; content: string; type: string}> => {
    const result: Array<{name: string; content: string; type: string}> = [];
    
    const traverse = (fileList: ProjectFile[], path = '') => {
      fileList.forEach(file => {
        const fullPath = path ? `${path}/${file.name}` : file.name;
        
        if (file.type === 'file' && file.content) {
          result.push({
            name: fullPath,
            content: file.content,
            type: getFileType(file.name)
          });
        }
        
        if (file.children) {
          traverse(file.children, fullPath);
        }
      });
    };
    
    traverse(files);
    return result;
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'tsx': case 'jsx': return 'component';
      case 'ts': case 'js': return 'script';
      case 'css': return 'styles';
      case 'json': return 'config';
      case 'md': return 'documentation';
      default: return 'file';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !apiKey) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsProcessing(true);

    // Create assistant message for real-time streaming
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const projectContext = {
        files: flattenFiles(projectFiles),
        framework: 'React',
        database: 'Supabase',
        features: ['TypeScript', 'Tailwind CSS', 'React Router']
      };

      console.log('Starting real-time AI streaming:', { prompt: inputValue, projectContext });

      // Use real-time streaming
      await streamChatResponse(
        [...messages, userMessage],
        (token: string) => {
          // Real-time token update
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        (stats) => {
          console.log('Real-time streaming progress:', stats);
        }
      );

      // After streaming is complete, try to process for code generation
      const finalMessage = messages.find(m => m.id === assistantMessageId);
      if (finalMessage?.content && aiGenerator) {
        try {
          const result = await aiGenerator.generateCode({
            prompt: inputValue,
            projectContext,
            operation: 'create'
          });

          if (result.success && result.files.length > 0) {
            // Apply changes through the global function
            if ((window as any).applyFileChanges) {
              console.log('Applying real-time file changes:', result.files);
              (window as any).applyFileChanges(result.files);
              
              toast({
                title: "Real-time Code Generated",
                description: `Created/updated ${result.files.length} file(s) in real-time`,
              });
            }
          }
        } catch (codeGenError) {
          console.log('Code generation failed, but streaming succeeded:', codeGenError);
        }
      }

    } catch (error) {
      console.error('Real-time streaming error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `Sorry, I encountered an error with real-time streaming: ${error instanceof Error ? error.message : 'Unknown error'}` }
            : msg
        )
      );
      
      toast({
        title: "Streaming Error",
        description: error instanceof Error ? error.message : 'Real-time streaming failed',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const quickActions = [
    {
      label: 'Create Component',
      prompt: 'Create a new React component with TypeScript and proper styling',
      icon: Code
    },
    {
      label: 'Add Database Table',
      prompt: 'Create a new database table with CRUD operations',
      icon: Database
    },
    {
      label: 'Generate API Routes',
      prompt: 'Create API routes for data management',
      icon: RefreshCw
    }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="font-semibold text-white">AI Full-Stack Assistant</h3>
        <p className="text-sm text-slate-400">Powered by DeepSeek - Real-time streaming enabled</p>
      </div>

      {/* Real-time Progress */}
      <RealTimeProgress
        isStreaming={streamingStats.status === 'streaming'}
        tokensReceived={streamingStats.tokensReceived}
        responseTime={streamingStats.responseTime}
        status={streamingStats.status}
      />

      {/* Quick Actions */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              onClick={() => setInputValue(action.prompt)}
              className="text-xs"
            >
              <action.icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                
                {message.codeChanges && message.codeChanges.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-600">
                    <p className="text-xs text-slate-400 mb-2">Real-time Code Changes Applied:</p>
                    {message.codeChanges.map((change, index) => (
                      <div key={index} className="text-xs bg-slate-700 p-2 rounded mb-1">
                        <span className={`font-semibold ${
                          change.operation === 'create' ? 'text-green-400' :
                          change.operation === 'update' ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {change.operation.toUpperCase()}
                        </span>
                        {' '}{change.path}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-100 p-3 rounded-lg">
                <TypingIndicator 
                  isVisible={isProcessing}
                  typingText={`Real-time streaming... (${streamingStats.tokensReceived} tokens)`}
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Describe what you want to build with real-time streaming... (e.g., 'Create a user dashboard with login form' or 'Add a blog post management system')"
            className="flex-1 bg-slate-800 border-slate-600 text-white min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || isProcessing || !apiKey}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {!apiKey && (
          <p className="text-xs text-slate-400 mt-2">
            Add your DeepSeek API key to enable real-time AI code generation
          </p>
        )}
        
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span>Press Shift + Enter for new line</span>
          <span className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              streamingStats.status === 'streaming' ? 'bg-blue-500 animate-pulse' :
              streamingStats.status === 'complete' ? 'bg-green-500' :
              streamingStats.status === 'error' ? 'bg-red-500' :
              apiKey ? 'bg-green-500' : 'bg-red-500'
            }`} />
            {streamingStats.status === 'streaming' ? 'Streaming Live' :
             streamingStats.status === 'complete' ? 'Stream Complete' :
             streamingStats.status === 'error' ? 'Stream Error' :
             apiKey ? 'Ready for Real-time' : 'Disconnected'}
          </span>
        </div>
      </form>
    </div>
  );
};
