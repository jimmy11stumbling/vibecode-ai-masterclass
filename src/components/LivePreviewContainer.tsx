
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, 
  Maximize2, 
  Minimize2, 
  Smartphone, 
  Tablet, 
  Monitor, 
  ExternalLink,
  Bug,
  Settings
} from 'lucide-react';

interface LivePreviewContainerProps {
  code: string;
  onRefresh?: () => void;
  onOpenExternal?: () => void;
}

export const LivePreviewContainer: React.FC<LivePreviewContainerProps> = ({
  code,
  onRefresh,
  onOpenExternal
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const getViewportDimensions = () => {
    switch (viewMode) {
      case 'mobile':
        return { width: '375px', height: '667px' };
      case 'tablet':
        return { width: '768px', height: '1024px' };
      case 'desktop':
        return { width: '100%', height: '100%' };
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setHasError(false);
    
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
    
    setTimeout(() => {
      setIsLoading(false);
      onRefresh?.();
    }, 1000);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  useEffect(() => {
    if (code && iframeRef.current) {
      setIsLoading(true);
      
      // Create a blob URL with the code
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Live Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 0; font-family: system-ui, sans-serif; }
            #root { min-height: 100vh; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${code}
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            try {
              root.render(React.createElement(App));
            } catch (error) {
              document.getElementById('root').innerHTML = 
                '<div style="padding: 20px; color: red; font-family: monospace;">' +
                '<h3>Preview Error:</h3>' +
                '<pre>' + error.toString() + '</pre>' +
                '</div>';
            }
          </script>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;

      return () => URL.revokeObjectURL(url);
    }
  }, [code]);

  const dimensions = getViewportDimensions();

  return (
    <div className={`flex flex-col h-full bg-slate-900 border border-slate-700 rounded-lg ${
      isFullscreen ? 'fixed inset-0 z-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-white">Live Preview</h3>
          
          {isLoading && (
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
              Loading
            </Badge>
          )}
          
          {hasError && (
            <Badge variant="destructive">
              <Bug className="w-3 h-3 mr-1" />
              Error
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Viewport Buttons */}
          <div className="flex items-center space-x-1 border border-slate-600 rounded">
            <Button
              size="sm"
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              onClick={() => setViewMode('mobile')}
              className="h-7 px-2"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'tablet' ? 'default' : 'ghost'}
              onClick={() => setViewMode('tablet')}
              className="h-7 px-2"
            >
              <Tablet className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              onClick={() => setViewMode('desktop')}
              className="h-7 px-2"
            >
              <Monitor className="w-3 h-3" />
            </Button>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            className="text-slate-400 hover:text-white h-7"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenExternal}
            className="text-slate-400 hover:text-white h-7"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-slate-400 hover:text-white h-7"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Viewport Info */}
      {viewMode !== 'desktop' && (
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-1">
          <span className="text-xs text-slate-400">
            {viewMode === 'mobile' ? 'iPhone 13 Pro' : 'iPad Pro'} • {dimensions.width} × {dimensions.height}
          </span>
        </div>
      )}

      {/* Preview Container */}
      <div className="flex-1 bg-white overflow-auto">
        {viewMode === 'desktop' ? (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0"
            onLoad={handleLoad}
            onError={handleError}
            sandbox="allow-scripts allow-same-origin"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-slate-100">
            <div 
              className="bg-white shadow-2xl rounded-lg overflow-hidden border-4 border-slate-800"
              style={{
                width: dimensions.width,
                height: dimensions.height,
                maxWidth: '100%',
                maxHeight: '100%'
              }}
            >
              <iframe
                ref={iframeRef}
                className="w-full h-full border-0"
                onLoad={handleLoad}
                onError={handleError}
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Preview
          </span>
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${
              hasError ? 'bg-red-500' : isLoading ? 'bg-yellow-500' : 'bg-green-500'
            }`}></div>
            <span>
              {hasError ? 'Error' : isLoading ? 'Loading' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
