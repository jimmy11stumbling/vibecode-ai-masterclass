
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Key } from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      localStorage.setItem('deepseek_api_key', apiKey.trim());
    }
  };

  React.useEffect(() => {
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeySet(savedKey);
    }
  }, [onApiKeySet]);

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-sm text-slate-300">
        <Key className="w-4 h-4" />
        <span>Enter your DeepSeek API Key</span>
      </div>
      
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="bg-slate-800 border-slate-600 text-slate-100 pr-10"
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        </div>
        <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700">
          Save
        </Button>
      </form>
      
      <p className="text-xs text-slate-400">
        Get your API key from{' '}
        <a
          href="https://platform.deepseek.com/api_keys"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          DeepSeek Platform
        </a>
      </p>
    </div>
  );
};
