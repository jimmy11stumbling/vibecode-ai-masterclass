
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Bot, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play,
  Pause,
  RotateCcw,
  Zap,
  Users,
  Activity,
  Network,
  Cpu
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  type: 'agent' | 'task' | 'decision';
  name: string;
  status: 'idle' | 'active' | 'completed' | 'failed';
  progress?: number;
  dependencies?: string[];
  assignedAgent?: string;
  estimatedTime?: number;
  actualTime?: number;
}

interface WorkflowConnection {
  from: string;
  to: string;
  type: 'data' | 'control' | 'feedback';
}

interface AgentWorkflowVisualizerProps {
  nodes?: WorkflowNode[];
  connections?: WorkflowConnection[];
  isActive?: boolean;
  onNodeClick?: (nodeId: string) => void;
  onWorkflowControl?: (action: 'play' | 'pause' | 'reset') => void;
}

export const AgentWorkflowVisualizer: React.FC<AgentWorkflowVisualizerProps> = ({
  nodes = [],
  connections = [],
  isActive = false,
  onNodeClick,
  onWorkflowControl
}) => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [workflowState, setWorkflowState] = useState<'idle' | 'running' | 'paused'>('idle');
  const [simulatedNodes, setSimulatedNodes] = useState<WorkflowNode[]>([]);

  // Initialize with default workflow if no nodes provided
  useEffect(() => {
    if (nodes.length === 0) {
      const defaultNodes: WorkflowNode[] = [
        {
          id: 'orchestrator',
          type: 'agent',
          name: 'Orchestrator Agent',
          status: 'idle',
          progress: 0,
          assignedAgent: 'orchestrator',
          estimatedTime: 30
        },
        {
          id: 'analyze',
          type: 'task',
          name: 'Analyze Requirements',
          status: 'idle',
          progress: 0,
          dependencies: ['orchestrator'],
          assignedAgent: 'architect',
          estimatedTime: 60
        },
        {
          id: 'architect',
          type: 'agent',
          name: 'Architect Agent',
          status: 'idle',
          progress: 0,
          dependencies: ['analyze'],
          assignedAgent: 'architect',
          estimatedTime: 90
        },
        {
          id: 'frontend_build',
          type: 'task',
          name: 'Build Frontend',
          status: 'idle',
          progress: 0,
          dependencies: ['architect'],
          assignedAgent: 'frontend_builder',
          estimatedTime: 120
        },
        {
          id: 'backend_build',
          type: 'task',
          name: 'Build Backend',
          status: 'idle',
          progress: 0,
          dependencies: ['architect'],
          assignedAgent: 'backend_builder',
          estimatedTime: 120
        },
        {
          id: 'validate',
          type: 'task',
          name: 'Validate & Test',
          status: 'idle',
          progress: 0,
          dependencies: ['frontend_build', 'backend_build'],
          assignedAgent: 'validator',
          estimatedTime: 45
        },
        {
          id: 'optimize',
          type: 'task',
          name: 'Optimize Code',
          status: 'idle',
          progress: 0,
          dependencies: ['validate'],
          assignedAgent: 'optimizer',
          estimatedTime: 60
        }
      ];
      setSimulatedNodes(defaultNodes);
    } else {
      setSimulatedNodes(nodes);
    }
  }, [nodes]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'active':
        return <RotateCcw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'active':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getAgentIcon = (agentType: string) => {
    switch (agentType) {
      case 'orchestrator':
        return <Users className="w-4 h-4" />;
      case 'architect':
        return <Network className="w-4 h-4" />;
      case 'frontend_builder':
      case 'backend_builder':
        return <Cpu className="w-4 h-4" />;
      default:
        return <Bot className="w-4 h-4" />;
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
    onNodeClick?.(nodeId);
  };

  const handleWorkflowControl = (action: 'play' | 'pause' | 'reset') => {
    switch (action) {
      case 'play':
        setWorkflowState('running');
        break;
      case 'pause':
        setWorkflowState('paused');
        break;
      case 'reset':
        setWorkflowState('idle');
        setSimulatedNodes(prev => prev.map(node => ({
          ...node,
          status: 'idle',
          progress: 0
        })));
        break;
    }
    onWorkflowControl?.(action);
  };

  const selectedNodeData = simulatedNodes.find(node => node.id === selectedNode);
  const completedTasks = simulatedNodes.filter(node => node.status === 'completed').length;
  const totalTasks = simulatedNodes.length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      {/* Header with Controls */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold">Agent Workflow</h3>
            <Badge variant="outline" className={getStatusColor(workflowState)}>
              {workflowState}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleWorkflowControl('play')}
              disabled={workflowState === 'running'}
              className="bg-green-500/10 text-green-400 border-green-500/20"
            >
              <Play className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleWorkflowControl('pause')}
              disabled={workflowState !== 'running'}
              className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
            >
              <Pause className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleWorkflowControl('reset')}
              className="bg-slate-500/10 text-slate-400 border-slate-500/20"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-white">{Math.round(overallProgress)}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{completedTasks}/{totalTasks} tasks completed</span>
            <span>{isActive ? 'Active' : 'Idle'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Workflow Visualization */}
        <div className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {simulatedNodes.map((node, index) => (
                <div key={node.id} className="relative">
                  {/* Connection Line */}
                  {index > 0 && (
                    <div className="absolute -top-3 left-6 w-0.5 h-3 bg-slate-600"></div>
                  )}
                  
                  {/* Node Card */}
                  <Card 
                    className={`bg-slate-800 border-slate-600 cursor-pointer transition-all duration-200 ${
                      selectedNode === node.id ? 'border-blue-500 bg-slate-700' : ''
                    }`}
                    onClick={() => handleNodeClick(node.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            {getAgentIcon(node.assignedAgent || '')}
                            {getStatusIcon(node.status)}
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-white">{node.name}</h4>
                            <p className="text-xs text-slate-400">
                              {node.assignedAgent && `Assigned to: ${node.assignedAgent}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {node.progress !== undefined && node.progress > 0 && (
                            <div className="text-right">
                              <div className="text-xs text-slate-400">{node.progress}%</div>
                              <Progress value={node.progress} className="w-16 h-1" />
                            </div>
                          )}
                          <Badge variant="outline" className={`text-xs ${getStatusColor(node.status)}`}>
                            {node.status}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Dependencies */}
                      {node.dependencies && node.dependencies.length > 0 && (
                        <div className="mt-2 text-xs text-slate-500">
                          Depends on: {node.dependencies.join(', ')}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Arrow to next node */}
                  {index < simulatedNodes.length - 1 && (
                    <div className="flex justify-center mt-2">
                      <ArrowRight className="w-4 h-4 text-slate-500" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Side Panel - Node Details */}
        {selectedNodeData && (
          <div className="w-80 border-l border-slate-700 p-4">
            <ScrollArea className="h-full">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Node Details</h3>
                  <Card className="bg-slate-800 border-slate-600">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center">
                        {getAgentIcon(selectedNodeData.assignedAgent || '')}
                        <span className="ml-2">{selectedNodeData.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-slate-400">Type:</span>
                          <span className="ml-2 text-white capitalize">{selectedNodeData.type}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Status:</span>
                          <Badge variant="outline" className={`ml-2 text-xs ${getStatusColor(selectedNodeData.status)}`}>
                            {selectedNodeData.status}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-slate-400">Progress:</span>
                          <span className="ml-2 text-white">{selectedNodeData.progress || 0}%</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Agent:</span>
                          <span className="ml-2 text-white">{selectedNodeData.assignedAgent || 'N/A'}</span>
                        </div>
                      </div>
                      
                      {selectedNodeData.progress !== undefined && selectedNodeData.progress > 0 && (
                        <Progress value={selectedNodeData.progress} className="h-2" />
                      )}
                      
                      {selectedNodeData.estimatedTime && (
                        <div className="text-sm">
                          <span className="text-slate-400">Estimated Time:</span>
                          <span className="ml-2 text-white">{selectedNodeData.estimatedTime}s</span>
                        </div>
                      )}
                      
                      {selectedNodeData.dependencies && selectedNodeData.dependencies.length > 0 && (
                        <div>
                          <span className="text-slate-400 text-sm">Dependencies:</span>
                          <div className="mt-1 space-y-1">
                            {selectedNodeData.dependencies.map(dep => (
                              <Badge key={dep} variant="outline" className="text-xs">
                                {dep}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-white mb-2">Actions</h4>
                  <div className="space-y-2">
                    <Button size="sm" variant="outline" className="w-full text-left justify-start">
                      <Zap className="w-4 h-4 mr-2" />
                      Execute Node
                    </Button>
                    <Button size="sm" variant="outline" className="w-full text-left justify-start">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Node
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
};
