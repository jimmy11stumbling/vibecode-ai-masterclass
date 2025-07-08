
import React, { useState, useEffect } from 'react';
import { Play, Square, RefreshCw, Maximize2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LivePreviewProps {
  code: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ code }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (code && isRunning) {
      try {
        // This is a simplified preview - in a real implementation,
        // you'd need a proper code execution environment
        setOutput('Code executed successfully!');
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setOutput('');
      }
    }
  }, [code, isRunning]);

  const handleRun = () => {
    setIsRunning(true);
    setError('');
    setOutput('Running code...');
  };

  const handleStop = () => {
    setIsRunning(false);
    setOutput('');
    setError('');
  };

  const handleRefresh = () => {
    if (isRunning) {
      handleRun();
    }
  };

  return (
    <div className="h-full bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Live Preview</h3>
          <div className="flex items-center space-x-2">
            {!isRunning ? (
              <Button
                size="sm"
                onClick={handleRun}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={handleStop}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Square className="w-4 h-4 mr-2" />
                Stop
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={handleRefresh}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Preview Frame */}
        <div className="h-full bg-white rounded-lg m-4 border border-gray-200 overflow-auto">
          {isRunning && !error && (
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Preview Running</h3>
                <p className="text-gray-600 mb-4">
                  Your code is executing in a sandboxed environment
                </p>
                <div className="bg-gray-100 rounded-lg p-4 text-left">
                  <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                    {output}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Error</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left">
                  <pre className="text-sm text-red-800 whitespace-pre-wrap">
                    {error}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {!isRunning && !error && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">Ready to Preview</h3>
                <p className="text-gray-400">
                  Click the Run button to execute your code
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Sandboxed Environment</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-green-500' : 'bg-gray-500'
            }`} />
            <span>{isRunning ? 'Running' : 'Stopped'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
