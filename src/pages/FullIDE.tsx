
import React, { useState, useEffect } from 'react';
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
  Zap,
  Play,
  Square,
  RotateCw
} from 'lucide-react';
import { EnhancedAIChatBot } from '@/components/EnhancedAIChatBot';
import { DatabaseManager } from '@/components/DatabaseManager';
import { useToast } from '@/hooks/use-toast';

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
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Load API key and project state from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey) {
      setAiApiKey(savedApiKey);
    }

    // Initialize with default project structure if empty
    if (projectFiles.length === 0) {
      const defaultProject: ProjectFile[] = [
        {
          id: 'src',
          name: 'src',
          type: 'folder',
          children: [
            {
              id: 'app',
              name: 'App.tsx',
              type: 'file',
              content: `import React, { useState } from 'react';

function App() {
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
}

export default App;`
            }
          ]
        }
      ];
      setProjectFiles(defaultProject);
      setPreviewCode(defaultProject[0].children?.[0]?.content || '');
    }
  }, [projectFiles.length]);

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
    
    // Auto-save to localStorage
    localStorage.setItem('ide_project_files', JSON.stringify(files));
  };

  const handleCodeGenerated = (code: string) => {
    console.log('Code generated:', code);
    setPreviewCode(code);
    
    // Update the selected file with the new code
    if (selectedFile) {
      const updatedFiles = updateFileContent(projectFiles, selectedFile.id, code);
      setProjectFiles(updatedFiles);
    }
  };

  const updateFileContent = (files: ProjectFile[], fileId: string, content: string): ProjectFile[] => {
    return files.map(file => {
      if (file.id === fileId) {
        return { ...file, content };
      }
      if (file.children) {
        return { ...file, children: updateFileContent(file.children, fileId, content) };
      }
      return file;
    });
  };

  const handleRunCode = async (code: string) => {
    console.log('Running code:', code);
    setIsRunning(true);
    setPreviewCode(code);
    
    // Simulate build/run process
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "Code executed successfully",
        description: "Your application is now running in the preview panel",
      });
    }, 1000);
  };

  const handleSaveProject = () => {
    localStorage.setItem('ide_project_files', JSON.stringify(projectFiles));
    localStorage.setItem('ide_selected_file', selectedFile?.id || '');
    
    toast({
      title: "Project saved",
      description: "All changes have been saved locally",
    });
  };

  const handleLoadProject = () => {
    const savedFiles = localStorage.getItem('ide_project_files');
    const savedFileId = localStorage.getItem('ide_selected_file');
    
    if (savedFiles) {
      try {
        const parsedFiles = JSON.parse(savedFiles);
        setProjectFiles(parsedFiles);
        
        if (savedFileId) {
          const file = findFileById(parsedFiles, savedFileId);
          if (file) {
            setSelectedFile(file);
            if (file.content) {
              setPreviewCode(file.content);
            }
          }
        }
        
        toast({
          title: "Project loaded",
          description: "Your previous project has been restored",
        });
      } catch (error) {
        toast({
          title: "Load failed",
          description: "Could not load the previous project",
          variant: "destructive"
        });
      }
    }
  };

  const findFileById = (files: ProjectFile[], id: string): ProjectFile | null => {
    for (const file of files) {
      if (file.id === id) {
        return file;
      }
      if (file.children) {
        const found = findFileById(file.children, id);
        if (found) return found;
      }
    }
    return null;
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
                        <h3 className="font-semibold text-white mb-4">Deployment & Actions</h3>
                        <div className="space-y-4">
                          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-medium text-slate-200 mb-2">Project Actions</h4>
                            <div className="space-y-2">
                              <Button 
                                onClick={handleSaveProject}
                                className="w-full bg-blue-600 hover:bg-blue-700"
                              >
                                Save Project
                              </Button>
                              <Button 
                                onClick={handleLoadProject}
                                variant="outline" 
                                className="w-full border-slate-600 text-slate-200 hover:bg-slate-700"
                              >
                                Load Project
                              </Button>
                            </div>
                          </div>
                          
                          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                            <h4 className="font-medium text-slate-200 mb-2">Build Status</h4>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`}></div>
                              <span className="text-sm text-slate-400">
                                {isRunning ? 'Building...' : 'Ready to deploy'}
                              </span>
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
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">AI:</span>
                                <span className="text-white">DeepSeek</span>
                              </div>
                            </div>
                          </div>

                          <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={isRunning}
                          >
                            {isRunning ? (
                              <>
                                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
                                Building...
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                Deploy to Production
                              </>
                            )}
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
                      <div className="border-b border-slate-700 px-4 py-2 flex items-center justify-between">
                        <TabsList className="bg-slate-800">
                          <TabsTrigger value="editor" className="data-[state=active]:bg-slate-700">
                            <Code className="w-4 h-4 mr-2" />
                            Editor
                          </TabsTrigger>
                        </TabsList>
                        
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            onClick={() => selectedFile?.content && handleRunCode(selectedFile.content)}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={!selectedFile?.content || isRunning}
                          >
                            {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <TabsContent value="editor" className="h-full m-0">
                          <CodeEditor 
                            onCodeChange={(files) => {
                              // Update project files when code changes
                              const updatedFiles = files.map(file => ({
                                id: file.id,
                                name: file.name,
                                type: 'file' as const,
                                content: file.content
                              }));
                              console.log('Code editor files changed:', updatedFiles);
                            }}
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
                            Live Preview
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
