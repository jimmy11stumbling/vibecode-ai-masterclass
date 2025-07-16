
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Code, 
  FileText, 
  Zap, 
  Settings,
  Bot,
  MessageSquare,
  Activity
} from 'lucide-react';
import { SeamlessDeepSeekChat } from './SeamlessDeepSeekChat';
import { RealTimeChat } from './RealTimeChat';
import { EnhancedAIChatBot } from './EnhancedAIChatBot';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

interface DeepSeekIntegrationHubProps {
  projectFiles?: ProjectFile[];
  onFilesChange?: (files: ProjectFile[]) => void;
  onCodeGenerated?: (code: string) => void;
}

export const DeepSeekIntegrationHub: React.FC<DeepSeekIntegrationHubProps> = ({
  projectFiles = [],
  onFilesChange,
  onCodeGenerated
}) => {
  const [activeTab, setActiveTab] = useState('seamless');
  const [apiKeyStatus, setApiKeyStatus] = useState(() => {
    return localStorage.getItem('deepseek_api_key') ? 'connected' : 'missing';
  });

  const integrationModes = [
    {
      id: 'seamless',
      title: 'Seamless Chat',
      description: 'Enhanced DeepSeek chat with real-time streaming and advanced UI',
      icon: MessageSquare,
      features: ['Real-time streaming', 'Enhanced UI', 'Copy/Export', 'Token tracking']
    },
    {
      id: 'realtime',
      title: 'Real-Time Streaming',
      description: 'Live streaming interface with validation and progress tracking',
      icon: Activity,
      features: ['Live validation', 'Progress tracking', 'Real-time updates', 'Error handling']
    },
    {
      id: 'enhanced',
      title: 'Enhanced Assistant',
      description: 'Advanced AI assistant with project context and code generation',
      icon: Brain,
      features: ['Project awareness', 'Code generation', 'Multi-file editing', 'Context understanding']
    }
  ];

  // Handle different component callback signatures
  const handleSeamlessMessage = (message: string, response: string) => {
    console.log('DeepSeek seamless conversation:', { message, response });
  };

  const handleRealTimeMessage = (message: string) => {
    console.log('DeepSeek real-time message:', { message });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">DeepSeek Integration Hub</h2>
              <p className="text-sm text-slate-400">Advanced AI reasoning with seamless streaming</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant={apiKeyStatus === 'connected' ? "default" : "destructive"}
              className="text-xs"
            >
              {apiKeyStatus === 'connected' ? 'API Connected' : 'API Key Required'}
            </Badge>
            <Button variant="ghost" size="sm" className="text-slate-400">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Integration Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {integrationModes.map((mode) => (
            <Card
              key={mode.id}
              className={`p-3 cursor-pointer transition-all border ${
                activeTab === mode.id
                  ? 'bg-blue-500/10 border-blue-500/30'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => setActiveTab(mode.id)}
            >
              <div className="flex items-start space-x-3">
                <mode.icon className={`w-5 h-5 mt-1 ${
                  activeTab === mode.id ? 'text-blue-400' : 'text-slate-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{mode.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{mode.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {mode.features.slice(0, 2).map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <TabsContent value="seamless" className="flex-1 m-0">
            <SeamlessDeepSeekChat
              onMessage={handleSeamlessMessage}
              className="h-full rounded-none border-0"
            />
          </TabsContent>

          <TabsContent value="realtime" className="flex-1 m-0">
            <RealTimeChat
              onMessage={handleRealTimeMessage}
              isConnected={apiKeyStatus === 'connected'}
              aiModel="DeepSeek Reasoner"
            />
          </TabsContent>

          <TabsContent value="enhanced" className="flex-1 m-0">
            <EnhancedAIChatBot
              projectFiles={projectFiles}
              onFilesChange={onFilesChange}
              onCodeGenerated={onCodeGenerated}
              apiKey={localStorage.getItem('deepseek_api_key') || ''}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
