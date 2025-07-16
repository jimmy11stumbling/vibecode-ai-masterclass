
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Message } from './types';

interface MessageListProps {
  messages: Message[];
}

export const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

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
  );
};
