
import React from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
  typingText?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isVisible, typingText }) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center space-x-1">
      <span className="text-sm text-slate-400">{typingText || "AI is typing"}</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
};
