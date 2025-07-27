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
import { RealAICodeGenerator } from '@/services/realAICodeGenerator';
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

  const [aiGenerator] = useState(() => new RealAICodeGenerator());

  // Initialize with a comprehensive project structure
  useEffect(() => {
    const initializeProject = async () => {
      if (files.length === 0) {
        // Create full-stack project structure
        await createNewFile('frontend', 'folder');
        await createNewFile('backend', 'folder');
        await createNewFile('database', 'folder');
        await createNewFile('docs', 'folder');
        
        // Frontend structure
        const appContent = `import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // API call example
    fetch('/api/status')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center text-white mb-8">
          <h1 className="text-4xl font-bold mb-2">Full-Stack Application</h1>
          <p className="text-xl opacity-90">Built with AI in Sovereign IDE</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Frontend</h2>
            <p className="text-gray-600 mb-4">React application with modern UI</p>
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Learn More
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Backend API</h2>
            <p className="text-gray-600 mb-4">RESTful API with authentication</p>
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              API Docs
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Database</h2>
            <p className="text-gray-600 mb-4">
              Status: {loading ? 'Connecting...' : (data ? 'Connected' : 'Disconnected')}
            </p>
            <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
              View Schema
            </button>
          </div>
        </div>
        
        {data && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">API Response</h3>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}
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

// Routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: true,
      type: 'PostgreSQL'
    },
    endpoints: [
      'GET /api/status',
      'GET /api/users',
      'POST /api/users',
      'GET /api/projects',
      'POST /api/projects'
    ]
  });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
  ]);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: Date.now(),
    name,
    email,
    createdAt: new Date().toISOString()
  };
  res.status(201).json(newUser);
});

app.get('/api/projects', (req, res) => {
  res.json([
    { id: 1, name: 'E-commerce Site', status: 'active' },
    { id: 2, name: 'Blog Platform', status: 'development' }
  ]);
});

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`;

        const databaseSchema = `-- Full-Stack Application Database Schema
-- Created by Sovereign IDE AI Agent

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'development',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project files table
CREATE TABLE project_files (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    filename VARCHAR(255) NOT NULL,
    content TEXT,
    file_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API keys table
CREATE TABLE api_keys (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    key_name VARCHAR(100) NOT NULL,
    key_value VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO users (name, email, password_hash) VALUES 
('John Doe', 'john@example.com', 'hashed_password_123'),
('Jane Smith', 'jane@example.com', 'hashed_password_456');

INSERT INTO projects (name, description, user_id, status) VALUES 
('E-commerce Site', 'Full-stack e-commerce application', 1, 'active'),
('Blog Platform', 'Personal blogging platform', 1, 'development'),
('Analytics Dashboard', 'Real-time analytics dashboard', 2, 'planning');`;

        const packageJsonContent = `{
  "name": "sovereign-ide-fullstack-app",
  "version": "1.0.0",
  "description": "Full-stack application generated by Sovereign IDE AI Agent",
  "main": "backend/server.js",
  "scripts": {
    "start": "node backend/server.js",
    "dev": "concurrently \\"npm run server\\" \\"npm run client\\"",
    "server": "nodemon backend/server.js",
    "client": "cd frontend && npm start",
    "build": "cd frontend && npm run build",
    "test": "jest",
    "deploy": "npm run build && node deploy.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "pg": "^8.8.0",
    "dotenv": "^16.0.3",
    "helmet": "^6.0.1",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20",
    "concurrently": "^7.6.0",
    "jest": "^29.3.1"
  },
  "keywords": ["fullstack", "ai-generated", "sovereign-ide"],
  "author": "Sovereign IDE AI Agent",
  "license": "MIT"
}`;

        const readmeContent = `# Full-Stack Application
*Generated by Sovereign IDE AI Agent*

## 🚀 Features

- **Frontend**: Modern React application with responsive design
- **Backend**: Express.js REST API with authentication
- **Database**: PostgreSQL with proper schema design
- **Real-time**: WebSocket support for live features
- **Security**: JWT authentication, CORS, input validation
- **Testing**: Jest test suite included
- **Deployment**: Ready for production deployment

## 📁 Project Structure

\`\`\`
├── frontend/          # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/           # Express.js API server
│   ├── routes/
│   ├── middleware/
│   ├── models/
│   └── server.js
├── database/          # Database schema and migrations
│   ├── schema.sql
│   └── migrations/
└── docs/             # Documentation
    └── API.md
\`\`\`

## 🛠️ Quick Start

1. **Install Dependencies**
   \`\`\`bash
   npm install
   cd frontend && npm install
   \`\`\`

2. **Set Up Database**
   \`\`\`bash
   createdb your_app_db
   psql your_app_db < database/schema.sql
   \`\`\`

3. **Configure Environment**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your database credentials
   \`\`\`

4. **Start Development**
   \`\`\`bash
   npm run dev
   \`\`\`

## 🔌 API Endpoints

- \`GET /api/status\` - Server health check
- \`GET /api/users\` - Get all users
- \`POST /api/users\` - Create new user
- \`GET /api/projects\` - Get user projects
- \`POST /api/projects\` - Create new project

## 🚀 Deployment

The application is ready for deployment to:
- Heroku
- Vercel
- DigitalOcean
- AWS
- Google Cloud

Built with ❤️ by Sovereign IDE AI Agent`;

        // Create all files
        await dynamicCodeModifier.createFile('/frontend/App.tsx', appContent);
        await dynamicCodeModifier.createFile('/backend/server.js', backendContent);
        await dynamicCodeModifier.createFile('/database/schema.sql', databaseSchema);
        await dynamicCodeModifier.createFile('/package.json', packageJsonContent);
        await dynamicCodeModifier.createFile('/README.md', readmeContent);

        // Load initial file
        setSelectedFile({
          id: 'app',
          name: 'App.tsx',
          content: appContent,
          language: 'typescript'
        });

        toast({
          title: "Full-Stack Project Initialized",
          description: "Complete application structure created with frontend, backend, and database",
        });
      }
    };

    initializeProject();
  }, [files.length, createNewFile, toast]);

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

      // Stream AI response with real-time updates
      let streamedContent = '';
      let generatedFiles: any[] = [];

      await aiGenerator.streamChatResponse([
        {
          id: '1',
          role: 'system',
          content: `You are a world-class full-stack developer and AI coding assistant. You have access to MCP (Model Context Protocol) tools for file operations.

Available MCP Tools:
- createFile(path, content): Create new files
- updateFile(path, content): Update existing files
- deleteFile(path): Delete files
- readFile(path): Read file contents

Project Context:
- Type: ${projectType.toUpperCase()}
- Current Files: ${validFiles.map(f => f.name).join(', ')}
- Framework: ${projectType === 'fullstack' ? 'React + Node.js + PostgreSQL' : projectType === 'web' ? 'React' : 'Node.js/Express'}

Instructions:
1. Analyze the user's request carefully
2. Generate complete, production-ready code
3. Use MCP tools to create/modify files
4. Explain your changes clearly
5. Follow best practices for ${projectType} development

When creating files, use this format:
🔧 Creating: /path/to/file
[file content]

When modifying files, use this format:
🔧 Updating: /path/to/file
[file content]`,
          timestamp: new Date()
        },
        {
          id: '2',
          role: 'user',
          content: prompt,
          timestamp: new Date()
        }
      ], (token: string) => {
        streamedContent += token;
        
        // Update the assistant message in real-time
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: streamedContent }
            : msg
        ));

        // Parse for file operations in real-time
        const fileCreateMatches = streamedContent.match(/🔧 Creating: (\/[^\n]+)\n([\s\S]*?)(?=🔧|$)/g);
        const fileUpdateMatches = streamedContent.match(/🔧 Updating: (\/[^\n]+)\n([\s\S]*?)(?=🔧|$)/g);
        
        if (fileCreateMatches || fileUpdateMatches) {
          const newFiles: any[] = [];
          
          // Process file creations
          fileCreateMatches?.forEach(match => {
            const lines = match.split('\n');
            const path = lines[0].replace('🔧 Creating: ', '');
            const content = lines.slice(1).join('\n').trim();
            
            if (path && content) {
              newFiles.push({ path, content, operation: 'create' });
              dynamicCodeModifier.createFile(path, content);
            }
          });

          // Process file updates
          fileUpdateMatches?.forEach(match => {
            const lines = match.split('\n');
            const path = lines[0].replace('🔧 Updating: ', '');
            const content = lines.slice(1).join('\n').trim();
            
            if (path && content) {
              newFiles.push({ path, content, operation: 'update' });
              dynamicCodeModifier.updateFile(path, content);
            }
          });

          if (newFiles.length > 0) {
            generatedFiles = [...generatedFiles, ...newFiles];
            
            // Update file explorer
            updateFiles(files);
            
            // Update selected file if it matches
            if (selectedFile && newFiles.some(f => f.path.includes(selectedFile.name))) {
              const matchingFile = newFiles.find(f => f.path.includes(selectedFile.name));
              if (matchingFile) {
                setSelectedFile(prev => prev ? {
                  ...prev,
                  content: matchingFile.content
                } : null);
              }
            }
          }
        }
      });

      // Final update with files
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: streamedContent, files: generatedFiles }
          : msg
      ));

      toast({
        title: "🚀 AI Development Complete",
        description: `Generated ${generatedFiles.length} files with streaming response`,
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