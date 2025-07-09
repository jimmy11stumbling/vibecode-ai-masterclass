
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { CodeEditor } from '@/components/CodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { ProjectManager } from '@/components/ProjectManager';
import { AIChatBot } from '@/components/AIChatBot';
import { Terminal } from '@/components/Terminal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { 
  Code, 
  Eye, 
  FolderTree, 
  Bot, 
  Terminal as TerminalIcon, 
  Settings,
  Play,
  Save,
  Download,
  Maximize2,
  Layout
} from 'lucide-react';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

const FullIDE = () => {
  const [activePanel, setActivePanel] = useState('files');
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [previewCode, setPreviewCode] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const [layout, setLayout] = useState('horizontal'); // 'horizontal' | 'vertical'

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

  const toggleTerminal = () => {
    setShowTerminal(!showTerminal);
    setTerminalMinimized(false);
  };

  const closeTerminal = () => {
    setShowTerminal(false);
    setTerminalMinimized(false);
  };

  const toggleTerminalMinimize = () => {
    setTerminalMinimized(!terminalMinimized);
  };

  const toggleLayout = () => {
    setLayout(layout === 'horizontal' ? 'vertical' : 'horizontal');
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
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-400"
              onClick={toggleTerminal}
            >
              <TerminalIcon className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-400"
              onClick={toggleLayout}
            >
              <Layout className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-slate-400">
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-slate-400">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main IDE Layout */}
      <div className="flex-1 flex overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full bg-slate-900 border-r border-slate-700 flex flex-col">
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
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content Area */}
          <ResizablePanel defaultSize={75}>
            <ResizablePanelGroup direction={layout === 'horizontal' ? 'horizontal' : 'vertical'}>
              {/* Editor Panel */}
              <ResizablePanel defaultSize={50}>
                <div className="h-full">
                  <Tabs defaultValue="editor" className="h-full flex flex-col">
                    <div className="border-b border-slate-700 px-4 py-2">
                      <TabsList className="bg-slate-800">
                        <TabsTrigger value="editor" className="data-[state=active]:bg-slate-700">
                          <Code className="w-4 h-4 mr-2" />
                          Editor
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <TabsContent value="editor" className="h-full m-0">
                        <CodeEditor 
                          onCodeChange={() => {}}
                          onRun={handleRunCode}
                          selectedFile={selectedFile}
                        />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </ResizablePanel>

              <ResizableHandle withHandle />

              {/* Preview Panel */}
              <ResizablePanel defaultSize={50}>
                <div className="h-full">
                  <Tabs defaultValue="preview" className="h-full flex flex-col">
                    <div className="border-b border-slate-700 px-4 py-2">
                      <TabsList className="bg-slate-800">
                        <TabsTrigger value="preview" className="data-[state=active]:bg-slate-700">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <TabsContent value="preview" className="h-full m-0">
                        <LivePreview code={previewCode} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Terminal Overlay */}
      {showTerminal && (
        <div className={`absolute ${terminalMinimized ? 'bottom-4 right-4' : 'bottom-4 left-4 right-4'} z-50`}>
          <Terminal
            onClose={closeTerminal}
            isMinimized={terminalMinimized}
            onToggleMinimize={toggleTerminalMinimize}
          />
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-slate-800 border-t border-slate-700 px-4 py-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <span>Ready</span>
            <span>•</span>
            <span>TypeScript</span>
            <span>•</span>
            <span>UTF-8</span>
            {selectedFile && (
              <>
                <span>•</span>
                <span>{selectedFile.name}</span>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>Ln 1, Col 1</span>
            <span>•</span>
            <span>Spaces: 2</span>
            <span>•</span>
            <span>Layout: {layout}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullIDE;
