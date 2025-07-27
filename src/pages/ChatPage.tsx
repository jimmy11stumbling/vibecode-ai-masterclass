import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RealTimeChat } from '@/components/RealTimeChat';
import { EnhancedAIChatBot } from '@/components/EnhancedAIChatBot';
import { AIChatBot } from '@/components/AIChatBot';
import { ChatInterface } from '@/components/ChatInterface';
import { Bot, Zap, MessageSquare, Settings, Brain } from 'lucide-react';

export default function ChatPage() {
  const apiKey = localStorage.getItem('deepseek_api_key') || '';

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Chat Interface</h1>
        <p className="text-muted-foreground">
          Choose your preferred AI assistant and start conversations
        </p>
        
        {/* API Key Status */}
        <div className="mt-4 flex items-center space-x-2">
          <Badge variant={apiKey ? "default" : "destructive"}>
            {apiKey ? 'DeepSeek API Connected' : 'API Key Required'}
          </Badge>
          {!apiKey && (
            <p className="text-sm text-muted-foreground">
              Add your DeepSeek API key in any chat interface to get started
            </p>
          )}
        </div>
      </div>

      <Tabs defaultValue="enhanced" className="h-full flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="enhanced" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span>Enhanced AI</span>
          </TabsTrigger>
          <TabsTrigger value="realtime" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Real-Time</span>
          </TabsTrigger>
          <TabsTrigger value="standard" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span>Standard</span>
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Full Interface</span>
          </TabsTrigger>
          <TabsTrigger value="sovereign" className="flex items-center space-x-2">
            <Bot className="w-4 h-4" />
            <span>Sovereign AI</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 mt-4">
          <TabsContent value="enhanced" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>Enhanced AI Assistant</span>
                </CardTitle>
                <CardDescription>
                  Advanced AI powered by DeepSeek Reasoner with RAG integration, MCP tools, and sophisticated reasoning capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-120px)]">
                <EnhancedAIChatBot
                  projectFiles={[]}
                  onFilesChange={() => {}}
                  onCodeGenerated={(code) => console.log('Code generated:', code)}
                  apiKey={apiKey}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="realtime" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5" />
                  <span>Real-Time Chat</span>
                </CardTitle>
                <CardDescription>
                  Experience live streaming responses with real-time validation and instant feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-120px)]">
                <RealTimeChat
                  onMessage={(message) => console.log('Message:', message)}
                  isConnected={true}
                  aiModel="DeepSeek Reasoner"
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="standard" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Standard AI Chat</span>
                </CardTitle>
                <CardDescription>
                  Clean and simple AI chat interface for general coding assistance and conversations.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-120px)]">
                <AIChatBot
                  context="General coding assistance and learning"
                  onCodeGenerated={(code) => console.log('Code generated:', code)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interface" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Full Chat Interface</span>
                </CardTitle>
                <CardDescription>
                  Complete chat interface with prompt builder, code preview, file management, and advanced features.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-120px)]">
                <ChatInterface />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sovereign" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-5 w-5" />
                  <span>Sovereign AI System</span>
                </CardTitle>
                <CardDescription>
                  Advanced AI system with autonomous agents, workflow orchestration, and intelligent task management.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-120px)]">
                <div className="h-full bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Bot className="h-16 w-16 mx-auto text-primary" />
                    <h3 className="text-xl font-semibold">Sovereign AI Coming Soon</h3>
                    <p className="text-muted-foreground max-w-md">
                      Experience the next generation of AI assistance with autonomous agents, 
                      intelligent workflows, and advanced reasoning capabilities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}