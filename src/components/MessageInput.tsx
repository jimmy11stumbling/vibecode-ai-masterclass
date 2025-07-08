
import React, { useState } from 'react';
import { Send, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="p-4 border-t border-white/10">
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about coding..."
            className="bg-white/10 border border-white/20 text-white placeholder:text-gray-400 resize-none min-h-[60px] pr-20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="absolute right-2 bottom-2 flex space-x-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              <Mic className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!inputValue.trim()}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
        <span>Press Shift + Enter for new line</span>
        <span>AI Assistant Ready</span>
      </div>
    </div>
  );
};
