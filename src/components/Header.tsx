
import React from 'react';
import { Code2, Zap, Brain } from 'lucide-react';

export const Header = () => {
  return (
    <header className="border-b border-white/10 backdrop-blur-sm bg-white/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Vibecode AI
              </h1>
              <p className="text-sm text-gray-400">Powered by DeepSeek</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-sm text-white">DeepSeek AI</span>
            </div>
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
