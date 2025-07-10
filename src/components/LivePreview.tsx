
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
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { 
      margin: 0; 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc;
    }
    .error { 
      color: #dc2626; 
      padding: 20px; 
      background: #fef2f2; 
      border: 1px solid #fecaca; 
      margin: 20px; 
      border-radius: 8px;
      font-family: monospace;
    }
    .console-log { 
      padding: 8px 12px; 
      border-bottom: 1px solid #e2e8f0; 
      font-family: 'Monaco', 'Menlo', monospace; 
      font-size: 12px;
      background: #1e293b;
      color: #e2e8f0;
    }
    #console-output {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      max-height: 200px;
      overflow-y: auto;
      background: #0f172a;
      border-top: 1px solid #334155;
      z-index: 1000;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  <div id="console-output" style="display: none;"></div>
  
  <script type="text/babel">
    const { useState, useEffect, createElement, Fragment } = React;
    const { createRoot } = ReactDOM;
    
    // Capture console logs
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;
    const consoleOutput = document.getElementById('console-output');
    let hasLogs = false;
    
    const addLog = (type, args) => {
      if (!hasLogs) {
        consoleOutput.style.display = 'block';
        hasLogs = true;
      }
      const logDiv = document.createElement('div');
      logDiv.className = 'console-log';
      logDiv.style.color = type === 'error' ? '#ef4444' : type === 'warn' ? '#f59e0b' : '#10b981';
      logDiv.textContent = (type === 'error' ? '✗ ' : type === 'warn' ? '⚠ ' : '> ') + args.join(' ');
      consoleOutput.appendChild(logDiv);
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
      
      window.parent.postMessage({ 
        type: 'console', 
        level: type, 
        message: args.join(' ') 
      }, '*');
    };
    
    console.log = (...args) => {
      originalLog(...args);
      addLog('log', args);
    };
    
    console.error = (...args) => {
      originalError(...args);
      addLog('error', args);
    };
    
    console.warn = (...args) => {
      originalWarn(...args);
      addLog('warn', args);
    };
    
    try {
      const transformedCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
      
      // Handle different code formats
      let componentCode = transformedCode;
      
      // If it's a full component with export default
      if (componentCode.includes('export default')) {
        componentCode = componentCode.replace(/export default\s+/, '');
      }
      
      // If it's just JSX, wrap it in a component
      if (!componentCode.includes('function') && !componentCode.includes('const') && !componentCode.includes('class')) {
        componentCode = \`function App() { return (\${componentCode}); }\`;
      }
      
      // Add React import if missing
      if (!componentCode.includes('React') && !componentCode.includes('import')) {
        componentCode = \`const React = window.React;\n\${componentCode}\`;
      }
      
      console.log('Rendering component...');
      
      // Evaluate the component code
      const evalCode = new Function('React', 'useState', 'useEffect', 'Fragment', \`
        \${componentCode}
        
        // Find the component to render
        if (typeof App !== 'undefined') return App;
        if (typeof Component !== 'undefined') return Component;
        
        // Look for any function that might be a component
        const vars = Object.keys(this).filter(key => 
          typeof this[key] === 'function' && 
          key[0] === key[0].toUpperCase()
        );
        
        if (vars.length > 0) return this[vars[0]];
        
        throw new Error('No React component found');
      \`);
      
      const Component = evalCode.call({}, React, useState, useEffect, Fragment);
      
      const root = createRoot(document.getElementById('root'));
      root.render(createElement(Component));
      
      window.parent.postMessage({ 
        type: 'success', 
        message: 'Component rendered successfully' 
      }, '*');
      
    } catch (error) {
      console.error('Preview Error:', error);
      document.getElementById('root').innerHTML = \`
        <div class="error">
          <h3>Preview Error</h3>
          <p>\${error.message}</p>
          <details>
            <summary>Stack trace</summary>
            <pre>\${error.stack}</pre>
          </details>
          <details>
            <summary>Code</summary>
            <pre>\${transformedCode}</pre>
          </details>
        </div>
      \`;
      window.parent.postMessage({ 
        type: 'error', 
        message: error.message 
      }, '*');
    }
  </script>
</body>
</html>`;
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'console') {
        setLogs(prev => [...prev.slice(-50), `[${event.data.level}] ${event.data.message}`]);
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
    if (code && code.trim()) {
      const timeoutId = setTimeout(() => {
        handleRun();
      }, 500);
      
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
          {code.trim() ? (
            <iframe
              ref={iframeRef}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-popups"
              title="Live Preview"
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-slate-800">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-300 mb-2">Ready to Preview</h3>
                <p className="text-slate-400">
                  Write some React code in the editor to see the live preview
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Console Logs */}
        {logs.length > 0 && (
          <div className="h-32 border-t border-slate-700 bg-slate-800 overflow-auto">
            <div className="p-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-400">Console Output</h4>
                <button
                  onClick={() => setLogs([])}
                  className="text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              </div>
              {logs.map((log, index) => (
                <div key={index} className="text-xs text-slate-300 font-mono mb-1 break-words">
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
              {isRunning ? 'Running' : error ? 'Error' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
