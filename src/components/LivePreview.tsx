
import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';
import { PreviewControls } from './PreviewControls';
import { PreviewStatus } from './PreviewStatus';

interface LivePreviewProps {
  code: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ code }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const createPreviewHTML = (code: string) => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Preview</title>
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .error { color: red; padding: 20px; background: #fee; border: 1px solid #fcc; margin: 20px; border-radius: 8px; }
    .console-log { padding: 10px; border-bottom: 1px solid #eee; font-family: monospace; font-size: 12px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="console-output"></div>
  
  <script type="text/babel">
    const { useState, useEffect, createElement } = React;
    const { createRoot } = ReactDOM;
    
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const consoleOutput = document.getElementById('console-output');
    
    console.log = (...args) => {
      originalLog(...args);
      const logDiv = document.createElement('div');
      logDiv.className = 'console-log';
      logDiv.textContent = '> ' + args.join(' ');
      consoleOutput.appendChild(logDiv);
      window.parent.postMessage({ type: 'console', level: 'log', message: args.join(' ') }, '*');
    };
    
    console.error = (...args) => {
      originalError(...args);
      const errorDiv = document.createElement('div');
      errorDiv.className = 'console-log';
      errorDiv.style.color = 'red';
      errorDiv.textContent = '✗ ' + args.join(' ');
      consoleOutput.appendChild(errorDiv);
      window.parent.postMessage({ type: 'console', level: 'error', message: args.join(' ') }, '*');
    };
    
    try {
      // Transform the code
      const transformedCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
      
      // Create a function that returns the component
      const componentCode = transformedCode.includes('export default') 
        ? transformedCode.replace('export default', 'return') 
        : \`return (\${transformedCode})\`;
      
      const ComponentFunction = new Function('React', 'useState', 'useEffect', componentCode);
      const Component = ComponentFunction(React, useState, useEffect);
      
      const root = createRoot(document.getElementById('root'));
      
      if (typeof Component === 'function') {
        root.render(createElement(Component));
      } else {
        root.render(Component);
      }
      
      window.parent.postMessage({ type: 'success', message: 'Component rendered successfully' }, '*');
      
    } catch (error) {
      console.error('Preview Error:', error);
      document.getElementById('root').innerHTML = \`
        <div class="error">
          <h3>Preview Error</h3>
          <p>\${error.message}</p>
          <pre>\${error.stack}</pre>
        </div>
      \`;
      window.parent.postMessage({ type: 'error', message: error.message }, '*');
    }
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setLogs(prev => [...prev, `[${event.data.level}] ${event.data.message}`]);
      } else if (event.data.type === 'error') {
        setError(event.data.message);
        setIsRunning(false);
      } else if (event.data.type === 'success') {
        setError('');
        setOutput(event.data.message);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleRun = () => {
    if (!code.trim()) {
      setError('No code to preview');
      return;
    }

    setIsRunning(true);
    setError('');
    setOutput('');
    setLogs([]);

    try {
      const previewHTML = createPreviewHTML(code);
      const blob = new Blob([previewHTML], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      if (iframeRef.current) {
        iframeRef.current.src = url;
      }
      
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setIsRunning(false);
    }
  };

  const handleStop = () => {
    setIsRunning(false);
    if (iframeRef.current) {
      iframeRef.current.src = 'about:blank';
    }
    setOutput('');
    setError('');
    setLogs([]);
  };

  const handleRefresh = () => {
    if (code) {
      handleRun();
    }
  };

  const openInNewTab = () => {
    if (code) {
      const previewHTML = createPreviewHTML(code);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(previewHTML);
        newWindow.document.close();
      }
    }
  };

  // Auto-run when code changes
  useEffect(() => {
    if (code && isRunning) {
      const timeoutId = setTimeout(() => {
        handleRun();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [code]);

  return (
    <div className="h-full bg-slate-900 rounded-lg border border-slate-700 flex flex-col">
      <PreviewControls
        isRunning={isRunning}
        hasCode={!!code.trim()}
        onRun={handleRun}
        onStop={handleStop}
        onRefresh={handleRefresh}
        onOpenInNewTab={openInNewTab}
      />

      <div className="flex-1 overflow-hidden flex flex-col">
        <PreviewStatus isRunning={isRunning} error={error} output={output} />

        {/* Preview Frame */}
        <div className="flex-1 relative">
          {isRunning && code ? (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
              title="Live Preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">Ready to Preview</h3>
                <p className="text-gray-400">
                  {!code.trim() ? 'Write some code and click Run to see the preview' : 'Click the Run button to execute your code'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Console Logs */}
        {logs.length > 0 && (
          <div className="h-32 border-t border-slate-700 bg-slate-800 overflow-auto">
            <div className="p-2">
              <h4 className="text-xs font-semibold text-slate-400 mb-2">Console Output</h4>
              {logs.map((log, index) => (
                <div key={index} className="text-xs text-slate-300 font-mono mb-1">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>React • Live Preview</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-green-500' : error ? 'bg-red-500' : 'bg-gray-500'
            }`} />
            <span>
              {isRunning ? 'Running' : error ? 'Error' : 'Stopped'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
