
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
  const [apiKey, setApiKey] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChatResponse = async (messages: any[], onToken: (token: string) => void) => {
    if (!apiKey) {
      throw new Error('Please enter your DeepSeek API key');
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.body) throw new Error("No response stream");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const parts = buffer.split("\n\n");
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i].trim();
        if (part.startsWith("data:")) {
          const jsonStr = part.slice(5).trim();
          if (jsonStr === "[DONE]") return;
          try {
            const parsed = JSON.parse(jsonStr);
            const token = parsed.choices?.[0]?.delta?.content;
            if (token) onToken(token);
          } catch (e) {
            console.warn("JSON parse error", e);
          }
        }
      }
      buffer = parts[parts.length - 1];
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Create empty assistant message for streaming
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
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: msg.content + token }
              : msg
          )
        );
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
      {!apiKey && (
        <div className="p-4 bg-yellow-500/20 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <input
              type="password"
              placeholder="Enter your DeepSeek API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-gray-400"
            />
            <span className="text-xs text-gray-300">Get your key from DeepSeek</span>
          </div>
        </div>
      )}
      
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
