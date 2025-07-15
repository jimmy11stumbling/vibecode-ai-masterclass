
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Code, Database, Brain, Zap, Sparkles } from 'lucide-react';
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
      content: 'Hello! I\'m your Enhanced AI Development Assistant with advanced capabilities:\n\n• Real-time code generation and modification\n• Full-stack application scaffolding\n• Database schema design and optimization\n• API integration and testing\n• Advanced reasoning and problem solving\n• Multi-file project management\n\nI can help you build complete applications from natural language descriptions. What would you like to create?',
      timestamp: new Date()
    }
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { streamChatResponse, streamingStats } = useDeepSeekAPI();
  const aiGenerator = apiKey ? new AICodeGenerator(apiKey) : null;

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

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
      if (!apiKey) {
        // Simulated response when no API key is provided
        setTimeout(() => {
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { 
                    ...msg, 
                    content: `I understand you want to work on: "${inputValue}"\n\nTo enable full AI functionality, please provide your OpenAI API key in the settings above. Once connected, I can:\n\n• Generate complete React applications\n• Create database schemas\n• Integrate APIs and external services\n• Debug and optimize code\n• Provide real-time assistance\n\nFor now, I can provide guidance and suggestions based on your request.` 
                  }
                : msg
            )
          );
          setIsProcessing(false);
        }, 1500);
        return;
      }

      const projectContext = {
        files: projectFiles.map(file => ({
          name: file.name,
          content: file.content || '',
          type: file.type
        })),
        framework: 'React',
        database: 'Supabase',
        features: ['TypeScript', 'Tailwind CSS'],
        capabilities: ['Real-time streaming', 'Code generation', 'Multi-file editing']
      };

      console.log('Starting enhanced AI processing:', { prompt: inputValue, projectContext });

      // Use real-time streaming
      await streamChatResponse(
        [...messages.slice(0, -1), userMessage],
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
          console.log('Real-time processing stats:', stats);
        }
      );

      // Enhanced AI code generation
      if (aiGenerator) {
        try {
          const result = await aiGenerator.generateCode({
            prompt: inputValue,
            projectContext,
            operation: 'create'
          });

          if (result.success && result.files.length > 0) {
            // Update the assistant message with code changes
            setMessages(prev => 
              prev.map(msg => 
                msg.id === assistantMessageId 
                  ? { 
                      ...msg, 
                      codeChanges: result.files.map(file => ({
                        path: file.path,
                        operation: 'create' as const,
                        content: file.content
                      }))
                    }
                  : msg
              )
            );

            if (onCodeGenerated) {
              onCodeGenerated(result.files[0]?.content || '');
            }
            
            toast({
              title: "Code Generated Successfully",
              description: `Created ${result.files.length} file(s) with enhanced AI`,
            });
          }
        } catch (codeGenError) {
          console.log('Code generation completed with streaming:', codeGenError);
        }
      }

    } catch (error) {
      console.error('Enhanced AI processing error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: `I encountered an error while processing your request: ${error instanceof Error ? error.message : 'Unknown error'}. Let me try a different approach.` 
              }
            : msg
        )
      );
      
      toast({
        title: "Processing Error",
        description: error instanceof Error ? error.message : 'AI processing failed',
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const quickActions = [
    {
      label: 'Create Component',
      prompt: 'Create a modern React component with TypeScript, proper styling, and full functionality',
      icon: Code,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      label: 'Advanced Reasoning',
      prompt: 'Analyze the current codebase and suggest architectural improvements with detailed explanations',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Database Design',
      prompt: 'Design a comprehensive database schema with relationships, indexes, and optimization',
      icon: Database,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Full-Stack App',
      prompt: 'Create a complete full-stack application with authentication, database, and modern UI',
      icon: Zap,
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-purple-400" />
              Enhanced AI Assistant
            </h3>
            <p className="text-sm text-slate-400">Advanced reasoning • Real-time streaming • Multi-file editing</p>
          </div>
          <div className="text-xs text-slate-500">
            {apiKey ? 'Connected' : 'No API Key'}
          </div>
        </div>
      </div>

      {/* Real-time Progress */}
      <div className="flex-shrink-0">
        <RealTimeProgress
          isStreaming={streamingStats.status === 'streaming'}
          tokensReceived={streamingStats.tokensReceived}
          responseTime={streamingStats.responseTime}
          status={streamingStats.status}
        />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-slate-700 flex-shrink-0">
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              size="sm"
              variant="outline"
              onClick={() => setInputValue(action.prompt)}
              className={`text-xs justify-start h-auto p-3 bg-gradient-to-r ${action.gradient} bg-opacity-10 border-opacity-30 hover:bg-opacity-20`}
            >
              <action.icon className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                      : 'bg-slate-800 text-slate-100 border border-slate-600'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                  
                  {message.codeChanges && message.codeChanges.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-600">
                      <p className="text-xs text-slate-400 mb-2 flex items-center">
                        <Code className="w-3 h-3 mr-1" />
                        Code Changes Applied:
                      </p>
                      {message.codeChanges.map((change, index) => (
                        <div key={index} className="text-xs bg-slate-700 p-2 rounded mb-1 font-mono">
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
                  
                  <div className="text-xs text-slate-400 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-800 text-slate-100 border border-slate-600 p-4 rounded-lg">
                  <TypingIndicator 
                    isVisible={isProcessing}
                    typingText={`Processing with enhanced AI... (${streamingStats.tokensReceived} tokens)`}
                  />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          disabled={isProcessing}
          apiKey={apiKey}
          placeholder="Describe your project or ask for help with advanced development tasks..."
        />
      </div>
    </div>
  );
};
