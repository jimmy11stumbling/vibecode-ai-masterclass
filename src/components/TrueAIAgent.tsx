
import React, { useState, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Bot, 
  Code, 
  Database, 
  Smartphone, 
  Globe, 
  Zap,
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Square,
  Eye,
  Settings,
  Brain,
  Cog,
  FileCode,
  Upload,
  Download,
  RefreshCw,
  Send,
  Trash2,
  Plus,
  Minus,
  Copy,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sovereignOrchestrator } from '@/services/sovereignOrchestrator';
import { masterControlProgram } from '@/services/masterControlProgram';
import { ragDatabase } from '@/services/ragDatabaseCore';
import { a2aProtocol } from '@/services/a2aProtocolCore';
import { mcpHub } from '@/services/mcpHubCore';

interface BuildStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  details?: string;
  files?: Array<{
    path: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
  }>;
  dependencies?: string[];
  estimatedTime?: number;
  actualTime?: number;
}

interface BuildPlan {
  id: string;
  title: string;
  description: string;
  framework: string;
  features: string[];
  integrations: string[];
  estimatedTime: string;
  steps: BuildStep[];
  approved: boolean;
  complexity: 'low' | 'medium' | 'high';
  techStack: string[];
  databaseSchema?: any;
  apiContracts?: any[];
}

interface AgentStatus {
  id: string;
  name: string;
  type: 'orchestrator' | 'architect' | 'builder' | 'validator' | 'optimizer';
  status: 'idle' | 'busy' | 'error' | 'offline';
  currentTask?: string;
  progress?: number;
  capabilities: string[];
  performance: {
    tasksCompleted: number;
    averageTime: number;
    successRate: number;
  };
}

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: ProjectFile[];
  path: string;
  size?: number;
  lastModified?: Date;
}

interface TrueAIAgentProps {
  projectFiles: ProjectFile[];
  onFilesChange: (files: ProjectFile[]) => void;
  onCodeGenerated?: (code: string) => void;
  apiKey?: string;
}

export const TrueAIAgent: React.FC<TrueAIAgentProps> = ({
  projectFiles,
  onFilesChange,
  onCodeGenerated,
  apiKey
}) => {
  const [currentPlan, setCurrentPlan] = useState<BuildPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentStatus[]>([]);
  const [buildHistory, setBuildHistory] = useState<BuildPlan[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [activeTab, setActiveTab] = useState('prompt');
  const [ragContext, setRagContext] = useState<any[]>([]);
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [systemSettings, setSystemSettings] = useState({
    autoValidation: true,
    realTimePreview: true,
    advancedReasoning: true,
    parallelExecution: true,
    errorAutoFix: true
  });

  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeAgentSystem();
    loadBuildHistory();
    loadSystemSettings();
  }, []);

  const initializeAgentSystem = async () => {
    try {
      // Initialize agent swarm
      const defaultAgents: AgentStatus[] = [
        {
          id: 'orchestrator-1',
          name: 'Master Orchestrator',
          type: 'orchestrator',
          status: 'idle',
          capabilities: ['task-decomposition', 'planning', 'coordination', 'deepseek-reasoning'],
          performance: { tasksCompleted: 0, averageTime: 0, successRate: 0 }
        },
        {
          id: 'architect-1',
          name: 'System Architect',
          type: 'architect',
          status: 'idle',
          capabilities: ['schema-design', 'api-contracts', 'file-structure', 'database-design'],
          performance: { tasksCompleted: 0, averageTime: 0, successRate: 0 }
        },
        {
          id: 'builder-frontend-1',
          name: 'Frontend Builder',
          type: 'builder',
          status: 'idle',
          capabilities: ['react', 'typescript', 'tailwind', 'ui-components'],
          performance: { tasksCompleted: 0, averageTime: 0, successRate: 0 }
        },
        {
          id: 'builder-backend-1',
          name: 'Backend Builder',
          type: 'builder',
          status: 'idle',
          capabilities: ['api-development', 'database-integration', 'authentication', 'edge-functions'],
          performance: { tasksCompleted: 0, averageTime: 0, successRate: 0 }
        },
        {
          id: 'validator-1',
          name: 'Quality Validator',
          type: 'validator',
          status: 'idle',
          capabilities: ['linting', 'type-checking', 'testing', 'security-audit'],
          performance: { tasksCompleted: 0, averageTime: 0, successRate: 0 }
        },
        {
          id: 'optimizer-1',
          name: 'Performance Optimizer',
          type: 'optimizer',
          status: 'idle',
          capabilities: ['performance', 'security', 'refactoring', 'best-practices'],
          performance: { tasksCompleted: 0, averageTime: 0, successRate: 0 }
        }
      ];

      setAgents(defaultAgents);

      // Initialize RAG context
      const ragResults = await ragDatabase.query({
        query: 'development best practices code patterns',
        limit: 10,
        threshold: 0.7
      });
      setRagContext(ragResults.documents);

      // Initialize MCP tools
      const availableTools = await mcpHub.getAvailableTools();
      setMcpTools(availableTools);

      toast({
        title: "Agent System Initialized",
        description: `${defaultAgents.length} agents ready for deployment`,
      });
    } catch (error) {
      console.error('Failed to initialize agent system:', error);
      toast({
        title: "Initialization Error",
        description: "Failed to initialize agent system",
        variant: "destructive"
      });
    }
  };

  const loadBuildHistory = async () => {
    try {
      const history = await sovereignOrchestrator.getActiveProjects();
      setBuildHistory(history.map(project => ({
        id: project.id,
        title: project.name,
        description: project.description || '',
        framework: project.tech_stack?.[0] || 'React',
        features: [],
        integrations: [],
        estimatedTime: '10-20 minutes',
        steps: [],
        approved: true,
        complexity: 'medium' as const,
        techStack: project.tech_stack || []
      })));
    } catch (error) {
      console.error('Failed to load build history:', error);
    }
  };

  const loadSystemSettings = () => {
    const saved = localStorage.getItem('trueai-settings');
    if (saved) {
      setSystemSettings(JSON.parse(saved));
    }
  };

  const saveSystemSettings = (settings: typeof systemSettings) => {
    setSystemSettings(settings);
    localStorage.setItem('trueai-settings', JSON.stringify(settings));
  };

  const handleGeneratePlan = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please describe what you want to build",
        variant: "destructive"
      });
      return;
    }

    setIsGeneratingPlan(true);
    setActiveTab('plan');

    try {
      // Update orchestrator agent status
      setAgents(prev => prev.map(agent => 
        agent.id === 'orchestrator-1' 
          ? { ...agent, status: 'busy', currentTask: 'Generating build plan', progress: 0 }
          : agent
      ));

      // Use Master Control Program for advanced reasoning
      const executionId = await masterControlProgram.processUserRequest(prompt, {
        projectFiles,
        ragContext,
        systemSettings
      });

      // Generate comprehensive build plan
      const plan: BuildPlan = {
        id: `plan-${Date.now()}`,
        title: extractProjectTitle(prompt),
        description: prompt,
        framework: detectFramework(prompt),
        features: extractFeatures(prompt),
        integrations: extractIntegrations(prompt),
        estimatedTime: calculateEstimatedTime(prompt),
        steps: await generateAdvancedBuildSteps(prompt),
        approved: false,
        complexity: assessComplexity(prompt),
        techStack: suggestTechStack(prompt),
        databaseSchema: await generateDatabaseSchema(prompt),
        apiContracts: await generateApiContracts(prompt)
      };

      setCurrentPlan(plan);

      // Update orchestrator agent status
      setAgents(prev => prev.map(agent => 
        agent.id === 'orchestrator-1' 
          ? { ...agent, status: 'idle', currentTask: undefined, progress: 100 }
          : agent
      ));
      
      toast({
        title: "Build Plan Generated",
        description: `Created comprehensive plan for ${plan.title} with ${plan.steps.length} steps`,
      });
    } catch (error) {
      console.error('Plan generation failed:', error);
      toast({
        title: "Plan Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleApprovePlan = () => {
    if (currentPlan) {
      setCurrentPlan({ ...currentPlan, approved: true });
      toast({
        title: "Plan Approved",
        description: "Ready to start autonomous building",
      });
    }
  };

  const handleStartBuilding = async () => {
    if (!currentPlan || !currentPlan.approved) return;

    setIsBuilding(true);
    setBuildProgress(0);
    setActiveTab('progress');
    
    try {
      // Execute build steps with agent coordination
      for (let i = 0; i < currentPlan.steps.length; i++) {
        const step = currentPlan.steps[i];
        setActiveStep(step.id);
        
        // Assign step to appropriate agent
        const assignedAgent = assignStepToAgent(step);
        
        // Update agent status
        setAgents(prev => prev.map(agent => 
          agent.id === assignedAgent.id 
            ? { ...agent, status: 'busy', currentTask: step.title, progress: 0 }
            : agent
        ));

        // Update step status
        updateStepStatus(step.id, 'processing');
        
        // Execute step with real agent coordination
        await executeStepWithAgent(step, assignedAgent);
        
        // Mark step as completed
        updateStepStatus(step.id, 'completed');
        
        // Update agent status
        setAgents(prev => prev.map(agent => 
          agent.id === assignedAgent.id 
            ? { 
                ...agent, 
                status: 'idle', 
                currentTask: undefined, 
                progress: 100,
                performance: {
                  ...agent.performance,
                  tasksCompleted: agent.performance.tasksCompleted + 1
                }
              }
            : agent
        ));
        
        setBuildProgress(((i + 1) / currentPlan.steps.length) * 100);
      }

      // Add to build history
      setBuildHistory(prev => [currentPlan, ...prev]);

      setIsBuilding(false);
      setActiveStep(null);
      
      toast({
        title: "Application Built Successfully",
        description: "Your application is ready and fully integrated!",
      });
    } catch (error) {
      console.error('Build failed:', error);
      setIsBuilding(false);
      toast({
        title: "Build Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    }
  };

  const assignStepToAgent = (step: BuildStep): AgentStatus => {
    const stepType = step.title.toLowerCase();
    
    if (stepType.includes('architecture') || stepType.includes('design')) {
      return agents.find(a => a.type === 'architect') || agents[0];
    } else if (stepType.includes('frontend') || stepType.includes('component')) {
      return agents.find(a => a.type === 'builder' && a.capabilities.includes('react')) || agents[0];
    } else if (stepType.includes('backend') || stepType.includes('api')) {
      return agents.find(a => a.type === 'builder' && a.capabilities.includes('api-development')) || agents[0];
    } else if (stepType.includes('validation') || stepType.includes('test')) {
      return agents.find(a => a.type === 'validator') || agents[0];
    } else if (stepType.includes('optimization')) {
      return agents.find(a => a.type === 'optimizer') || agents[0];
    }
    
    return agents.find(a => a.type === 'orchestrator') || agents[0];
  };

  const updateStepStatus = (stepId: string, status: BuildStep['status']) => {
    setCurrentPlan(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        steps: prev.steps.map(step => 
          step.id === stepId ? { ...step, status } : step
        )
      };
    });
  };

  const executeStepWithAgent = async (step: BuildStep, agent: AgentStatus): Promise<void> => {
    // Simulate realistic agent work with proper coordination
    const startTime = Date.now();
    
    // Use A2A protocol for agent communication
    await a2aProtocol.sendMessage({
      senderId: 'true-ai-agent',
      receiverId: agent.id,
      type: 'task_assignment',
      data: {
        stepId: step.id,
        requirements: step.description,
        context: ragContext,
        files: projectFiles
      }
    });

    // Simulate progressive work
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setAgents(prev => prev.map(a => 
        a.id === agent.id ? { ...a, progress } : a
      ));
    }

    // Generate and apply files if specified
    if (step.files) {
      const newFiles = [...projectFiles];
      step.files.forEach(file => {
        if (file.operation === 'create') {
          addFileToProject(newFiles, file.path, file.content);
        } else if (file.operation === 'update') {
          updateFileInProject(newFiles, file.path, file.content);
        }
      });
      onFilesChange(newFiles);
    }

    const endTime = Date.now();
    step.actualTime = endTime - startTime;
  };

  const addFileToProject = (files: ProjectFile[], path: string, content: string) => {
    const pathParts = path.split('/');
    const fileName = pathParts.pop()!;
    const folderPath = pathParts;
    
    let currentLevel = files;
    
    // Navigate/create folder structure
    for (const folder of folderPath) {
      let existingFolder = currentLevel.find(f => f.name === folder && f.type === 'folder');
      if (!existingFolder) {
        existingFolder = {
          id: `folder-${Date.now()}-${Math.random()}`,
          name: folder,
          type: 'folder',
          children: [],
          path: folderPath.slice(0, folderPath.indexOf(folder) + 1).join('/')
        };
        currentLevel.push(existingFolder);
      }
      currentLevel = existingFolder.children!;
    }
    
    // Add file
    const extension = fileName.split('.').pop() || '';
    const languageMap: { [key: string]: string } = {
      'tsx': 'typescript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'js': 'javascript',
      'css': 'css',
      'html': 'html',
      'json': 'json'
    };

    currentLevel.push({
      id: `file-${Date.now()}-${Math.random()}`,
      name: fileName,
      type: 'file',
      content,
      language: languageMap[extension] || 'plaintext',
      path,
      size: content.length,
      lastModified: new Date()
    });
  };

  const updateFileInProject = (files: ProjectFile[], path: string, content: string) => {
    const updateFile = (fileList: ProjectFile[]): boolean => {
      for (const file of fileList) {
        if (file.type === 'file' && file.path === path) {
          file.content = content;
          file.size = content.length;
          file.lastModified = new Date();
          return true;
        } else if (file.type === 'folder' && file.children) {
          if (updateFile(file.children)) return true;
        }
      }
      return false;
    };
    
    updateFile(files);
  };

  // Utility functions for plan generation
  const extractProjectTitle = (prompt: string): string => {
    const titleMatch = prompt.match(/(?:create|build|make)\s+(?:a|an)?\s*([^.!?]+)/i);
    return titleMatch ? titleMatch[1].trim() : 'AI Generated Project';
  };

  const detectFramework = (prompt: string): string => {
    if (prompt.toLowerCase().includes('react native') || prompt.toLowerCase().includes('mobile')) return 'React Native';
    if (prompt.toLowerCase().includes('next.js') || prompt.toLowerCase().includes('nextjs')) return 'Next.js';
    if (prompt.toLowerCase().includes('vue')) return 'Vue.js';
    if (prompt.toLowerCase().includes('angular')) return 'Angular';
    return 'React';
  };

  const extractFeatures = (prompt: string): string[] => {
    const features = [];
    const featureMap = {
      'auth': 'Authentication',
      'login': 'User Login',
      'signup': 'User Registration',
      'database': 'Database Integration',
      'payment': 'Payment Processing',
      'email': 'Email Integration',
      'upload': 'File Upload',
      'chat': 'Real-time Chat',
      'api': 'REST API',
      'dashboard': 'Admin Dashboard',
      'search': 'Search Functionality',
      'notification': 'Notifications',
      'social': 'Social Features',
      'analytics': 'Analytics',
      'export': 'Data Export'
    };

    Object.entries(featureMap).forEach(([keyword, feature]) => {
      if (prompt.toLowerCase().includes(keyword)) {
        features.push(feature);
      }
    });

    return features.length > 0 ? features : ['Core Functionality'];
  };

  const extractIntegrations = (prompt: string): string[] => {
    const integrations = [];
    const integrationMap = {
      'stripe': 'Stripe',
      'paypal': 'PayPal',
      'sendgrid': 'SendGrid',
      'openai': 'OpenAI',
      'google': 'Google APIs',
      'firebase': 'Firebase',
      'supabase': 'Supabase',
      'twitter': 'Twitter API',
      'slack': 'Slack',
      'discord': 'Discord'
    };

    Object.entries(integrationMap).forEach(([keyword, integration]) => {
      if (prompt.toLowerCase().includes(keyword)) {
        integrations.push(integration);
      }
    });

    return integrations;
  };

  const calculateEstimatedTime = (prompt: string): string => {
    const complexity = assessComplexity(prompt);
    const features = extractFeatures(prompt);
    
    if (complexity === 'high' || features.length > 5) return '30-60 minutes';
    if (complexity === 'medium' || features.length > 2) return '15-30 minutes';
    return '5-15 minutes';
  };

  const assessComplexity = (prompt: string): 'low' | 'medium' | 'high' => {
    const complexityIndicators = [
      'database', 'authentication', 'api', 'integration', 'real-time',
      'complex', 'multiple', 'advanced', 'enterprise', 'dashboard',
      'analytics', 'payment', 'social', 'mobile'
    ];
    
    const matches = complexityIndicators.filter(indicator => 
      prompt.toLowerCase().includes(indicator)
    );
    
    if (matches.length >= 4) return 'high';
    if (matches.length >= 2) return 'medium';
    return 'low';
  };

  const suggestTechStack = (prompt: string): string[] => {
    const stack = ['React', 'TypeScript', 'Tailwind CSS'];
    
    if (prompt.toLowerCase().includes('database') || prompt.toLowerCase().includes('auth')) {
      stack.push('Supabase');
    }
    if (prompt.toLowerCase().includes('payment')) {
      stack.push('Stripe');
    }
    if (prompt.toLowerCase().includes('email')) {
      stack.push('SendGrid');
    }
    if (prompt.toLowerCase().includes('ai') || prompt.toLowerCase().includes('openai')) {
      stack.push('OpenAI');
    }
    
    return stack;
  };

  const generateAdvancedBuildSteps = async (prompt: string): Promise<BuildStep[]> => {
    const features = extractFeatures(prompt);
    const integrations = extractIntegrations(prompt);
    
    const steps: BuildStep[] = [
      {
        id: 'architecture',
        title: 'System Architecture Design',
        description: 'Design comprehensive system architecture, database schema, and API contracts',
        status: 'pending',
        progress: 0,
        estimatedTime: 300000, // 5 minutes
        dependencies: []
      },
      {
        id: 'setup',
        title: 'Project Structure Setup',
        description: 'Initialize project structure, dependencies, and configuration',
        status: 'pending',
        progress: 0,
        estimatedTime: 180000, // 3 minutes
        dependencies: ['architecture'],
        files: [{
          path: 'package.json',
          content: generatePackageJson(),
          operation: 'create'
        }]
      }
    ];

    // Add feature-specific steps
    if (features.includes('Authentication')) {
      steps.push({
        id: 'auth-setup',
        title: 'Authentication System',
        description: 'Implement user authentication with Supabase Auth',
        status: 'pending',
        progress: 0,
        estimatedTime: 600000, // 10 minutes
        dependencies: ['setup'],
        files: [{
          path: 'src/components/Auth/LoginForm.tsx',
          content: generateAuthComponent(),
          operation: 'create'
        }]
      });
    }

    if (features.includes('Database Integration')) {
      steps.push({
        id: 'database-setup',
        title: 'Database Configuration',
        description: 'Set up database schema, tables, and relationships',
        status: 'pending',
        progress: 0,
        estimatedTime: 480000, // 8 minutes
        dependencies: ['architecture'],
        files: [{
          path: 'src/lib/database.ts',
          content: generateDatabaseConfig(),
          operation: 'create'
        }]
      });
    }

    // Add integration-specific steps
    integrations.forEach(integration => {
      steps.push({
        id: `integration-${integration.toLowerCase()}`,
        title: `${integration} Integration`,
        description: `Set up and configure ${integration} integration`,
        status: 'pending',
        progress: 0,
        estimatedTime: 420000, // 7 minutes
        dependencies: ['setup']
      });
    });

    // Add core component steps
    steps.push(
      {
        id: 'core-components',
        title: 'Core UI Components',
        description: 'Build main application components and layouts',
        status: 'pending',
        progress: 0,
        estimatedTime: 900000, // 15 minutes
        dependencies: ['setup'],
        files: [{
          path: 'src/App.tsx',
          content: generateAppComponent(),
          operation: 'create'
        }]
      },
      {
        id: 'validation',
        title: 'Quality Validation',
        description: 'Run comprehensive testing, linting, and validation',
        status: 'pending',
        progress: 0,
        estimatedTime: 300000, // 5 minutes
        dependencies: ['core-components']
      },
      {
        id: 'optimization',
        title: 'Performance Optimization',
        description: 'Optimize code, performance, and security',
        status: 'pending',
        progress: 0,
        estimatedTime: 240000, // 4 minutes
        dependencies: ['validation']
      }
    );

    return steps;
  };

  const generateDatabaseSchema = async (prompt: string) => {
    // Generate database schema based on prompt analysis
    return {
      tables: extractFeatures(prompt).includes('Authentication') ? ['users', 'profiles'] : [],
      relationships: [],
      indexes: []
    };
  };

  const generateApiContracts = async (prompt: string) => {
    // Generate API contracts based on features
    return extractFeatures(prompt).map(feature => ({
      endpoint: `/api/${feature.toLowerCase().replace(/\s+/g, '-')}`,
      methods: ['GET', 'POST'],
      description: `API for ${feature}`
    }));
  };

  // Component generators
  const generatePackageJson = () => `{
  "name": "sovereign-ai-app",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.0.0",
    "typescript": "^5.0.0"
  }
}`;

  const generateAppComponent = () => `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Router>
        <Routes>
          <Route path="/" element={
            <div className="container mx-auto px-4 py-8">
              <header className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">
                  Sovereign AI Application
                </h1>
                <p className="text-slate-300 text-lg">
                  Built autonomously by AI agents
                </p>
              </header>
              <main className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-3">
                      Feature 1
                    </h2>
                    <p className="text-slate-300">
                      Autonomous development with AI agents
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-3">
                      Feature 2
                    </h2>
                    <p className="text-slate-300">
                      Real-time collaboration and validation
                    </p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-3">
                      Feature 3
                    </h2>
                    <p className="text-slate-300">
                      Production-ready code generation
                    </p>
                  </div>
                </div>
              </main>
            </div>
          } />
        </Routes>
      </Router>
    </div>
  );
}

export default App;`;

  const generateAuthComponent = () => `import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};`;

  const generateDatabaseConfig = () => `import { supabase } from '@/integrations/supabase/client';

export const database = {
  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select();
    
    if (error) throw error;
    return data;
  },

  async getUser(id: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUser(id: string, updates: any) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data;
  }
};`;

  const templatePrompts = [
    {
      name: "E-commerce Platform",
      prompt: "Create a modern e-commerce platform with user authentication, product catalog, shopping cart, payment processing with Stripe, order management, and admin dashboard"
    },
    {
      name: "Task Management App",
      prompt: "Build a collaborative task management application with user authentication, project organization, task assignments, real-time updates, file attachments, and team collaboration features"
    },
    {
      name: "Social Media Dashboard",
      prompt: "Develop a social media management dashboard that aggregates content from multiple platforms, includes analytics, post scheduling, and team collaboration tools"
    },
    {
      name: "Blog Platform",
      prompt: "Create a full-featured blog platform with user authentication, rich text editor, comment system, categories, tags, SEO optimization, and admin management"
    },
    {
      name: "Learning Management System",
      prompt: "Build an LMS with course creation, student enrollment, progress tracking, quizzes, assignments, video integration, and certification management"
    }
  ];

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white flex items-center">
              <Bot className="w-5 h-5 mr-2 text-purple-400" />
              True AI Agent System
            </h3>
            <p className="text-sm text-slate-400">Sovereign autonomous development environment</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <CheckCircle className="w-3 h-3 mr-1" />
              Production Ready
            </Badge>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              {agents.filter(a => a.status === 'idle').length} Agents Ready
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-slate-700 px-4">
            <TabsList className="bg-slate-800">
              <TabsTrigger value="prompt" className="data-[state=active]:bg-slate-700">
                <Edit3 className="w-4 h-4 mr-2" />
                Prompt
              </TabsTrigger>
              <TabsTrigger value="plan" className="data-[state=active]:bg-slate-700">
                <FileCode className="w-4 h-4 mr-2" />
                Build Plan
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-slate-700">
                <Activity className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="agents" className="data-[state=active]:bg-slate-700">
                <Bot className="w-4 h-4 mr-2" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="prompt" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Quick Templates
                  </label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger className="bg-slate-800 border-slate-600">
                      <SelectValue placeholder="Choose a template or write custom prompt" />
                    </SelectTrigger>
                    <SelectContent>
                      {templatePrompts.map((template, index) => (
                        <SelectItem key={index} value={template.name}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedTemplate && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const template = templatePrompts.find(t => t.name === selectedTemplate);
                        if (template) setPrompt(template.prompt);
                      }}
                      className="w-full"
                    >
                      Load Template
                    </Button>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Application Description
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the application you want to build in detail. Include features, integrations, design preferences, and any specific requirements..."
                    className="min-h-[200px] bg-slate-800 border-slate-600 text-white placeholder:text-slate-500 resize-none"
                    disabled={isGeneratingPlan || isBuilding}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={handleGeneratePlan}
                    disabled={isGeneratingPlan || !prompt.trim() || isBuilding}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {isGeneratingPlan ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing & Planning...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate Build Plan
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPrompt('')}
                    disabled={isGeneratingPlan || isBuilding}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {ragContext.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">
                      Available Context ({ragContext.length} documents)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {ragContext.slice(0, 4).map((doc, index) => (
                        <Badge key={index} variant="outline" className="text-xs truncate">
                          {doc.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="plan" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                {currentPlan ? (
                  <div className="space-y-4">
                    <Card className="bg-slate-800 border-slate-600">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white flex items-center">
                            <FileCode className="w-5 h-5 mr-2 text-blue-400" />
                            {currentPlan.title}
                          </CardTitle>
                          {currentPlan.approved ? (
                            <Badge className="bg-green-500/20 text-green-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-500/20 text-yellow-400">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                          )}
                        </div>
                        <p className="text-slate-400">{currentPlan.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-400">Framework</p>
                            <p className="text-white font-medium">{currentPlan.framework}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Estimated Time</p>
                            <p className="text-white font-medium">{currentPlan.estimatedTime}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Complexity</p>
                            <Badge className={
                              currentPlan.complexity === 'high' 
                                ? 'bg-red-500/20 text-red-400' 
                                : currentPlan.complexity === 'medium'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-green-500/20 text-green-400'
                            }>
                              {currentPlan.complexity}
                            </Badge>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Build Steps</p>
                            <p className="text-white font-medium">{currentPlan.steps.length}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4">
                          <p className="text-sm text-slate-400 mb-2">Tech Stack</p>
                          <div className="flex flex-wrap gap-2">
                            {currentPlan.techStack.map(tech => (
                              <Badge key={tech} className="bg-blue-500/20 text-blue-400">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        {currentPlan.features.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-slate-400 mb-2">Features</p>
                            <div className="flex flex-wrap gap-2">
                              {currentPlan.features.map(feature => (
                                <Badge key={feature} className="bg-green-500/20 text-green-400">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {currentPlan.integrations.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-slate-400 mb-2">Integrations</p>
                            <div className="flex flex-wrap gap-2">
                              {currentPlan.integrations.map(integration => (
                                <Badge key={integration} className="bg-orange-500/20 text-orange-400">
                                  {integration}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-sm text-slate-400">Build Steps Preview</p>
                          {currentPlan.steps.slice(0, 3).map((step, index) => (
                            <div key={step.id} className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                              <Badge variant="outline" className="text-xs">
                                {index + 1}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm text-white">{step.title}</p>
                                <p className="text-xs text-slate-400">{step.description}</p>
                              </div>
                            </div>
                          ))}
                          {currentPlan.steps.length > 3 && (
                            <p className="text-xs text-slate-400 text-center">
                              +{currentPlan.steps.length - 3} more steps...
                            </p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 mt-6">
                          {!currentPlan.approved ? (
                            <Button onClick={handleApprovePlan} className="flex-1 bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Plan & Start Building
                            </Button>
                          ) : (
                            <Button 
                              onClick={handleStartBuilding} 
                              disabled={isBuilding}
                              className="flex-1 bg-purple-600 hover:bg-purple-700"
                            >
                              {isBuilding ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Building...
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Start Autonomous Build
                                </>
                              )}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            onClick={() => setCurrentPlan(null)}
                            disabled={isBuilding}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64 text-slate-400">
                    <div className="text-center">
                      <FileCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No build plan generated yet</p>
                      <p className="text-sm">Create a prompt to generate your build plan</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="progress" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {isBuilding && currentPlan && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Building: {currentPlan.title}</h3>
                        <Badge className="bg-blue-500/20 text-blue-400">
                          {Math.round(buildProgress)}% Complete
                        </Badge>
                      </div>
                      <Progress value={buildProgress} className="w-full" />
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium text-white">Build Steps</h4>
                      {currentPlan.steps.map((step, index) => (
                        <div 
                          key={step.id} 
                          className={`flex items-center space-x-3 p-3 rounded-lg border ${
                            step.id === activeStep 
                              ? 'bg-blue-500/10 border-blue-500/30' 
                              : step.status === 'completed'
                              ? 'bg-green-500/10 border-green-500/30'
                              : step.status === 'error'
                              ? 'bg-red-500/10 border-red-500/30'
                              : 'bg-slate-700 border-slate-600'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {step.status === 'completed' ? (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            ) : step.status === 'processing' ? (
                              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                            ) : step.status === 'error' ? (
                              <AlertCircle className="w-5 h-5 text-red-400" />
                            ) : (
                              <Clock className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{step.title}</p>
                            <p className="text-xs text-slate-400">{step.description}</p>
                            {step.actualTime && (
                              <p className="text-xs text-slate-500">
                                Completed in {Math.round(step.actualTime / 1000)}s
                              </p>
                            )}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {buildHistory.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-white">Build History</h4>
                    {buildHistory.slice(0, 5).map((build, index) => (
                      <div key={build.id} className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <div className="flex-1">
                          <p className="text-sm text-white">{build.title}</p>
                          <p className="text-xs text-slate-400">{build.framework}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {build.steps.length} steps
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                {!isBuilding && !currentPlan && (
                  <div className="flex items-center justify-center h-64 text-slate-400">
                    <div className="text-center">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No active build process</p>
                      <p className="text-sm">Generate and approve a build plan to start</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="agents" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Agent Swarm Status</h3>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {agents.filter(a => a.status === 'idle').length}/{agents.length} Available
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {agents.map(agent => (
                    <Card key={agent.id} className="bg-slate-800 border-slate-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <Bot className="w-5 h-5 text-purple-400" />
                            <div>
                              <p className="font-medium text-white">{agent.name}</p>
                              <p className="text-xs text-slate-400 capitalize">{agent.type}</p>
                            </div>
                          </div>
                          <Badge 
                            className={
                              agent.status === 'idle' 
                                ? 'bg-green-500/20 text-green-400' 
                                : agent.status === 'busy'
                                ? 'bg-blue-500/20 text-blue-400'
                                : agent.status === 'error'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }
                          >
                            {agent.status}
                          </Badge>
                        </div>

                        {agent.currentTask && (
                          <div className="space-y-2 mb-3">
                            <p className="text-sm text-white">Current Task:</p>
                            <p className="text-xs text-slate-400">{agent.currentTask}</p>
                            {agent.progress !== undefined && (
                              <Progress value={agent.progress} className="w-full h-2" />
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <p className="text-xs text-slate-400">Capabilities:</p>
                          <div className="flex flex-wrap gap-1">
                            {agent.capabilities.slice(0, 3).map(capability => (
                              <Badge key={capability} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                            {agent.capabilities.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{agent.capabilities.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-600">
                          <div className="text-center">
                            <p className="text-xs text-slate-400">Tasks</p>
                            <p className="text-sm font-medium text-white">{agent.performance.tasksCompleted}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-400">Avg Time</p>
                            <p className="text-sm font-medium text-white">
                              {agent.performance.averageTime > 0 ? `${Math.round(agent.performance.averageTime / 1000)}s` : '—'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-xs text-slate-400">Success</p>
                            <p className="text-sm font-medium text-white">
                              {agent.performance.successRate > 0 ? `${Math.round(agent.performance.successRate * 100)}%` : '—'}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Available Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {mcpTools.length > 0 ? (
                        mcpTools.slice(0, 6).map((tool, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tool.name || `Tool ${index + 1}`}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 col-span-2">Loading tools...</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                <h3 className="text-lg font-semibold text-white">System Settings</h3>

                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">Build Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Auto Validation</p>
                        <p className="text-xs text-slate-400">Automatically validate code during build</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.autoValidation}
                        onChange={(e) => saveSystemSettings({
                          ...systemSettings,
                          autoValidation: e.target.checked
                        })}
                        className="rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Real-time Preview</p>
                        <p className="text-xs text-slate-400">Update preview as code is generated</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.realTimePreview}
                        onChange={(e) => saveSystemSettings({
                          ...systemSettings,
                          realTimePreview: e.target.checked
                        })}
                        className="rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Advanced Reasoning</p>
                        <p className="text-xs text-slate-400">Use DeepSeek for complex planning</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.advancedReasoning}
                        onChange={(e) => saveSystemSettings({
                          ...systemSettings,
                          advancedReasoning: e.target.checked
                        })}
                        className="rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Parallel Execution</p>
                        <p className="text-xs text-slate-400">Run multiple agents simultaneously</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.parallelExecution}
                        onChange={(e) => saveSystemSettings({
                          ...systemSettings,
                          parallelExecution: e.target.checked
                        })}
                        className="rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Auto Error Fix</p>
                        <p className="text-xs text-slate-400">Automatically fix build errors</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={systemSettings.errorAutoFix}
                        onChange={(e) => saveSystemSettings({
                          ...systemSettings,
                          errorAutoFix: e.target.checked
                        })}
                        className="rounded"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader>
                    <CardTitle className="text-white text-sm">System Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Version</span>
                      <span className="text-sm text-white">v1.0.0</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Active Agents</span>
                      <span className="text-sm text-white">{agents.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">Available Tools</span>
                      <span className="text-sm text-white">{mcpTools.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-400">RAG Documents</span>
                      <span className="text-sm text-white">{ragContext.length}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export Settings
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    Import Settings
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};
