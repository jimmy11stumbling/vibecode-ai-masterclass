
import React, { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { RealTimeProgress } from './RealTimeProgress';
import { TypingIndicator } from './TypingIndicator';
import { ApiKeyInput } from './ApiKeyInput';
import { ChatHeader } from './ChatHeader';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

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
      <ChatHeader onClearChat={clearChat} onExportChat={exportChat} />

      {!apiKey && (
        <div className="p-4 border-b border-slate-700">
          <ApiKeyInput onApiKeySet={setApiKey} />
        </div>
      )}

      <RealTimeProgress
        isStreaming={streamingStats.status === 'streaming'}
        tokensReceived={streamingStats.tokensReceived}
        responseTime={streamingStats.responseTime}
        status={streamingStats.status}
      />

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-100 rounded-lg p-3">
                <TypingIndicator isVisible={isTyping} />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSendMessage}
        disabled={isTyping}
        apiKey={apiKey}
      />
    </div>
  );
};
