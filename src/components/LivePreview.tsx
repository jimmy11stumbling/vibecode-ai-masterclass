
import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone, Tablet, RefreshCw, ExternalLink, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LivePreviewProps {
  code: string;
  onViewChange?: (view: 'desktop' | 'tablet' | 'mobile') => void;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ code, onViewChange }) => {
  const [currentView, setCurrentView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    generatePreview();
  }, [code]);

  const generatePreview = () => {
    setIsLoading(true);
    
    // Create a complete HTML document with the code
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Live Preview</title>
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        <style>
          body { margin: 0; padding: 20px; font-family: system-ui, -apple-system, sans-serif; }
          .preview-container { min-height: 100vh; }
        </style>
      </head>
      <body>
        <div id="root"></div>
        <script type="text/babel">
          ${code}
          
          // If there's a default export, render it
          if (typeof App !== 'undefined') {
            ReactDOM.render(<App />, document.getElementById('root'));
          } else {
            // Fallback content
            ReactDOM.render(
              <div className="preview-container flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">Preview Ready</h1>
                  <p className="text-gray-600">Your code will appear here when you run it.</p>
                </div>
              </div>,
              document.getElementById('root')
            );
          }
        </script>
      </body>
      </html>
    `;

    setPreviewHtml(html);
    setTimeout(() => setIsLoading(false), 1000);
  };

  const handleViewChange = (view: 'desktop' | 'tablet' | 'mobile') => {
    setCurrentView(view);
    onViewChange?.(view);
  };

  const getFrameWidth = () => {
    switch (currentView) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  const refreshPreview = () => {
    generatePreview();
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Live Preview</h3>
        </div>

        <div className="flex items-center space-x-4">
          {/* Viewport Controls */}
          <div className="flex items-center space-x-1 bg-slate-800 rounded-lg p-1">
            <Button
              size="sm"
              variant={currentView === 'desktop' ? 'secondary' : 'ghost'}
              onClick={() => handleViewChange('desktop')}
              className="h-8 w-8 p-0"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={currentView === 'tablet' ? 'secondary' : 'ghost'}
              onClick={() => handleViewChange('tablet')}
              className="h-8 w-8 p-0"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={currentView === 'mobile' ? 'secondary' : 'ghost'}
              onClick={() => handleViewChange('mobile')}
              className="h-8 w-8 p-0"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={refreshPreview}
              disabled={isLoading}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-slate-400 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Viewport Size Indicator */}
          <div className="text-xs text-slate-400">
            {currentView === 'desktop' ? '1200px+' : currentView === 'tablet' ? '768px' : '375px'}
          </div>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 p-4 bg-slate-800">
        <div 
          className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
          style={{ 
            width: getFrameWidth(),
            height: '100%',
            minHeight: '500px',
            transition: 'width 0.3s ease'
          }}
        >
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Generating preview...</p>
              </div>
            </div>
          ) : (
            <iframe
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Preview Mode: {currentView}</span>
          <span>{isLoading ? 'Loading...' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
};
