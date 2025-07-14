
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Terminal, 
  Search, 
  Filter, 
  Trash2, 
  Download,
  Bug,
  Info,
  AlertTriangle,
  XCircle
} from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  source?: string;
}

interface ConsoleLoggerProps {
  logs: LogEntry[];
  onClear: () => void;
  onExport: () => void;
  maxEntries?: number;
}

export const ConsoleLogger: React.FC<ConsoleLoggerProps> = ({
  logs,
  onClear,
  onExport,
  maxEntries = 500
}) => {
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | LogEntry['level']>('all');

  useEffect(() => {
    const filtered = logs
      .filter(log => {
        const matchesSearch = !searchQuery || 
          log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
          log.source?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
        return matchesSearch && matchesLevel;
      })
      .slice(-maxEntries)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredLogs(filtered);

    // Log to actual console for debugging
    logs.forEach(log => {
      const prefix = `[${log.source || 'System'}]`;
      const timestamp = log.timestamp.toLocaleTimeString();
      
      switch (log.level) {
        case 'error':
          console.error(`${prefix} ${timestamp}:`, log.message, log.data);
          break;
        case 'warn':
          console.warn(`${prefix} ${timestamp}:`, log.message, log.data);
          break;
        case 'info':
          console.info(`${prefix} ${timestamp}:`, log.message, log.data);
          break;
        case 'debug':
          console.debug(`${prefix} ${timestamp}:`, log.message, log.data);
          break;
        default:
          console.log(`${prefix} ${timestamp}:`, log.message, log.data);
      }
    });
  }, [logs, searchQuery, levelFilter, maxEntries]);

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warn':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'debug':
        return <Bug className="w-4 h-4 text-purple-400" />;
      default:
        return <Terminal className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400 bg-red-900/20 border-red-800';
      case 'warn':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-800';
      case 'info':
        return 'text-blue-400 bg-blue-900/20 border-blue-800';
      case 'debug':
        return 'text-purple-400 bg-purple-900/20 border-purple-800';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-800';
    }
  };

  const getLevelCounts = () => {
    return logs.reduce((counts, log) => {
      counts[log.level] = (counts[log.level] || 0) + 1;
      return counts;
    }, {} as Record<LogEntry['level'], number>);
  };

  const levelCounts = getLevelCounts();

  return (
    <div className="h-full flex flex-col bg-slate-900 border border-slate-700 rounded-lg">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center space-x-3">
          <Terminal className="w-5 h-5 text-green-400" />
          <h3 className="text-sm font-semibold text-white">Console Logger</h3>
          <Badge variant="secondary" className="text-xs">
            {logs.length} entries
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={onExport}
            className="text-slate-400 hover:text-white h-8 w-8 p-0"
          >
            <Download className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onClear}
            className="text-slate-400 hover:text-red-400 h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 border-b border-slate-700 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search logs..."
            className="pl-10 bg-slate-800 border-slate-600 text-white text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          {(['all', 'error', 'warn', 'info', 'debug', 'log'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                levelFilter === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
              {level !== 'all' && levelCounts[level] && (
                <span className="ml-1 text-xs opacity-75">
                  ({levelCounts[level]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Logs */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredLogs.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              <Terminal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No logs to display</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className={`border rounded-lg p-3 ${getLogColor(log.level)}`}
              >
                <div className="flex items-start space-x-3">
                  {getLogIcon(log.level)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {log.level.toUpperCase()}
                        </span>
                        {log.source && (
                          <Badge variant="outline" className="text-xs">
                            {log.source}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs opacity-70">
                        {log.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <p className="text-sm mb-2 break-words">
                      {log.message}
                    </p>
                    
                    {log.data && (
                      <div className="bg-slate-800 rounded p-2 text-xs font-mono overflow-x-auto">
                        <pre>{JSON.stringify(log.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Stats Footer */}
      <div className="border-t border-slate-700 px-4 py-2 bg-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Total: {logs.length}</span>
          <div className="flex items-center space-x-4">
            <span className="text-red-400">E: {levelCounts.error || 0}</span>
            <span className="text-yellow-400">W: {levelCounts.warn || 0}</span>
            <span className="text-blue-400">I: {levelCounts.info || 0}</span>
            <span className="text-purple-400">D: {levelCounts.debug || 0}</span>
            <span className="text-gray-400">L: {levelCounts.log || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
