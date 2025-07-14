
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Key, Save } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  placeholder?: string;
  label?: string;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeySet,
  placeholder = "Enter your DeepSeek API key...",
  label = "DeepSeek API Key"
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      localStorage.setItem('deepseek_api_key', apiKey.trim());
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Key className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={placeholder}
            className="bg-slate-800 border-slate-600 text-white pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-0 top-0 h-full px-3 text-slate-400 hover:text-white"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        
        <Button
          onClick={handleSave}
          disabled={!apiKey.trim()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save
        </Button>
      </div>
      
      <p className="text-xs text-slate-400">
        Your API key is stored locally and never sent to our servers.
      </p>
    </div>
  );
};
