
import React, { useState } from 'react';
import { Key, Eye, EyeOff, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (apiKey.trim()) {
      onApiKeySet(apiKey.trim());
      setIsSaved(true);
      // Store in localStorage for convenience (not secure for production)
      localStorage.setItem('deepseek_api_key', apiKey.trim());
    }
  };

  // Load from localStorage on component mount
  React.useEffect(() => {
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      onApiKeySet(savedKey);
      setIsSaved(true);
    }
  }, [onApiKeySet]);

  if (isSaved) {
    return (
      <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-green-400">
          <Key className="w-4 h-4" />
          <span className="text-sm">API Key configured successfully</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setIsSaved(false);
              setApiKey('');
              localStorage.removeItem('deepseek_api_key');
              onApiKeySet('');
            }}
            className="text-green-400 hover:text-green-300 ml-auto"
          >
            Change
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Key className="w-4 h-4" />
          <span className="text-sm font-medium">DeepSeek API Key Required</span>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="api-key" className="text-slate-300 text-xs">
            Enter your DeepSeek API key to enable AI features
          </Label>
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 pr-10"
              />
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white h-6 w-6 p-0"
              >
                {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </Button>
            </div>
            <Button
              onClick={handleSave}
              disabled={!apiKey.trim()}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-slate-400">
          Get your API key from{' '}
          <a 
            href="https://platform.deepseek.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline"
          >
            DeepSeek Platform
          </a>
        </p>
      </div>
    </div>
  );
};
