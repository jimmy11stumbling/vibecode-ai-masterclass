
import React, { useState, useRef, useEffect } from 'react';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { PromptBuilder } from './PromptBuilder';
import { CodePreview } from './CodePreview';
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

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Great! Let me help you create that React component. Here's a clean, modern approach:",
        "Perfect choice! I'll show you how to implement this with best practices:",
        "Excellent idea! Let's build this step by step with proper TypeScript support:",
        "Nice prompt! Here's how we can implement this using modern React patterns:"
      ];

      const sampleCode = `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface CounterProps {
  initialValue?: number;
}

export const Counter: React.FC<CounterProps> = ({ initialValue = 0 }) => {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(initialValue);

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800">Counter</h2>
      <div className="text-4xl font-mono text-blue-600">{count}</div>
      <div className="flex space-x-2">
        <Button onClick={decrement} variant="outline">-</Button>
        <Button onClick={reset} variant="ghost">Reset</Button>
        <Button onClick={increment}>+</Button>
      </div>
    </div>
  );
};`;

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date(),
        code: sampleCode,
        language: 'typescript'
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 h-full flex flex-col">
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
