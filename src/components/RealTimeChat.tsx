
import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Bot, 
  User, 
  Zap, 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useRealTimeValidator } from '@/hooks/useRealTimeValidator';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { validateSuccess, validateError, validateInfo } = useRealTimeValidator();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

    console.log('💬 Adding message:', message);
    validateInfo(`Message added: ${type}`, content, 'RealTimeChat');

    setMessages(prev => [...prev, message]);
    return message;
  };

  const updateMessage = (id: string, updates: Partial<Message>) => {
    setMessages(prev => prev.map(msg => 
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  };

  const simulateAIResponse = async (userMessage: string) => {
    const startTime = Date.now();
    setIsProcessing(true);

    const systemMsg = addMessage('system', `Processing "${userMessage}" with ${aiModel}...`, 'processing');

    try {
      validateInfo('AI processing started', userMessage, 'RealTimeChat');

      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const responses = [
        'I understand your request. Let me help you with that.',
        'That\'s an interesting question. Here\'s what I think...',
        'I can help you implement that feature. Here\'s the approach I recommend...',
        'Let me analyze your code and provide suggestions...',
        'I\'ve processed your request and here are the results...'
      ];

      const response = responses[Math.floor(Math.random() * responses.length)];
      const processingTime = Date.now() - startTime;

      updateMessage(systemMsg.id, {
        status: 'completed',
        processingTime,
        content: `Processed in ${processingTime}ms`
      });

      const aiMsg = addMessage('assistant', response, 'completed');
      updateMessage(aiMsg.id, {
        processingTime,
        tokens: Math.floor(Math.random() * 100) + 50
      });

      validateSuccess('AI response generated', `${response.substring(0, 50)}...`, 'RealTimeChat');

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      addMessage('system', `Error: ${errorMsg}`, 'error');
      validateError('AI response failed', errorMsg, 'RealTimeChat');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage = input.trim();
    setInput('');

    addMessage('user', userMessage, 'sent');
    onMessage?.(userMessage);

    await simulateAIResponse(userMessage);
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
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg">
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Real-Time Chat</h3>
          <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
            {isConnected ? 'Connected' : 'Disconnected'}
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

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Bot className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Start a conversation with the AI</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start space-x-3 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type !== 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
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
                    <p className="text-sm">{message.content}</p>
                    
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
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    {getMessageIcon(message)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t border-slate-700 p-4">
        <div className="flex items-center space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-slate-800 border-slate-600 text-white"
            disabled={!isConnected || isProcessing}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!input.trim() || !isConnected || isProcessing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};
