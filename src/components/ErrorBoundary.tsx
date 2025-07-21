
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, RefreshCw, Bug, Code, ExternalLink } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableRetry?: boolean;
  maxRetries?: number;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeouts: NodeJS.Timeout[] = [];

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report error to external service
    this.reportError(error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    // Clean up any pending retry timeouts
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

  private reportError = async (error: Error, errorInfo: ErrorInfo) => {
    try {
      // In a real app, you'd send this to your error reporting service
      const errorReport = {
        errorId: this.state.errorId,
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
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount >= maxRetries) {
      console.warn('Max retry attempts reached');
      return;
    }

    console.log(`🔄 Retrying... Attempt ${this.state.retryCount + 1}`);
    
    this.setState(prevState => ({
      retryCount: prevState.retryCount + 1
    }));

    // Progressive backoff: wait longer between retries
    const retryDelay = Math.min(1000 * Math.pow(2, this.state.retryCount), 10000);
    
    const timeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null
      });
    }, retryDelay);
    
    this.retryTimeouts.push(timeout);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private copyErrorDetails = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      stack: this.state.error?.stack,
      componentStack: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { enableRetry = true, maxRetries = 3 } = this.props;
      const canRetry = enableRetry && this.state.retryCount < maxRetries;

      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-slate-800 border-slate-700">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-red-500/20 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </div>
              <CardTitle className="text-white text-2xl">Something went wrong</CardTitle>
              <CardDescription className="text-slate-400">
                An unexpected error occurred while rendering this component
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Error Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-medium">Error Details</h4>
                  <Badge variant="outline" className="text-red-400 border-red-400">
                    ID: {this.state.errorId.substring(0, 8)}
                  </Badge>
                </div>
                
                <div className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-start space-x-2">
                    <Bug className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-red-300 font-medium">
                        {this.state.error?.name}: {this.state.error?.message}
                      </p>
                    </div>
                  </div>
                  
                  {this.state.error?.stack && (
                    <details className="mt-3">
                      <summary className="text-slate-400 cursor-pointer hover:text-slate-300">
                        View Stack Trace
                      </summary>
                      <pre className="mt-2 text-xs text-slate-300 bg-slate-800 p-3 rounded overflow-x-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </div>

              {/* Retry Information */}
              {this.state.retryCount > 0 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-blue-300 text-sm">
                    Retry attempts: {this.state.retryCount} / {maxRetries}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canRetry && (
                  <Button 
                    onClick={this.handleRetry}
                    className="bg-blue-600 hover:bg-blue-700 flex-1"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button 
                  onClick={this.handleReload}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button 
                  onClick={this.copyErrorDetails}
                  variant="outline"
                  size="sm"
                >
                  <Code className="w-4 h-4 mr-2" />
                  Copy Error
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center pt-4 border-t border-slate-700">
                <p className="text-slate-400 text-sm">
                  If this error persists, please{' '}
                  <a 
                    href="https://github.com/your-repo/issues" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 inline-flex items-center"
                  >
                    report this issue
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
