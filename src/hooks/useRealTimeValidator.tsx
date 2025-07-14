import { useState, useCallback } from 'react';

interface ValidationResult {
  id: string;
  timestamp: Date;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  details?: string;
  component?: string;
  duration?: number;
}

let validationCount = 0;

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
      id: `validation-${++validationCount}`,
      timestamp: new Date(),
      type,
      message,
      details,
      component,
      duration
    };

    console.log('🔍 Adding validation:', validation);

    setValidations(prev => {
      const updated = [...prev, validation];
      // Keep only last 1000 validations to prevent memory issues
      if (updated.length > 1000) {
        return updated.slice(-1000);
      }
      return updated;
    });

    return validation;
  }, []);

  const validateSuccess = useCallback((message: string, details?: string, component?: string, duration?: number) => {
    return addValidation('success', message, details, component, duration);
  }, [addValidation]);

  const validateError = useCallback((message: string, details?: string, component?: string, duration?: number) => {
    return addValidation('error', message, details, component, duration);
  }, [addValidation]);

  const validateWarning = useCallback((message: string, details?: string, component?: string, duration?: number) => {
    return addValidation('warning', message, details, component, duration);
  }, [addValidation]);

  const validateInfo = useCallback((message: string, details?: string, component?: string, duration?: number) => {
    return addValidation('info', message, details, component, duration);
  }, [addValidation]);

  const clearValidations = useCallback(() => {
    console.log('🗑️ Clearing all validations');
    setValidations([]);
  }, []);

  const exportValidations = useCallback(() => {
    console.log('📤 Exporting validations');
    const data = JSON.stringify(validations, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
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
    exportValidations
  };
};
