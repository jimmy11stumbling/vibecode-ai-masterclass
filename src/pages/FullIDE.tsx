
import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { CodeEditor } from '@/components/CodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { ProjectManager } from '@/components/ProjectManager';
import { AIChatBot } from '@/components/AIChatBot';
import { Terminal } from '@/components/Terminal';
import { IDEToolbar } from '@/components/IDEToolbar';
import { IDEStatusBar } from '@/components/IDEStatusBar';
import { ToastProvider } from '@/components/ToastProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { 
  Code, 
  Eye, 
  FolderTree, 
  Bot,
  Database,
  Settings,
  Zap
} from 'lucide-react';
import { EnhancedAIChatBot } from '@/components/EnhancedAIChatBot';
import { DatabaseManager } from '@/components/DatabaseManager';

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
  const [layout, setLayout] = useState('horizontal');
  const [aiApiKey, setAiApiKey] = useState('');

  // Load API key from localStorage
  React.useEffect(() => {
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey) {
      setAiApiKey(savedApiKey);
    }
  }, []);

  const handleFileSelect = (file: ProjectFile) => {
    console.log('File selected:', file);
    setSelectedFile(file);
    if (file.content) {
      setPreviewCode(file.content);
    }
  };

  const handleProjectChange = (files: ProjectFile[]) => {
    console.log('Project files changed:', files);
    setProjectFiles(files);
  };

  const handleCodeGenerated = (code: string) => {
    console.log('Code generated:', code);
    setPreviewCode(code);
  };

  const handleRunCode = (code: string) => {
    console.log('Running code:', code);
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <Header />
        
        <IDEToolbar 
          onToggleTerminal={toggleTerminal}
          onToggleLayout={toggleLayout}
          layout={layout}
        />

        {/* Main IDE Layout */}
        <div className="flex-1 flex overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Left Sidebar */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full bg-slate-900 border-r border-slate-700 flex flex-col">
                <Tabs value={activePanel} onValueChange={setActivePanel} className="h-full flex flex-col">
                  <div className="border-b border-slate-700 p-2">
                    <TabsList className="bg-slate-800 w-full grid grid-cols-4">
                      <TabsTrigger value="files" className="data-[state=active]:bg-slate-700">
                        <FolderTree className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="ai" className="data-[state=active]:bg-slate-700">
                        <Bot className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="database" className="data-[state=active]:bg-slate-700">
                        <Database className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="deploy" className="data-[state=active]:bg-slate-700">
                        <Zap className="w-4 h-4" />
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
                      <EnhancedAIChatBot 
                        projectFiles={projectFiles}
                        onFilesChange={setProjectFiles}
                        onCodeGenerated={handleCodeGenerated}
                        apiKey={aiApiKey}
                      />
                    </TabsContent>

                    <TabsContent value="database" className="h-full m-0">
                      <DatabaseManager 
                        onSchemaChange={(tables) => {
                          console.log('Database schema updated:', tables);
                        }}
                      />
                    </TabsContent>

                    <TabsContent value="deploy" className="h-full m-0">
                      <div className="p-4">
                        <h3 className="font-semibold text-white mb-4">Deployment</h3>
                        <div className="space-y-4">
                          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-medium text-slate-200 mb-2">Build Status</h4>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-sm text-slate-400">Ready to deploy</span>
                            </div>
                          </div>
                          
                          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-medium text-slate-200 mb-2">Environment</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Framework:</span>
                                <span className="text-white">React + TypeScript</span>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Database:</span>
                                <span className="text-white">Supabase</span>
                              </div>
                            </div>
                          </div>

                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <Zap className="w-4 h-4 mr-2" />
                            Deploy to Production
                          </Button>
                        </div>
                      </div>
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

        <IDEStatusBar selectedFile={selectedFile} layout={layout} />
      </div>
      
      <ToastProvider />
    </>
  );
};

export default FullIDE;
