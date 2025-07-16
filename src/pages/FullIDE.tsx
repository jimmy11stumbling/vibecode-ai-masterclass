import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Command
} from 'lucide-react';

// Import all components
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
import { masterControlProgram } from '@/services/masterControlProgram';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: ProjectFile[];
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
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeAITab, setActiveAITab] = useState('sovereign-control');
  const [activeToolTab, setActiveToolTab] = useState('database');
  const [activeRightTab, setActiveRightTab] = useState('sovereign-ai');
  const [isAgentProcessing, setIsAgentProcessing] = useState(false);
  const [agentStatus, setAgentStatus] = useState('ready');

  const handleFileSelect = (file: ProjectFile) => {
    // Add language detection based on file extension
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
      content: file.content || '' // Ensure content is always a string
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
      
      // Add log entry
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

  // Create a CodeFile from ProjectFile for MonacoCodeEditor
  const createCodeFile = (file: ProjectFile | null) => {
    if (!file) return null;
    return {
      id: file.id,
      name: file.name,
      content: file.content || '',
      language: file.language || 'plaintext'
    };
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Enhanced Toolbar with Sovereign Badge */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-6 h-6 text-yellow-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
              Sovereign IDE
            </span>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              Production Ready
            </Badge>
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
      
      {/* Main IDE Layout */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - File Explorer & Tools */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-slate-900 border-r border-slate-700">
              <Tabs defaultValue="files" className="h-full flex flex-col">
                <div className="border-b border-slate-700 px-2 py-1">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800 h-8">
                    <TabsTrigger value="files" className="text-xs data-[state=active]:bg-slate-700">
                      <FileText className="w-3 h-3 mr-1" />
                      Files
                    </TabsTrigger>
                    <TabsTrigger value="tools" className="text-xs data-[state=active]:bg-slate-700">
                      <Settings className="w-3 h-3 mr-1" />
                      Tools
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="files" className="flex-1 m-0">
                  <FileExplorer onFileSelect={handleFileSelect} />
                </TabsContent>
                
                <TabsContent value="tools" className="flex-1 m-0">
                  <div className="h-full">
                    <Tabs value={activeToolTab} onValueChange={setActiveToolTab} className="h-full flex flex-col">
                      <div className="border-b border-slate-700 px-2 py-1">
                        <TabsList className="grid w-full grid-cols-3 bg-slate-800 h-8">
                          <TabsTrigger value="database" className="text-xs data-[state=active]:bg-slate-700">
                            <Database className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="deploy" className="text-xs data-[state=active]:bg-slate-700">
                            <Globe className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="mobile" className="text-xs data-[state=active]:bg-slate-700">
                            <Smartphone className="w-3 h-3" />
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <TabsContent value="database" className="flex-1 m-0">
                        <DatabaseManager onSchemaChange={() => {}} />
                      </TabsContent>
                      
                      <TabsContent value="deploy" className="flex-1 m-0">
                        <DeploymentManager />
                      </TabsContent>
                      
                      <TabsContent value="mobile" className="flex-1 m-0">
                        <MobileExpoIntegration 
                          projectFiles={projectFiles}
                          onProjectUpdate={() => {}}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Center Panel - Code Editor & Preview */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <ResizablePanelGroup direction="vertical">
              {/* Code Editor */}
              <ResizablePanel defaultSize={60} minSize={30}>
                <div className="h-full bg-slate-900 border-b border-slate-700">
                  <MonacoCodeEditor
                    file={createCodeFile(activeFile)}
                    onContentChange={(fileId, content) => {
                      if (activeFile) {
                        setProjectFiles(prev => 
                          prev.map(f => f.id === activeFile.id ? { ...f, content } : f)
                        );
                      }
                    }}
                  />
                </div>
              </ResizablePanel>

              <ResizableHandle />

              {/* Preview & Terminal */}
              <ResizablePanel defaultSize={40} minSize={20}>
                <Tabs defaultValue="preview" className="h-full flex flex-col">
                  <div className="border-b border-slate-700 px-4 py-2">
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
                    </TabsList>
                  </div>
                  
                  <TabsContent value="preview" className="flex-1 m-0">
                    <LivePreview code={activeFile?.content || ''} />
                  </TabsContent>
                  
                  <TabsContent value="terminal" className="flex-1 m-0">
                    <TerminalPanel />
                  </TabsContent>
                  
                  <TabsContent value="console" className="flex-1 m-0">
                    <ConsoleLogger 
                      logs={logs}
                      onClear={() => setLogs([])}
                      onExport={() => {}}
                      title="Application Console"
                    />
                  </TabsContent>
                </Tabs>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>

          <ResizableHandle />

          {/* Right Sidebar - Sovereign AI & Advanced Features */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full bg-slate-900 border-l border-slate-700">
              <Tabs value={activeRightTab} onValueChange={setActiveRightTab} className="h-full flex flex-col">
                <div className="border-b border-slate-700 px-2 py-1">
                  <TabsList className="grid w-full grid-cols-3 bg-slate-800 h-8">
                    <TabsTrigger value="sovereign-ai" className="text-xs data-[state=active]:bg-slate-700">
                      <Crown className="w-3 h-3 mr-1" />
                      AI
                    </TabsTrigger>
                    <TabsTrigger value="protocols" className="text-xs data-[state=active]:bg-slate-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Protocols
                    </TabsTrigger>
                    <TabsTrigger value="dashboard" className="text-xs data-[state=active]:bg-slate-700">
                      <Layout className="w-3 h-3 mr-1" />
                      Control
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="sovereign-ai" className="flex-1 m-0">
                  <div className="h-full">
                    <Tabs value={activeAITab} onValueChange={setActiveAITab} className="h-full flex flex-col">
                      <div className="border-b border-slate-700 px-2 py-1">
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
                      
                      <TabsContent value="sovereign-control" className="flex-1 m-0">
                        <TrueAIAgent
                          projectFiles={projectFiles}
                          onFilesChange={setProjectFiles}
                          onCodeGenerated={(code) => {
                            console.log('Sovereign AI generated code:', code);
                            handleSovereignRequest(code);
                          }}
                        />
                      </TabsContent>
                      
                      <TabsContent value="command" className="flex-1 m-0">
                        <SovereignCommandInterface />
                      </TabsContent>
                      
                      <TabsContent value="agents" className="flex-1 m-0">
                        <EnhancedAIChatBot
                          projectFiles={projectFiles}
                          onFilesChange={setProjectFiles}
                          onCodeGenerated={(code) => console.log('Agent code generated:', code)}
                        />
                      </TabsContent>
                      
                      <TabsContent value="integrations" className="flex-1 m-0">
                        <ServiceIntegrationHub onIntegrationAdd={() => {}} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
                
                <TabsContent value="protocols" className="flex-1 m-0">
                  <div className="h-full">
                    <Tabs defaultValue="rag" className="h-full flex flex-col">
                      <div className="border-b border-slate-700 px-2 py-1">
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
                      
                      <TabsContent value="rag" className="flex-1 m-0">
                        <AdvancedRAGInterface
                          onResultSelect={(result) => console.log('RAG result selected:', result)}
                          onDocumentProcess={(doc) => console.log('Document processed:', doc)}
                        />
                      </TabsContent>
                      
                      <TabsContent value="mcp" className="flex-1 m-0">
                        <MCPProtocolInterface
                          onAgentSelect={(agent) => console.log('MCP agent selected:', agent)}
                          onToolInvoke={(agentId, toolName, params) => console.log('MCP tool invoked:', { agentId, toolName, params })}
                        />
                      </TabsContent>
                      
                      <TabsContent value="a2a" className="flex-1 m-0">
                        <A2AProtocolInterface
                          onMessageSend={(message) => console.log('A2A message sent:', message)}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
                
                <TabsContent value="dashboard" className="flex-1 m-0">
                  <SovereignDashboard />
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Enhanced Status Bar */}
      <div className="bg-slate-900 border-t border-slate-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
              <Crown className="w-3 h-3 mr-1" />
              Sovereign Mode
            </Badge>
            <span className="text-xs text-slate-400">
              Master Control Program: {agentStatus}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <span>Files: {projectFiles.length}</span>
            <span>•</span>
            <span>Logs: {logs.length}</span>
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
