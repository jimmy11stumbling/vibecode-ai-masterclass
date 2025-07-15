
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';

interface ApiKeyInputProps {
  onApiKeySet: (apiKey: string) => void;
  currentApiKey?: string;
  serviceName?: string;
  helpUrl?: string;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({
  onApiKeySet,
  currentApiKey,
  serviceName = 'DeepSeek',
  helpUrl = 'https://platform.deepseek.com/api-keys'
}) => {
  const [apiKey, setApiKey] = useState(currentApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    
    setIsValidating(true);
    
    // Simulate API key validation
    setTimeout(() => {
      onApiKeySet(apiKey);
      setIsValidating(false);
    }, 1000);
  };

  const handleClear = () => {
    setApiKey('');
    onApiKeySet('');
  };

  const isValidKey = apiKey.trim().length > 0;
  const isConnected = Boolean(currentApiKey);

  if (isConnected) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">
                {serviceName} API Connected
              </p>
              <p className="text-xs text-slate-400">
                Key: •••••{currentApiKey?.slice(-4)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-green-600 text-white">
              Connected
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              className="h-8 text-xs"
            >
              Change
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Key className="w-5 h-5 text-yellow-400" />
          <CardTitle className="text-sm text-white">
            {serviceName} API Key Required
          </CardTitle>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert className="bg-slate-900 border-slate-600">
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <AlertDescription className="text-slate-300">
            Connect your {serviceName} API key to enable AI-powered features
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Enter your ${serviceName} API key...`}
              className="bg-slate-900 border-slate-600 text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <a
              href={helpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>Get your API key</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isValidKey || isValidating}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {isValidating ? 'Validating...' : 'Save Key'}
            </Button>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          <p>• Your API key is stored locally and never shared</p>
          <p>• Used only for AI-powered development features</p>
        </div>
      </CardContent>
    </Card>
  );
};
