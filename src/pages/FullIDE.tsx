
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { CodeEditor } from '@/components/CodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { ProjectManager } from '@/components/ProjectManager';
import { AIChatBot } from '@/components/AIChatBot';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Eye, 
  FolderTree, 
  Bot, 
  Terminal, 
  Settings,
  Play,
  Save,
  Download
} from 'lucide-react';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

const FullIDE = () => {
  const [activePanel, setActivePanel] = useState('editor');
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [previewCode, setPreviewCode] = useState('');

  const handleFileSelect = (file: ProjectFile) => {
    setSelectedFile(file);
    if (file.content) {
      setPreviewCode(file.content);
    }
  };

  const handleProjectChange = (files: ProjectFile[]) => {
    setProjectFiles(files);
  };

  const handleCodeGenerated = (code: string) => {
    setPreviewCode(code);
  };

  const handleRunCode = (code: string) => {
    setPreviewCode(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      <Header />
      
      {/* IDE Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-white font-semibold">Vibecode IDE</h1>
            <div className="flex items-center space-x-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Play className="w-4 h-4 mr-2" />
                Run
              </Button>
              <Button size="sm" variant="outline" className="border-slate-600">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button size="sm" variant="outline" className="border-slate-600">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" className="text-slate-400">
              <Terminal className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-slate-400">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 bg-slate-900 border-r border-slate-700 flex flex-col">
          <Tabs value={activePanel} onValueChange={setActivePanel} className="h-full flex flex-col">
            <div className="border-b border-slate-700 p-2">
              <TabsList className="bg-slate-800 w-full">
                <TabsTrigger value="files" className="flex-1 data-[state=active]:bg-slate-700">
                  <FolderTree className="w-4 h-4 mr-2" />
                  Files
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex-1 data-[state=active]:bg-slate-700">
                  <Bot className="w-4 h-4 mr-2" />
                  AI
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="files" className="h-full m-0">
                <ProjectManager 
                  onFileSelect={handleFileSelect}
                  onProjectChange={handleProjectChange}
                />
              </TabsContent>

              <TabsContent value="ai" className="h-full m-0">
                <AIChatBot 
                  context={selectedFile ? `Working on: ${selectedFile.name}` : undefined}
                  onCodeGenerated={handleCodeGenerated}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Editor/Preview Tabs */}
          <Tabs defaultValue="editor" className="h-full flex flex-col">
            <div className="border-b border-slate-700 px-4 py-2">
              <TabsList className="bg-slate-800">
                <TabsTrigger value="editor" className="data-[state=active]:bg-slate-700">
                  <Code className="w-4 h-4 mr-2" />
                  Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-slate-700">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="split" className="data-[state=active]:bg-slate-700">
                  Split View
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="editor" className="h-full m-0">
                <CodeEditor 
                  onCodeChange={() => {}}
                  onRun={handleRunCode}
                />
              </TabsContent>

              <TabsContent value="preview" className="h-full m-0">
                <LivePreview code={previewCode} />
              </TabsContent>

              <TabsContent value="split" className="h-full m-0">
                <div className="h-full flex">
                  <div className="flex-1 border-r border-slate-700">
                    <CodeEditor 
                      onCodeChange={() => {}}
                      onRun={handleRunCode}
                    />
                  </div>
                  <div className="flex-1">
                    <LivePreview code={previewCode} />
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>Ready</span>
            <span>•</span>
            <span>JavaScript</span>
            <span>•</span>
            <span>UTF-8</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Ln 1, Col 1</span>
            <span>•</span>
            <span>Spaces: 2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullIDE;
