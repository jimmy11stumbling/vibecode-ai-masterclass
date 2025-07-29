import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Zap,
  Clock
} from 'lucide-react';

interface BuildLog {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  timestamp: Date;
  file?: string;
  line?: number;
}

interface BuildStats {
  duration: number;
  errors: number;
  warnings: number;
  status: 'idle' | 'building' | 'success' | 'error';
}

export const BuildOutput: React.FC = () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [logs, setLogs] = useState<BuildLog[]>([]);
  const [stats, setStats] = useState<BuildStats>({
    duration: 0,
    errors: 0,
    warnings: 0,
    status: 'idle'
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const addLog = (type: BuildLog['type'], message: string, file?: string, line?: number) => {
    const log: BuildLog = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: new Date(),
      file,
      line
    };
    setLogs(prev => [...prev, log]);
  };

  const startBuild = async () => {
    setIsBuilding(true);
    setLogs([]);
    setStats({ duration: 0, errors: 0, warnings: 0, status: 'building' });

    const startTime = Date.now();

    try {
      // Simulate build process
      addLog('info', '🚀 Starting build process...');
      await new Promise(resolve => setTimeout(resolve, 500));

      addLog('info', '📦 Installing dependencies...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      addLog('info', '🔍 Type checking...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Simulate some warnings
      addLog('warning', 'Unused variable "unusedVar" in src/components/Example.tsx:42', 'src/components/Example.tsx', 42);
      addLog('warning', 'Missing dependency in useEffect hook', 'src/hooks/useExample.ts', 15);

      addLog('info', '⚡ Building for production...');
      await new Promise(resolve => setTimeout(resolve, 1500));

      addLog('info', '🎨 Processing CSS...');
      await new Promise(resolve => setTimeout(resolve, 600));

      addLog('info', '📊 Optimizing assets...');
      await new Promise(resolve => setTimeout(resolve, 400));

      addLog('success', '✅ Build completed successfully!');

      const duration = Date.now() - startTime;
      const warningCount = logs.filter(log => log.type === 'warning').length;

      setStats({
        duration,
        errors: 0,
        warnings: warningCount,
        status: 'success'
      });

    } catch (error) {
      addLog('error', `❌ Build failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      const duration = Date.now() - startTime;
      const errorCount = logs.filter(log => log.type === 'error').length;
      const warningCount = logs.filter(log => log.type === 'warning').length;

      setStats({
        duration,
        errors: errorCount,
        warnings: warningCount,
        status: 'error'
      });
    } finally {
      setIsBuilding(false);
    }
  };

  const stopBuild = () => {
    setIsBuilding(false);
    addLog('warning', '⚠️ Build process stopped by user');
    setStats(prev => ({ ...prev, status: 'idle' }));
  };

  const clearLogs = () => {
    setLogs([]);
    setStats({ duration: 0, errors: 0, warnings: 0, status: 'idle' });
  };

  const getLogIcon = (type: BuildLog['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info':
      default:
        return <div className="h-4 w-4" />;
    }
  };

  const getLogColor = (type: BuildLog['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
      default:
        return 'text-gray-700';
    }
  };

  const getStatusBadge = () => {
    switch (stats.status) {
      case 'building':
        return <Badge className="bg-blue-100 text-blue-800">Building...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'error':
        return <Badge variant="destructive">Failed</Badge>;
      case 'idle':
      default:
        return <Badge variant="secondary">Ready</Badge>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <h3 className="font-semibold">Build Output</h3>
            {getStatusBadge()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={clearLogs}
              disabled={isBuilding}
            >
              <RotateCcw className="h-4 w-4" />
              Clear
            </Button>
            {isBuilding ? (
              <Button size="sm" variant="outline" onClick={stopBuild}>
                <Square className="h-4 w-4" />
                Stop
              </Button>
            ) : (
              <Button size="sm" onClick={startBuild}>
                <Play className="h-4 w-4" />
                Build
              </Button>
            )}
          </div>
        </div>

        {/* Build Stats */}
        {stats.status !== 'idle' && (
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>{Math.round(stats.duration / 1000)}s</span>
            </div>
            {stats.errors > 0 && (
              <div className="flex items-center space-x-1 text-red-600">
                <XCircle className="h-4 w-4" />
                <span>{stats.errors} errors</span>
              </div>
            )}
            {stats.warnings > 0 && (
              <div className="flex items-center space-x-1 text-yellow-600">
                <AlertTriangle className="h-4 w-4" />
                <span>{stats.warnings} warnings</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Build Logs */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {logs.length > 0 ? (
          <div className="space-y-2 font-mono text-sm">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start space-x-2">
                {getLogIcon(log.type)}
                <div className="flex-1 min-w-0">
                  <div className={`${getLogColor(log.type)}`}>
                    <span className="text-gray-500">
                      [{log.timestamp.toLocaleTimeString()}]
                    </span>{' '}
                    {log.message}
                  </div>
                  {log.file && (
                    <div className="text-xs text-muted-foreground mt-1">
                      at {log.file}{log.line && `:${log.line}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isBuilding && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Building...</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Zap className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium mb-2">No Build Output</h4>
            <p className="text-muted-foreground mb-4">
              Click the Build button to start building your project
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};