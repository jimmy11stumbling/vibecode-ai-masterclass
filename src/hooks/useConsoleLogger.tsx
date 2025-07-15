
import { useState, useCallback } from 'react';

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: any;
  source?: string;
}

let logCount = 0;

export const useConsoleLogger = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback((
    level: LogEntry['level'],
    message: string,
    details?: any,
    source?: string
  ) => {
    const log: LogEntry = {
      id: `log-${++logCount}`,
      timestamp: new Date(),
      level,
      message,
      details,
      source
    };

    setLogs(prev => {
      const updated = [...prev, log];
      // Keep only last 1000 logs to prevent memory issues
      if (updated.length > 1000) {
        return updated.slice(-1000);
      }
      return updated;
    });

    return log;
  }, []);

  const logInfo = useCallback((message: string, details?: any, source?: string) => {
    return addLog('info', message, details, source);
  }, [addLog]);

  const logError = useCallback((message: string, details?: any, source?: string) => {
    return addLog('error', message, details, source);
  }, [addLog]);

  const logWarn = useCallback((message: string, details?: any, source?: string) => {
    return addLog('warn', message, details, source);
  }, [addLog]);

  const logSuccess = useCallback((message: string, details?: any, source?: string) => {
    return addLog('success', message, details, source);
  }, [addLog]);

  const log = useCallback((message: string, details?: any, source?: string) => {
    return addLog('info', message, details, source);
  }, [addLog]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const exportLogs = useCallback(() => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `console-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [logs]);

  return {
    logs,
    logInfo,
    logError,
    logWarn,
    logSuccess,
    log,
    clearLogs,
    exportLogs
  };
};
