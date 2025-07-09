
import React from 'react';
import { Bot, Trash2, Download, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChatHeaderProps {
  onClearChat: () => void;
  onExportChat: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ onClearChat, onExportChat }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-slate-700">
      <div className="flex items-center space-x-2">
        <Bot className="w-5 h-5 text-blue-400" />
        <h3 className="font-semibold text-white">AI Assistant</h3>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={onClearChat}
          className="text-slate-400 hover:text-white"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onExportChat}
          className="text-slate-400 hover:text-white"
        >
          <Download className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-slate-400 hover:text-white"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
