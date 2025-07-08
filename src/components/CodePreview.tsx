
import React, { useState } from 'react';
import { Eye, Code, Monitor, Smartphone, Tablet, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const CodePreview: React.FC = () => {
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [showCode, setShowCode] = useState(false);

  const sampleHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
    <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
        <div class="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-800 mb-4">Hello World!</h1>
                <p class="text-gray-600 mb-6">This is a sample component preview.</p>
                <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors">
                    Click Me
                </button>
            </div>
        </div>
    </div>
</body>
</html>`;

  const getFrameWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-2">
          <Eye className="w-5 h-5 text-green-400" />
          <h3 className="font-semibold text-white">Code Preview</h3>
        </div>

        <div className="flex items-center space-x-4">
          {/* Viewport Controls */}
          <div className="flex items-center space-x-1 bg-white/10 rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'desktop' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('desktop')}
              className="h-8 w-8 p-0"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'tablet' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('tablet')}
              className="h-8 w-8 p-0"
            >
              <Tablet className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'mobile' ? 'secondary' : 'ghost'}
              onClick={() => setViewMode('mobile')}
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
              onClick={() => setShowCode(!showCode)}
              className="text-gray-300 hover:text-white"
            >
              <Code className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-300 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>

          {/* Viewport Size Indicator */}
          <div className="text-xs text-gray-400">
            {viewMode === 'desktop' ? '1200px+' : viewMode === 'tablet' ? '768px' : '375px'}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={showCode ? 'code' : 'preview'} className="h-full">
          <TabsContent value="preview" className="h-full m-0 p-4">
            <div 
              className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden"
              style={{ 
                width: getFrameWidth(),
                height: '100%',
                minHeight: '400px',
                transition: 'width 0.3s ease'
              }}
            >
              <iframe
                srcDoc={sampleHTML}
                className="w-full h-full border-0"
                title="Code Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>
          </TabsContent>

          <TabsContent value="code" className="h-full m-0 p-4">
            <div className="h-full bg-gray-900 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                <span className="text-xs text-gray-300 uppercase tracking-wide">HTML</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigator.clipboard.writeText(sampleHTML)}
                  className="text-gray-300 hover:text-white h-6 px-2"
                >
                  Copy
                </Button>
              </div>
              <pre className="p-4 text-sm overflow-auto h-full">
                <code className="text-gray-100 whitespace-pre-wrap">{sampleHTML}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Preview Mode: {viewMode}</span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
};
