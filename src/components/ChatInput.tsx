
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, Paperclip } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  disabled?: boolean;
  apiKey?: string;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  apiKey,
  placeholder = "Ask me anything about your code..."
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSubmit(e);
      }
    }
  };

  return (
    <div className="p-4 border-t border-slate-700 bg-slate-900 flex-shrink-0">
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="min-h-[60px] max-h-[120px] bg-slate-800 border-slate-600 text-white pr-20 resize-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={disabled}
          />
          
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white h-8 w-8 p-0"
              disabled={disabled}
            >
              <Mic className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Press Shift + Enter for new line</span>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${
                apiKey ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>{apiKey ? 'API Connected' : 'API Key Required'}</span>
            </div>
          </div>
          
          <Button
            type="submit"
            size="sm"
            disabled={disabled || !value.trim() || !apiKey}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </form>
    </div>
  );
};
