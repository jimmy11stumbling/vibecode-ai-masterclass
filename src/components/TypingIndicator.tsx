
import React from 'react';
import { Loader2 } from 'lucide-react';

interface TypingIndicatorProps {
  isVisible: boolean;
  typingText?: string;
  variant?: 'dots' | 'pulse' | 'spinner';
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  typingText = 'AI is typing...',
  variant = 'dots'
}) => {
  if (!isVisible) return null;

  const renderIndicator = () => {
    switch (variant) {
      case 'spinner':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'pulse':
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></div>
          </div>
        );
      default:
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
          </div>
        );
    }
  };

  return (
    <div className="flex items-center space-x-2 text-slate-400">
      {renderIndicator()}
      <span className="text-sm">{typingText}</span>
    </div>
  );
};
