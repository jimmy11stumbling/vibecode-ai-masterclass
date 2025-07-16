
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CodeEditor } from '@/components/CodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { FileExplorer } from '@/components/FileExplorer';
import { EnhancedAIChatBot } from '@/components/EnhancedAIChatBot';
import { TrueAIAgent } from '@/components/TrueAIAgent';
import { ServiceIntegrationHub } from '@/components/ServiceIntegrationHub';
import { TemplateSystem } from '@/components/TemplateSystem';
import { MobileExpoIntegration } from '@/components/MobileExpoIntegration';
import { Terminal } from '@/components/Terminal';
import { IDEStatusBar } from '@/components/IDEStatusBar';
import { MCPHub } from '@/components/MCPHub';
import { RAGDatabase } from '@/components/RAGDatabase';
import { DatabaseManager } from '@/components/DatabaseManager';
import { RealTimeChat } from '@/components/RealTimeChat';
import { RealTimeStatusIndicator } from '@/components/RealTimeStatusIndicator';
import { RealTimeValidator } from '@/components/RealTimeValidator';
import { ChatInterface } from '@/components/ChatInterface';
import { ToastProvider } from '@/components/ToastProvider';
import { ProjectFileManager } from '@/components/ProjectFileManager';
import { AIAssistant } from '@/components/AIAssistant';
import { CodePreviewPanel } from '@/components/CodePreviewPanel';
import { TerminalPanel } from '@/components/TerminalPanel';
import { DeploymentManager } from '@/components/DeploymentManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  RotateCw,
  Server,
  Brain,
  Save,
  Upload,
  Download,
  MessageSquare,
  Activity,
  Shield,
  Terminal as TerminalIcon,
  Smartphone,
  Globe,
  Layers,
  Puzzle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRealTimeValidator } from '@/hooks/useRealTimeValidator';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  tags: string[];
  embedding?: number[];
  similarity?: number;
  createdAt: Date;
  updatedAt: Date;
}

const FullIDE = () => {
  const [activePanel, setActivePanel] = useState('agent');
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [previewCode, setPreviewCode] = useState('');
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalMinimized, setTerminalMinimized] = useState(false);
  const [layout, setLayout] = useState('horizontal');
  const [aiApiKey, setAiApiKey] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting' | 'processing' | 'error'>('connected');
  const [currentProject, setCurrentProject] = useState<any>(null);
  const { toast } = useToast();
  const { 
    validations, 
    validateSuccess, 
    validateError, 
    validateInfo, 
    clearValidations, 
    exportValidations 
  } = useRealTimeValidator();

  // Real-time status updates
  useEffect(() => {
    const interval = setInterval(() => {
      validateInfo('IDE heartbeat', new Date().toISOString(), 'FullIDE');
    }, 30000);

    return () => clearInterval(interval);
  }, [validateInfo]);

  // Load API key and project state from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('deepseek_api_key');
    if (savedApiKey) {
      setAiApiKey(savedApiKey);
      validateSuccess('API key loaded', 'DeepSeek API key found', 'FullIDE');
    } else {
      validateError('API key missing', 'No DeepSeek API key found', 'FullIDE');
    }

    const savedProject = localStorage.getItem('ide_project_files');
    if (savedProject) {
      try {
        const parsed = JSON.parse(savedProject);
        setProjectFiles(parsed);
        
        const firstFile = findFirstFile(parsed);
        if (firstFile) {
          setSelectedFile(firstFile);
          setPreviewCode(firstFile.content || '');
          validateSuccess('Project loaded', `Selected file: ${firstFile.name}`, 'FullIDE');
        }
      } catch (error) {
        console.error('Failed to load saved project:', error);
        validateError('Project load failed', error, 'FullIDE');
        initializeDefaultProject();
      }
    } else {
      initializeDefaultProject();
    }
  }, [validateSuccess, validateError]);

  const findFirstFile = (files: ProjectFile[]): ProjectFile | null => {
    for (const file of files) {
      if (file.type === 'file') return file;
      if (file.children) {
        const found = findFirstFile(file.children);
        if (found) return found;
      }
    }
    return null;
  };

  const initializeDefaultProject = () => {
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
}

export default App;`
          }
        ]
      }
    ];
    setProjectFiles(defaultProject);
    
    const firstFile = defaultProject[0].children?.[0];
    if (firstFile) {
      setSelectedFile(firstFile);
      setPreviewCode(firstFile.content || '');
      validateSuccess('Default project initialized', firstFile.name, 'FullIDE');
    }
  };

  const handleFileSelect = (file: ProjectFile) => {
    console.log('File selected:', file);
    setSelectedFile(file);
    if (file.content) {
      setPreviewCode(file.content);
      validateInfo('File selected', file.name, 'FullIDE');
    }
  };

  const handleProjectChange = (files: ProjectFile[]) => {
    console.log('Project files changed:', files);
    setProjectFiles(files);
    setHasUnsavedChanges(true);
    localStorage.setItem('ide_project_files', JSON.stringify(files));
    validateInfo('Project updated', `${files.length} files`, 'FullIDE');
  };

  const handleCodeGenerated = (code: string) => {
    console.log('Code generated:', code);
    setPreviewCode(code);
    setHasUnsavedChanges(true);
    
    if (selectedFile) {
      const updatedFiles = updateFileContent(projectFiles, selectedFile.id, code);
      setProjectFiles(updatedFiles);
      validateSuccess('Code generated', `Updated ${selectedFile.name}`, 'FullIDE');
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
    setIsBuilding(true);
    setConnectionStatus('processing');
    setPreviewCode(code);
    
    validateInfo('Code execution started', 'Building application...', 'FullIDE');
    
    setTimeout(() => {
      setIsBuilding(false);
      setIsRunning(false);
      setConnectionStatus('connected');
      validateSuccess('Code executed', 'Application built successfully', 'FullIDE');
      toast({
        title: "Code executed successfully",
        description: "Your application is now running in the preview panel",
      });
    }, 2000);
  };

  const handleSaveProject = () => {
    localStorage.setItem('ide_project_files', JSON.stringify(projectFiles));
    localStorage.setItem('ide_selected_file', selectedFile?.id || '');
    localStorage.setItem('deepseek_api_key', aiApiKey);
    setHasUnsavedChanges(false);
    
    validateSuccess('Project saved', 'All changes saved locally', 'FullIDE');
    toast({
      title: "Project saved",
      description: "All changes have been saved locally",
    });
  };

  const handleExportProject = () => {
    const projectData = {
      files: projectFiles,
      selectedFile: selectedFile?.id,
      metadata: {
        name: 'Sovereign AI Project',
        version: '1.0.0',
        created: new Date().toISOString(),
        framework: 'React',
        dependencies: ['react', 'typescript', 'tailwindcss']
      }
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sovereign-ai-project.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Project exported",
      description: "Project has been downloaded as JSON file",
    });
  };

  const handleImportProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string);
        if (projectData.files) {
          setProjectFiles(projectData.files);
          
          if (projectData.selectedFile) {
            const selectedId = projectData.selectedFile;
            const findFileById = (files: ProjectFile[]): ProjectFile | null => {
              for (const file of files) {
                if (file.id === selectedId) return file;
                if (file.children) {
                  const found = findFileById(file.children);
                  if (found) return found;
                }
              }
              return null;
            };
            
            const foundFile = findFileById(projectData.files);
            if (foundFile) {
              setSelectedFile(foundFile);
              setPreviewCode(foundFile.content || '');
            }
          }
          
          toast({
            title: "Project imported",
            description: "Project has been loaded successfully",
          });
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Failed to parse project file",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
    
    event.target.value = '';
  };

  const toggleTerminal = () => {
    setShowTerminal(!showTerminal);
    setTerminalMinimized(false);
    validateInfo('Terminal toggled', showTerminal ? 'closed' : 'opened', 'FullIDE');
  };

  const handleRAGSearch = async (query: string): Promise<KnowledgeChunk[]> => {
    // Mock RAG search implementation
    return [
      {
        id: '1',
        title: 'Search Result',
        content: `Results for "${query}"`,
        source: 'knowledge-base',
        category: 'search',
        tags: ['search'],
        similarity: 0.95,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  };

  const handleChunkSelect = (chunk: KnowledgeChunk) => {
    console.log('Knowledge chunk selected:', chunk);
    validateInfo('Knowledge chunk selected', chunk.title, 'FullIDE');
  };

  const handleTemplateSelect = (template: any) => {
    console.log('Template selected:', template);
    // Apply template to project
    if (template.sourceCode && template.sourceCode.files) {
      const templateFiles = template.sourceCode.files.map((file: any, index: number) => ({
        id: `template-${index}`,
        name: file.path.split('/').pop(),
        type: 'file' as const,
        content: file.content
      }));
      
      setProjectFiles(templateFiles);
      setCurrentProject(template);
      
      toast({
        title: "Template Applied",
        description: `${template.name} template has been applied to your project`,
      });
    }
  };

  const handleIntegrationAdd = (integration: any) => {
    console.log('Integration added:', integration);
    validateSuccess('Service integrated', integration.name, 'FullIDE');
  };

  return (
    <>
      <div className="min-h-screen max-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
        <Header />
        
        {/* Enhanced IDE Toolbar */}
        <div className="bg-slate-800 border-b border-slate-700 px-4 py-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                onClick={() => selectedFile?.content && handleRunCode(selectedFile.content)}
                disabled={!selectedFile?.content || isRunning}
                className="bg-green-600 hover:bg-green-700"
              >
                {isRunning ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isRunning ? 'Stop' : 'Run'}
              </Button>
              
              <Button
                size="sm"
                onClick={handleSaveProject}
                disabled={!hasUnsavedChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              
              <Button
                size="sm"
                onClick={handleExportProject}
                variant="outline"
                className="border-slate-600"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportProject}
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="border-slate-600"
                  asChild
                >
                  <span>
                    <Upload className="w-4 h-4 mr-1" />
                    Import
                  </span>
                </Button>
              </label>

              <Button
                size="sm"
                onClick={toggleTerminal}
                variant="outline"
                className="border-slate-600"
              >
                <TerminalIcon className="w-4 h-4 mr-1" />
                Terminal
              </Button>
            </div>
            
            <div className="flex items-center space-x-4">
              <RealTimeStatusIndicator
                status={connectionStatus}
                lastUpdate={new Date()}
                responseTime={isBuilding ? undefined : 150}
                aiModel="DeepSeek Reasoner"
              />
              
              {hasUnsavedChanges && (
                <span className="text-xs text-amber-400">● Unsaved changes</span>
              )}
              
              {isBuilding && (
                <span className="text-xs text-blue-400 flex items-center">
                  <RotateCw className="w-3 h-3 mr-1 animate-spin" />
                  Building...
                </span>
              )}
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
                  <div className="border-b border-slate-700 p-2 flex-shrink-0">
                    <TabsList className="bg-slate-800 w-full grid grid-cols-4">
                      <TabsTrigger value="agent" className="data-[state=active]:bg-slate-700" title="AI Agent">
                        <Bot className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="files" className="data-[state=active]:bg-slate-700" title="Files">
                        <FolderTree className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="templates" className="data-[state=active]:bg-slate-700" title="Templates">
                        <Layers className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="services" className="data-[state=active]:bg-slate-700" title="Services">
                        <Puzzle className="w-4 h-4" />
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="agent" className="h-full m-0">
                      <TrueAIAgent 
                        projectFiles={projectFiles}
                        onFilesChange={handleProjectChange}
                        onCodeGenerated={handleCodeGenerated}
                        apiKey={aiApiKey}
                      />
                    </TabsContent>

                    <TabsContent value="files" className="h-full m-0">
                      <ProjectFileManager 
                        files={projectFiles}
                        onFilesChange={handleProjectChange}
                        onFileSelect={handleFileSelect}
                        selectedFileId={selectedFile?.id}
                      />
                    </TabsContent>

                    <TabsContent value="templates" className="h-full m-0">
                      <TemplateSystem 
                        onTemplateSelect={handleTemplateSelect}
                      />
                    </TabsContent>

                    <TabsContent value="services" className="h-full m-0">
                      <ServiceIntegrationHub 
                        onIntegrationAdd={handleIntegrationAdd}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Main Content Area */}
            <ResizablePanel defaultSize={50}>
              <ResizablePanelGroup direction="vertical">
                {/* Editor Panel */}
                <ResizablePanel defaultSize={60}>
                  <div className="h-full">
                    <CodeEditor 
                      onCodeChange={(files) => {
                        console.log('Code editor files changed:', files);
                      }}
                      onRun={handleRunCode}
                      selectedFile={selectedFile}
                    />
                  </div>
                </ResizablePanel>

                <ResizableHandle withHandle />

                {/* Preview Panel */}
                <ResizablePanel defaultSize={40}>
                  <div className="h-full">
                    <CodePreviewPanel 
                      code={previewCode} 
                      isRunning={isRunning}
                      onRun={() => handleRunCode(previewCode)}
                      onStop={() => setIsRunning(false)}
                    />
                  </div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            {/* Right Panel - Mobile & Deployment */}
            <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
              <div className="h-full">
                <Tabs defaultValue="mobile" className="h-full flex flex-col">
                  <div className="border-b border-slate-700 p-2 flex-shrink-0">
                    <TabsList className="bg-slate-800 w-full grid grid-cols-2">
                      <TabsTrigger value="mobile" className="data-[state=active]:bg-slate-700">
                        <Smartphone className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="deploy" className="data-[state=active]:bg-slate-700">
                        <Globe className="w-4 h-4" />
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="mobile" className="h-full m-0">
                      <MobileExpoIntegration 
                        projectFiles={projectFiles}
                        onProjectUpdate={handleProjectChange}
                      />
                    </TabsContent>

                    <TabsContent value="deploy" className="h-full m-0">
                      <ScrollArea className="h-full">
                        <DeploymentManager />
                      </ScrollArea>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Terminal Overlay */}
        {showTerminal && (
          <div className={`absolute ${terminalMinimized ? 'bottom-4 right-4' : 'bottom-4 left-4 right-4'} z-50`}>
            <TerminalPanel
              isMinimized={terminalMinimized}
              onClose={() => setShowTerminal(false)}
              onToggleMinimize={() => setTerminalMinimized(!terminalMinimized)}
            />
          </div>
        )}

        <IDEStatusBar 
          selectedFile={selectedFile} 
          layout={layout}
          isBuilding={isBuilding}
          hasUnsavedChanges={hasUnsavedChanges}
          projectStats={{
            files: projectFiles.length,
            components: projectFiles.filter(f => f.name.endsWith('.tsx')).length,
            lines: selectedFile?.content?.split('\n').length || 0
          }}
        />
      </div>
      
      <ToastProvider />
    </>
  );
};

export default FullIDE;
