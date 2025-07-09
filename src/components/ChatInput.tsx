
import React from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  apiKey: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({ 
  value, 
  onChange, 
  onSubmit, 
  disabled = false,
  apiKey 
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="p-4 border-t border-slate-700">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Ask me anything about coding..."
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none min-h-[60px] pr-20"
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-2 bottom-2 flex space-x-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white h-6 w-6 p-0"
            >
              <Mic className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <Button
          onClick={onSubmit}
          disabled={!value.trim() || disabled || !apiKey}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
        <span>Press Shift + Enter for new line</span>
        <span>{apiKey ? 'AI Ready' : 'API Key Required'}</span>
      </div>
    </div>
  );
};
