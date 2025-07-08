
import React, { useState, useEffect } from 'react';
import { Play, RotateCcw, Maximize2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LivePreviewProps {
  code: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ code }) => {
  const [previewContent, setPreviewContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (code) {
      try {
        // Simple preview generation - in production this would be more sophisticated
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                ${code}
                
                const container = document.getElementById('root');
                const root = ReactDOM.createRoot(container);
                
                try {
                  if (typeof App !== 'undefined') {
                    root.render(React.createElement(App));
                  } else {
                    root.render(React.createElement('div', {}, 'No App component found'));
                  }
                } catch (err) {
                  root.render(React.createElement('div', { style: { color: 'red', padding: '20px' } }, 'Error: ' + err.message));
                }
              </script>
            </body>
          </html>
        `;
        setPreviewContent(htmlContent);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  }, [code]);

  const refreshPreview = () => {
    setPreviewContent('');
    setTimeout(() => {
      if (code) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
              <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
              <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
              <script src="https://cdn.tailwindcss.com"></script>
              <style>
                body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
              </style>
            </head>
            <body>
              <div id="root"></div>
              <script type="text/babel">
                ${code}
                
                const container = document.getElementById('root');
                const root = ReactDOM.createRoot(container);
                
                try {
                  if (typeof App !== 'undefined') {
                    root.render(React.createElement(App));
                  } else {
                    root.render(React.createElement('div', {}, 'No App component found'));
                  }
                } catch (err) {
                  root.render(React.createElement('div', { style: { color: 'red', padding: '20px' } }, 'Error: ' + err.message));
                }
              </script>
            </body>
          </html>
        `;
        setPreviewContent(htmlContent);
      }
    }, 100);
  };

  return (
    <div className={`h-full flex flex-col bg-white rounded-xl border border-gray-200 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-800">Live Preview</h3>
          {error && (
            <div className="flex items-center space-x-1 text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs">Error</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={refreshPreview}
            className="border-gray-300"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="border-gray-300"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {error ? (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">Preview Error</h4>
              <p className="text-gray-600 text-sm">{error}</p>
            </div>
          </div>
        ) : previewContent ? (
          <iframe
            srcDoc={previewContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin"
            title="Code Preview"
          />
        ) : (
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center">
              <Play className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-600 mb-2">No Preview Available</h4>
              <p className="text-gray-500 text-sm">Run some code to see the preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
