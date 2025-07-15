
import { useState, useCallback } from 'react';

export interface ValidationResult {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  component?: string;
  duration?: number;
}

export const useRealTimeValidator = () => {
  const [validations, setValidations] = useState<ValidationResult[]>([]);

  const addValidation = useCallback((
    type: ValidationResult['type'],
    message: string,
    details?: string,
    component?: string,
    duration?: number
  ) => {
    const validation: ValidationResult = {
      id: `validation-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      type,
      message,
      details,
      component,
      duration
    };

    setValidations(prev => [...prev.slice(-99), validation]); // Keep last 100
    return validation;
  }, []);

  const validateSuccess = useCallback((message: string, details?: string, component?: string) => {
    return addValidation('success', message, details, component);
  }, [addValidation]);

  const validateError = useCallback((message: string, details?: any, component?: string) => {
    const errorDetails = typeof details === 'string' ? details : 
                        details instanceof Error ? details.message :
                        details ? JSON.stringify(details) : undefined;
    return addValidation('error', message, errorDetails, component);
  }, [addValidation]);

  const validateWarning = useCallback((message: string, details?: string, component?: string) => {
    return addValidation('warning', message, details, component);
  }, [addValidation]);

  const validateInfo = useCallback((message: string, details?: string, component?: string) => {
    return addValidation('info', message, details, component);
  }, [addValidation]);

  const clearValidations = useCallback(() => {
    setValidations([]);
  }, []);

  const exportValidations = useCallback(() => {
    const data = {
      validations,
      exportedAt: new Date().toISOString(),
      totalCount: validations.length
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `validations-${new Date().toISOString().split('T')[0]}.json`;
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
    exportValidations,
    addValidation
  };
};
