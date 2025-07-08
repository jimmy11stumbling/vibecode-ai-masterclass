
import React, { useState } from 'react';
import { Play, Copy, Download, Maximize2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const CodePreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState('preview');
  const [code, setCode] = useState(`// React Component Preview
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Counter Example</h2>
      <div className="text-center">
        <p className="text-lg mb-4">Count: {count}</p>
        <div className="space-x-2">
          <button 
            onClick={() => setCount(count - 1)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            -
          </button>
          <button 
            onClick={() => setCount(count + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default Counter;`);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
  };

  const downloadCode = () => {
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'component.jsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">Code Preview</h3>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={copyCode}
              className="text-gray-400 hover:text-white"
            >
              <Copy className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={downloadCode}
              className="text-gray-400 hover:text-white"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b border-white/10">
          <TabsList className="bg-white/10 backdrop-blur-sm">
            <TabsTrigger value="preview" className="data-[state=active]:bg-white/20">
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="data-[state=active]:bg-white/20">
              Code
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="preview" className="h-full m-0 p-4">
            <div className="h-full bg-white rounded-lg p-6 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Preview Ready</h3>
                <p className="text-gray-600 mb-4">
                  Your code will be rendered here when you run it
                </p>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  <Play className="w-4 h-4 mr-2" />
                  Run Code
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="h-full m-0">
            <div className="h-full bg-gray-900 text-green-400 font-mono text-sm overflow-auto">
              <div className="p-4">
                <pre className="whitespace-pre-wrap">{code}</pre>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      <div className="p-3 border-t border-white/10 bg-white/5">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>React • JavaScript • Ready</span>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white h-6 px-2"
            >
              <RefreshCw className="w-3 h-3" />
            </Button>
            <span>Auto-refresh enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
