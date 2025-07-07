
import React from 'react';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  code?: string;
  language?: string;
}

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, messagesEndRef }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex space-x-4 ${message.role === 'user' ? 'justify-end' : ''}`}
        >
          {message.role === 'assistant' && (
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
          )}
          
          <div className={`max-w-3xl ${message.role === 'user' ? 'order-first' : ''}`}>
            <div
              className={`p-4 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white ml-auto'
                  : 'bg-white/10 backdrop-blur-sm border border-white/20 text-white'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              
              {message.code && (
                <div className="mt-4 bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700/50">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700/50">
                    <span className="text-xs text-gray-300 uppercase tracking-wide">
                      {message.language || 'code'}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(message.code!)}
                      className="text-gray-300 hover:text-white h-6 px-2"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <pre className="p-4 text-sm overflow-x-auto">
                    <code className="text-gray-100">{message.code}</code>
                  </pre>
                </div>
              )}
            </div>
            
            {message.role === 'assistant' && (
              <div className="flex items-center space-x-2 mt-2">
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-green-400 h-6 px-2">
                  <ThumbsUp className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400 h-6 px-2">
                  <ThumbsDown className="w-3 h-3" />
                </Button>
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
          
          {message.role === 'user' && (
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      ))}
      
      {isLoading && (
        <div className="flex space-x-4">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-4 rounded-2xl">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};
