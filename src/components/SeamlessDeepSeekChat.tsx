
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bot, 
  User, 
  Send, 
  Zap, 
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Key,
  Copy,
  Download
} from 'lucide-react';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  streaming?: boolean;
}

interface SeamlessDeepSeekChatProps {
  initialMessage?: string;
  onMessage?: (message: string, response: string) => void;
  className?: string;
}

export const SeamlessDeepSeekChat: React.FC<SeamlessDeepSeekChatProps> = ({
  initialMessage,
  onMessage,
  className = ""
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I\'m your DeepSeek AI assistant with advanced reasoning capabilities. I can help you with coding, analysis, problem-solving, and more. What would you like to work on today?',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState(initialMessage || '');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const { apiKey, setApiKey, streamChatResponse, streamingStats } = useDeepSeekAPI();

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (initialMessage && !input) {
      setInput(initialMessage);
    }
  }, [initialMessage, input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;

    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your DeepSeek API key to continue",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      streaming: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    const currentInput = input;
    setInput('');
    setIsStreaming(true);

    try {
      let fullResponse = '';

      await streamChatResponse(
        [...messages, userMessage],
        (token: string) => {
          fullResponse += token;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessageId 
                ? { ...msg, content: fullResponse, streaming: true }
                : msg
            )
          );
        },
        (stats) => {
          // Progress updates are handled by the hook
        }
      );

      // Mark streaming as complete
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, streaming: false }
            : msg
        )
      );

      onMessage?.(currentInput, fullResponse);

      toast({
        title: "Response Complete",
        description: `Generated in ${(streamingStats.responseTime / 1000).toFixed(1)}s with ${streamingStats.tokensReceived} tokens`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { 
                ...msg, 
                content: `Error: ${errorMessage}. Please check your API key and try again.`,
                streaming: false
              }
            : msg
        )
      );

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const exportChat = () => {
    const chatData = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepseek-chat-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusIcon = () => {
    switch (streamingStats.status) {
      case 'streaming':
        return <Activity className="w-3 h-3 text-blue-400 animate-pulse" />;
      case 'complete':
        return <CheckCircle2 className="w-3 h-3 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-3 rounded-t-xl">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">DeepSeek Reasoner</h3>
            <p className="text-xs text-slate-400">Advanced AI reasoning model</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {streamingStats.status !== 'idle' && (
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              {getStatusIcon()}
              {streamingStats.tokensReceived > 0 && (
                <span>{streamingStats.tokensReceived} tokens</span>
              )}
              {streamingStats.responseTime > 0 && (
                <span>{(streamingStats.responseTime / 1000).toFixed(1)}s</span>
              )}
            </div>
          )}
          
          <Badge variant={apiKey ? "default" : "destructive"} className="text-xs">
            {apiKey ? 'Connected' : 'No API Key'}
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={exportChat}
            className="text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* API Key Input */}
      {!apiKey && (
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white font-medium">DeepSeek API Key Required</span>
          </div>
          <div className="flex space-x-2">
            <input
              type="password"
              placeholder="Enter your DeepSeek API key..."
              className="flex-1 px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setApiKey(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <Button
              onClick={() => {
                const inputEl = document.querySelector('input[type="password"]') as HTMLInputElement;
                if (inputEl?.value) {
                  setApiKey(inputEl.value);
                  inputEl.value = '';
                }
              }}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save
            </Button>
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
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                  <div className={`px-4 py-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-slate-800 text-slate-100 border border-slate-600'
                  }`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {message.content}
                      {message.streaming && (
                        <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse ml-1" />
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                        className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-slate-700">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask DeepSeek anything... I can help with coding, analysis, reasoning, and more!"
              className="min-h-[60px] max-h-[120px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none pr-12"
              disabled={isStreaming}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isStreaming || !apiKey}
              className="absolute right-2 bottom-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
            >
              {isStreaming ? (
                <Activity className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Press Shift + Enter for new line</span>
            <div className="flex items-center space-x-4">
              {isStreaming && (
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span>Streaming...</span>
                </div>
              )}
              <span>{input.length}/4000</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
