
import React, { useState } from 'react';
import { Bot, Send, Mic, Settings, Trash2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { RealTimeProgress } from './RealTimeProgress';
import { TypingIndicator } from './TypingIndicator';
import { ApiKeyInput } from './ApiKeyInput';

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
      content: 'Hello! I\'m your AI coding assistant. I can help you write code, debug issues, and explain programming concepts. What would you like to work on today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const { apiKey, setApiKey, streamChatResponse, streamingStats } = useDeepSeekAPI();

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      let assistantResponse = '';
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      const contextualPrompt = context 
        ? `Context: ${context}\n\nUser request: ${inputValue}`
        : inputValue;

      await streamChatResponse(
        [...messages, { ...userMessage, content: contextualPrompt }],
        (token) => {
          assistantResponse += token;
          setMessages(prev => 
            prev.map(msg => 
              msg.id === assistantMessage.id 
                ? { ...msg, content: assistantResponse }
                : msg
            )
          );
        },
        (stats) => {
          // Progress updates handled by the hook
        }
      );

      // Extract code blocks if any
      const codeMatch = assistantResponse.match(/```(?:javascript|typescript|jsx|tsx)?\n([\s\S]*?)```/);
      if (codeMatch && onCodeGenerated) {
        onCodeGenerated(codeMatch[1]);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please check your API key and try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      role: 'assistant',
      content: 'Chat cleared. How can I help you with your code today?',
      timestamp: new Date()
    }]);
  };

  const exportChat = () => {
    const chatData = JSON.stringify(messages, null, 2);
    const blob = new Blob([chatData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-chat-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">AI Assistant</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={clearChat}
            className="text-slate-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={exportChat}
            className="text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* API Key Input */}
      {!apiKey && (
        <div className="p-4 border-b border-slate-700">
          <ApiKeyInput onApiKeySet={setApiKey} />
        </div>
      )}

      {/* Real-time Progress */}
      <RealTimeProgress
        isStreaming={streamingStats.status === 'streaming'}
        tokensReceived={streamingStats.tokensReceived}
        responseTime={streamingStats.responseTime}
        status={streamingStats.status}
      />

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-100'
                }`}
              >
                <pre className="whitespace-pre-wrap text-sm font-sans">
                  {message.content}
                </pre>
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-100 rounded-lg p-3">
                <TypingIndicator />
              </div>
            </div>
          )}
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
              className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none min-h-[60px] pr-20"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
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
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping || !apiKey}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
          <span>Press Shift + Enter for new line</span>
          <span>{apiKey ? 'AI Ready' : 'API Key Required'}</span>
        </div>
      </div>
    </div>
  );
};
