
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { ErrorReportService } from './error/ErrorReportService';
import { ErrorActions } from './error/ErrorActions';
import { ErrorDetails } from './error/ErrorDetails';

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
    
    this.setState({ error, errorInfo });

    // Report error to external service
    ErrorReportService.reportError(error, errorInfo, this.state.errorId);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
  }

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

  private handleCopyError = () => {
    if (this.state.error && this.state.errorInfo) {
      ErrorReportService.copyErrorDetails(
        this.state.error,
        this.state.errorInfo,
        this.state.errorId
      );
    }
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
              {this.state.error && (
                <ErrorDetails 
                  error={this.state.error} 
                  errorId={this.state.errorId} 
                />
              )}

              <ErrorActions
                canRetry={canRetry}
                onRetry={this.handleRetry}
                onReload={this.handleReload}
                onCopyError={this.handleCopyError}
                retryCount={this.state.retryCount}
                maxRetries={maxRetries}
              />
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
