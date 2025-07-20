import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { MonacoCodeEditor } from './MonacoCodeEditor';
import { FileTabs } from './FileTabs';
import { BuildOutput } from './BuildOutput';
import { PackageManager } from './PackageManager';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { dynamicCodeModifier } from '@/services/dynamicCodeModifier';

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

export const CodeEditor: React.FC<CodeEditorProps> = ({ 
  onCodeChange, 
  onRun, 
  selectedFile 
}) => {
  const [files, setFiles] = useState<CodeFile[]>([
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
          Sovereign AI IDE
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
      language: 'typescript'
    }
  ]);

  const [activeFileId, setActiveFileId] = useState('1');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeBottomPanel, setActiveBottomPanel] = useState<'build' | 'packages'>('build');

  const activeFile = files.find(file => file.id === activeFileId) || files[0];

  // Update active file when selectedFile changes
  useEffect(() => {
    if (selectedFile && selectedFile.type === 'file' && selectedFile.content !== undefined) {
      const existingFile = files.find(f => f.name === selectedFile.name);
      if (existingFile) {
        // Update existing file content
        setFiles(prev => prev.map(f => 
          f.id === existingFile.id 
            ? { ...f, content: selectedFile.content || '' }
            : f
        ));
        setActiveFileId(existingFile.id);
      } else {
        // Add new file
        const newFile: CodeFile = {
          id: Date.now().toString(),
          name: selectedFile.name,
          content: selectedFile.content || '',
          language: getLanguageFromFileName(selectedFile.name)
        };
        setFiles(prev => [...prev, newFile]);
        setActiveFileId(newFile.id);
      }
    }
  }, [selectedFile]);

  // Notify parent when files change
  useEffect(() => {
    onCodeChange?.(files);
  }, [files, onCodeChange]);

  // Sync files with dynamic code modifier
  useEffect(() => {
    const syncFiles = async () => {
      for (const file of files) {
        await dynamicCodeModifier.writeFile(`/src/${file.name}`, file.content);
      }
    };
    syncFiles();
  }, [files]);

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
      case 'md':
        return 'markdown';
      default:
        return 'text';
    }
  };

  const updateFileContent = async (fileId: string, content: string) => {
    const updatedFiles = files.map(file =>
      file.id === fileId ? { ...file, content } : file
    );
    setFiles(updatedFiles);
    
    // Sync with dynamic code modifier
    const file = files.find(f => f.id === fileId);
    if (file) {
      await dynamicCodeModifier.updateFile(`/src/${file.name}`, content);
    }
  };

  const createNewFile = (fileName: string) => {
    const language = getLanguageFromFileName(fileName);
    const template = getFileTemplate(language, fileName);
    
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: fileName,
      content: template,
      language
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
    
    // Sync with dynamic code modifier
    dynamicCodeModifier.createFile(`/src/${fileName}`, template);
  };

  const getFileTemplate = (language: string, fileName: string): string => {
    if (language === 'typescript' && fileName.endsWith('.tsx')) {
      const componentName = fileName.replace('.tsx', '');
      return `import React from 'react';

interface ${componentName}Props {
  // Add your props here
}

export const ${componentName}: React.FC<${componentName}Props> = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">${componentName}</h1>
      <p>Welcome to your new component!</p>
    </div>
  );
};

export default ${componentName};`;
    }
    
    if (language === 'css') {
      return `/* ${fileName} */

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}`;
    }
    
    if (language === 'json') {
      return `{
  "name": "example",
  "version": "1.0.0",
  "description": ""
}`;
    }
    
    return `// ${fileName}\n\n`;
  };

  const deleteFile = async (fileId: string) => {
    if (files.length <= 1) return;
    
    const fileToDelete = files.find(f => f.id === fileId);
    if (fileToDelete) {
      await dynamicCodeModifier.deleteFile(`/src/${fileToDelete.name}`);
    }
    
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    
    if (activeFileId === fileId) {
      setActiveFileId(updatedFiles[0]?.id || '');
    }
  };

  const handleSave = async () => {
    console.log('Saving files...', files);
    localStorage.setItem('ide_files', JSON.stringify(files));
    
    // Sync all files with dynamic code modifier
    for (const file of files) {
      await dynamicCodeModifier.writeFile(`/src/${file.name}`, file.content);
    }
  };

  return (
    <div className={`h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      <ResizablePanelGroup direction="vertical" className="h-full">
        {/* Main Editor Panel */}
        <ResizablePanel defaultSize={70} minSize={50}>
          <Tabs value={activeFileId} onValueChange={setActiveFileId} className="flex-1 flex flex-col h-full">
            <FileTabs
              files={files}
              onDeleteFile={deleteFile}
              onCreateFile={createNewFile}
            />

            {files.map((file) => (
              <TabsContent key={file.id} value={file.id} className="flex-1 m-0">
                <MonacoCodeEditor
                  file={file}
                  onContentChange={updateFileContent}
                  onRun={onRun}
                  onSave={handleSave}
                  isFullscreen={isFullscreen}
                  onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
                />
              </TabsContent>
            ))}
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Bottom Panel */}
        <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
          <Tabs value={activeBottomPanel} onValueChange={setActiveBottomPanel as any} className="h-full flex flex-col">
            <div className="border-b border-slate-700 bg-slate-800">
              <div className="flex items-center px-4 py-2">
                <button
                  onClick={() => setActiveBottomPanel('build')}
                  className={`px-3 py-1 text-sm rounded ${
                    activeBottomPanel === 'build' 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Build Output
                </button>
                <button
                  onClick={() => setActiveBottomPanel('packages')}
                  className={`ml-2 px-3 py-1 text-sm rounded ${
                    activeBottomPanel === 'packages' 
                      ? 'bg-slate-700 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Packages
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="build" className="h-full m-0">
                <BuildOutput />
              </TabsContent>
              <TabsContent value="packages" className="h-full m-0">
                <PackageManager />
              </TabsContent>
            </div>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};
