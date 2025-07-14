
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info, 
  Trash2, 
  Download,
  Play,
  Square
} from 'lucide-react';

interface BuildMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  file?: string;
  line?: number;
  column?: number;
  timestamp: Date;
}

interface BuildOutputProps {
  isBuilding?: boolean;
  onBuild?: () => void;
  onStop?: () => void;
  onClear?: () => void;
}

export const BuildOutput: React.FC<BuildOutputProps> = ({
  isBuilding = false,
  onBuild,
  onStop,
  onClear
}) => {
  const [messages, setMessages] = useState<BuildMessage[]>([
    {
      id: '1',
      type: 'success',
      message: 'Build completed successfully',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'warning',
      message: 'Unused variable \'count\' in App.tsx',
      file: 'App.tsx',
      line: 12,
      column: 10,
      timestamp: new Date()
    },
    {
      id: '3',
      type: 'info',
      message: 'TypeScript compilation finished',
      timestamp: new Date()
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');

  const getIcon = (type: BuildMessage['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getBadgeVariant = (type: BuildMessage['type']) => {
    switch (type) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'success':
        return 'default';
      case 'info':
        return 'outline';
    }
  };

  const filteredMessages = messages.filter(msg => {
    if (activeTab === 'all') return true;
    return msg.type === activeTab;
  });

  const counts = {
    errors: messages.filter(m => m.type === 'error').length,
    warnings: messages.filter(m => m.type === 'warning').length,
    info: messages.filter(m => m.type === 'info').length,
    success: messages.filter(m => m.type === 'success').length
  };

  const handleExport = () => {
    const output = messages.map(msg => 
      `[${msg.timestamp.toLocaleTimeString()}] ${msg.type.toUpperCase()}: ${msg.message}${
        msg.file ? ` (${msg.file}:${msg.line}:${msg.column})` : ''
      }`
    ).join('\n');
    
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'build-output.log';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const simulateBuild = () => {
    if (isBuilding) return;
    
    onBuild?.();
    
    // Simulate build messages
    const buildMessages = [
      { type: 'info' as const, message: 'Starting TypeScript compilation...' },
      { type: 'info' as const, message: 'Checking dependencies...' },
      { type: 'success' as const, message: 'Dependencies resolved successfully' },
      { type: 'info' as const, message: 'Compiling components...' },
      { type: 'warning' as const, message: 'Type assertion used in FileManager.tsx', file: 'FileManager.tsx', line: 45, column: 12 },
      { type: 'success' as const, message: 'Build completed in 2.3s' }
    ];
    
    buildMessages.forEach((msg, index) => {
      setTimeout(() => {
        const newMessage: BuildMessage = {
          id: Date.now().toString() + index,
          timestamp: new Date(),
          ...msg
        };
        setMessages(prev => [...prev, newMessage]);
      }, index * 500);
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-white">Build Output</h3>
          {isBuilding && (
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              Building...
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={isBuilding ? onStop : simulateBuild}
            className="text-slate-400 hover:text-white"
          >
            {isBuilding ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleExport}
            className="text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setMessages([]);
              onClear?.();
            }}
            className="text-slate-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4 py-2">
          <TabsList className="bg-slate-800 w-full">
            <TabsTrigger value="all" className="data-[state=active]:bg-slate-700">
              All ({messages.length})
            </TabsTrigger>
            <TabsTrigger value="error" className="data-[state=active]:bg-slate-700">
              Errors ({counts.errors})
            </TabsTrigger>
            <TabsTrigger value="warning" className="data-[state=active]:bg-slate-700">
              Warnings ({counts.warnings})
            </TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-slate-700">
              Info ({counts.info})
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value={activeTab} className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {filteredMessages.length === 0 ? (
                  <div className="text-center text-slate-500 py-8">
                    <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No {activeTab === 'all' ? 'build output' : activeTab} messages</p>
                  </div>
                ) : (
                  filteredMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start space-x-3 p-3 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors"
                    >
                      {getIcon(message.type)}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getBadgeVariant(message.type)} className="text-xs">
                            {message.type.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-slate-500">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-300 mb-1">
                          {message.message}
                        </p>
                        
                        {message.file && (
                          <p className="text-xs text-slate-500">
                            {message.file}:{message.line}:{message.column}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
