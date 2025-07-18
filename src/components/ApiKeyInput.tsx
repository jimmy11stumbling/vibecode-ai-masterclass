
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Key, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ApiKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
  placeholder?: string;
  label?: string;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeySubmit,
  placeholder = "Enter your API key",
  label = "API Key"
}) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    // Load API key from localStorage on component mount
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
      validateApiKey(savedApiKey);
    }
  }, []);

  const validateApiKey = (key: string) => {
    // Basic validation - DeepSeek API keys should have some length
    const isValidFormat = key.length >= 10;
    setIsValid(isValidFormat);
    return isValidFormat;
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    if (value) {
      validateApiKey(value);
      // Save to localStorage
      localStorage.setItem('deepseek_api_key', value);
    } else {
      setIsValid(null);
      localStorage.removeItem('deepseek_api_key');
    }
  };

  const handleSubmit = () => {
    if (apiKey && isValid) {
      onApiKeySubmit(apiKey);
    }
  };

  const getStatusIndicator = () => {
    if (!apiKey) {
      return (
        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
          <AlertCircle className="w-3 h-3 mr-1" />
          API Key Required
        </Badge>
      );
    }
    if (isValid === true) {
      return (
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Valid
        </Badge>
      );
    }
    if (isValid === false) {
      return (
        <Badge variant="outline" className="border-red-500/50 text-red-400">
          <AlertCircle className="w-3 h-3 mr-1" />
          Invalid Key
        </Badge>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Key className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-300">{label}</span>
        </div>
        {getStatusIndicator()}
      </div>
      
      <div className="relative">
        <Input
          type={showApiKey ? 'text' : 'password'}
          value={apiKey}
          onChange={(e) => handleApiKeyChange(e.target.value)}
          placeholder={placeholder}
          className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowApiKey(!showApiKey)}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-white/10"
        >
          {showApiKey ? (
            <EyeOff className="w-4 h-4 text-gray-400" />
          ) : (
            <Eye className="w-4 h-4 text-gray-400" />
          )}
        </Button>
      </div>
      
      <Button
        onClick={handleSubmit}
        disabled={!apiKey || !isValid}
        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        Configure API Key
      </Button>
      
      {!apiKey && (
        <p className="text-xs text-gray-400">
          Enter your DeepSeek API key to enable autonomous AI development. Your key is stored locally and never sent to our servers.
        </p>
      )}
    </div>
  );
};
