
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { 
  Code, 
  FileText, 
  Rocket, 
  Users, 
  Settings,
  Crown,
  Palette,
  GitBranch,
  Layout,
  Zap,
  Database,
  Monitor
} from 'lucide-react';

import { SovereignIDE } from '@/components/SovereignIDE';
import { CodeEditor } from '@/components/CodeEditor';
import { ProjectManager } from '@/components/ProjectManager';
import { DeploymentManager } from '@/components/DeploymentManager';
import { RealTimeCollaboration } from '@/components/RealTimeCollaboration';
import { ProductionDeploymentManager } from '@/components/ProductionDeploymentManager';
import { VisualComponentEditor } from '@/components/VisualComponentEditor';
import { ThemeCustomizer } from '@/components/ThemeCustomizer';
import { ProjectTemplateManager } from '@/components/ProjectTemplateManager';
import { DatabaseTools } from '@/components/DatabaseTools';

export default function FullIDE() {
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('sovereign');
  const [showCollaboration, setShowCollaboration] = useState(true);

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    if (activeTab === 'sovereign') {
      setActiveTab('code');
    }
  };

  const handleProjectGenerated = (project: any) => {
    console.log('Project generated:', project);
    setActiveTab('code');
  };

  const toolbarButtons = [
    { id: 'sovereign', label: 'Sovereign AI', icon: Crown, description: 'AI-powered development' },
    { id: 'code', label: 'Code Editor', icon: Code, description: 'Write and edit code' },
    { id: 'visual', label: 'Visual Editor', icon: Layout, description: 'Drag & drop interface builder' },
    { id: 'templates', label: 'Templates', icon: GitBranch, description: 'Project templates & starters' },
    { id: 'deploy', label: 'Deploy', icon: Rocket, description: 'Deployment management' },
    { id: 'production', label: 'Production', icon: Zap, description: 'Production deployment & CI/CD' },
    { id: 'theme', label: 'Theme', icon: Palette, description: 'Visual theme customization' },
    { id: 'database', label: 'Database', icon: Database, description: 'Database & backend tools' },
  ];

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Sovereign IDE</h1>
            <p className="text-xs text-slate-400">Production-Ready Development Environment</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCollaboration(!showCollaboration)}
            className="border-slate-600"
          >
            <Users className="w-4 h-4 mr-2" />
            Collaboration
          </Button>
          <Button variant="outline" size="sm" className="border-slate-600">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Main IDE Interface */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Left Sidebar - Project Explorer */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-slate-800 border-r border-slate-700">
              <ProjectManager 
                onFileSelect={handleFileSelect}
                onProjectChange={(files) => console.log('Project changed:', files)}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Main Content Area */}
          <ResizablePanel defaultSize={80}>
            <div className="h-full flex flex-col">
              {/* Toolbar */}
              <div className="h-12 bg-slate-800 border-b border-slate-700 flex items-center px-4 overflow-x-auto">
                <div className="flex items-center space-x-1">
                  {toolbarButtons.map((button) => (
                    <Button
                      key={button.id}
                      variant={activeTab === button.id ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setActiveTab(button.id)}
                      className={`flex items-center space-x-2 ${
                        activeTab === button.id 
                          ? 'bg-slate-700 text-white' 
                          : 'text-slate-400 hover:text-white hover:bg-slate-700'
                      }`}
                      title={button.description}
                    >
                      <button.icon className="w-4 h-4" />
                      <span className="hidden md:inline">{button.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Content Panels */}
              <div className="flex-1 overflow-hidden">
                {activeTab === 'sovereign' && (
                  <SovereignIDE onProjectGenerated={handleProjectGenerated} />
                )}
                
                {activeTab === 'code' && (
                  <CodeEditor 
                    selectedFile={selectedFile}
                    onCodeChange={(files) => console.log('Code changed:', files)}
                    onRun={(code) => console.log('Running code:', code)}
                  />
                )}
                
                {activeTab === 'visual' && (
                  <VisualComponentEditor />
                )}
                
                {activeTab === 'templates' && (
                  <ProjectTemplateManager />
                )}
                
                {activeTab === 'deploy' && (
                  <DeploymentManager />
                )}
                
                {activeTab === 'production' && (
                  <ProductionDeploymentManager />
                )}
                
                {activeTab === 'theme' && (
                  <ThemeCustomizer />
                )}
                
                {activeTab === 'database' && (
                  <DatabaseTools />
                )}
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Real-time Collaboration Overlay */}
      {showCollaboration && (
        <RealTimeCollaboration 
          projectId="current-project"
          currentFile={selectedFile?.name}
          onUserJoin={(user) => console.log('User joined:', user)}
          onUserLeave={(userId) => console.log('User left:', userId)}
          onActivity={(activity) => console.log('Activity:', activity)}
        />
      )}
    </div>
  );
}
