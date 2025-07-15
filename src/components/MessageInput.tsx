
import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send, Mic, MicOff, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  value: controlledValue,
  onChange: controlledOnChange
}) => {
  const [internalMessage, setInternalMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // Use controlled or uncontrolled state
  const message = controlledValue !== undefined ? controlledValue : internalMessage;
  const setMessage = controlledOnChange || setInternalMessage;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      if (controlledValue === undefined) {
        setInternalMessage('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording functionality would be implemented here
  };

  const handleAttachment = () => {
    // File attachment functionality would be implemented here
  };

  const handleEmojiClick = () => {
    // Emoji picker functionality would be implemented here
  };

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-700 p-4">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[60px] max-h-[200px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-400 resize-none pr-20"
          />
          
          {/* Input Actions */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleEmojiClick}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <Smile className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={handleAttachment}
              className="h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={toggleRecording}
              className={`h-6 w-6 p-0 ${
                isRecording 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-4 h-4" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
        
        <Button
          type="submit"
          size="sm"
          disabled={!message.trim() || disabled}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
        <span>Press Shift + Enter for new line</span>
        <span>{message.length}/2000</span>
      </div>
    </form>
  );
};
