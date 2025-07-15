
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  Trash2, 
  Download, 
  Search,
  Filter,
  AlertCircle,
  Info,
  AlertTriangle,
  CheckCircle,
  X
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: any;
  source?: string;
}

interface ConsoleLoggerProps {
  logs: LogEntry[];
  onClear: () => void;
  onExport: () => void;
  maxHeight?: string;
  title?: string;
}

export const ConsoleLogger: React.FC<ConsoleLoggerProps> = ({
  logs,
  onClear,
  onExport,
  maxHeight = '300px',
  title = 'Console Logger'
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      case 'warn':
        return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      case 'success':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      default:
        return <Info className="w-3 h-3 text-blue-400" />;
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400 border-red-400/20 bg-red-400/5';
      case 'warn':
        return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/5';
      case 'success':
        return 'text-green-400 border-green-400/20 bg-green-400/5';
      default:
        return 'text-blue-400 border-blue-400/20 bg-blue-400/5';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-medium text-white">{title}</h3>
          <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
            {logs.length} entries
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onExport}
            className="h-7 px-2 text-slate-400 hover:text-white"
            disabled={logs.length === 0}
          >
            <Download className="w-3 h-3" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="h-7 px-2 text-slate-400 hover:text-white"
            disabled={logs.length === 0}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea 
          className="h-full"
          style={{ maxHeight }}
        >
          <div className="p-2 space-y-1" ref={scrollRef}>
            {logs.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-slate-500">
                <div className="text-center">
                  <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No logs yet</p>
                </div>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-2 rounded border-l-2 text-xs font-mono ${getLogColor(log.level)}`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="flex items-center space-x-2 min-w-0 flex-1">
                      {getLogIcon(log.level)}
                      
                      <span className="text-slate-400 text-xs tabular-nums">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      
                      {log.source && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                          {log.source}
                        </Badge>
                      )}
                      
                      <span className="text-slate-200 break-words flex-1">
                        {log.message}
                      </span>
                    </div>
                  </div>
                  
                  {log.details && (
                    <div className="mt-1 pl-5 text-slate-400 text-xs">
                      <pre className="whitespace-pre-wrap break-words">
                        {typeof log.details === 'string' 
                          ? log.details 
                          : JSON.stringify(log.details, null, 2)
                        }
                      </pre>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};
