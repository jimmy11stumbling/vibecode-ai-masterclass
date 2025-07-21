
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings, Zap, Sparkles } from 'lucide-react';
import { ApiKeyInput } from '../ApiKeyInput';

interface ChatHeaderProps {
  apiKey?: string;
  aiModel: string;
  isProcessing: boolean;
  onApiKeyChange: (key: string) => void;
}

export const ChatHeader = ({ 
  apiKey, 
  aiModel, 
  isProcessing, 
  onApiKeyChange 
}: ChatHeaderProps) => {
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleApiKeySubmit = (key: string) => {
    onApiKeyChange(key);
    setShowApiKeyInput(false);
  };

  if (showApiKeyInput) {
    return (
      <div className="p-4 border-b border-slate-700">
        <ApiKeyInput
          onApiKeySubmit={handleApiKeySubmit}
          placeholder="Enter your API key"
          label="API Key"
        />
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-slate-700 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
            Real-Time AI Chat
          </h3>
          <p className="text-sm text-slate-400">
            {aiModel} • {isProcessing ? 'Processing...' : 'Ready'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-xs">
            <Zap className="w-3 h-3 text-green-400" />
            <span className="text-slate-400">
              {apiKey ? 'Connected' : 'No API Key'}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowApiKeyInput(true)}
            className="border-slate-600"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
