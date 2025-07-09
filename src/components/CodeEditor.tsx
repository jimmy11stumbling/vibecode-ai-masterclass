
import React, { useState, useRef } from 'react';
import { Play, Save, Download, Upload, Settings, Maximize2, Copy, RotateCcw, FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

interface CodeEditorProps {
  onCodeChange?: (files: CodeFile[]) => void;
  onRun?: (code: string) => void;
  selectedFile?: any;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ onCodeChange, onRun, selectedFile }) => {
  const [files, setFiles] = useState<CodeFile[]>([
    {
      id: '1',
      name: 'App.tsx',
      content: `import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Hello, World!
        </h1>
        <p className="text-gray-600">
          Welcome to your React application.
        </p>
      </div>
    </div>
  );
};

export default App;`,
      language: 'typescript'
    },
    {
      id: '2',
      name: 'styles.css',
      content: `/* Global Styles */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}`,
      language: 'css'
    }
  ]);

  const [activeFileId, setActiveFileId] = useState('1');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeFile = files.find(file => file.id === activeFileId) || files[0];

  // Update active file when selectedFile changes
  React.useEffect(() => {
    if (selectedFile && selectedFile.type === 'file') {
      // Check if file already exists
      const existingFile = files.find(f => f.name === selectedFile.name);
      if (existingFile) {
        setActiveFileId(existingFile.id);
      } else {
        // Create new file
        const newFile: CodeFile = {
          id: Date.now().toString(),
          name: selectedFile.name,
          content: selectedFile.content || '// New file',
          language: getLanguageFromFileName(selectedFile.name)
        };
        setFiles(prev => [...prev, newFile]);
        setActiveFileId(newFile.id);
      }
    }
  }, [selectedFile]);

  const getLanguageFromFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      default:
        return 'text';
    }
  };

  const updateFileContent = (fileId: string, content: string) => {
    const updatedFiles = files.map(file =>
      file.id === fileId ? { ...file, content } : file
    );
    setFiles(updatedFiles);
    onCodeChange?.(updatedFiles);
  };

  const createNewFile = () => {
    if (!newFileName.trim()) return;
    
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: newFileName.trim(),
      content: `// ${newFileName}\n`,
      language: getLanguageFromFileName(newFileName)
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setIsCreatingFile(false);
    setNewFileName('');
  };

  const deleteFile = (fileId: string) => {
    if (files.length <= 1) return; // Keep at least one file
    
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    
    if (activeFileId === fileId) {
      setActiveFileId(updatedFiles[0]?.id || '');
    }
  };

  const handleRun = () => {
    const mainFile = files.find(file => file.name.includes('App')) || files[0];
    onRun?.(mainFile.content);
  };

  const handleSave = () => {
    console.log('Saving files...', files);
    // In production, this would save to backend or local storage
    localStorage.setItem('ide_files', JSON.stringify(files));
  };

  const handleLoad = () => {
    const savedFiles = localStorage.getItem('ide_files');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        setFiles(parsedFiles);
        setActiveFileId(parsedFiles[0]?.id || '');
      } catch (error) {
        console.error('Error loading files:', error);
      }
    }
  };

  const handleDownload = () => {
    const content = JSON.stringify(files, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project-files.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeFile.content);
  };

  const resetFile = () => {
    if (activeFile.name === 'App.tsx') {
      updateFileContent(activeFile.id, `import React from 'react';

const App = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Hello, World!
        </h1>
        <p className="text-gray-600">
          Welcome to your React application.
        </p>
      </div>
    </div>
  );
};

export default App;`);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-white">Code Editor</h3>
          <span className="text-xs text-slate-400">
            {files.length} file{files.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={handleRun}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleSave}
            className="text-slate-400 hover:text-white"
          >
            <Save className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleLoad}
            className="text-slate-400 hover:text-white"
          >
            <Upload className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDownload}
            className="text-slate-400 hover:text-white"
          >
            <Download className="w-4 h-4" />
          </Button>
          
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
            onClick={resetFile}
            className="text-slate-400 hover:text-white"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="text-slate-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* File Tabs */}
      <Tabs value={activeFileId} onValueChange={setActiveFileId} className="flex-1 flex flex-col">
        <div className="flex items-center border-b border-slate-700">
          <TabsList className="bg-slate-800 border-b border-slate-700 rounded-none justify-start h-auto p-0 flex-1">
            {files.map((file) => (
              <TabsTrigger
                key={file.id}
                value={file.id}
                className="data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400 rounded-none border-r border-slate-700 px-4 py-2 relative group"
              >
                <FileText className="w-3 h-3 mr-1" />
                {file.name}
                {files.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteFile(file.id);
                    }}
                    className="ml-2 h-4 w-4 p-0 text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </Button>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <div className="p-2">
            {isCreatingFile ? (
              <div className="flex items-center space-x-2">
                <Input
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="filename.tsx"
                  className="w-32 h-6 text-xs bg-slate-800 border-slate-600"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') createNewFile();
                    if (e.key === 'Escape') {
                      setIsCreatingFile(false);
                      setNewFileName('');
                    }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={createNewFile} className="h-6 px-2 text-xs">
                  Add
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsCreatingFile(true)}
                className="text-slate-400 hover:text-white h-6 w-6 p-0"
              >
                <Plus className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {files.map((file) => (
          <TabsContent key={file.id} value={file.id} className="flex-1 m-0">
            <div className="h-full flex flex-col">
              {/* Code Editor Area */}
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={file.content}
                  onChange={(e) => updateFileContent(file.id, e.target.value)}
                  className="w-full h-full bg-slate-800 text-slate-100 font-mono text-sm p-4 pl-16 border-0 resize-none focus:outline-none"
                  placeholder={`Write your ${file.language} code here...`}
                  spellCheck={false}
                />
                
                {/* Line Numbers */}
                <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900 border-r border-slate-700 flex flex-col text-slate-500 text-xs font-mono pt-4">
                  {file.content.split('\n').map((_, index) => (
                    <div key={index} className="h-[1.25rem] flex items-center justify-end pr-2">
                      {index + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-t border-slate-700 text-xs text-slate-400">
                <div className="flex items-center space-x-4">
                  <span>Language: {file.language}</span>
                  <span>Lines: {file.content.split('\n').length}</span>
                  <span>Characters: {file.content.length}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>UTF-8</span>
                  <span>•</span>
                  <span>Spaces: 2</span>
                </div>
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
