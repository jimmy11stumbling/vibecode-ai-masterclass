
import { useState, useCallback } from 'react';

export interface ValidationEntry {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info'; // Changed from 'level' to 'type'
  message: string;
  details?: any;
  source: string;
  duration?: number; // Added to match ValidationResult interface
}

export const useRealTimeValidator = () => {
  const [validations, setValidations] = useState<ValidationEntry[]>([]);

  const addValidation = useCallback((
    type: ValidationEntry['type'], // Changed from 'level' to 'type'
    message: string,
    details?: any,
    source: string = 'System',
    duration?: number
  ) => {
    const entry: ValidationEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type, // Changed from 'level' to 'type'
      message,
      details,
      source,
      duration
    };

    setValidations(prev => [entry, ...prev.slice(0, 999)]); // Keep last 1000 entries
  }, []);

  const validateSuccess = useCallback((message: string, details?: any, source?: string, duration?: number) => {
    addValidation('success', message, details, source, duration);
  }, [addValidation]);

  const validateError = useCallback((message: string, details?: any, source?: string) => {
    addValidation('error', message, details, source);
  }, [addValidation]);

  const validateWarning = useCallback((message: string, details?: any, source?: string) => {
    addValidation('warning', message, details, source);
  }, [addValidation]);

  const validateInfo = useCallback((message: string, details?: any, source?: string) => {
    addValidation('info', message, details, source);
  }, [addValidation]);

  const clearValidations = useCallback(() => {
    setValidations([]);
  }, []);

  const exportValidations = useCallback(() => {
    const data = JSON.stringify(validations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validation-log-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [validations]);

  return {
    validations,
    validateSuccess,
    validateError,
    validateWarning,
    validateInfo,
    clearValidations,
    exportValidations
  };
};
