
import React, { useState, useEffect } from 'react';
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
          React Counter
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

  const activeFile = files.find(file => file.id === activeFileId) || files[0];

  // Update active file when selectedFile changes
  useEffect(() => {
    if (selectedFile && selectedFile.type === 'file' && selectedFile.content) {
      const existingFile = files.find(f => f.name === selectedFile.name);
      if (existingFile) {
        setActiveFileId(existingFile.id);
      } else {
        const newFile: CodeFile = {
          id: Date.now().toString(),
          name: selectedFile.name,
          content: selectedFile.content,
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

  const updateFileContent = (fileId: string, content: string) => {
    const updatedFiles = files.map(file =>
      file.id === fileId ? { ...file, content } : file
    );
    setFiles(updatedFiles);
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

  const deleteFile = (fileId: string) => {
    if (files.length <= 1) return;
    
    const updatedFiles = files.filter(file => file.id !== fileId);
    setFiles(updatedFiles);
    
    if (activeFileId === fileId) {
      setActiveFileId(updatedFiles[0]?.id || '');
    }
  };

  const handleRun = () => {
    console.log('Running code:', activeFile.content);
    onRun?.(activeFile.content);
  };

  const handleSave = () => {
    console.log('Saving files...', files);
    localStorage.setItem('ide_files', JSON.stringify(files));
    
    // Show save confirmation
    const event = new CustomEvent('show-toast', {
      detail: { message: 'Files saved successfully!', type: 'success' }
    });
    window.dispatchEvent(event);
  };

  const handleLoad = () => {
    const savedFiles = localStorage.getItem('ide_files');
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        setFiles(parsedFiles);
        setActiveFileId(parsedFiles[0]?.id || '');
        
        const event = new CustomEvent('show-toast', {
          detail: { message: 'Files loaded successfully!', type: 'success' }
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error('Error loading files:', error);
        const event = new CustomEvent('show-toast', {
          detail: { message: 'Error loading files', type: 'error' }
        });
        window.dispatchEvent(event);
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

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      const event = new CustomEvent('show-toast', {
        detail: { message: 'Code copied to clipboard!', type: 'success' }
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const resetFile = () => {
    const template = getFileTemplate(activeFile.language, activeFile.name);
    updateFileContent(activeFile.id, template);
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
