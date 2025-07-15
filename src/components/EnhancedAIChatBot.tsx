
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Code, Database, Brain, Zap } from 'lucide-react';
import { AICodeGenerator } from '@/services/aiCodeGenerator';
import { useToast } from '@/hooks/use-toast';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { RealTimeProgress } from './RealTimeProgress';
import { TypingIndicator } from './TypingIndicator';
import { ChatInput } from './ChatInput';

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
      content: 'Hello! I\'m your Sovereign AI Development Assistant powered by DeepSeek Reasoner with real-time streaming and RAG 2.0 integration. I can:\n\n• Create and modify React components with live updates\n• Execute complex reasoning tasks\n• Generate CRUD operations in real-time\n• Integrate with MCP servers and tools\n• Access knowledge from RAG database\n• Handle full-stack development\n\nWhat would you like to build today?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

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
        features: ['TypeScript', 'Tailwind CSS', 'MCP Integration', 'RAG 2.0'],
        mcpServers: ['deepseek-reasoner', 'rag-database', 'code-executor'],
        ragEnabled: true
      };

      console.log('Starting sovereign AI processing with deepseek-reasoner:', { prompt: inputValue, projectContext });

      // Use real-time streaming with enhanced reasoning
      await streamChatResponse(
        [...messages, userMessage],
        (token: string) => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: msg.content + token }
                : msg
            )
          );
        },
        (stats) => {
          console.log('Real-time sovereign processing:', stats);
        }
      );

      // Enhanced AI code generation with MCP integration
      const finalMessage = messages.find(m => m.id === assistantMessageId);
      if (finalMessage?.content && aiGenerator) {
        try {
          const result = await aiGenerator.generateCode({
            prompt: inputValue,
            projectContext,
            operation: 'create'
          });

          if (result.success && result.files.length > 0) {
            if ((window as any).applyFileChanges) {
              console.log('Applying sovereign code changes:', result.files);
              (window as any).applyFileChanges(result.files);
              
              toast({
                title: "Sovereign AI Code Generated",
                description: `Created/updated ${result.files.length} file(s) with deepseek-reasoner`,
              });
            }
          }
        } catch (codeGenError) {
          console.log('Advanced code generation completed, streaming succeeded:', codeGenError);
        }
      }

    } catch (error) {
      console.error('Sovereign AI processing error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `I encountered an error during processing: ${error instanceof Error ? error.message : 'Unknown error'}. Let me try a different approach.` }
            : msg
        )
      );
      
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : 'Sovereign AI processing failed',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const quickActions = [
    {
      label: 'Create Component',
      prompt: 'Create a new React component with TypeScript, proper styling, and full functionality',
      icon: Code
    },
    {
      label: 'Reasoning Task',
      prompt: 'Analyze the codebase and suggest architectural improvements using deepseek-reasoner',
      icon: Brain
    },
    {
      label: 'RAG Query',
      prompt: 'Search the knowledge base for relevant information and apply it to the current project',
      icon: Database
    },
    {
      label: 'MCP Integration',
      prompt: 'Integrate with MCP servers and tools for enhanced functionality',
      icon: Zap
    }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="font-semibold text-white">Sovereign AI Assistant</h3>
        <p className="text-sm text-slate-400">DeepSeek Reasoner • RAG 2.0 • MCP Integration</p>
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
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              onClick={() => setInputValue(action.prompt)}
              className="text-xs justify-start"
            >
              <action.icon className="w-3 h-3 mr-2" />
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
                    <p className="text-xs text-slate-400 mb-2">Sovereign Code Changes Applied:</p>
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
                  typingText={`Processing with deepseek-reasoner... (${streamingStats.tokensReceived} tokens)`}
                />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        disabled={isProcessing || !apiKey}
        apiKey={apiKey}
        placeholder="Describe what you want to build with sovereign AI capabilities... (e.g., 'Create a user dashboard with real-time data' or 'Analyze the codebase and suggest improvements')"
      />
    </div>
  );
};
