
import { useEffect, useRef } from 'react';

interface ValidationMessage {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  data?: any;
}

export const useRealTimeValidator = () => {
  const validationLog = useRef<ValidationMessage[]>([]);

  const logValidation = (type: ValidationMessage['type'], message: string, data?: any) => {
    const validationEntry: ValidationMessage = {
      timestamp: new Date().toISOString(),
      type,
      message,
      data
    };

    validationLog.current.push(validationEntry);
    
    // Log to console with appropriate styling
    const styles = {
      info: 'color: #3b82f6; font-weight: bold;',
      success: 'color: #10b981; font-weight: bold;',
      warning: 'color: #f59e0b; font-weight: bold;',
      error: 'color: #ef4444; font-weight: bold;'
    };

    console.log(
      `%c[REAL-TIME VALIDATOR] ${type.toUpperCase()}: ${message}`,
      styles[type],
      data ? data : ''
    );
  };

  const validateApiResponse = (response: any, expectedStructure: any) => {
    logValidation('info', 'Validating API response structure');
    
    try {
      if (!response) {
        logValidation('error', 'Response is null or undefined', response);
        return false;
      }

      if (expectedStructure.choices && !response.choices) {
        logValidation('error', 'Missing choices in response', response);
        return false;
      }

      logValidation('success', 'API response validation passed', response);
      return true;
    } catch (error) {
      logValidation('error', 'Validation error occurred', error);
      return false;
    }
  };

  const validateStreamToken = (token: string) => {
    logValidation('info', `Received stream token: "${token}"`);
    
    if (!token || typeof token !== 'string') {
      logValidation('warning', 'Invalid token received', token);
      return false;
    }

    if (token.length > 0) {
      logValidation('success', 'Valid token processed');
      return true;
    }

    return false;
  };

  return {
    logValidation,
    validateApiResponse,
    validateStreamToken,
    getValidationLog: () => validationLog.current
  };
};
