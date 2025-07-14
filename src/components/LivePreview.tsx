
import React, { useState, useEffect } from 'react';
import { LivePreviewContainer } from './LivePreviewContainer';

interface LivePreviewProps {
  code: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ code }) => {
  const [previewCode, setPreviewCode] = useState(code);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Debounce code updates to avoid excessive re-renders
    const timer = setTimeout(() => {
      setPreviewCode(code);
    }, 500);

    return () => clearTimeout(timer);
  }, [code]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    // Create a new window with the preview code
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Live Preview - External</title>
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
            ${previewCode}
            
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
      
      newWindow.document.write(htmlContent);
      newWindow.document.close();
    }
  };

  return (
    <LivePreviewContainer
      key={refreshKey}
      code={previewCode}
      onRefresh={handleRefresh}
      onOpenExternal={handleOpenExternal}
    />
  );
};
