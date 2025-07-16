
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play, 
  Square, 
  Save, 
  Download, 
  Upload,
  RefreshCw,
  Bug,
  CheckCircle,
  AlertTriangle,
  Zap,
  Eye,
  Code2,
  Palette,
  Settings
} from 'lucide-react';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
  lastModified: Date;
}

interface CompilationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  file: string;
}

interface RealTimeCodeEditorProps {
  initialFiles?: CodeFile[];
  onCodeChange?: (files: CodeFile[]) => void;
  onExecute?: (code: string) => void;
  autoSave?: boolean;
  hotReload?: boolean;
}

export const RealTimeCodeEditor: React.FC<RealTimeCodeEditorProps> = ({
  initialFiles = [],
  onCodeChange,
  onExecute,
  autoSave = true,
  hotReload = true
}) => {
  const [files, setFiles] = useState<CodeFile[]>(initialFiles.length > 0 ? initialFiles : [
    {
      id: '1',
      name: 'App.tsx',
      content: `import React, { useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          Real-Time IDE
        </h1>
        <div className="text-center">
          <div className="text-6xl font-bold text-indigo-600 mb-6">
            {count}
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setCount(count - 1)}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Decrease
            </button>
            <button
              onClick={() => setCount(count + 1)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Increase
            </button>
          </div>
          <button
            onClick={() => setCount(0)}
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;`,
      language: 'typescript',
      lastModified: new Date()
    }
  ]);
  
  const [activeFileId, setActiveFileId] = useState('1');
  const [isExecuting, setIsExecuting] = useState(false);
  const [compilationErrors, setCompilationErrors] = useState<CompilationError[]>([]);
  const [executionOutput, setExecutionOutput] = useState('');
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [previewUrl, setPreviewUrl] = useState('');
  
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const hotReloadTimeoutRef = useRef<NodeJS.Timeout>();

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  // Auto-save functionality
  const handleAutoSave = useCallback(() => {
    if (!autoSave) return;
    
    setAutoSaveStatus('saving');
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      setAutoSaveStatus('saved');
      onCodeChange?.(files);
    }, 1000);
  }, [files, autoSave, onCodeChange]);

  // Hot reload functionality
  const handleHotReload = useCallback(() => {
    if (!hotReload || !activeFile) return;
    
    if (hotReloadTimeoutRef.current) {
      clearTimeout(hotReloadTimeoutRef.current);
    }
    
    hotReloadTimeoutRef.current = setTimeout(() => {
      compileAndPreview(activeFile.content);
    }, 500);
  }, [activeFile, hotReload]);

  const updateFileContent = (fileId: string, content: string) => {
    const updatedFiles = files.map(file =>
      file.id === fileId 
        ? { ...file, content, lastModified: new Date() }
        : file
    );
    setFiles(updatedFiles);
    setAutoSaveStatus('unsaved');
  };

  const compileAndPreview = async (code: string) => {
    try {
      setIsExecuting(true);
      setCompilationErrors([]);
      
      // Simulate compilation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate preview URL
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
                '<h3>Runtime Error:</h3>' +
                '<pre>' + error.toString() + '</pre>' +
                '</div>';
            }
          </script>
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      setExecutionOutput('Compilation successful');
      
    } catch (error) {
      const compilationError: CompilationError = {
        line: 1,
        column: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        severity: 'error',
        file: activeFile?.name || 'unknown'
      };
      setCompilationErrors([compilationError]);
      setExecutionOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExecute = () => {
    if (activeFile) {
      compileAndPreview(activeFile.content);
      onExecute?.(activeFile.content);
    }
  };

  const handleSave = () => {
    setAutoSaveStatus('saving');
    setTimeout(() => {
      setAutoSaveStatus('saved');
      onCodeChange?.(files);
    }, 500);
  };

  const createNewFile = () => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: `NewFile${files.length + 1}.tsx`,
      content: `import React from 'react';\n\nconst NewComponent = () => {\n  return (\n    <div>\n      <h1>New Component</h1>\n    </div>\n  );\n};\n\nexport default NewComponent;`,
      language: 'typescript',
      lastModified: new Date()
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
  };

  // Auto-save effect
  useEffect(() => {
    handleAutoSave();
  }, [files, handleAutoSave]);

  // Hot reload effect
  useEffect(() => {
    if (activeFile) {
      handleHotReload();
    }
  }, [activeFile?.content, handleHotReload]);

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center space-x-3">
          <h3 className="text-sm font-semibold text-white">Real-Time Editor</h3>
          <Badge variant="outline" className={`text-xs ${
            autoSaveStatus === 'saved' ? 'text-green-400 border-green-400' :
            autoSaveStatus === 'saving' ? 'text-yellow-400 border-yellow-400' :
            'text-red-400 border-red-400'
          }`}>
            {autoSaveStatus === 'saved' ? <CheckCircle className="w-3 h-3 mr-1" /> :
             autoSaveStatus === 'saving' ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> :
             <AlertTriangle className="w-3 h-3 mr-1" />}
            {autoSaveStatus}
          </Badge>
          {hotReload && (
            <Badge variant="outline" className="text-blue-400 border-blue-400 text-xs">
              <Zap className="w-3 h-3 mr-1" />
              Hot Reload
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={handleExecute}
            disabled={isExecuting}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExecuting ? (
              <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            {isExecuting ? 'Compiling...' : 'Run'}
          </Button>
          
          <Button size="sm" variant="ghost" onClick={handleSave}>
            <Save className="w-4 h-4" />
          </Button>
          
          <Button size="sm" variant="ghost" onClick={createNewFile}>
            <Code2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File Tabs */}
      <div className="border-b border-slate-700 bg-slate-800">
        <div className="flex items-center px-2 py-1 overflow-x-auto">
          {files.map((file) => (
            <button
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`px-3 py-2 text-sm whitespace-nowrap rounded-t-md mr-1 transition-colors ${
                activeFileId === file.id
                  ? 'bg-slate-900 text-white border-t border-l border-r border-slate-600'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative">
            <textarea
              ref={editorRef}
              value={activeFile?.content || ''}
              onChange={(e) => updateFileContent(activeFile?.id || '', e.target.value)}
              className="w-full h-full bg-slate-900 text-slate-100 font-mono text-sm p-4 pl-16 border-0 resize-none focus:outline-none"
              placeholder="Write your code here..."
              spellCheck={false}
              style={{
                tabSize: 2,
                fontFamily: '"Fira Code", "JetBrains Mono", Consolas, "Liberation Mono", Menlo, Courier, monospace'
              }}
            />
            
            {/* Line Numbers */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-800 border-r border-slate-700 flex flex-col text-slate-500 text-xs font-mono pt-4">
              {(activeFile?.content || '').split('\n').map((_, index) => (
                <div key={index} className="h-[1.25rem] flex items-center justify-end pr-2 leading-5">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Error Panel */}
          {compilationErrors.length > 0 && (
            <div className="bg-red-900/20 border-t border-red-700 p-4">
              <div className="flex items-center mb-2">
                <Bug className="w-4 h-4 text-red-400 mr-2" />
                <span className="text-red-400 font-semibold">Compilation Errors</span>
              </div>
              <ScrollArea className="max-h-24">
                {compilationErrors.map((error, index) => (
                  <div key={index} className="text-sm text-red-300 mb-1">
                    {error.file}:{error.line}:{error.column} - {error.message}
                  </div>
                ))}
              </ScrollArea>
            </div>
          )}
        </div>

        {/* Live Preview */}
        <div className="w-1/2 border-l border-slate-700 flex flex-col">
          <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-white">Live Preview</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span>{compilationErrors.length === 0 ? 'Ready' : 'Errors'}</span>
              <div className={`w-2 h-2 rounded-full ${
                compilationErrors.length === 0 ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
            </div>
          </div>
          
          <div className="flex-1 bg-white">
            {previewUrl ? (
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
                title="Live Preview"
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Eye className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Click "Run" to see live preview</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-1 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>{activeFile?.name || 'No file'}</span>
          <span>{activeFile?.language || 'plain'}</span>
          <span>{files.length} files</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Auto-save: {autoSave ? 'On' : 'Off'}</span>
          <span>Hot Reload: {hotReload ? 'On' : 'Off'}</span>
          <span>{executionOutput}</span>
        </div>
      </div>
    </div>
  );
};
