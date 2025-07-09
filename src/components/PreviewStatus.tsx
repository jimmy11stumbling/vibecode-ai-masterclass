
import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface PreviewStatusProps {
  isRunning: boolean;
  error: string;
  output: string;
}

export const PreviewStatus: React.FC<PreviewStatusProps> = ({ isRunning, error, output }) => {
  if (!isRunning && !error && !output) return null;

  return (
    <div className="px-4 py-2 border-b border-slate-700 bg-slate-800">
      <div className="flex items-center space-x-2 text-sm">
        {error ? (
          <>
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400">Error: {error}</span>
          </>
        ) : output ? (
          <>
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400">{output}</span>
          </>
        ) : (
          <>
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-blue-400">Running preview...</span>
          </>
        )}
      </div>
    </div>
  );
};
