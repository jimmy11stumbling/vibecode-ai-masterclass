
import React from 'react';
import { Bot } from 'lucide-react';

interface TypingIndicatorProps {
  isVisible: boolean;
  typingText?: string;
  variant?: 'dots' | 'pulse' | 'wave';
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  isVisible,
  typingText = 'AI is thinking...',
  variant = 'dots'
}) => {
  if (!isVisible) return null;

  const renderDots = () => (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  const renderPulse = () => (
    <div className="flex items-center space-x-2">
      <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
      <span className="text-sm text-slate-400 animate-pulse">{typingText}</span>
    </div>
  );

  const renderWave = () => (
    <div className="flex items-center space-x-2">
      <div className="flex space-x-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="w-1 h-4 bg-blue-400 rounded-full animate-pulse"
            style={{ 
              animationDelay: `${i * 100}ms`,
              animationDuration: '1s'
            }}
          ></div>
        ))}
      </div>
      <span className="text-sm text-slate-400">{typingText}</span>
    </div>
  );

  return (
    <div className="flex items-center space-x-3 p-3 bg-slate-800 rounded-lg">
      <Bot className="w-5 h-5 text-blue-400" />
      <div className="flex-1">
        {variant === 'dots' && renderDots()}
        {variant === 'pulse' && renderPulse()}
        {variant === 'wave' && renderWave()}
      </div>
    </div>
  );
};
