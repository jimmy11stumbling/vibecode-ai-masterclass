
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, Key } from 'lucide-react';

interface ChatHeaderProps {
  apiKey: string;
  aiModel: string;
  isProcessing: boolean;
  onApiKeyChange: (key: string) => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  apiKey,
  aiModel,
  isProcessing,
  onApiKeyChange
}) => {
  return (
    <>
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-3 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Bot className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Real-Time Chat</h3>
          <Badge variant={apiKey ? "default" : "destructive"} className="text-xs">
            {apiKey ? 'Connected' : 'No API Key'}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {aiModel}
          </Badge>
          {isProcessing && (
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3 text-blue-400 animate-pulse" />
              <span className="text-xs text-blue-400">Processing</span>
            </div>
          )}
        </div>
      </div>

      {!apiKey && (
        <div className="p-3 border-b border-slate-700 bg-slate-800 flex-shrink-0">
          <div className="flex items-center space-x-2 mb-2">
            <Key className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-white">API Key Required</span>
          </div>
          <div className="flex space-x-2">
            <input
              type="password"
              placeholder="Enter your DeepSeek API key..."
              className="flex-1 px-3 py-1 text-sm bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onApiKeyChange(e.currentTarget.value);
                  e.currentTarget.value = '';
                }
              }}
            />
            <button
              onClick={() => {
                const inputEl = document.querySelector('input[type="password"]') as HTMLInputElement;
                if (inputEl?.value) {
                  onApiKeyChange(inputEl.value);
                  inputEl.value = '';
                }
              }}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
};
