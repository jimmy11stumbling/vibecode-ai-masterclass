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
  Bot
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

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error';
  message: string;
  context?: string;
}

export const FullIDE = () => {
  const [activeFile, setActiveFile] = useState<any>(null);
  const [projectFiles, setProjectFiles] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [previewUrl, setPreviewUrl] = useState('');
  const [activeAITab, setActiveAITab] = useState('true-agent');
  const [activeToolTab, setActiveToolTab] = useState('database');

  const handleFileSelect = (file: ProjectFile) => {
    setActiveFile(file);
  };

  const handleFilesChange = (files: ProjectFile[]) => {
    setProjectFiles(files);
  };

  const handleLog = (log: LogEntry) => {
    setLogs(prev => [...prev, log]);
  };

  return (
    <div className="h-screen bg-slate-950 flex flex-col">
      {/* Toolbar */}
      <IDEToolbar />
      
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
                  <FileExplorer 
                    files={projectFiles}
                    onFileSelect={setActiveFile}
                    onFilesChange={setProjectFiles}
                  />
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
                        <DatabaseManager />
                      </TabsContent>
                      
                      <TabsContent value="deploy" className="flex-1 m-0">
                        <DeploymentManager />
                      </TabsContent>
                      
                      <TabsContent value="mobile" className="flex-1 m-0">
                        <MobileExpoIntegration 
                          onProjectCreate={() => {}}
                          onPreviewUpdate={() => {}}
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
                    file={activeFile}
                    onChange={(content) => {
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
                    <LivePreview url={previewUrl} />
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

          {/* Right Sidebar - AI & Advanced Features */}
          <ResizablePanel defaultSize={30} minSize={20} maxSize={40}>
            <div className="h-full bg-slate-900 border-l border-slate-700">
              <Tabs value={activeAITab} onValueChange={setActiveAITab} className="h-full flex flex-col">
                <div className="border-b border-slate-700 px-2 py-1">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800 h-8">
                    <TabsTrigger value="ai-agents" className="text-xs data-[state=active]:bg-slate-700">
                      <Bot className="w-3 h-3 mr-1" />
                      AI
                    </TabsTrigger>
                    <TabsTrigger value="protocols" className="text-xs data-[state=active]:bg-slate-700">
                      <Zap className="w-3 h-3 mr-1" />
                      Protocols
                    </TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="ai-agents" className="flex-1 m-0">
                  <div className="h-full">
                    <Tabs defaultValue="true-agent" className="h-full flex flex-col">
                      <div className="border-b border-slate-700 px-2 py-1">
                        <TabsList className="grid w-full grid-cols-4 bg-slate-800 h-8 text-xs">
                          <TabsTrigger value="true-agent" className="data-[state=active]:bg-slate-700">
                            <Bot className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="chat" className="data-[state=active]:bg-slate-700">
                            <Brain className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="integrations" className="data-[state=active]:bg-slate-700">
                            <Plug className="w-3 h-3" />
                          </TabsTrigger>
                          <TabsTrigger value="templates" className="data-[state=active]:bg-slate-700">
                            <Layout className="w-3 h-3" />
                          </TabsTrigger>
                        </TabsList>
                      </div>
                      
                      <TabsContent value="true-agent" className="flex-1 m-0">
                        <TrueAIAgent
                          projectFiles={projectFiles}
                          onFilesChange={setProjectFiles}
                          onCodeGenerated={(code) => console.log('Code generated:', code)}
                        />
                      </TabsContent>
                      
                      <TabsContent value="chat" className="flex-1 m-0">
                        <EnhancedAIChatBot
                          context="Full-stack development environment"
                          onCodeGenerated={(code) => console.log('Chat code generated:', code)}
                        />
                      </TabsContent>
                      
                      <TabsContent value="integrations" className="flex-1 m-0">
                        <ServiceIntegrationHub
                          onServiceAdd={(service) => console.log('Service added:', service)}
                          onCodeGenerate={(code) => console.log('Integration code:', code)}
                        />
                      </TabsContent>
                      
                      <TabsContent value="templates" className="flex-1 m-0">
                        <TemplateSystem
                          onTemplateSelect={(template) => console.log('Template selected:', template)}
                          onProjectCreate={(project) => setProjectFiles(project.files)}
                        />
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
                          onTaskSelect={(task) => console.log('A2A task selected:', task)}
                          onMessageSend={(taskId, message) => console.log('A2A message sent:', { taskId, message })}
                        />
                      </TabsContent>
                    </Tabs>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Status Bar */}
      <IDEStatusBar 
        activeFile={activeFile?.name}
        linesOfCode={projectFiles.reduce((total, file) => total + (file.content?.split('\n').length || 0), 0)}
        errors={0}
        warnings={0}
      />
    </div>
  );
};
