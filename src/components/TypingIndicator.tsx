
import React from 'react';
import { Bot } from 'lucide-react';

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
    <div className="flex items-start space-x-3 animate-fade-in">
      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
        <Bot className="w-4 h-4 text-white" />
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white p-3 rounded-lg max-w-xs">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-300">{typingText}</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
