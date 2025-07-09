
import React, { useState } from 'react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { CodeEditorHeader } from './CodeEditorHeader';
import { FileTabs } from './FileTabs';
import { CodeEditorArea } from './CodeEditorArea';
import { StatusBar } from './StatusBar';

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

  const activeFile = files.find(file => file.id === activeFileId) || files[0];

  // Update active file when selectedFile changes
  React.useEffect(() => {
    if (selectedFile && selectedFile.type === 'file') {
      const existingFile = files.find(f => f.name === selectedFile.name);
      if (existingFile) {
        setActiveFileId(existingFile.id);
      } else {
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

  const createNewFile = (fileName: string) => {
    const newFile: CodeFile = {
      id: Date.now().toString(),
      name: fileName,
      content: `// ${fileName}\n`,
      language: getLanguageFromFileName(fileName)
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const deleteFile = (fileId: string) => {
    if (files.length <= 1) return;
    
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
      <CodeEditorHeader
        filesCount={files.length}
        onRun={handleRun}
        onSave={handleSave}
        onLoad={handleLoad}
        onDownload={handleDownload}
        onCopy={copyToClipboard}
        onReset={resetFile}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      <Tabs value={activeFileId} onValueChange={setActiveFileId} className="flex-1 flex flex-col">
        <FileTabs
          files={files}
          onDeleteFile={deleteFile}
          onCreateFile={createNewFile}
        />

        {files.map((file) => (
          <TabsContent key={file.id} value={file.id} className="flex-1 m-0">
            <div className="h-full flex flex-col">
              <CodeEditorArea
                file={file}
                onContentChange={updateFileContent}
              />
              <StatusBar file={file} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
