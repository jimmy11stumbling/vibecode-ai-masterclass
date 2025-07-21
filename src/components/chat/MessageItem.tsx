
import { Code } from 'lucide-react';
import { Message } from './types';
import { TypingIndicator } from '../TypingIndicator';

interface MessageItemProps {
  message: Message;
}

export const MessageItem = ({ message }: MessageItemProps) => {
  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'sent': return 'text-blue-400';
      case 'processing': return 'text-yellow-400';
      case 'completed': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] p-4 rounded-lg ${
          message.type === 'user'
            ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30'
            : message.type === 'system'
            ? 'bg-red-600/20 text-red-100 border border-red-500/30'
            : 'bg-slate-800 text-slate-100 border border-slate-600'
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.status === 'processing' && message.content === '' ? (
            <TypingIndicator isVisible={true} typingText="Thinking..." />
          ) : (
            message.content
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className={getStatusColor(message.status)}>
            {message.status}
          </span>
          <div className="flex items-center space-x-2 text-slate-400">
            {message.processingTime && (
              <span>{message.processingTime}ms</span>
            )}
            {message.tokens && (
              <span>{message.tokens} tokens</span>
            )}
            <span>{message.timestamp.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
