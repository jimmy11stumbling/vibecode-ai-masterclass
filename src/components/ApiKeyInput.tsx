
import React from 'react';

interface ApiKeyInputProps {
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onApiKeyChange }) => {
  if (apiKey) return null;

  return (
    <div className="p-4 bg-yellow-500/20 border-b border-white/10">
      <div className="flex items-center space-x-2">
        <input
          type="password"
          placeholder="Enter your DeepSeek API key"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          className="flex-1 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-gray-400"
        />
        <span className="text-xs text-gray-300">Get your key from DeepSeek</span>
      </div>
    </div>
  );
};
