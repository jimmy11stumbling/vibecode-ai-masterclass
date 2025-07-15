
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  User, 
  Zap, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Key
} from 'lucide-react';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { useToast } from '@/hooks/use-toast';
import { ChatInput } from './ChatInput';

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  status: 'sending' | 'sent' | 'processing' | 'completed' | 'error';
  processingTime?: number;
  tokens?: number;
}

interface RealTimeChatProps {
  onMessage?: (message: string) => void;
  isConnected?: boolean;
  aiModel?: string;
}

export const RealTimeChat: React.FC<RealTimeChatProps> = ({
  onMessage,
  isConnected = true,
  aiModel = 'DeepSeek Reasoner'
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'assistant',
      content: 'Hello! I\'m your Real-Time AI Assistant. I can help you with coding, debugging, and development questions. What would you like to work on?',
      timestamp: new Date(),
      status: 'completed'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { apiKey, setApiKey, streamChatResponse, streamingStats } = useDeepSeekAPI();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const addMessage = (type: Message['type'], content: string, status: Message['status'] = 'sent') => {
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
      status
    };

    setMessages(prev => [...prev, message]);
    return message;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your DeepSeek API key to start chatting",
        variant: "destructive"
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');

    const userMsg = addMessage('user', userMessage, 'sent');
    onMessage?.(userMessage);

    const startTime = Date.now();
    setIsProcessing(true);

    try {
      const assistantMessageId = `msg-${Date.now()}-ai`;
      const assistantMessage: Message = {
        id: assistantMessageId,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        status: 'processing'
      };

      setMessages(prev => [...prev, assistantMessage]);

      let fullResponse = '';

      await streamChatResponse(
        [{ id: userMsg.id, role: 'user', content: userMessage, timestamp: new Date() }],
        (token) => {
          fullResponse += token;
          updateMessage(assistantMessageId, {
            content: fullResponse,
            status: 'processing'
          });
        },
        (stats) => {
          // Real-time progress updates
        }
      );

      const processingTime = Date.now() - startTime;
      updateMessage(assistantMessageId, {
        status: 'completed',
        processingTime,
        tokens: streamingStats.tokensReceived
      });

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addMessage('system', `Error: ${errorMsg}`, 'error');
      
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
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
    switch (message.type) {
      case 'user':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'assistant':
        return <Bot className="w-4 h-4 text-green-400" />;
      case 'system':
        return <Activity className="w-4 h-4 text-yellow-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-yellow-400 animate-pulse" />;
      case 'processing':
        return <Activity className="w-3 h-3 text-blue-400 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Real-Time Chat</h3>
          <Badge variant={apiKey ? "default" : "destructive"} className="text-xs">
            {apiKey ? 'Connected' : 'No API Key'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {aiModel}
          </Badge>
          {isProcessing && (
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="text-xs text-blue-400">Processing</span>
            </div>
          )}
        </div>
      </div>

      {!apiKey && (
        <div className="p-3 border-b border-slate-700 bg-slate-800 flex-shrink-0">
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
            <button
              onClick={() => {
                const inputEl = document.querySelector('input[type="password"]') as HTMLInputElement;
                if (inputEl?.value) {
                  handleApiKeyChange(inputEl.value);
                  inputEl.value = '';
                }
              }}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
                    {getMessageIcon(message)}
                  </div>
                )}
                
                <div className={`max-w-[70%] ${
                  message.type === 'user' ? 'order-2' : 'order-1'
                }`}>
                  <div className={`px-4 py-2 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : message.type === 'system'
                      ? 'bg-slate-700 text-slate-300'
                      : 'bg-slate-800 text-slate-100'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      <div className="flex items-center space-x-2">
                        {message.processingTime && (
                          <span>{message.processingTime}ms</span>
                        )}
                        {message.tokens && (
                          <span>{message.tokens} tokens</span>
                        )}
                        {getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    {getMessageIcon(message)}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="flex-shrink-0">
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={!apiKey || isProcessing}
          apiKey={apiKey}
          placeholder="Type your message..."
        />
      </div>
    </div>
  );
};
