
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bug } from 'lucide-react';

interface ErrorDetailsProps {
  error: Error;
  errorId: string;
}

export const ErrorDetails: React.FC<ErrorDetailsProps> = ({ error, errorId }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-medium">Error Details</h4>
        <Badge variant="outline" className="text-red-400 border-red-400">
          ID: {errorId.substring(0, 8)}
        </Badge>
      </div>
      
      <div className="bg-slate-700 rounded-lg p-4 space-y-2">
        <div className="flex items-start space-x-2">
          <Bug className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-medium">
              {error.name}: {error.message}
            </p>
          </div>
        </div>
        
        {error.stack && (
          <details className="mt-3">
            <summary className="text-slate-400 cursor-pointer hover:text-slate-300">
              View Stack Trace
            </summary>
            <pre className="mt-2 text-xs text-slate-300 bg-slate-800 p-3 rounded overflow-x-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};
