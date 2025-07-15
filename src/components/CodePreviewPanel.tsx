
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  RotateCw, 
  Maximize2, 
  Minimize2,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface CodePreviewPanelProps {
  code: string;
  isRunning?: boolean;
  onRun?: () => void;
  onStop?: () => void;
}

export const CodePreviewPanel: React.FC<CodePreviewPanelProps> = ({
  code,
  isRunning = false,
  onRun,
  onStop
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewStatus, setPreviewStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [previewContent, setPreviewContent] = useState<string>('');

  useEffect(() => {
    if (code && code.trim()) {
      generatePreview(code);
    }
  }, [code]);

  const generatePreview = async (sourceCode: string) => {
    setPreviewStatus('loading');
    
    // Simulate code compilation/preview generation
    setTimeout(() => {
      try {
        const htmlContent = generateHTMLPreview(sourceCode);
        setPreviewContent(htmlContent);
        setPreviewStatus('ready');
      } catch (error) {
        setPreviewStatus('error');
      }
    }, 1000);
  };

  const generateHTMLPreview = (sourceCode: string): string => {
    // Simple React-to-HTML preview generator
    const hasReactComponent = sourceCode.includes('export default') || sourceCode.includes('function');
    
    if (hasReactComponent) {
      return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            body { margin: 0; padding: 20px; font-family: system-ui, sans-serif; }
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${sourceCode}
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(App || (() => React.createElement('div', {}, 'Component rendered successfully!'))));
          </script>
        </body>
        </html>
      `;
    }
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Code Preview</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body>
        <div class="p-8">
          <h2 class="text-2xl font-bold mb-4">Code Preview</h2>
          <div class="bg-gray-100 p-4 rounded-lg">
            <pre class="text-sm"><code>${sourceCode}</code></pre>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const handleRun = () => {
    if (onRun) {
      onRun();
    } else {
      generatePreview(code);
    }
  };

  const getStatusIcon = () => {
    switch (previewStatus) {
      case 'loading':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (previewStatus) {
      case 'loading':
        return 'Compiling...';
      case 'ready':
        return 'Ready';
      case 'error':
        return 'Error';
      default:
        return 'Idle';
    }
  };

  return (
    <div className={`h-full flex flex-col bg-slate-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold text-white">Live Preview</h3>
          <Badge variant="secondary" className="text-xs flex items-center space-x-1">
            {getStatusIcon()}
            <span>{getStatusText()}</span>
          </Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={isRunning ? onStop : handleRun}
            className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
          >
            {isRunning ? (
              <>
                <Square className="w-4 h-4 mr-1" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-1" />
                Run
              </>
            )}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => generatePreview(code)}
            disabled={previewStatus === 'loading'}
          >
            <RotateCw className={`w-4 h-4 ${previewStatus === 'loading' ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 bg-white">
        {previewStatus === 'loading' ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600">Compiling your code...</p>
            </div>
          </div>
        ) : previewStatus === 'error' ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
              <p className="text-gray-600">Error compiling code</p>
              <Button size="sm" className="mt-2" onClick={() => generatePreview(code)}>
                Retry
              </Button>
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
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Play className="w-8 h-8 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">Run your code to see the preview</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
