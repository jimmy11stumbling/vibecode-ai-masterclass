import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
interface ApiKeyInputProps {
  onApiKeyChange: (apiKey: string) => void;
}
export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeyChange
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedApiKey = localStorage.getItem('openai_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      onApiKeyChange(savedApiKey);
      validateApiKey(savedApiKey);
    }
  }, [onApiKeyChange]);
  const validateApiKey = (key: string) => {
    // Basic validation - OpenAI API keys start with 'sk-' and are 51 characters long
    const isValidFormat = key.startsWith('sk-') && key.length >= 40;
    setIsValid(isValidFormat);
    return isValidFormat;
  };
  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    onApiKeyChange(value);
    if (value) {
      validateApiKey(value);
      // Save to localStorage
      localStorage.setItem('openai_api_key', value);
    } else {
      setIsValid(null);
      localStorage.removeItem('openai_api_key');
    }
  };
  const getStatusIndicator = () => {
    if (!apiKey) {
      return <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
          <AlertCircle className="w-3 h-3 mr-1" />
          API Key Required
        </Badge>;
    }
    if (isValid === true) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Connected
        </Badge>;
    }
    if (isValid === false) {
      return <Badge variant="outline" className="border-red-500/50 text-red-400">
          <AlertCircle className="w-3 h-3 mr-1" />
          Invalid Key
        </Badge>;
    }
    return null;
  };
  return <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Key className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">DEEPSEEK API Key</span>
        </div>
        {getStatusIndicator()}
      </div>
      
      <div className="relative">
        <Input type={showApiKey ? 'text' : 'password'} value={apiKey} onChange={e => handleApiKeyChange(e.target.value)} placeholder="sk-..." className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pr-10" />
        <Button type="button" variant="ghost" size="sm" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10">
          {showApiKey ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
        </Button>
      </div>
      
      {!apiKey && <p className="text-xs text-gray-400">
          Enter your OpenAI API key to enable full AI functionality. Your key is stored locally and never sent to our servers.
        </p>}
    </div>;
};