
import React from 'react';

interface TypingIndicatorProps {
  isVisible: boolean;
  typingText?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ 
  isVisible, 
  typingText = "AI is thinking..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
      </div>
      <span className="text-sm text-slate-400">{typingText}</span>
    </div>
  );
};
