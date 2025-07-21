
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Code, ExternalLink } from 'lucide-react';

interface ErrorActionsProps {
  canRetry: boolean;
  onRetry: () => void;
  onReload: () => void;
  onCopyError: () => void;
  retryCount: number;
  maxRetries: number;
}

export const ErrorActions: React.FC<ErrorActionsProps> = ({
  canRetry,
  onRetry,
  onReload,
  onCopyError,
  retryCount,
  maxRetries
}) => {
  return (
    <div className="space-y-4">
      {/* Retry Information */}
      {retryCount > 0 && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <p className="text-blue-300 text-sm">
            Retry attempts: {retryCount} / {maxRetries}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {canRetry && (
          <Button 
            onClick={onRetry}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        
        <Button 
          onClick={onReload}
          variant="outline"
          className="flex-1"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reload Page
        </Button>
        
        <Button 
          onClick={onCopyError}
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
    </div>
  );
};
