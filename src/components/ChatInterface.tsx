
import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { PromptBuilder } from './PromptBuilder';
import { CodePreview } from './CodePreview';
import { ApiKeyInput } from './ApiKeyInput';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

export const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to Vibecode AI! I'm here to help you master prompt engineering for full-stack development. Let's start with a simple React component. What would you like to build?",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { apiKey, setApiKey, streamChatResponse } = useDeepSeekAPI();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      const conversationMessages = [...messages, userMessage];
      
      await streamChatResponse(conversationMessages, (token: string) => {
        setMessages(prev => {
          const updated = prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: msg.content + token }
              : msg
          );
          return updated;
        });
      });
    } catch (error) {
      console.error('DeepSeek API error:', error);
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: `Error: ${error instanceof Error ? error.message : 'Failed to get response from DeepSeek API'}` }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-full flex flex-col">
      <ApiKeyInput apiKey={apiKey} onApiKeyChange={setApiKey} />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
        <div className="border-b border-white/10 px-6 py-4">
          <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="chat" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
              Chat
            </TabsTrigger>
            <TabsTrigger value="builder" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
              Prompt Builder
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
              Code Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0 flex flex-col">
            <MessageList 
              messages={messages} 
              isLoading={isLoading} 
              messagesEndRef={messagesEndRef}
            />
            <MessageInput onSendMessage={handleSendMessage} />
          </TabsContent>

          <TabsContent value="builder" className="h-full m-0">
            <PromptBuilder />
          </TabsContent>

          <TabsContent value="preview" className="h-full m-0">
            <CodePreview />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
