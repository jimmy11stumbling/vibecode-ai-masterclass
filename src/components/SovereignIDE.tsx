import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthProvider';
import { useWebSocket } from '@/components/realtime/WebSocketManager';
import { RealTimeChat } from '@/components/RealTimeChat';
import { ProjectManager } from '@/components/ProjectManager';
import { FileUploadZone } from '@/components/upload/FileUploadZone';
import { AgentOrchestrationDashboard } from '@/components/dashboard/AgentOrchestrationDashboard';
import { LiveCodeExecutor } from '@/components/code/LiveCodeExecutor';
import { ProjectTemplateGallery } from '@/components/templates/ProjectTemplateGallery';
import { MetricsDashboard } from '@/components/analytics/MetricsDashboard';
import { sovereignSystemInitializer } from '@/services/sovereignSystemInitializer';
import { masterControlProgram } from '@/services/masterControlProgram';
import { 
  Bot, 
  Code, 
  FileText, 
  Upload, 
  LayoutDashboard, 
  Play, 
  FolderTemplate, 
  BarChart3, 
  Settings,
  User,
  LogOut,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';

interface SovereignIDEProps {
  onProjectGenerated?: (project: any) => void;
}

export const SovereignIDE: React.FC<SovereignIDEProps> = ({ onProjectGenerated }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user, signOut } = useAuth();
  const { isConnected, connectionState } = useWebSocket();

  useEffect(() => {
    const initializeSystem = async () => {
      try {
        console.log('🚀 Initializing Sovereign IDE System...');
        
        // Initialize the sovereign system
        await sovereignSystemInitializer.initializeSovereignSystem();
        
        // Get system status
        const status = await sovereignSystemInitializer.getSystemStatus();
        setSystemStatus(status);
        setIsInitialized(true);
        
        console.log('✅ Sovereign IDE System initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Sovereign IDE System:', error);
      }
    };

    initializeSystem();

    // Set up periodic status updates
    const statusInterval = setInterval(async () => {
      if (sovereignSystemInitializer.isSystemReady()) {
        const status = await sovereignSystemInitializer.getSystemStatus();
        setSystemStatus(status);
      }
    }, 10000);

    return () => {
      clearInterval(statusInterval);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const getConnectionIcon = () => {
    switch (connectionState) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'connecting':
        return <Activity className="h-4 w-4 text-yellow-500 animate-pulse" />;
      default:
        return <WifiOff className="h-4 w-4 text-red-500" />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Sovereign IDE</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={isInitialized ? 'default' : 'secondary'}>
                {isInitialized ? 'System Ready' : 'Initializing...'}
              </Badge>
              
              <div className="flex items-center space-x-1">
                {getConnectionIcon()}
                <span className="text-sm text-gray-600 capitalize">
                  {connectionState}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {systemStatus && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Agents: {systemStatus.agents.length}</span>
                <span>Tasks: {systemStatus.tasks.length}</span>
                <span>Tools: {systemStatus.tools.length}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="text-sm text-gray-700">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="bg-white border-b border-gray-200 px-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <Bot className="h-4 w-4" />
                <span>AI Chat</span>
              </TabsTrigger>
              
              <TabsTrigger value="dashboard" className="flex items-center space-x-2">
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </TabsTrigger>
              
              <TabsTrigger value="projects" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>Projects</span>
              </TabsTrigger>
              
              <TabsTrigger value="code" className="flex items-center space-x-2">
                <Play className="h-4 w-4" />
                <span>Code Executor</span>
              </TabsTrigger>
              
              <TabsTrigger value="templates" className="flex items-center space-x-2">
                <FolderTemplate className="h-4 w-4" />
                <span>Templates</span>
              </TabsTrigger>
              
              <TabsTrigger value="upload" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Upload</span>
              </TabsTrigger>
              
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
              
              <TabsTrigger value="settings" className="flex items-center space-x-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="h-full m-0 p-6">
              <RealTimeChat />
            </TabsContent>
            
            <TabsContent value="dashboard" className="h-full m-0">
              <AgentOrchestrationDashboard />
            </TabsContent>
            
            <TabsContent value="projects" className="h-full m-0 p-6">
              <ProjectManager />
            </TabsContent>
            
            <TabsContent value="code" className="h-full m-0 p-6">
              <LiveCodeExecutor />
            </TabsContent>
            
            <TabsContent value="templates" className="h-full m-0">
              <ProjectTemplateGallery />
            </TabsContent>
            
            <TabsContent value="upload" className="h-full m-0 p-6">
              <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-2">File Upload</h2>
                  <p className="text-gray-600">Upload files to your project workspace</p>
                </div>
                <FileUploadZone
                  onFilesUploaded={(files) => {
                    console.log('Files uploaded:', files);
                  }}
                  maxFiles={20}
                  acceptedTypes={['image/*', 'text/*', '.pdf', '.doc', '.docx', '.js', '.ts', '.tsx', '.jsx', '.py', '.json']}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="h-full m-0">
              <MetricsDashboard />
            </TabsContent>
            
            <TabsContent value="settings" className="h-full m-0 p-6">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">System Information</h3>
                    {systemStatus && (
                      <div className="bg-white p-4 rounded-lg border space-y-2">
                        <div className="flex justify-between">
                          <span>System Status:</span>
                          <Badge variant={isInitialized ? 'default' : 'secondary'}>
                            {isInitialized ? 'Ready' : 'Initializing'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Agents:</span>
                          <span>{systemStatus.agents.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Tasks:</span>
                          <span>{systemStatus.tasks.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Available Tools:</span>
                          <span>{systemStatus.tools.length}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">User Preferences</h3>
                    <div className="bg-white p-4 rounded-lg border space-y-2">
                      <div className="flex justify-between">
                        <span>Email:</span>
                        <span>{user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Connection:</span>
                        <Badge variant={isConnected ? 'default' : 'destructive'}>
                          {isConnected ? 'Connected' : 'Disconnected'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
