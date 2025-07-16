
import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code2, 
  FileText, 
  Terminal, 
  Globe, 
  Settings, 
  Database,
  Brain,
  Plug,
  Users,
  Zap,
  Smartphone,
  Layout,
  Bot,
  Crown,
  Command,
  Activity,
  BarChart3,
  Shield,
  Cpu,
  TestTube,
  Rocket,
  Eye,
  GitBranch
} from 'lucide-react';

// Import all production components
import { MonacoCodeEditor } from '@/components/MonacoCodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { FileExplorer } from '@/components/FileExplorer';
import { TerminalPanel } from '@/components/TerminalPanel';
import { ConsoleLogger } from '@/components/ConsoleLogger';
import { IDEToolbar } from '@/components/IDEToolbar';
import { IDEStatusBar } from '@/components/IDEStatusBar';
import { EnhancedAIChatBot } from '@/components/EnhancedAIChatBot';
import { TrueAIAgent } from '@/components/TrueAIAgent';
import { ServiceIntegrationHub } from '@/components/ServiceIntegrationHub';
import { TemplateSystem } from '@/components/TemplateSystem';
import { MobileExpoIntegration } from '@/components/MobileExpoIntegration';
import { AdvancedRAGInterface } from '@/components/AdvancedRAGInterface';
import { MCPProtocolInterface } from '@/components/MCPProtocolInterface';
import { A2AProtocolInterface } from '@/components/A2AProtocolInterface';
import { DatabaseManager } from '@/components/DatabaseManager';
import { DeploymentManager } from '@/components/DeploymentManager';
import { AgentDashboard } from '@/components/AgentDashboard';
import { SovereignDashboard } from '@/components/SovereignDashboard';
import { SovereignCommandInterface } from '@/components/SovereignCommandInterface';
import { SovereignIDE } from '@/components/SovereignIDE';

// Import new production components
import { PredictiveCodeCompletion } from '@/components/PredictiveCodeCompletion';
import { RealTimeCollaboration } from '@/components/RealTimeCollaboration';
import { AdvancedProjectAnalytics } from '@/components/AdvancedProjectAnalytics';
import { AutomatedTestingSuite } from '@/components/AutomatedTestingSuite';

// Import services
import { masterControlProgram } from '@/services/masterControlProgram';
import { realAICodeGenerator } from '@/services/realAICodeGenerator';
import { intelligentDebugger } from '@/services/intelligentDebugger';
import { productionRAGSystem } from '@/services/productionRAGSystem';
import { deploymentOrchestrator } from '@/services/deploymentOrchestrator';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: ProjectFile[];
  path: string;
  size?: number;
  lastModified?: Date;
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: string;
}

const FullIDE = () => {
  const [activeFile, setActiveFile] = useState<ProjectFile | null>(null);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([
    {
      id: '1',
      name: 'src',
      type: 'folder',
      path: 'src',
      children: [
        {
          id: '2',
          name: 'App.tsx',
          type: 'file',
          path: 'src/App.tsx',
          language: 'typescript',
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
          lastModified: new Date()
        }
      ]
    }
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeAITab, setActiveAITab] = useState('sovereign-control');
  const [activeToolTab, setActiveToolTab] = useState('database');
  const [activeRightTab, setActiveRightTab] = useState('sovereign-ai');
  const [activeBottomTab, setActiveBottomTab] = useState('preview');
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState('ready');
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });
  const [showCollaboration, setShowCollaboration] = useState(true);
  const [showCodeCompletion, setShowCodeCompletion] = useState(true);

  const handleFileSelect = (file: ProjectFile) => {
    const extension = file.name.split('.').pop() || '';
    const languageMap: { [key: string]: string } = {
      'tsx': 'typescript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'js': 'javascript',
      'css': 'css',
      'html': 'html',
      'json': 'json',
      'md': 'markdown'
    };

    const fileWithLanguage = {
      ...file,
      language: languageMap[extension] || 'plaintext',
      content: file.content || '',
      path: file.path || file.name
    };

    setActiveFile(fileWithLanguage);
  };

  const handleFilesChange = (files: ProjectFile[]) => {
    setProjectFiles(files);
  };

  const handleLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  const handleSovereignRequest = async (prompt: string) => {
    try {
      setIsAgentProcessing(true);
      setAgentStatus('processing');
      
      console.log('🧠 Sovereign AI: Processing request:', prompt);
      
      const result = await masterControlProgram.processUserRequest(prompt, {
        projectFiles,
        activeFile,
        systemContext: 'production-ide'
      });
      
      console.log('✅ Sovereign AI: Request completed:', result);
      setAgentStatus('success');
      
      handleLog({
        id: `log_${Date.now()}`,
        timestamp: new Date(),
        level: 'info',
        message: `Sovereign AI completed request: ${prompt.substring(0, 50)}...`,
        context: 'Master Control Program'
      });
      
    } catch (error) {
      console.error('❌ Sovereign AI: Request failed:', error);
      setAgentStatus('error');
      
      handleLog({
        id: `log_${Date.now()}`,
        timestamp: new Date(),
        level: 'error',
        message: `Sovereign AI request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        context: 'Master Control Program'
      });
    } finally {
      setIsAgentProcessing(false);
    }
  };

  const handleCodeSuggestionApply = async (suggestion: any) => {
    if (!activeFile) return;

    try {
      // Apply the suggestion to the current file
      const updatedContent = suggestion.code;
      
      setProjectFiles(prev => {
        const updateFile = (files: ProjectFile[]): ProjectFile[] => {
          return files.map(f => {
            if (f.id === activeFile.id) {
              return { ...f, content: updatedContent, lastModified: new Date() };
            } else if (f.type === 'folder' && f.children) {
              return { ...f, children: updateFile(f.children) };
            }
            return f;
          });
        };
        return updateFile(prev);
      });

      handleLog({
        id: `log_${Date.now()}`,
        timestamp: new Date(),
        level: 'info',
        message: `Applied AI suggestion: ${suggestion.description}`,
        context: 'Code Completion'
      });
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  const createCodeFile = (file: ProjectFile | null) => {
    if (!file) return null;
    return {
      id: file.id,
      name: file.name,
      content: file.content || '',
      language: file.language || 'plaintext'
    };
  };

  const handleProjectGenerated = (project: any) => {
    console.log('Project generated:', project);
    handleLog({
      id: `log_${Date.now()}`,
      timestamp: new Date(),
      level: 'info',
      message: `New project generated: ${project.executionId}`,
      context: 'Sovereign IDE'
    });
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col overflow-hidden">
      {/* Enhanced Production Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Sovereign IDE
            </span>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              Production v2.0
            </Badge>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" onClick={() => setShowCollaboration(!showCollaboration)}>
              <Users className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowCodeCompletion(!showCodeCompletion)}>
              <Brain className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <GitBranch className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <IDEToolbar 
          onRun={() => console.log('Run project')}
          onStop={() => console.log('Stop project')}
          onSave={() => console.log('Save project')}
          onExport={() => console.log('Export project')}
          onImport={() => console.log('Import project')}
          onSettings={() => console.log('Open settings')}
          onToggleTerminal={() => console.log('Toggle terminal')}
          isRunning={false}
          hasUnsavedChanges={false}
          isBuilding={isAgentProcessing}
        />
      </div>
      
      {/* Main Production IDE Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Enhanced File Explorer & Tools */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-slate-900 border-r border-slate-700 flex flex-col">
              <Tabs defaultValue="files" className="h-full flex flex-col">
                <div className="border-b border-slate-700 px-2 py-1 flex-shrink-0">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800 h-8">
                    <TabsTrigger value="files" className="text-xs data-[state=active]:bg-slate-700">
                      <FileText className="w-3 h-3 mr-1" />
                      Files
                    </TabsTrigger>
                    <TabsTrigger value="tools" className="text-xs data-[state=active]:bg-slate-700">
                      <Settings className="w-3 h-3 mr-1" />
                      Tools
                    </TabsTrigger>
                    <TabsTrigger value="sovereign" className="text-xs data-[state=active]:bg-slate-700">
                      <Crown className="w-3 h-3 mr-1" />
                      AI
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="files" className="flex-1 m-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <FileExplorer onFileSelect={handleFileSelect} onProjectChange={handleFilesChange} />
                  </ScrollArea>
                </TabsContent>
                
                <TabsContent value="tools" className="flex-1 m-0 overflow-hidden">
                  <div className="h-full">
                    <Tabs value={activeToolTab} onValueChange={setActiveToolTab} className="h-full flex flex-col">
                      <div className="border-b border-slate-700 px-2 py-1 flex-shrink-0">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-800 h-8 text-xs">
                          <TabsTrigger value="database" className="data-[state=active]:bg-slate-700">
                            <Database className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="deploy" className="data-[state=active]:bg-slate-700">
                            <Rocket className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="mobile" className="data-[state=active]:bg-slate-700">
                            <Smartphone className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="test" className="data-[state=active]:bg-slate-700">
                            <TestTube className="w-3 h-3" />
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <TabsContent value="database" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <DatabaseManager onSchemaChange={() => {}} />
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="deploy" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <DeploymentManager />
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="mobile" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <MobileExpoIntegration 
                            projectFiles={projectFiles}
                            onProjectUpdate={() => {}}
                          />
                        </ScrollArea>
                      </TabsContent>

                      <TabsContent value="test" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <div className="p-2">
                            <AutomatedTestingSuite />
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>

                <TabsContent value="sovereign" className="flex-1 m-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <SovereignIDE onProjectGenerated={handleProjectGenerated} />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel - Enhanced Code Editor & Preview */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor with AI Features */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="h-full bg-slate-900 border-b border-slate-700 relative">
                  <MonacoCodeEditor
                    file={createCodeFile(activeFile)}
                    onContentChange={(fileId, content) => {
                      if (activeFile) {
                        setProjectFiles(prev => {
                          const updateFile = (files: ProjectFile[]): ProjectFile[] => {
                            return files.map(f => {
                              if (f.id === activeFile.id) {
                                return { ...f, content, lastModified: new Date() };
                              } else if (f.type === 'folder' && f.children) {
                                return { ...f, children: updateFile(f.children) };
                              }
                              return f;
                            });
                          };
                          return updateFile(prev);
                        });
                      }
                    }}
                    onCursorPositionChange={setCursorPosition}
                  />
                  
                  {/* AI Code Completion Overlay */}
                  {showCodeCompletion && activeFile && (
                    <PredictiveCodeCompletion
                      currentCode={activeFile.content || ''}
                      fileName={activeFile.name}
                      cursorPosition={cursorPosition}
                      onApplySuggestion={handleCodeSuggestionApply}
                      projectContext={{
                        files: projectFiles.map(f => ({ name: f.name, content: f.content || '' })),
                        framework: 'React'
                      }}
                    />
                  )}
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Enhanced Preview & Tools Panel */}
              <ResizablePanel defaultSize={40} minSize={20}>
                <Tabs value={activeBottomTab} onValueChange={setActiveBottomTab} className="h-full flex flex-col">
                  <div className="border-b border-slate-700 px-4 py-2 flex-shrink-0">
                    <TabsList className="bg-slate-800">
                      <TabsTrigger value="preview" className="data-[state=active]:bg-slate-700">
                        <Globe className="w-4 h-4 mr-2" />
                        Preview
                      </TabsTrigger>
                      <TabsTrigger value="terminal" className="data-[state=active]:bg-slate-700">
                        <Terminal className="w-4 h-4 mr-2" />
                        Terminal
                      </TabsTrigger>
                      <TabsTrigger value="console" className="data-[state=active]:bg-slate-700">
                        <Code2 className="w-4 h-4 mr-2" />
                        Console
                      </TabsTrigger>
                      <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Analytics
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="preview" className="flex-1 m-0 overflow-hidden">
                    <LivePreview code={activeFile?.content || ''} />
                  </TabsContent>
                  
                  <TabsContent value="terminal" className="flex-1 m-0 overflow-hidden">
                    <TerminalPanel />
                  </TabsContent>
                  
                  <TabsContent value="console" className="flex-1 m-0 overflow-hidden">
                    <ConsoleLogger 
                      logs={logs}
                      onClear={() => setLogs([])}
                      onExport={() => {}}
                      title="Application Console"
                    />
                  </TabsContent>

                  <TabsContent value="analytics" className="flex-1 m-0 overflow-hidden">
                    <AdvancedProjectAnalytics />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Sidebar - Advanced AI & Collaboration */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full bg-slate-900 border-l border-slate-700 flex flex-col">
              <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
                <div className="border-b border-slate-700 px-2 py-1 flex-shrink-0">
                  <TabsList className="grid w-full grid-cols-4 bg-slate-800 h-8 text-xs">
                    <TabsTrigger value="sovereign-ai" className="data-[state=active]:bg-slate-700">
                      <Crown className="w-3 h-3 mr-1" />
                      AI
                    </TabsTrigger>
                    <TabsTrigger value="protocols" className="data-[state=active]:bg-slate-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Proto
                    </TabsTrigger>
                    <TabsTrigger value="collab" className="data-[state=active]:bg-slate-700">
                      <Users className="w-3 h-3 mr-1" />
                      Team
                    </TabsTrigger>
                    <TabsTrigger value="control" className="data-[state=active]:bg-slate-700">
                      <Layout className="w-3 h-3 mr-1" />
                      Control
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="sovereign-ai" className="flex-1 m-0 overflow-hidden">
                  <div className="h-full">
                    <Tabs value={activeAITab} onValueChange={setActiveAITab} className="h-full flex flex-col">
                      <div className="border-b border-slate-700 px-2 py-1 flex-shrink-0">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-800 h-8 text-xs">
                          <TabsTrigger value="sovereign-control" className="data-[state=active]:bg-slate-700">
                            <Crown className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="command" className="data-[state=active]:bg-slate-700">
                            <Command className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="agents" className="data-[state=active]:bg-slate-700">
                            <Bot className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="integrations" className="data-[state=active]:bg-slate-700">
                            <Plug className="w-3 h-3" />
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <TabsContent value="sovereign-control" className="flex-1 m-0 overflow-hidden">
                        <TrueAIAgent
                          projectFiles={projectFiles}
                          onFilesChange={handleFilesChange}
                          onCodeGenerated={(code) => {
                            console.log('Sovereign AI generated code:', code);
                            handleSovereignRequest(code);
                          }}
                        />
                      </TabsContent>
                      
                      <TabsContent value="command" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <SovereignCommandInterface />
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="agents" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <EnhancedAIChatBot
                            projectFiles={projectFiles}
                            onFilesChange={handleFilesChange}
                            onCodeGenerated={(code) => console.log('Agent code generated:', code)}
                          />
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="integrations" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <ServiceIntegrationHub onIntegrationAdd={() => {}} />
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
                
                <TabsContent value="protocols" className="flex-1 m-0 overflow-hidden">
                  <div className="h-full">
                    <Tabs defaultValue="rag" className="h-full flex flex-col">
                      <div className="border-b border-slate-700 px-2 py-1 flex-shrink-0">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-800 h-8 text-xs">
                          <TabsTrigger value="rag" className="data-[state=active]:bg-slate-700">
                            <Brain className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="mcp" className="data-[state=active]:bg-slate-700">
                            <Plug className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="a2a" className="data-[state=active]:bg-slate-700">
                            <Users className="w-3 h-3" />
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <TabsContent value="rag" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <AdvancedRAGInterface
                            onResultSelect={(result) => console.log('RAG result selected:', result)}
                            onDocumentProcess={(doc) => console.log('Document processed:', doc)}
                          />
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="mcp" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <MCPProtocolInterface
                            onAgentSelect={(agent) => console.log('MCP agent selected:', agent)}
                            onToolInvoke={(agentId, toolName, params) => console.log('MCP tool invoked:', { agentId, toolName, params })}
                          />
                        </ScrollArea>
                      </TabsContent>
                      
                      <TabsContent value="a2a" className="flex-1 m-0 overflow-hidden">
                        <ScrollArea className="h-full">
                          <A2AProtocolInterface
                            onMessageSend={(message) => console.log('A2A message sent:', message)}
                          />
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>

                <TabsContent value="collab" className="flex-1 m-0 overflow-hidden">
                  <div className="h-full p-4">
                    {/* Real-time collaboration will be rendered as overlay */}
                    <div className="text-center text-slate-400 mt-8">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Real-time collaboration active</p>
                      <p className="text-xs">See overlay for team activity</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="control" className="flex-1 m-0 overflow-hidden">
                  <ScrollArea className="h-full">
                    <SovereignDashboard />
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Real-time Collaboration Overlay */}
      {showCollaboration && (
        <RealTimeCollaboration
          projectId="sovereign-ide-project"
          currentFile={activeFile?.name}
          onUserJoin={(user) => console.log('User joined:', user)}
          onUserLeave={(userId) => console.log('User left:', userId)}
          onActivity={(activity) => console.log('Collaboration activity:', activity)}
        />
      )}

      {/* Enhanced Production Status Bar */}
      <div className="bg-slate-900 border-t border-slate-700 px-4 py-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <Crown className="w-3 h-3 mr-1" />
              Sovereign Mode
            </Badge>
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
              <Brain className="w-3 h-3 mr-1" />
              AI Active
            </Badge>
            <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20">
              <Users className="w-3 h-3 mr-1" />
              Collaborative
            </Badge>
            <span className="text-xs text-slate-400">
              Master Control: {agentStatus}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-slate-400">
            <span>Files: {projectFiles.length}</span>
            <span>•</span>
            <span>Logs: {logs.length}</span>
            <span>•</span>
            <span>Line: {cursorPosition.line}, Col: {cursorPosition.column}</span>
            <span>•</span>
            <span className={isAgentProcessing ? 'text-yellow-400' : 'text-green-400'}>
              {isAgentProcessing ? 'Processing...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullIDE;
