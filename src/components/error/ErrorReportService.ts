
export interface ErrorReport {
  errorId: string;
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export class ErrorReportService {
  static async reportError(error: Error, errorInfo: React.ErrorInfo, errorId: string): Promise<void> {
    try {
      const errorReport: ErrorReport = {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      console.log('📊 Error Report:', errorReport);
      
      // You could send this to services like Sentry, LogRocket, etc.
      // await sendToErrorReporting(errorReport);
      
    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  static copyErrorDetails(error: Error, errorInfo: React.ErrorInfo, errorId: string): void {
    const errorDetails = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  }
}
