import React, { useState, useEffect } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MonacoCodeEditor } from '@/components/MonacoCodeEditor';
import { LivePreview } from '@/components/LivePreview';
import { Terminal } from '@/components/Terminal';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { realTimeAIAgent } from '@/services/realTimeAIAgent';
import { dynamicCodeModifier } from '@/services/dynamicCodeModifier';
import { useToast } from '@/hooks/use-toast';
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
  Folder,
  Settings,
  Rocket,
  Database,
  Globe,
  Lightbulb,
  Wand2
} from 'lucide-react';
import { FileTree } from '@/components/FileTree';

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

export default function EditorPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(null);
  const [activeView, setActiveView] = useState('code');
  const [isRunning, setIsRunning] = useState(false);
  const [projectType, setProjectType] = useState<'web' | 'api' | 'fullstack'>('fullstack');
  
  const { toast } = useToast();
  
  const {
    files,
    updateFiles,
    createNewFile,
    deleteFile,
    updateFileContent
  } = useProjectFiles((updatedFiles) => {
    // Sync changes to live preview
    setIsRunning(false);
    setTimeout(() => setIsRunning(true), 100);
  });

  // Remove old AI generator - using new real-time agent now

  // Initialize with a comprehensive project structure
  useEffect(() => {
    const initializeProject = async () => {
      try {
        // Check if files are already loaded from localStorage
        const savedFiles = localStorage.getItem('dynamic_code_files');
        if (savedFiles && Object.keys(JSON.parse(savedFiles)).length > 0) {
          // Files already exist, load the first one for editing
          const structure = await dynamicCodeModifier.getProjectStructure();
          if (structure.length > 0) {
            const firstFile = structure.find(node => node.type === 'file');
            if (firstFile) {
              const content = await dynamicCodeModifier.readFile(firstFile.path);
              setSelectedFile({
                id: firstFile.path,
                name: firstFile.path.split('/').pop() || 'file',
                content: content || '',
                language: getLanguageFromPath(firstFile.path)
              });
            }
          }
          return;
        }

        // Create initial project structure only if none exists
        console.log('🏗️ Initializing new project structure...');
        
        // Frontend structure
        const appContent = `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setMessage('Welcome to your AI-Generated Application!');
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">🚀 AI-Generated App</h1>
          <p className="text-xl opacity-90">Built with Sovereign IDE</p>
        </header>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">✨ Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">⚛️</div>
                <h3 className="font-semibold mb-2">React Frontend</h3>
                <p className="text-gray-600">Modern React with hooks</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🔗</div>
                <h3 className="font-semibold mb-2">API Ready</h3>
                <p className="text-gray-600">Backend integration ready</p>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="font-semibold mb-2">Styled</h3>
                <p className="text-gray-600">Beautiful Tailwind CSS</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{message}</h2>
            <p className="text-gray-600 mb-4">
              This application was generated by AI using Sovereign IDE. 
              You can now ask the AI to add features, modify the design, or build additional functionality.
            </p>
            
            <div className="flex gap-4">
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={() => alert('AI Feature: Ready to add functionality!')}
              >
                Add Feature
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
                onClick={() => alert('AI Feature: Ready to modify design!')}
              >
                Modify Design
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;`;

        const backendContent = `const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    message: 'Backend server is running',
    version: '1.0.0'
  });
});

// Sample API endpoints
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from AI-generated backend!' });
});

app.post('/api/data', (req, res) => {
  const { data } = req.body;
  res.json({ 
    received: data, 
    processed: true,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on port \${PORT}\`);
});`;

        const packageJsonContent = `{
  "name": "ai-generated-fullstack-app",
  "version": "1.0.0",
  "description": "Full-stack application generated by Sovereign IDE AI",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "concurrently \\"npm run server\\" \\"npm run client\\"",
    "server": "nodemon backend/server.js",
    "client": "cd frontend && npm start",
    "build": "cd frontend && npm run build"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "concurrently": "^7.6.0"
  }
}`;

        const readmeContent = `# 🚀 AI-Generated Full-Stack Application

Generated by Sovereign IDE's AI Agent

## Features
- ⚛️ React Frontend
- 🔗 Express.js Backend  
- 🎨 Tailwind CSS Styling
- 📡 API Integration Ready

## Quick Start
1. Install dependencies: \`npm install\`
2. Start development: \`npm run dev\`
3. Open browser: \`http://localhost:3000\`

## Ask the AI to:
- Add new features
- Modify the design  
- Create API endpoints
- Add database integration
- Deploy to production

Built with ❤️ by Sovereign IDE AI`;

        // Create all files using the dynamic code modifier
        await dynamicCodeModifier.createFile('/frontend/App.tsx', appContent);
        await dynamicCodeModifier.createFile('/backend/server.js', backendContent);  
        await dynamicCodeModifier.createFile('/package.json', packageJsonContent);
        await dynamicCodeModifier.createFile('/README.md', readmeContent);

        // Set the first file for editing
        setSelectedFile({
          id: 'app-tsx',
          name: 'App.tsx',
          content: appContent,
          language: 'typescript'
        });

        console.log('✅ Project structure initialized successfully');
        
        toast({
          title: "🚀 Project Initialized",
          description: "Full-stack application structure created successfully",
        });

      } catch (error) {
        console.error('❌ Failed to initialize project:', error);
        toast({
          title: "Initialization Failed",
          description: "Could not create project structure",
          variant: "destructive"
        });
      }
    };

    initializeProject();
  }, [toast]);

  // Helper function to determine language from file path
  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const langMap: Record<string, string> = {
      'tsx': 'typescript',
      'ts': 'typescript', 
      'jsx': 'javascript',
      'js': 'javascript',
      'css': 'css',
      'json': 'json',
      'md': 'markdown',
      'html': 'html',
      'sql': 'sql'
    };
    return langMap[ext || ''] || 'javascript';
  };

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
    setPrompt('');

    // Create streaming assistant message
    const assistantMessageId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      files: []
    };

    setMessages(prev => [...prev, assistantMessage]);

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

      // Stream AI response with REAL-TIME file creation
      let streamedContent = '';
      let generatedFiles: any[] = [];

      console.log('🚀 Starting real-time AI code generation...');

      await realTimeAIAgent.streamCodeGeneration(
        prompt,
        (token: string) => {
          streamedContent += token;
          
          // Update the assistant message in real-time as AI types
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: streamedContent }
              : msg
          ));
        },
        (fileOperation: { type: 'create' | 'update' | 'delete', path: string, content?: string }) => {
          console.log(`🔧 File operation: ${fileOperation.type} ${fileOperation.path}`);
          
          // Track generated files
          generatedFiles.push({
            path: fileOperation.path,
            content: fileOperation.content || '',
            operation: fileOperation.type
          });

          // Update selected file if it matches the created/updated file
          if (fileOperation.type !== 'delete' && fileOperation.content) {
            const fileName = fileOperation.path.split('/').pop() || 'file';
            if (!selectedFile || selectedFile.name === fileName) {
              setSelectedFile({
                id: fileOperation.path,
                name: fileName,
                content: fileOperation.content,
                language: getLanguageFromPath(fileOperation.path)
              });
            }
          }

          // Update the message with file operations
          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, files: [...generatedFiles] }
              : msg
          ));
        },
        (stats) => {
          // Optional progress updates
          if (stats.status === 'complete') {
            console.log(`✅ Streaming complete: ${stats.tokensReceived} tokens in ${stats.responseTime}ms`);
          }
        }
      );

      toast({
        title: "🚀 AI Development Complete", 
        description: `Generated ${generatedFiles.length} files with real-time streaming`,
      });
    } catch (error) {
      console.error('AI Generation error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `❌ **Error:** ${error instanceof Error ? error.message : 'Unknown error'}

💡 **Suggestions:**
- Try rephrasing your request
- Be more specific about what you want to build
- Check if you have a valid DeepSeek API key configured`,
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
      else if (extension === 'sql') language = 'sql';
      else if (extension === 'md') language = 'markdown';

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
        title: "Application Running",
        description: "Your full-stack application is now live in the preview",
      });
    }, 3000);
  };

  const quickStartTemplates = [
    {
      name: "E-commerce Store",
      description: "Complete online store with cart, checkout, and admin panel",
      icon: "🛒",
      prompt: "Create a complete e-commerce store with product catalog, shopping cart, user authentication, checkout process, and admin panel for managing products and orders"
    },
    {
      name: "Social Media App",
      description: "Social platform with posts, comments, likes, and real-time chat",
      icon: "📱",
      prompt: "Build a social media application with user profiles, posts, comments, likes, follow system, and real-time messaging"
    },
    {
      name: "Task Management",
      description: "Collaborative project management tool with teams and deadlines",
      icon: "📋",
      prompt: "Create a comprehensive task management application with projects, teams, deadlines, file attachments, and progress tracking"
    },
    {
      name: "Blog Platform",
      description: "Full-featured blogging platform with CMS and analytics",
      icon: "📝",
      prompt: "Build a complete blogging platform with content management, user roles, comments, categories, SEO optimization, and analytics dashboard"
    },
    {
      name: "Learning Management",
      description: "Educational platform with courses, quizzes, and progress tracking",
      icon: "🎓",
      prompt: "Create a learning management system with courses, lessons, quizzes, certificates, and student progress tracking"
    },
    {
      name: "Real Estate Portal",
      description: "Property listings with search, filters, and virtual tours",
      icon: "🏠",
      prompt: "Build a real estate portal with property listings, advanced search and filters, map integration, virtual tours, and agent profiles"
    }
  ];

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Bot className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">AI Full-Stack Builder</h1>
            </div>
            <Badge variant="secondary" className="flex items-center space-x-1">
              <Brain className="h-3 w-3" />
              <span>DeepSeek AI Agent</span>
            </Badge>
            <div className="flex items-center space-x-2">
              <Button
                variant={projectType === 'fullstack' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProjectType('fullstack')}
              >
                <Database className="h-4 w-4 mr-1" />
                Full-Stack
              </Button>
              <Button
                variant={projectType === 'web' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProjectType('web')}
              >
                <Globe className="h-4 w-4 mr-1" />
                Frontend
              </Button>
              <Button
                variant={projectType === 'api' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setProjectType('api')}
              >
                <Settings className="h-4 w-4 mr-1" />
                API
              </Button>
            </div>
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
                <Rocket className="h-4 w-4" />
              )}
              <span>{isRunning ? 'Deploying...' : 'Deploy App'}</span>
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
          <ResizablePanel defaultSize={28} minSize={20} maxSize={40}>
            <div className="h-full flex flex-col bg-white border-r">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Wand2 className="h-5 w-5 mr-2 text-blue-600" />
                  AI Full-Stack Assistant
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Build complete applications with natural language
                </p>
              </div>
              
              {/* Quick Start Templates */}
              {messages.length === 0 && (
                <div className="p-4 border-b">
                  <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <Lightbulb className="h-4 w-4 mr-1" />
                    Quick Start Templates
                  </h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {quickStartTemplates.map((template, index) => (
                      <div
                        key={index}
                        className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => setPrompt(template.prompt)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{template.icon}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {template.name}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {template.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
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
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">
                        {message.content}
                      </div>
                      
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
                        <span className="text-sm text-yellow-700">AI is building your application...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              
              <div className="p-4 border-t">
                <div className="space-y-3">
                  <Textarea
                    placeholder={`Tell the AI what ${projectType} application to build...\n\nExample: "Create a task management app with user authentication, teams, project boards, and real-time collaboration"`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px] resize-none"
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
                        Building Application...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Build {projectType.charAt(0).toUpperCase() + projectType.slice(1)} App
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
                  Project Structure
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
          <ResizablePanel defaultSize={52} minSize={40}>
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
                    {selectedFile ? (
                      <MonacoCodeEditor
                        file={selectedFile}
                        onContentChange={handleContentChange}
                        onSave={() => toast({ title: "File saved", description: "Changes saved successfully" })}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Select a file to start editing</p>
                          <p className="text-sm text-gray-400 mt-2">Or ask the AI to create a new application</p>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="preview" className="h-full m-0">
                    <div className="h-full bg-white border border-gray-200 flex items-center justify-center">
                      {isRunning ? (
                        <div className="text-center">
                          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                          <p className="text-gray-600">Deploying your application...</p>
                          <p className="text-sm text-gray-400 mt-2">Setting up frontend, backend, and database</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Rocket className="h-8 w-8 text-blue-600" />
                          </div>
                          <p className="text-gray-600">Your application preview will appear here</p>
                          <p className="text-sm text-gray-400 mt-2">Click "Deploy App" to start the preview</p>
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

      {/* Status Bar */}
      <div className="bg-gray-100 border-t px-4 py-2 flex items-center justify-between text-sm text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Project Type: {projectType.charAt(0).toUpperCase() + projectType.slice(1)}</span>
          <span>•</span>
          <span>Files: {files.length}</span>
          <span>•</span>
          <span>AI Agent: Ready</span>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">DeepSeek AI</Badge>
          <span>Full-Stack Generator</span>
        </div>
      </div>
    </div>
  );
}