
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff, Key, CheckCircle, AlertCircle, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onApiKeySet }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load saved API key from localStorage
    const savedKey = localStorage.getItem('deepseek_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      setIsValid(true);
      onApiKeySet(savedKey);
    }
  }, [onApiKeySet]);

  const validateApiKey = async (key: string): Promise<boolean> => {
    if (!key || key.length < 10) return false;
    
    // Basic validation - check if it looks like a valid API key
    const keyPattern = /^sk-[a-zA-Z0-9]{32,}$/;
    return keyPattern.test(key);
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your DeepSeek API key",
        variant: "destructive"
      });
      return;
    }

    setIsValidating(true);
    
    try {
      const valid = await validateApiKey(apiKey.trim());
      setIsValid(valid);
      
      if (valid) {
        localStorage.setItem('deepseek_api_key', apiKey.trim());
        onApiKeySet(apiKey.trim());
        toast({
          title: "API Key Saved",
          description: "Your DeepSeek API key has been saved and validated",
        });
      } else {
        toast({
          title: "Invalid API Key",
          description: "Please check your DeepSeek API key format",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsValid(false);
      toast({
        title: "Validation Error",
        description: "Failed to validate API key",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleClearKey = () => {
    setApiKey('');
    setIsValid(null);
    localStorage.removeItem('deepseek_api_key');
    onApiKeySet('');
    toast({
      title: "API Key Cleared",
      description: "Your API key has been removed",
    });
  };

  const getStatusBadge = () => {
    if (isValidating) {
      return <Badge variant="secondary">Validating...</Badge>;
    }
    
    if (isValid === true) {
      return (
        <Badge variant="default" className="bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Valid
        </Badge>
      );
    }
    
    if (isValid === false) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="w-3 h-3 mr-1" />
          Invalid
        </Badge>
      );
    }
    
    return <Badge variant="outline">Not Set</Badge>;
  };

  return (
    <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Key className="w-4 h-4 text-white/70" />
            <h3 className="text-sm font-medium text-white">DeepSeek API Key</h3>
          </div>
          {getStatusBadge()}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveKey();
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 text-white/50 hover:text-white"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </Button>
          </div>
          
          <Button
            onClick={handleSaveKey}
            disabled={isValidating || !apiKey.trim()}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
          
          {isValid && (
            <Button
              onClick={handleClearKey}
              variant="outline"
              size="sm"
              className="border-white/20 text-white/70 hover:text-white"
            >
              Clear
            </Button>
          )}
        </div>
        
        <p className="text-xs text-white/50 mt-2">
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
    </Card>
  );
};
