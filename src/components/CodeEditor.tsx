
import React, { useState, useRef } from 'react';
import { Copy, Download, Play, Save, RefreshCw, Eye, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CodeFile {
  name: string;
  content: string;
  language: string;
  id: string;
}

interface CodeEditorProps {
  initialFiles?: CodeFile[];
  onCodeChange?: (files: CodeFile[]) => void;
  onRun?: (code: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  initialFiles = [], 
  onCodeChange,
  onRun 
}) => {
  const [files, setFiles] = useState<CodeFile[]>(initialFiles.length > 0 ? initialFiles : [
    {
      id: '1',
      name: 'App.tsx',
      language: 'typescript',
      content: `import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome to Vibecode AI
        </h1>
        <p className="text-gray-600">
          Start building something amazing!
        </p>
      </div>
    </div>
  );
}

export default App;`
    }
  ]);
  
  const [activeFile, setActiveFile] = useState(files[0]?.id || '1');
  const [isRunning, setIsRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const getCurrentFile = () => files.find(f => f.id === activeFile) || files[0];
  
  const updateFileContent = (content: string) => {
    const updatedFiles = files.map(file => 
      file.id === activeFile ? { ...file, content } : file
    );
    setFiles(updatedFiles);
    onCodeChange?.(updatedFiles);
  };

  const addNewFile = () => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: `Component${files.length + 1}.tsx`,
      language: 'typescript',
      content: `import React from 'react';

const Component${files.length + 1} = () => {
  return (
    <div>
      <h2>New Component</h2>
    </div>
  );
};

export default Component${files.length + 1};`
    };
    
    const updatedFiles = [...files, newFile];
    setFiles(updatedFiles);
    setActiveFile(newFile.id);
    onCodeChange?.(updatedFiles);
  };

  const runCode = async () => {
    setIsRunning(true);
    const currentFile = getCurrentFile();
    onRun?.(currentFile.content);
    
    // Simulate compilation time
    setTimeout(() => {
      setIsRunning(false);
    }, 2000);
  };

  const copyToClipboard = () => {
    const currentFile = getCurrentFile();
    navigator.clipboard.writeText(currentFile.content);
  };

  const downloadFile = () => {
    const currentFile = getCurrentFile();
    const blob = new Blob([currentFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Code2 className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Code Editor</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
            className="text-slate-400 hover:text-white"
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={downloadFile}
            className="text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={addNewFile}
            className="text-slate-400 hover:text-white"
          >
            <Save className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            onClick={runCode}
            disabled={isRunning}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isRunning ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeFile} onValueChange={setActiveFile} className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4">
          <TabsList className="bg-transparent">
            {files.map((file) => (
              <TabsTrigger
                key={file.id}
                value={file.id}
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
              >
                {file.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          {files.map((file) => (
            <TabsContent key={file.id} value={file.id} className="m-0 h-full">
              <textarea
                ref={textareaRef}
                value={file.content}
                onChange={(e) => updateFileContent(e.target.value)}
                className="w-full h-full p-4 bg-slate-900 text-slate-100 font-mono text-sm resize-none focus:outline-none"
                style={{
                  tabSize: 2,
                  fontFamily: '"Fira Code", "JetBrains Mono", Consolas, monospace'
                }}
                placeholder="Start coding..."
              />
            </TabsContent>
          ))}
        </div>
      </Tabs>

      <div className="p-2 border-t border-slate-700 bg-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Lines: {getCurrentFile().content.split('\n').length}</span>
          <span>Language: {getCurrentFile().language}</span>
          <span>Encoding: UTF-8</span>
        </div>
      </div>
    </div>
  );
};
