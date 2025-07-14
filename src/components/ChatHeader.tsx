
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Download, Settings, Bot, Zap } from 'lucide-react';

interface ChatHeaderProps {
  onClearChat: () => void;
  onExportChat: () => void;
  onSettings?: () => void;
  isStreaming?: boolean;
  model?: string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  onClearChat,
  onExportChat,
  onSettings,
  isStreaming = false,
  model = "DeepSeek Reasoner"
}) => {
  return (
    <div className="p-4 border-b border-slate-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">AI Assistant</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {model}
            </Badge>
            
            {isStreaming && (
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
                <span className="text-xs text-blue-400">Streaming</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {onSettings && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onSettings}
              className="text-slate-400 hover:text-white"
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
          
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
            onClick={onClearChat}
            className="text-slate-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
