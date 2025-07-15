
import React, { useState } from 'react';
import { ChatInterface } from '@/components/ChatInterface';
import { AIChatBot } from '@/components/AIChatBot';
import { EnhancedAIChatBot } from '@/components/EnhancedAIChatBot';
import { RealTimeChat } from '@/components/RealTimeChat';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Zap, MessageSquare, Settings } from 'lucide-react';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: ProjectFile[];
}

export default function Dashboard() {
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [selectedChatType, setSelectedChatType] = useState('enhanced');

  // Get API key from localStorage
  const apiKey = localStorage.getItem('deepseek_api_key') || '';

  const handleFilesChange = (files: ProjectFile[]) => {
    setProjectFiles(files);
  };

  const handleCodeGenerated = (code: string) => {
    console.log('Code generated:', code);
    // Handle code generation if needed
  };

  const handleMessage = (message: string) => {
    console.log('Message received:', message);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">AI Learning Dashboard</h1>
          <p className="text-white/70">Choose your AI assistant and start learning</p>
          
          {/* API Key Status */}
          <div className="mt-4 flex items-center space-x-2">
            <Badge variant={apiKey ? "default" : "destructive"}>
              {apiKey ? 'API Key Connected' : 'API Key Required'}
            </Badge>
            {!apiKey && (
              <p className="text-sm text-white/60">
                Add your DeepSeek API key in any chat interface to get started
              </p>
            )}
          </div>
        </div>

        <Tabs value={selectedChatType} onValueChange={setSelectedChatType} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger 
              value="enhanced" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Bot className="w-4 h-4 mr-2" />
              Enhanced AI
            </TabsTrigger>
            <TabsTrigger 
              value="standard" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Standard Chat
            </TabsTrigger>
            <TabsTrigger 
              value="realtime" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Zap className="w-4 h-4 mr-2" />
              Real-Time
            </TabsTrigger>
            <TabsTrigger 
              value="interface" 
              className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/70"
            >
              <Settings className="w-4 h-4 mr-2" />
              Full Interface
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="enhanced" className="space-y-4">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Enhanced AI Assistant</h3>
                <p className="text-white/70 mb-4">
                  Powered by DeepSeek Reasoner with advanced reasoning capabilities, RAG integration, and MCP tools.
                </p>
                <div className="h-[600px]">
                  <EnhancedAIChatBot
                    projectFiles={projectFiles}
                    onFilesChange={handleFilesChange}
                    onCodeGenerated={handleCodeGenerated}
                    apiKey={apiKey}
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="standard" className="space-y-4">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Standard AI Chat</h3>
                <p className="text-white/70 mb-4">
                  Clean and simple AI chat interface for general coding assistance.
                </p>
                <div className="h-[600px]">
                  <AIChatBot
                    context="General coding assistance and learning"
                    onCodeGenerated={handleCodeGenerated}
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="realtime" className="space-y-4">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Real-Time Chat</h3>
                <p className="text-white/70 mb-4">
                  Experience real-time AI responses with live streaming and validation.
                </p>
                <div className="h-[600px]">
                  <RealTimeChat
                    onMessage={handleMessage}
                    isConnected={true}
                    aiModel="DeepSeek Reasoner"
                  />
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="interface" className="space-y-4">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm p-6">
                <h3 className="text-xl font-semibold text-white mb-2">Full Chat Interface</h3>
                <p className="text-white/70 mb-4">
                  Complete chat interface with prompt builder, code preview, and advanced features.
                </p>
                <div className="h-[600px]">
                  <ChatInterface />
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
