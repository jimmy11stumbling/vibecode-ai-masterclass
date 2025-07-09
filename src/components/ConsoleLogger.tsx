
import React, { useState, useEffect } from 'react';
import { Terminal, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  data?: any;
}

interface ConsoleLoggerProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const ConsoleLogger: React.FC<ConsoleLoggerProps> = ({ 
  isVisible = false, 
  onToggle 
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Intercept console methods to capture logs
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalInfo = console.info;

    const addLog = (level: LogEntry['level'], message: string, data?: any) => {
      const logEntry: LogEntry = {
        id: Date.now().toString() + Math.random(),
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        data
      };

      setLogs(prev => [...prev.slice(-49), logEntry]); // Keep last 50 logs
    };

    console.log = (...args) => {
      originalLog(...args);
      addLog('info', args.join(' '), args.length > 1 ? args.slice(1) : undefined);
    };

    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warning', args.join(' '), args.length > 1 ? args.slice(1) : undefined);
    };

    console.error = (...args) => {
      originalError(...args);
      addLog('error', args.join(' '), args.length > 1 ? args.slice(1) : undefined);
    };

    console.info = (...args) => {
      originalInfo(...args);
      addLog('success', args.join(' '), args.length > 1 ? args.slice(1) : undefined);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
      console.info = originalInfo;
    };
  }, []);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'text-blue-400';
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const clearLogs = () => {
    setLogs([]);
    console.log('Console cleared');
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 ${
      isMinimized ? 'w-64' : 'w-96'
    } ${isMinimized ? 'h-12' : 'h-80'} transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-sm font-medium text-white">Real-time Console</span>
          <span className="text-xs text-gray-400">({logs.length})</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            size="sm"
            variant="ghost"
            onClick={clearLogs}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            ×
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggle}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <ScrollArea className="h-64 p-2">
          <div className="space-y-1">
            {logs.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-8">
                No logs yet. Real-time validation will appear here.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="text-xs font-mono">
                  <span className="text-gray-500">[{log.timestamp}]</span>
                  <span className={`ml-2 ${getLevelColor(log.level)}`}>
                    {log.level.toUpperCase()}:
                  </span>
                  <span className="ml-2 text-gray-300">{log.message}</span>
                  {log.data && (
                    <div className="ml-8 text-gray-400 text-xs">
                      {JSON.stringify(log.data, null, 2)}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};
