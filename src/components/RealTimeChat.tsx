
import React, { useState } from 'react';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { useToast } from '@/hooks/use-toast';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './chat/ChatHeader';
import { MessageList } from './chat/MessageList';
import { Message, RealTimeChatProps } from './chat/types';

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
  const { toast } = useToast();

  const { apiKey, setApiKey, streamChatResponse, streamingStats } = useDeepSeekAPI();

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

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      <ChatHeader
        apiKey={apiKey}
        aiModel={aiModel}
        isProcessing={isProcessing}
        onApiKeyChange={handleApiKeyChange}
      />

      <MessageList messages={messages} />

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
