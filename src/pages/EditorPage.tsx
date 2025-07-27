import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MonacoCodeEditor } from '@/components/MonacoCodeEditor';
import { CodeEditor } from '@/components/CodeEditor';
import { RealTimeCodeEditor } from '@/components/RealTimeCodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { FileExplorer } from '@/components/FileExplorer';
import { TerminalPanel } from '@/components/TerminalPanel';
import { 
  Code, 
  Play, 
  Save, 
  FolderOpen, 
  Terminal, 
  Eye, 
  Settings,
  GitBranch,
  RefreshCw,
  Download,
  Upload
} from 'lucide-react';

interface File {
  id: string;
  name: string;
  content: string;
  language: string;
  modified: boolean;
  lastModified: Date;
}

export default function EditorPage() {
  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([
    {
      id: '1',
      name: 'index.html',
      content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sovereign IDE - Code Editor</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .container { max-width: 800px; margin: 0 auto; }
        h1 { color: #333; text-align: center; }
        .demo { padding: 20px; background: #f5f5f5; border-radius: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Sovereign IDE</h1>
        <div class="demo">
            <p>This is a live preview of your HTML code.</p>
            <button onclick="alert('Hello from Sovereign IDE!')">Click me!</button>
        </div>
    </div>
</body>
</html>`,
      language: 'html',
      modified: false,
      lastModified: new Date()
    },
    {
      id: '2',
      name: 'script.js',
      content: `// Sovereign IDE - JavaScript Example
console.log('Welcome to Sovereign IDE!');

// Example function
function greetUser(name) {
    return \`Hello, \${name}! Welcome to the code editor.\`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded successfully');
    
    // Example API call
    fetch('/api/status')
        .then(response => response.json())
        .then(data => console.log('API Status:', data))
        .catch(error => console.error('API Error:', error));
});

// Example class
class ProjectManager {
    constructor(name) {
        this.name = name;
        this.projects = [];
    }
    
    addProject(project) {
        this.projects.push(project);
        console.log(\`Project \${project} added to \${this.name}\`);
    }
    
    listProjects() {
        return this.projects;
    }
}

const manager = new ProjectManager('Sovereign IDE');
manager.addProject('Web Application');
manager.addProject('Mobile App');`,
      language: 'javascript',
      modified: false,
      lastModified: new Date()
    },
    {
      id: '3',
      name: 'styles.css',
      content: `/* Sovereign IDE - CSS Styles */
:root {
    --primary-color: #3b82f6;
    --secondary-color: #6366f1;
    --background-color: #f8fafc;
    --text-color: #1e293b;
    --border-color: #e2e8f0;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.header {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    padding: 2rem 0;
    text-align: center;
    border-radius: 12px;
    margin-bottom: 2rem;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    border: 1px solid var(--border-color);
    margin-bottom: 1rem;
}

.button {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
}

.button:hover {
    background: #2563eb;
}

.grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}`,
      language: 'css',
      modified: false,
      lastModified: new Date()
    }
  ]);
  const [isPreviewVisible, setIsPreviewVisible] = useState(true);
  const [isTerminalVisible, setIsTerminalVisible] = useState(false);

  const handleFileSelect = (file: File) => {
    setActiveFile(file);
  };

  const handleCodeChange = (newCode: string) => {
    if (activeFile) {
      const updatedFile = { ...activeFile, content: newCode, modified: true };
      setActiveFile(updatedFile);
      setFiles(files.map(f => f.id === activeFile.id ? updatedFile : f));
    }
  };

  const handleSaveFile = () => {
    if (activeFile) {
      const savedFile = { ...activeFile, modified: false };
      setActiveFile(savedFile);
      setFiles(files.map(f => f.id === activeFile.id ? savedFile : f));
      console.log('File saved:', activeFile.name);
    }
  };

  const handleRunCode = () => {
    if (activeFile) {
      console.log('Running code:', activeFile.name);
      // Implement code execution logic
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="bg-background border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Code Editor</h1>
            {activeFile && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{activeFile.language}</Badge>
                <span className="text-sm text-muted-foreground">
                  {activeFile.name}
                  {activeFile.modified && <span className="text-orange-500"> •</span>}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveFile}
              disabled={!activeFile?.modified}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunCode}
              disabled={!activeFile}
            >
              <Play className="h-4 w-4 mr-2" />
              Run
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewVisible(!isPreviewVisible)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTerminalVisible(!isTerminalVisible)}
            >
              <Terminal className="h-4 w-4 mr-2" />
              Terminal
            </Button>
            
            <Button variant="outline" size="sm">
              <GitBranch className="h-4 w-4 mr-2" />
              Git
            </Button>
            
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-64 bg-background border-r border-border">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold mb-2">Files</h3>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <FolderOpen className="h-4 w-4 mr-1" />
                Open
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="p-2">
            {files.map((file) => (
              <div
                key={file.id}
                className={`p-2 rounded cursor-pointer hover:bg-accent ${
                  activeFile?.id === file.id ? 'bg-accent' : ''
                }`}
                onClick={() => handleFileSelect(file)}
              >
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4" />
                  <span className="text-sm">{file.name}</span>
                  {file.modified && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor and Preview */}
        <div className="flex-1 flex">
          {/* Code Editor */}
          <div className={`${isPreviewVisible ? 'w-1/2' : 'w-full'} flex flex-col`}>
            <div className="bg-background border-b border-border p-2">
              <Tabs defaultValue="monaco" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="monaco">Monaco Editor</TabsTrigger>
                  <TabsTrigger value="simple">Simple Editor</TabsTrigger>
                  <TabsTrigger value="realtime">Real-time</TabsTrigger>
                </TabsList>
                
                <div className="mt-2 h-[calc(100vh-200px)]">
                  <TabsContent value="monaco" className="h-full">
                    {activeFile && (
                      <MonacoCodeEditor
                        file={activeFile}
                        onContentChange={(fileId, content) => handleCodeChange(content)}
                        onRun={handleRunCode}
                        onSave={handleSaveFile}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="simple" className="h-full">
                    <CodeEditor
                      onCodeChange={(files) => console.log('Files changed:', files)}
                      onRun={handleRunCode}
                      selectedFile={activeFile}
                    />
                  </TabsContent>
                  
                  <TabsContent value="realtime" className="h-full">
                    <RealTimeCodeEditor
                      initialFiles={activeFile ? [activeFile] : []}
                      onCodeChange={(files) => {
                        if (files.length > 0) {
                          handleCodeChange(files[0].content);
                        }
                      }}
                      onExecute={handleRunCode}
                      autoSave={true}
                      hotReload={true}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>

          {/* Live Preview */}
          {isPreviewVisible && (
            <div className="w-1/2 border-l border-border">
              <div className="bg-background border-b border-border p-2 flex items-center justify-between">
                <h3 className="font-semibold">Live Preview</h3>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="h-[calc(100vh-200px)]">
                <LivePreview
                  code={activeFile?.content || ''}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terminal */}
      {isTerminalVisible && (
        <div className="h-64 border-t border-border">
          <TerminalPanel />
        </div>
      )}
    </div>
  );
}