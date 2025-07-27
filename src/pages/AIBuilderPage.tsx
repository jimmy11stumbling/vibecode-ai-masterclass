import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileExplorer } from '@/components/FileExplorer';
import { MonacoCodeEditor } from '@/components/MonacoCodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { Terminal } from '@/components/Terminal';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { RealAICodeGenerator } from '@/services/realAICodeGenerator';
import { dynamicCodeModifier } from '@/services/dynamicCodeModifier';
import { 
  Bot, 
  Play, 
  Square, 
  RotateCcw, 
  Save, 
  Upload, 
  Download,
  Zap,
  Brain,
  Code,
  Eye,
  Terminal as TerminalIcon,
  FileText,
  Folder
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  files?: Array<{
    path: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
  }>;
}

interface CodeFile {
  id: string;
  name: string;
  content: string;
  language: string;
}

export const AIBuilderPage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [activeView, setActiveView] = useState('preview');
  const [isRunning, setIsRunning] = useState(false);
  
  const { toast } = useToast();
  
  const {
    files,
    updateFiles,
    createNewFile,
    deleteFile,
    updateFileContent
  } = useProjectFiles();

  const [aiGenerator] = useState(() => new RealAICodeGenerator());

  // Initialize with a basic project structure
  useEffect(() => {
    const initializeProject = async () => {
      if (files.length === 0) {
        // Create basic React project structure
        await createNewFile('src', 'folder');
        await createNewFile('public', 'folder');
        
        const appContent = `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-xl">Built with AI in Sovereign IDE</p>
      </div>
    </div>
  );
}

export default App;`;

        const cssContent = `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.App {
  text-align: center;
}`;

        await dynamicCodeModifier.createFile('/src/App.tsx', appContent);
        await dynamicCodeModifier.createFile('/src/App.css', cssContent);
        await dynamicCodeModifier.createFile('/src/index.tsx', `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);`);
        
        await dynamicCodeModifier.createFile('/public/index.html', `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AI Generated App</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>`);

        // Load initial file
        setSelectedFile({
          id: 'app',
          name: 'App.tsx',
          content: appContent,
          language: 'typescript'
        });
      }
    };

    initializeProject();
  }, [files.length, createNewFile]);

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // Get current project context
      const projectStructure = await dynamicCodeModifier.getProjectStructure();
      const projectFiles = await Promise.all(
        projectStructure.map(async (node) => {
          if (node.type === 'file') {
            const content = await dynamicCodeModifier.readFile(node.path);
            return {
              name: node.path,
              content: content || '',
              type: 'file'
            };
          }
          return null;
        })
      );

      const validFiles = projectFiles.filter(f => f !== null) as any[];

      // Generate code with AI
      const result = await aiGenerator.generateCode({
        prompt: prompt,
        context: {
          files: validFiles,
          framework: 'React',
          requirements: ['TypeScript', 'Tailwind CSS', 'Modern React patterns']
        },
        operation: 'modify'
      });

      if (result.success && result.files.length > 0) {
        // Apply file changes
        for (const file of result.files) {
          await dynamicCodeModifier.writeFile(file.path, file.content);
          
          // Update selected file if it matches
          if (selectedFile && file.path.includes(selectedFile.name)) {
            setSelectedFile(prev => prev ? {
              ...prev,
              content: file.content
            } : null);
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: typeof result.analysis === 'string' ? result.analysis : 'I\'ve updated your project files based on your request.',
          timestamp: new Date(),
          files: result.files
        };

        setMessages(prev => [...prev, assistantMessage]);

        toast({
          title: "Code Generated Successfully",
          description: `Updated ${result.files.length} file(s)`,
        });
      } else {
        throw new Error(result.errors?.[0] || 'Failed to generate code');
      }
    } catch (error) {
      console.error('AI Generation error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);

      toast({
        title: "Generation Failed",
        description: "Please try rephrasing your request",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
      setPrompt('');
    }
  };

  const handleFileSelect = (file: any) => {
    if (file.type === 'file') {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let language = 'javascript';
      
      if (extension === 'tsx' || extension === 'ts') language = 'typescript';
      else if (extension === 'css') language = 'css';
      else if (extension === 'html') language = 'html';
      else if (extension === 'json') language = 'json';

      setSelectedFile({
        id: file.id,
        name: file.name,
        content: file.content || '',
        language
      });
    }
  };

  const handleContentChange = async (fileId: string, content: string) => {
    if (selectedFile) {
      setSelectedFile(prev => prev ? { ...prev, content } : null);
      
      // Update file in the system
      const filePath = selectedFile.name.startsWith('/') ? selectedFile.name : `/${selectedFile.name}`;
      await dynamicCodeModifier.writeFile(filePath, content);
    }
  };

  const handleRunApp = () => {
    setIsRunning(true);
    // Simulate build process
    setTimeout(() => {
      setIsRunning(false);
      toast({
        title: "App Running",
        description: "Your application is now live in the preview",
      });
    }, 2000);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">AI App Builder</h1>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>DeepSeek Reasoner</span>
            </Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRunApp}
              disabled={isRunning}
              className="flex items-center space-x-2"
            >
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span>{isRunning ? 'Building...' : 'Run App'}</span>
            </Button>
            
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* AI Chat Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full flex flex-col bg-white border-r">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-blue-600" />
                  AI Assistant
                </h3>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`p-3 rounded-lg ${
                        message.role === 'user' 
                          ? 'bg-blue-50 border border-blue-200' 
                          : 'bg-gray-50 border border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {message.role === 'user' ? (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">U</span>
                          </div>
                        ) : (
                          <Bot className="h-6 w-6 text-gray-600" />
                        )}
                        <span className="text-sm font-medium capitalize">{message.role}</span>
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{message.content}</p>
                      
                      {message.files && message.files.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs font-medium text-gray-600">Files modified:</p>
                          {message.files.map((file, index) => (
                            <div key={index} className="flex items-center space-x-1 text-xs">
                              <FileText className="h-3 w-3" />
                              <span>{file.path}</span>
                              <Badge variant="outline">{file.operation}</Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isGenerating && (
                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-yellow-700">AI is generating code...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="space-y-3">
                  <Textarea
                    placeholder="Tell the AI what to build... (e.g., 'Add a login form with email and password')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[80px] resize-none"
                    disabled={isGenerating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={isGenerating || !prompt.trim()}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Generate Code
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* File Explorer Panel */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <div className="h-full bg-white border-r">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Folder className="h-5 w-5 mr-2 text-gray-600" />
                  Project Files
                </h3>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={() => handleFileSelect(file)}
                      >
                        {file.type === 'folder' ? (
                          <Folder className="h-4 w-4 text-blue-600" />
                        ) : (
                          <FileText className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Code Editor & Preview Panel */}
          <ResizablePanel defaultSize={55} minSize={40}>
            <div className="h-full flex flex-col">
              <div className="bg-white border-b">
                <Tabs value={activeView} onValueChange={setActiveView}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="code" className="flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>Code Editor</span>
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center space-x-2">
                      <Eye className="h-4 w-4" />
                      <span>Live Preview</span>
                    </TabsTrigger>
                    <TabsTrigger value="terminal" className="flex items-center space-x-2">
                      <TerminalIcon className="h-4 w-4" />
                      <span>Terminal</span>
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="flex-1 overflow-hidden">
                <Tabs value={activeView} className="h-full">
                  <TabsContent value="code" className="h-full m-0">
                    <MonacoCodeEditor
                      file={selectedFile}
                      onContentChange={handleContentChange}
                      onSave={() => toast({ title: "File saved", description: "Changes saved successfully" })}
                    />
                  </TabsContent>
                  
                  <TabsContent value="preview" className="h-full m-0">
                    <div className="h-full bg-white border border-gray-200 flex items-center justify-center">
                      {isRunning ? (
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-gray-600">Building your app...</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Eye className="h-8 w-8 text-blue-600" />
                          </div>
                          <p className="text-gray-600">Live preview will appear here</p>
                          <p className="text-sm text-gray-400 mt-2">Click "Run App" to start the preview</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="terminal" className="h-full m-0">
                    <Terminal />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};