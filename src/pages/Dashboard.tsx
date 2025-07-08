import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { LearningProgress } from '@/components/LearningProgress';
import { AIChatBot } from '@/components/AIChatBot';
import { CodeEditor } from '@/components/CodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { Settings } from '@/components/Settings';
import { Tutorial } from '@/components/Tutorial';
import { ResourceLibrary } from '@/components/ResourceLibrary';
import { Analytics } from '@/components/Analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Book, 
  Bot, 
  Code, 
  Eye, 
  Settings as SettingsIcon, 
  GraduationCap,
  Library,
  Plus,
  Zap
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [codeContent, setCodeContent] = useState('');

  const handleCodeGenerated = (code: string) => {
    setCodeContent(code);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
      }}></div>
      
      <Header />
      
      <div className="container mx-auto px-4 py-6 h-[calc(100vh-80px)]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Learning Dashboard</h1>
          <p className="text-gray-300">Track your progress and explore new technologies</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="mb-6">
            <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20 p-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center space-x-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </TabsTrigger>
              <TabsTrigger 
                value="learning" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Learning</span>
              </TabsTrigger>
              <TabsTrigger 
                value="coding" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center space-x-2"
              >
                <Code className="w-4 h-4" />
                <span>Coding</span>
              </TabsTrigger>
              <TabsTrigger 
                value="ai-chat" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center space-x-2"
              >
                <Bot className="w-4 h-4" />
                <span>AI Assistant</span>
              </TabsTrigger>
              <TabsTrigger 
                value="resources" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center space-x-2"
              >
                <Library className="w-4 h-4" />
                <span>Resources</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tutorial" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center space-x-2"
              >
                <Book className="w-4 h-4" />
                <span>Tutorial</span>
              </TabsTrigger>
              <TabsTrigger 
                value="settings" 
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex items-center space-x-2"
              >
                <SettingsIcon className="w-4 h-4" />
                <span>Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="overview" className="h-full m-0">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
                <div className="xl:col-span-2">
                  <Analytics />
                </div>
                <div>
                  <LearningProgress />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="learning" className="h-full m-0">
              <LearningProgress />
            </TabsContent>

            <TabsContent value="coding" className="h-full m-0">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                <CodeEditor onCodeChange={() => {}} onRun={() => {}} />
                <LivePreview code={codeContent} />
              </div>
            </TabsContent>

            <TabsContent value="ai-chat" className="h-full m-0">
              <AIChatBot onCodeGenerated={handleCodeGenerated} />
            </TabsContent>

            <TabsContent value="resources" className="h-full m-0">
              <ResourceLibrary />
            </TabsContent>

            <TabsContent value="tutorial" className="h-full m-0">
              <Tutorial />
            </TabsContent>

            <TabsContent value="settings" className="h-full m-0">
              <Settings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
