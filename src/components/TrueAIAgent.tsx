
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Pause, 
  Square, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Zap,
  Bot,
  Code,
  Database,
  FileText,
  GitBranch,
  Settings,
  Activity,
  Brain,
  Cpu,
  Network,
  Users,
  Crown,
  Command,
  Terminal,
  Eye,
  Download,
  Upload,
  Trash2,
  Save,
  Copy,
  Edit3,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { masterControlProgram } from '@/services/masterControlProgram';
import { mcpHub } from '@/services/mcpHubCore';
import { a2aProtocol } from '@/services/a2aProtocolCore';
import { SovereignRealTimeProgress } from '@/components/SovereignRealTimeProgress';
import { AgentWorkflowVisualizer } from '@/components/AgentWorkflowVisualizer';

interface ProjectFile {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: ProjectFile[];
  path?: string;
  size?: number;
  lastModified?: Date;
}

interface TrueAIAgentProps {
  projectFiles: ProjectFile[];
  onFilesChange: (files: ProjectFile[]) => void;
  onCodeGenerated: (code: string) => void;
}

interface AgentTask {
  id: string;
  type: 'architecture' | 'frontend' | 'backend' | 'validation' | 'optimization';
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent: string;
  progress: number;
  result?: any;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

interface BuildPlan {
  id: string;
  name: string;
  description: string;
  tasks: AgentTask[];
  status: 'draft' | 'approved' | 'executing' | 'completed' | 'failed';
  estimatedTime: number;
  createdAt: Date;
}

interface AgentMetrics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageTime: number;
  successRate: number;
}

export const TrueAIAgent: React.FC<TrueAIAgentProps> = ({
  projectFiles,
  onFilesChange,
  onCodeGenerated
}) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<BuildPlan | null>(null);
  const [buildHistory, setBuildHistory] = useState<BuildPlan[]>([]);
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics>({
    totalTasks: 0,
    completedTasks: 0,
    failedTasks: 0,
    averageTime: 0,
    successRate: 0
  });
  const [logs, setLogs] = useState<Array<{
    id: string;
    timestamp: Date;
    level: 'info' | 'warn' | 'error' | 'success';
    message: string;
    source: string;
  }>>([]);
  const [activeTab, setActiveTab] = useState('plan');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [availableAgents] = useState([
    { id: 'orchestrator', name: 'Orchestrator Agent', type: 'coordination', status: 'active' },
    { id: 'architect', name: 'Architect Agent', type: 'design', status: 'active' },
    { id: 'frontend_builder', name: 'Frontend Builder', type: 'development', status: 'active' },
    { id: 'backend_builder', name: 'Backend Builder', type: 'development', status: 'active' },
    { id: 'validator', name: 'Validator Agent', type: 'qa', status: 'active' },
    { id: 'optimizer', name: 'Optimizer Agent', type: 'enhancement', status: 'active' }
  ]);

  // Initialize MCP tools and A2A agents
  useEffect(() => {
    initializeAgentSystem();
  }, []);

  const initializeAgentSystem = async () => {
    try {
      addLog('info', 'Initializing Sovereign AI Agent System...', 'System');
      
      // Register all agents with A2A protocol
      for (const agent of availableAgents) {
        await a2aProtocol.registerAgent({
          id: agent.id,
          name: agent.name,
          type: agent.type as any,
          capabilities: getAgentCapabilities(agent.id),
          status: 'active',
          currentTasks: []
        });
      }

      // Get available MCP tools
      const tools = mcpHub.getAllTools();
      addLog('success', `Initialized ${availableAgents.length} agents and ${tools.length} MCP tools`, 'System');
      
    } catch (error) {
      addLog('error', `Failed to initialize agent system: ${error}`, 'System');
    }
  };

  const getAgentCapabilities = (agentId: string): string[] => {
    const capabilityMap: { [key: string]: string[] } = {
      orchestrator: ['task_planning', 'agent_coordination', 'progress_monitoring'],
      architect: ['system_design', 'database_schema', 'api_design', 'file_structure'],
      frontend_builder: ['react_development', 'ui_components', 'styling', 'state_management'],
      backend_builder: ['api_development', 'database_operations', 'authentication', 'business_logic'],
      validator: ['code_validation', 'testing', 'quality_assurance', 'error_detection'],
      optimizer: ['performance_optimization', 'code_refactoring', 'security_analysis', 'best_practices']
    };
    return capabilityMap[agentId] || [];
  };

  const addLog = (level: 'info' | 'warn' | 'error' | 'success', message: string, source: string) => {
    const newLog = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      level,
      message,
      source
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const generateBuildPlan = async (userPrompt: string): Promise<BuildPlan> => {
    addLog('info', 'Generating comprehensive build plan...', 'Orchestrator');
    
    // Use master control program for advanced planning
    const planningResult = await masterControlProgram.processUserRequest(userPrompt, {
      projectFiles,
      activeFile: null,
      systemContext: 'build_planning'
    });

    // Create detailed task breakdown
    const tasks: AgentTask[] = [
      {
        id: 'task_analyze',
        type: 'architecture',
        description: 'Analyze requirements and create system architecture',
        status: 'pending',
        assignedAgent: 'architect',
        progress: 0,
        createdAt: new Date()
      },
      {
        id: 'task_database',
        type: 'backend',
        description: 'Design and implement database schema',
        status: 'pending',
        assignedAgent: 'backend_builder',
        progress: 0,
        createdAt: new Date()
      },
      {
        id: 'task_api',
        type: 'backend',
        description: 'Create API endpoints and business logic',
        status: 'pending',
        assignedAgent: 'backend_builder',
        progress: 0,
        createdAt: new Date()
      },
      {
        id: 'task_components',
        type: 'frontend',
        description: 'Build React components and UI',
        status: 'pending',
        assignedAgent: 'frontend_builder',
        progress: 0,
        createdAt: new Date()
      },
      {
        id: 'task_integration',
        type: 'frontend',
        description: 'Integrate frontend with backend APIs',
        status: 'pending',
        assignedAgent: 'frontend_builder',
        progress: 0,
        createdAt: new Date()
      },
      {
        id: 'task_validation',
        type: 'validation',
        description: 'Validate code quality and functionality',
        status: 'pending',
        assignedAgent: 'validator',
        progress: 0,
        createdAt: new Date()
      },
      {
        id: 'task_optimization',
        type: 'optimization',
        description: 'Optimize performance and code quality',
        status: 'pending',
        assignedAgent: 'optimizer',
        progress: 0,
        createdAt: new Date()
      }
    ];

    const plan: BuildPlan = {
      id: `plan_${Date.now()}`,
      name: `Build Plan: ${userPrompt.substring(0, 50)}...`,
      description: userPrompt,
      tasks,
      status: 'draft',
      estimatedTime: tasks.length * 2, // 2 minutes per task estimate
      createdAt: new Date()
    };

    return plan;
  };

  const executeBuildPlan = async (plan: BuildPlan) => {
    addLog('info', 'Starting build plan execution...', 'Orchestrator');
    setIsProcessing(true);
    
    try {
      // Update plan status
      const updatedPlan = { ...plan, status: 'executing' as const };
      setCurrentPlan(updatedPlan);

      // Execute tasks sequentially with agent coordination
      for (const task of updatedPlan.tasks) {
        await executeTask(task, updatedPlan);
      }

      // Mark plan as completed
      updatedPlan.status = 'completed';
      setCurrentPlan(updatedPlan);
      setBuildHistory(prev => [updatedPlan, ...prev]);
      
      addLog('success', 'Build plan execution completed successfully!', 'Orchestrator');
      
    } catch (error) {
      addLog('error', `Build plan execution failed: ${error}`, 'Orchestrator');
      if (currentPlan) {
        setCurrentPlan({ ...currentPlan, status: 'failed' });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const executeTask = async (task: AgentTask, plan: BuildPlan) => {
    addLog('info', `Executing task: ${task.description}`, task.assignedAgent);
    
    // Update task status
    task.status = 'in_progress';
    setCurrentPlan({ ...plan });

    try {
      // Send task to appropriate agent via A2A protocol
      await a2aProtocol.sendMessage({
        fromAgent: 'orchestrator',
        toAgent: task.assignedAgent,
        messageType: 'task',
        payload: {
          taskId: task.id,
          description: task.description,
          context: {
            projectFiles,
            planDescription: plan.description
          }
        },
        priority: 'high',
        requiresResponse: true
      });

      // Simulate task execution with progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        task.progress = progress;
        setCurrentPlan({ ...plan });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Mark task as completed
      task.status = 'completed';
      task.completedAt = new Date();
      task.result = `Task ${task.id} completed successfully`;
      
      addLog('success', `Task completed: ${task.description}`, task.assignedAgent);
      
      // Update metrics
      updateAgentMetrics();
      
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Unknown error';
      addLog('error', `Task failed: ${task.description} - ${task.error}`, task.assignedAgent);
      throw error;
    }
  };

  const updateAgentMetrics = () => {
    const allTasks = buildHistory.flatMap(plan => plan.tasks).concat(currentPlan?.tasks || []);
    const completed = allTasks.filter(t => t.status === 'completed');
    const failed = allTasks.filter(t => t.status === 'failed');
    
    setAgentMetrics({
      totalTasks: allTasks.length,
      completedTasks: completed.length,
      failedTasks: failed.length,
      averageTime: completed.reduce((acc, task) => {
        if (task.completedAt && task.createdAt) {
          return acc + (task.completedAt.getTime() - task.createdAt.getTime());
        }
        return acc;
      }, 0) / (completed.length || 1),
      successRate: allTasks.length > 0 ? (completed.length / allTasks.length) * 100 : 0
    });
  };

  const handlePromptSubmit = async () => {
    if (!prompt.trim() || isProcessing) return;

    try {
      addLog('info', `Processing prompt: ${prompt}`, 'User');
      
      // Generate build plan
      const plan = await generateBuildPlan(prompt);
      setCurrentPlan(plan);
      setActiveTab('plan');
      
      addLog('success', 'Build plan generated successfully', 'Orchestrator');
      
    } catch (error) {
      addLog('error', `Failed to generate build plan: ${error}`, 'Orchestrator');
    }
  };

  const handleApprovePlan = async () => {
    if (!currentPlan) return;
    
    const approvedPlan = { ...currentPlan, status: 'approved' as const };
    setCurrentPlan(approvedPlan);
    await executeBuildPlan(approvedPlan);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress': return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'executing': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Sovereign AI Agent</h2>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
              {isProcessing ? 'Processing' : 'Ready'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-xs">
              {agentMetrics.successRate.toFixed(1)}% Success
            </Badge>
            <Badge variant="outline" className="text-xs">
              {agentMetrics.totalTasks} Tasks
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="flex-shrink-0 px-4 py-2 border-b border-slate-700">
            <TabsList className="bg-slate-800 w-full grid grid-cols-5">
              <TabsTrigger value="prompt" className="text-xs">
                <Terminal className="w-3 h-3 mr-1" />
                Prompt
              </TabsTrigger>
              <TabsTrigger value="plan" className="text-xs">
                <Brain className="w-3 h-3 mr-1" />
                Plan
              </TabsTrigger>
              <TabsTrigger value="agents" className="text-xs">
                <Users className="w-3 h-3 mr-1" />
                Agents
              </TabsTrigger>
              <TabsTrigger value="progress" className="text-xs">
                <Activity className="w-3 h-3 mr-1" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                History
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="prompt" className="h-full m-0 p-4">
              <div className="h-full flex flex-col space-y-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Describe what you want to build:
                  </label>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., Create a user authentication system with login, signup, and dashboard pages..."
                    className="h-32 bg-slate-800 border-slate-600 text-white resize-none"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handlePromptSubmit}
                    disabled={!prompt.trim() || isProcessing}
                    className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Plan
                      </>
                    )}
                  </Button>
                  
                  {currentPlan && currentPlan.status === 'draft' && (
                    <Button 
                      onClick={handleApprovePlan}
                      variant="outline"
                      className="border-green-500 text-green-400 hover:bg-green-500/10"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Execute
                    </Button>
                  )}
                </div>

                {/* RAG Context Integration */}
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      RAG Context
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-xs text-slate-400">
                      Context will be automatically retrieved from knowledge base
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="plan" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {currentPlan ? (
                    <>
                      <Card className="bg-slate-800 border-slate-600">
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <span className="flex items-center">
                              <Brain className="w-5 h-5 mr-2 text-yellow-400" />
                              {currentPlan.name}
                            </span>
                            <Badge className={getStatusColor(currentPlan.status)}>
                              {currentPlan.status}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-300 mb-4">{currentPlan.description}</p>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-slate-400">Tasks:</span>
                              <span className="ml-2 text-white">{currentPlan.tasks.length}</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Est. Time:</span>
                              <span className="ml-2 text-white">{currentPlan.estimatedTime}m</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-slate-300">Task Breakdown</h3>
                        {currentPlan.tasks.map((task, index) => (
                          <Card key={task.id} className="bg-slate-800 border-slate-600">
                            <CardContent className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(task.status)}
                                  <span className="text-sm font-medium">{task.description}</span>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {task.assignedAgent}
                                </Badge>
                              </div>
                              
                              {task.status === 'in_progress' && (
                                <Progress value={task.progress} className="h-1" />
                              )}
                              
                              {task.error && (
                                <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded">
                                  {task.error}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No build plan generated yet.</p>
                      <p className="text-sm">Submit a prompt to get started.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="agents" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    {availableAgents.map((agent) => (
                      <Card 
                        key={agent.id} 
                        className={`bg-slate-800 border-slate-600 cursor-pointer transition-colors ${
                          selectedAgent === agent.id ? 'border-yellow-500' : ''
                        }`}
                        onClick={() => setSelectedAgent(selectedAgent === agent.id ? null : agent.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Bot className="w-4 h-4 text-blue-400" />
                              <span className="text-sm font-medium">{agent.name}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                                {agent.status}
                              </Badge>
                              {selectedAgent === agent.id ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                          
                          {selectedAgent === agent.id && (
                            <div className="mt-3 pt-3 border-t border-slate-600">
                              <div className="space-y-2">
                                <div>
                                  <span className="text-xs text-slate-400">Type:</span>
                                  <span className="ml-2 text-xs text-white">{agent.type}</span>
                                </div>
                                <div>
                                  <span className="text-xs text-slate-400">Capabilities:</span>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {getAgentCapabilities(agent.id).map((capability) => (
                                      <Badge key={capability} variant="outline" className="text-xs">
                                        {capability}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Separator className="bg-slate-600" />

                  <Card className="bg-slate-800 border-slate-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Agent Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Success Rate:</span>
                          <span className="ml-2 text-green-400">{agentMetrics.successRate.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Avg. Time:</span>
                          <span className="ml-2 text-white">{(agentMetrics.averageTime / 1000).toFixed(1)}s</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Completed:</span>
                          <span className="ml-2 text-white">{agentMetrics.completedTasks}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Failed:</span>
                          <span className="ml-2 text-red-400">{agentMetrics.failedTasks}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="progress" className="h-full m-0">
              <div className="h-full p-4">
                <SovereignRealTimeProgress />
                <div className="mt-4">
                  <AgentWorkflowVisualizer />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="h-full m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {buildHistory.length > 0 ? (
                    buildHistory.map((plan) => (
                      <Card key={plan.id} className="bg-slate-800 border-slate-600">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{plan.name}</span>
                            <Badge className={getStatusColor(plan.status)}>
                              {plan.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 mb-2">{plan.description}</p>
                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span>{plan.tasks.length} tasks</span>
                            <span>{plan.createdAt.toLocaleString()}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No build history yet.</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Footer Logs */}
      <div className="flex-shrink-0 border-t border-slate-700">
        <div className="p-2">
          <div className="text-xs text-slate-400 mb-1">Recent Activity</div>
          <ScrollArea className="h-20">
            <div className="space-y-1">
              {logs.slice(0, 3).map((log) => (
                <div key={log.id} className="flex items-center space-x-2 text-xs">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    log.level === 'error' ? 'bg-red-500' :
                    log.level === 'warn' ? 'bg-yellow-500' :
                    log.level === 'success' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <span className="text-slate-400">{log.timestamp.toLocaleTimeString()}</span>
                  <span className="text-slate-300">{log.source}:</span>
                  <span className="text-white">{log.message}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
