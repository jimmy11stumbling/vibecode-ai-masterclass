
import React, { useState } from 'react';
import { Send, Mic, Paperclip, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

const promptSuggestions = [
  "Create a responsive navbar component",
  "Build a user authentication form",
  "Design a dashboard with charts",
  "Make a todo list with drag & drop"
];

export const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="p-6 border-t border-white/10">
      {showSuggestions && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-gray-300">Try these prompts:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {promptSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-xs bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-gray-300 hover:text-white hover:bg-white/20 transition-all duration-200"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask me to build something amazing..."
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-gray-400 resize-none min-h-[50px] pr-20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="absolute right-3 bottom-3 flex space-x-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white h-6 w-6 p-0"
            >
              <Paperclip className="w-3 h-3" />
            </Button>
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
          type="submit"
          disabled={!message.trim()}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 px-6"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
      
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        <span>Press Shift + Enter for new line</span>
        <span>AI-powered by Vibecode</span>
      </div>
    </div>
  );
};
