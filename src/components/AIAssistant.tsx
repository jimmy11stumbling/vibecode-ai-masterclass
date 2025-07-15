
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Loader2,
  Key
} from 'lucide-react';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { useToast } from '@/hooks/use-toast';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'code';
}

interface AIAssistantProps {
  onCodeGenerated?: (code: string) => void;
  projectContext?: any;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  onCodeGenerated,
  projectContext
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI coding assistant. I can help you write code, debug issues, and explain programming concepts. What would you like to work on today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { apiKey, setApiKey, streamChatResponse, streamingStats } = useDeepSeekAPI();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your DeepSeek API key to start chatting",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const assistantMessageId = `msg-${Date.now()}-ai`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      let fullResponse = '';

      await streamChatResponse(
        [...messages, userMessage],
        (token) => {
          fullResponse += token;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse }
                : msg
            )
          );
        },
        (stats) => {
          // Progress updates handled by the hook
        }
      );

      // Extract code blocks if any
      const codeMatch = fullResponse.match(/```(?:javascript|typescript|jsx|tsx)?\n([\s\S]*?)```/);
      if (codeMatch && onCodeGenerated) {
        onCodeGenerated(codeMatch[1]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key and try again.',
        timestamp: new Date()
      }]);
      
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApiKeyChange = (newKey: string) => {
    setApiKey(newKey);
    toast({
      title: "API Key Updated",
      description: "Your DeepSeek API key has been saved",
    });
  };

  const getMessageIcon = (message: Message) => {
    if (message.role === 'user') {
      return <User className="w-4 h-4 text-blue-400" />;
    }
    return <Bot className="w-4 h-4 text-green-400" />;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-semibold text-white">AI Assistant</h3>
          <Badge variant={apiKey ? "default" : "destructive"} className="text-xs">
            {apiKey ? 'Connected' : 'No API Key'}
          </Badge>
        </div>
      </div>

      {!apiKey && (
        <div className="p-3 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white">API Key Required</span>
          </div>
          <div className="flex space-x-2">
            <input
              type="password"
              placeholder="Enter your DeepSeek API key..."
              className="flex-1 px-3 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleApiKeyChange(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              size="sm"
              onClick={() => {
                const input = document.querySelector('input[type="password"]') as HTMLInputElement;
                if (input?.value) {
                  handleApiKeyChange(input.value);
                  input.value = '';
                }
              }}
            >
              Save
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start space-x-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                  {getMessageIcon(message)}
                </div>
              )}
              
              <div className={`max-w-[80%] ${
                message.role === 'user' ? 'order-2' : 'order-1'
              }`}>
                <div className={`px-4 py-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-800 text-slate-100'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{message.timestamp.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
              
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                  {getMessageIcon(message)}
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-400" />
              </div>
              <div className="bg-slate-800 text-slate-100 px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput
        value={input}
        onChange={setInput}
        onSubmit={handleSubmit}
        disabled={!apiKey || isLoading}
        apiKey={apiKey}
        placeholder="Ask me anything about your code..."
      />
    </div>
  );
};
