
import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Mic, Settings, RefreshCw, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

interface AIChatBotProps {
  context?: string;
  onCodeGenerated?: (code: string) => void;
}

export const AIChatBot: React.FC<AIChatBotProps> = ({ context, onCodeGenerated }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello! I'm your AI coding assistant. I can help you with:\n\n• Writing React components\n• Debugging code\n• Code reviews\n• Best practices\n• TypeScript assistance\n\nWhat would you like to work on?`,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateResponse(content),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const generateResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    if (input.includes('component') || input.includes('react')) {
      const code = `const MyComponent = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">My Component</h2>
      <p className="text-gray-600">This is a sample component.</p>
    </div>
  );
};

export default MyComponent;`;
      
      onCodeGenerated?.(code);
      return `Here's a React component template:\n\n\`\`\`jsx\n${code}\n\`\`\`\n\nThis component includes:\n• Responsive design with Tailwind CSS\n• Proper TypeScript typing\n• Clean structure\n\nWould you like me to modify anything?`;
    }
    
    if (input.includes('debug') || input.includes('error')) {
      return `I can help you debug! Please share:\n\n• The error message\n• The problematic code\n• What you expected to happen\n\nCommon issues I can help with:\n• TypeScript errors\n• React hooks problems\n• CSS styling issues\n• API integration problems`;
    }
    
    if (input.includes('api') || input.includes('fetch')) {
      const code = `const fetchData = async () => {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};`;
      
      return `Here's a robust API call pattern:\n\n\`\`\`javascript\n${code}\n\`\`\`\n\nKey features:\n• Proper error handling\n• Async/await syntax\n• TypeScript compatible\n\nNeed help with a specific API integration?`;
    }
    
    return `I understand you're asking about "${userInput}". I can help you with:\n\n• Code implementation\n• Best practices\n• Debugging assistance\n• Architecture decisions\n\nCould you provide more specific details about what you'd like to accomplish?`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatMessage = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        const lines = code.split('\n');
        const language = lines[0].trim() || 'code';
        const codeContent = lines.slice(1).join('\n');
        
        return (
          <div key={index} className="mt-4 bg-gray-900 rounded-lg overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
              <span className="text-xs text-gray-300 uppercase tracking-wide">
                {language}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(codeContent)}
                className="text-gray-300 hover:text-white h-6 px-2"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <pre className="p-4 text-sm overflow-x-auto">
              <code className="text-gray-100 whitespace-pre-wrap">{codeContent}</code>
            </pre>
          </div>
        );
      }
      
      return (
        <div key={index} className="whitespace-pre-wrap">
          {part}
        </div>
      );
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Assistant</h3>
            {context && (
              <p className="text-xs text-slate-400">Context: {context}</p>
            )}
          </div>
        </div>
        <Button size="sm" variant="ghost" className="text-slate-400 hover:text-white">
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-3 ${message.role === 'user' ? 'justify-end' : ''}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                <div
                  className={`p-3 rounded-xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-slate-800 text-slate-100'
                  }`}
                >
                  <div className="text-sm">
                    {message.role === 'assistant' ? formatMessage(message.content) : message.content}
                  </div>
                </div>
                
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 mt-2 ml-2">
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-green-400 h-6 px-2">
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-slate-400 hover:text-red-400 h-6 px-2">
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                    <span className="text-xs text-slate-500">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                )}
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-xs font-medium">U</span>
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-slate-800 p-3 rounded-xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about coding..."
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none min-h-[40px] pr-20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
            />
            <div className="absolute right-2 bottom-2 flex space-x-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-white h-6 w-6 p-0"
              >
                <Mic className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <Button
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
          <span>Press Shift + Enter for new line</span>
          <span>AI Assistant Ready</span>
        </div>
      </div>
    </div>
  );
};
