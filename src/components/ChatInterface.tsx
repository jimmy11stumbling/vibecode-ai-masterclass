
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Code, Database, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { EnhancedAIChatBot } from '@/components/EnhancedAIChatBot';
import { ApiKeyInput } from '@/components/ApiKeyInput';
import { ConsoleLogger } from '@/components/ConsoleLogger';
import { useConsoleLogger } from '@/hooks/useConsoleLogger';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Welcome to the AI Development Environment! I\'m here to help you build amazing applications using natural language. You can:\n\n• Create React components and full applications\n• Generate and modify code in real-time\n• Integrate with databases and APIs\n• Build responsive UIs with Tailwind CSS\n• Debug and optimize your code\n\nWhat would you like to build today?',
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [activeView, setActiveView] = useState<'chat' | 'console'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { logs, logInfo, logError, clearLogs } = useConsoleLogger();

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
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Log the user message
    logInfo(`User: ${inputValue}`, undefined, 'Chat Interface');

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I understand you want to work on: "${inputValue}". Let me help you with that! This is a simulated response - connect your API key to enable full AI functionality.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      
      logInfo('AI response generated', undefined, 'Chat Interface');
    }, 1000);
  };

  const handleFilesChange = (files: ProjectFile[]) => {
    setProjectFiles(files);
    logInfo(`Project files updated: ${files.length} files`, undefined, 'File Manager');
  };

  const quickActions = [
    {
      label: 'Create React App',
      prompt: 'Create a modern React application with routing, state management, and responsive design',
      icon: Code,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    },
    {
      label: 'Database Setup',
      prompt: 'Set up a database schema with user authentication and data models',
      icon: Database,
      color: 'bg-green-500/20 text-green-400 border-green-500/30'
    },
    {
      label: 'API Integration',
      prompt: 'Create API endpoints and integrate with external services',
      icon: Zap,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }
  ];

  return (
    <div className="h-full flex flex-col bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">AI Development Assistant</h2>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Active
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant={activeView === 'chat' ? 'default' : 'ghost'}
              onClick={() => setActiveView('chat')}
              size="sm"
              className={activeView === 'chat' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400'}
            >
              Chat
            </Button>
            <Button
              variant={activeView === 'console' ? 'default' : 'ghost'}
              onClick={() => setActiveView('console')}
              size="sm"
              className={activeView === 'console' ? 'bg-purple-500/20 text-purple-300' : 'text-gray-400'}
            >
              Console
            </Button>
          </div>
        </div>

        {/* API Key Input */}
        <ApiKeyInput onApiKeyChange={setApiKey} />
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={() => setInputValue(action.prompt)}
              className={`text-xs justify-start h-auto p-3 ${action.color}`}
            >
              <action.icon className="w-4 h-4 mr-2" />
              <div className="text-left">
                <div className="font-medium">{action.label}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeView === 'chat' ? (
          <>
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
                        className={`max-w-[80%] p-4 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
                            : 'bg-white/10 text-gray-100 border border-white/20'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          <div className="flex-shrink-0 mt-1">
                            {message.role === 'user' ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                            <div className="text-xs opacity-70 mt-2">
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white/10 text-gray-100 border border-white/20 p-4 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Bot className="w-4 h-4" />
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Input Form */}
            <div className="p-4 border-t border-white/10 flex-shrink-0">
              <form onSubmit={handleSubmit} className="space-y-3">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Describe what you want to build... Be specific for better results!"
                  className="min-h-[80px] bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e as any);
                    }
                  }}
                />
                <div className="flex justify-between items-center">
                  <div className="text-xs text-gray-400">
                    Press Enter to send, Shift+Enter for new line
                  </div>
                  <Button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full">
            <ConsoleLogger 
              logs={logs} 
              onClear={clearLogs}
              title="Development Console"
            />
          </div>
        )}
      </div>
    </div>
  );
};
