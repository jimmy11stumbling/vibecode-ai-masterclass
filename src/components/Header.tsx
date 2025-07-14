
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Settings, 
  User, 
  Bell, 
  Search,
  Command,
  Zap,
  Database,
  GitBranch
} from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Sovereign AI IDE</h1>
              <p className="text-xs text-slate-400">Production-Ready Development Environment</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-green-400 border-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2" />
              Online
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <Zap className="w-3 h-3 mr-1" />
              DeepSeek AI
            </Badge>
            <Badge variant="outline" className="text-purple-400 border-purple-400">
              <Database className="w-3 h-3 mr-1" />
              Supabase
            </Badge>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search project..."
              className="w-64 pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-400 focus:outline-none"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <Command className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-500">K</span>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white relative"
          >
            <Bell className="w-4 h-4" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <GitBranch className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};
