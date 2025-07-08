
import React, { useState } from 'react';
import { AIChatBot } from '@/components/AIChatBot';
import { CodeEditor } from '@/components/CodeEditor';
import { ProjectManager } from '@/components/ProjectManager';
import { LivePreview } from '@/components/LivePreview';
import { LearningProgress } from '@/components/LearningProgress';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const FullIDE = () => {
  const [currentCode, setCurrentCode] = useState('');
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleCodeGenerated = (code: string) => {
    setCurrentCode(code);
  };

  const handleFileSelect = (file: any) => {
    setSelectedFile(file);
    setCurrentCode(file.content || '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-120px)]">
          {/* Left Sidebar - Project Manager */}
          <div className="col-span-2">
            <ProjectManager 
              onFileSelect={handleFileSelect}
              onProjectChange={(files) => console.log('Project updated:', files)}
            />
          </div>

          {/* Main Content Area */}
          <div className="col-span-7">
            <Tabs defaultValue="editor" className="h-full">
              <TabsList className="mb-4 bg-white/10 backdrop-blur-sm border border-white/20">
                <TabsTrigger value="editor" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  Code Editor
                </TabsTrigger>
                <TabsTrigger value="preview" className="data-[state=active]:bg-white/20 data-[state=active]:text-white">
                  Live Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="h-full">
                <CodeEditor 
                  onCodeChange={(files) => {
                    const activeFile = files.find(f => f.name === selectedFile?.name);
                    if (activeFile) {
                      setCurrentCode(activeFile.content);
                    }
                  }}
                  onRun={(code) => setCurrentCode(code)}
                />
              </TabsContent>

              <TabsContent value="preview" className="h-full">
                <LivePreview 
                  code={currentCode}
                  onViewChange={(view) => console.log('View changed to:', view)}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <Tabs defaultValue="ai" className="h-full">
              <TabsList className="mb-4 bg-white/10 backdrop-blur-sm border border-white/20 w-full">
                <TabsTrigger value="ai" className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex-1">
                  AI Assistant
                </TabsTrigger>
                <TabsTrigger value="progress" className="data-[state=active]:bg-white/20 data-[state=active]:text-white flex-1">
                  Progress
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ai" className="h-full">
                <AIChatBot 
                  context={selectedFile?.name}
                  onCodeGenerated={handleCodeGenerated}
                />
              </TabsContent>

              <TabsContent value="progress" className="h-full">
                <LearningProgress />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullIDE;
