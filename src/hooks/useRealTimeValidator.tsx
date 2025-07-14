
import { useState, useCallback } from 'react';

interface ValidationLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  data?: any;
}

interface RealTimeValidatorHook {
  logs: ValidationLog[];
  logValidation: (level: ValidationLog['level'], message: string, data?: any) => void;
  clearLogs: () => void;
  validateStreamToken: (token: string) => boolean;
  validateApiResponse: (response: any, expectedSchema: any) => boolean;
}

export const useRealTimeValidator = (): RealTimeValidatorHook => {
  const [logs, setLogs] = useState<ValidationLog[]>([]);

  const logValidation = useCallback((level: ValidationLog['level'], message: string, data?: any) => {
    const log: ValidationLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      level,
      message,
      data
    };
    
    setLogs(prev => [...prev.slice(-49), log]); // Keep last 50 logs
    
    // Also log to console for debugging
    const consoleMethod = level === 'error' ? 'error' : level === 'warning' ? 'warn' : 'log';
    console[consoleMethod](`[Real-time Validator] ${message}`, data);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const validateStreamToken = useCallback((token: string): boolean => {
    try {
      // Basic token validation
      if (typeof token !== 'string') {
        logValidation('warning', 'Invalid token type received', { token, type: typeof token });
        return false;
      }
      
      if (token.length === 0) {
        logValidation('warning', 'Empty token received');
        return false;
      }
      
      // Check for common streaming artifacts
      if (token.includes('\n\n') || token.includes('data:')) {
        logValidation('warning', 'Token contains streaming artifacts', { token });
        return false;
      }
      
      return true;
    } catch (error) {
      logValidation('error', 'Token validation error', { error, token });
      return false;
    }
  }, [logValidation]);

  const validateApiResponse = useCallback((response: any, expectedSchema: any): boolean => {
    try {
      if (!response) {
        logValidation('error', 'Empty API response received');
        return false;
      }
      
      // Check required fields
      for (const field of Object.keys(expectedSchema)) {
        if (expectedSchema[field] && !response.hasOwnProperty(field)) {
          logValidation('error', `Missing required field: ${field}`, { response, expectedSchema });
          return false;
        }
      }
      
      return true;
    } catch (error) {
      logValidation('error', 'API response validation error', { error, response });
      return false;
    }
  }, [logValidation]);

  return {
    logs,
    logValidation,
    clearLogs,
    validateStreamToken,
    validateApiResponse
  };
};
