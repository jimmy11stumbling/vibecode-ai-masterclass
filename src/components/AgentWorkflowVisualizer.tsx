
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Zap,
  Brain,
  Code,
  Database,
  Shield,
  Cog,
  Play,
  Pause,
  Square,
  RefreshCw
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'agent' | 'task' | 'decision' | 'integration';
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error' | 'waiting';
  progress?: number;
  description?: string;
  dependencies?: string[];
  assignedAgent?: string;
  estimatedTime?: number;
  actualTime?: number;
  output?: any;
  metadata?: any;
}

interface WorkflowConnection {
  from: string;
  to: string;
  type: 'success' | 'error' | 'conditional';
  condition?: string;
}

interface AgentWorkflowVisualizerProps {
  workflow?: {
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
  };
  isActive?: boolean;
  onNodeSelect?: (node: WorkflowNode) => void;
  onWorkflowControl?: (action: 'start' | 'pause' | 'stop' | 'reset') => void;
}

export const AgentWorkflowVisualizer: React.FC<AgentWorkflowVisualizerProps> = ({
  workflow,
  isActive = false,
  onNodeSelect,
  onWorkflowControl
}) => {
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [workflowState, setWorkflowState] = useState<'idle' | 'running' | 'paused' | 'completed'>('idle');

  const defaultWorkflow = {
    nodes: [
      {
        id: 'orchestrator',
        type: 'agent' as const,
        name: 'Master Orchestrator',
        status: 'completed' as const,
        progress: 100,
        description: 'Analyzes user request and creates execution plan',
        assignedAgent: 'orchestrator-1',
        actualTime: 2500
      },
      {
        id: 'architect',
        type: 'agent' as const,
        name: 'System Architect',
        status: 'completed' as const,
        progress: 100,
        description: 'Designs application architecture and data models',
        dependencies: ['orchestrator'],
        assignedAgent: 'architect-1',
        actualTime: 4200
      },
      {
        id: 'frontend-build',
        type: 'task' as const,
        name: 'Frontend Development',
        status: 'processing' as const,
        progress: 65,
        description: 'Building React components and UI',
        dependencies: ['architect'],
        assignedAgent: 'builder-frontend-1',
        estimatedTime: 8000
      },
      {
        id: 'backend-build',
        type: 'task' as const,
        name: 'Backend Development',
        status: 'processing' as const,
        progress: 45,
        description: 'Creating API endpoints and business logic',
        dependencies: ['architect'],
        assignedAgent: 'builder-backend-1',
        estimatedTime: 10000
      },
      {
        id: 'database-setup',
        type: 'integration' as const,
        name: 'Database Integration',
        status: 'waiting' as const,
        progress: 0,
        description: 'Setting up database schema and connections',
        dependencies: ['backend-build'],
        estimatedTime: 3000
      },
      {
        id: 'validation',
        type: 'agent' as const,
        name: 'Quality Validator',
        status: 'pending' as const,
        progress: 0,
        description: 'Validates code quality and runs tests',
        dependencies: ['frontend-build', 'backend-build', 'database-setup'],
        assignedAgent: 'validator-1',
        estimatedTime: 5000
      },
      {
        id: 'optimization',
        type: 'agent' as const,
        name: 'Performance Optimizer',
        status: 'pending' as const,
        progress: 0,
        description: 'Optimizes performance and security',
        dependencies: ['validation'],
        assignedAgent: 'optimizer-1',
        estimatedTime: 4000
      }
    ],
    connections: [
      { from: 'orchestrator', to: 'architect', type: 'success' as const },
      { from: 'architect', to: 'frontend-build', type: 'success' as const },
      { from: 'architect', to: 'backend-build', type: 'success' as const },
      { from: 'backend-build', to: 'database-setup', type: 'success' as const },
      { from: 'frontend-build', to: 'validation', type: 'success' as const },
      { from: 'backend-build', to: 'validation', type: 'success' as const },
      { from: 'database-setup', to: 'validation', type: 'success' as const },
      { from: 'validation', to: 'optimization', type: 'success' as const }
    ]
  };

  const activeWorkflow = workflow || defaultWorkflow;

  useEffect(() => {
    if (isActive) {
      setWorkflowState('running');
    } else {
      setWorkflowState('idle');
    }
  }, [isActive]);

  const getNodeIcon = (node: WorkflowNode) => {
    switch (node.type) {
      case 'agent':
        return <Bot className="w-4 h-4" />;
      case 'task':
        return <Code className="w-4 h-4" />;
      case 'integration':
        return <Database className="w-4 h-4" />;
      case 'decision':
        return <Brain className="w-4 h-4" />;
      default:
        return <Cog className="w-4 h-4" />;
    }
  };

  const getNodeColor = (node: WorkflowNode) => {
    switch (node.status) {
      case 'completed':
        return 'bg-green-500/20 border-green-500/50 text-green-400';
      case 'processing':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-400';
      case 'waiting':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400';
      case 'error':
        return 'bg-red-500/20 border-red-500/50 text-red-400';
      default:
        return 'bg-slate-700 border-slate-600 text-slate-300';
    }
  };

  const getStatusIcon = (status: WorkflowNode['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'processing':
        return <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />;
      case 'waiting':
        return <Clock className="w-3 h-3 text-yellow-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return <Clock className="w-3 h-3 text-slate-400" />;
    }
  };

  const handleNodeClick = (node: WorkflowNode) => {
    setSelectedNode(node);
    onNodeSelect?.(node);
  };

  const handleWorkflowAction = (action: 'start' | 'pause' | 'stop' | 'reset') => {
    switch (action) {
      case 'start':
        setWorkflowState('running');
        break;
      case 'pause':
        setWorkflowState('paused');
        break;
      case 'stop':
      case 'reset':
        setWorkflowState('idle');
        setSelectedNode(null);
        break;
    }
    onWorkflowControl?.(action);
  };

  const getOverallProgress = () => {
    const totalNodes = activeWorkflow.nodes.length;
    const completedNodes = activeWorkflow.nodes.filter(n => n.status === 'completed').length;
    const processingNodes = activeWorkflow.nodes.filter(n => n.status === 'processing');
    
    let totalProgress = completedNodes * 100;
    processingNodes.forEach(node => {
      totalProgress += node.progress || 0;
    });
    
    return Math.round(totalProgress / totalNodes);
  };

  return (
    <div className="space-y-4">
      {/* Workflow Controls */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-sm flex items-center">
              <Zap className="w-4 h-4 mr-2 text-purple-400" />
              Agent Workflow
            </CardTitle>
            <Badge className={`
              ${workflowState === 'running' ? 'bg-green-500/20 text-green-400' : 
                workflowState === 'paused' ? 'bg-yellow-500/20 text-yellow-400' :
                workflowState === 'completed' ? 'bg-blue-500/20 text-blue-400' :
                'bg-slate-500/20 text-slate-400'}
            `}>
              {workflowState}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-300">Overall Progress</span>
            <span className="text-sm text-white">{getOverallProgress()}%</span>
          </div>
          <Progress value={getOverallProgress()} className="w-full" />
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => handleWorkflowAction('start')}
              disabled={workflowState === 'running'}
              className="flex-1"
            >
              <Play className="w-3 h-3 mr-1" />
              Start
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleWorkflowAction('pause')}
              disabled={workflowState !== 'running'}
            >
              <Pause className="w-3 h-3 mr-1" />
              Pause
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleWorkflowAction('stop')}
              disabled={workflowState === 'idle'}
            >
              <Square className="w-3 h-3 mr-1" />
              Stop
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleWorkflowAction('reset')}
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Visualization */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Execution Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-80">
            <div className="space-y-3">
              {activeWorkflow.nodes.map((node, index) => (
                <div key={node.id} className="relative">
                  <div
                    className={`p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 ${getNodeColor(node)} ${
                      selectedNode?.id === node.id ? 'ring-2 ring-purple-500' : ''
                    }`}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {getNodeIcon(node)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium truncate">{node.name}</p>
                          {getStatusIcon(node.status)}
                        </div>
                        <p className="text-xs opacity-75 truncate">{node.description}</p>
                        {node.progress !== undefined && node.progress > 0 && (
                          <Progress value={node.progress} className="h-1 mt-2" />
                        )}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <Badge variant="outline" className="text-xs">
                          {index + 1}
                        </Badge>
                        {node.assignedAgent && (
                          <p className="text-xs opacity-75 mt-1">{node.assignedAgent}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection Arrow */}
                  {index < activeWorkflow.nodes.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Node Details */}
      {selectedNode && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center">
              {getNodeIcon(selectedNode)}
              <span className="ml-2">{selectedNode.name}</span>
              {getStatusIcon(selectedNode.status)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-slate-300">{selectedNode.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-400">Type</p>
                <p className="text-sm text-white capitalize">{selectedNode.type}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <Badge className={getNodeColor(selectedNode).split(' ')[0]}>
                  {selectedNode.status}
                </Badge>
              </div>
              {selectedNode.assignedAgent && (
                <div>
                  <p className="text-xs text-slate-400">Assigned Agent</p>
                  <p className="text-sm text-white">{selectedNode.assignedAgent}</p>
                </div>
              )}
              {selectedNode.progress !== undefined && (
                <div>
                  <p className="text-xs text-slate-400">Progress</p>
                  <p className="text-sm text-white">{selectedNode.progress}%</p>
                </div>
              )}
            </div>

            {selectedNode.dependencies && selectedNode.dependencies.length > 0 && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Dependencies</p>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.dependencies.map(dep => (
                    <Badge key={dep} variant="outline" className="text-xs">
                      {activeWorkflow.nodes.find(n => n.id === dep)?.name || dep}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(selectedNode.estimatedTime || selectedNode.actualTime) && (
              <div className="grid grid-cols-2 gap-3">
                {selectedNode.estimatedTime && (
                  <div>
                    <p className="text-xs text-slate-400">Estimated Time</p>
                    <p className="text-sm text-white">{Math.round(selectedNode.estimatedTime / 1000)}s</p>
                  </div>
                )}
                {selectedNode.actualTime && (
                  <div>
                    <p className="text-xs text-slate-400">Actual Time</p>
                    <p className="text-sm text-white">{Math.round(selectedNode.actualTime / 1000)}s</p>
                  </div>
                )}
              </div>
            )}

            {selectedNode.output && (
              <div>
                <p className="text-xs text-slate-400 mb-1">Output</p>
                <div className="bg-slate-900 rounded p-2 text-xs text-slate-300 font-mono max-h-20 overflow-y-auto">
                  {JSON.stringify(selectedNode.output, null, 2)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
