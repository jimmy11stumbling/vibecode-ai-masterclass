
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Play, 
  Pause,
  Zap,
  Cpu,
  Network,
  Database,
  Bot,
  Crown
} from 'lucide-react';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';

interface ProgressStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
  actualTime?: number;
  agentId?: string;
}

interface SovereignRealTimeProgressProps {
  isActive: boolean;
  currentOperation?: string;
  steps?: ProgressStep[];
  onStepClick?: (stepId: string) => void;
}

export const SovereignRealTimeProgress: React.FC<SovereignRealTimeProgressProps> = ({
  isActive,
  currentOperation = 'Idle',
  steps = [],
  onStepClick
}) => {
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [operationStartTime, setOperationStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const { 
    currentMetrics, 
    historicalData, 
    startCollection, 
    stopCollection 
  } = useRealTimeMetrics(isActive, {
    updateInterval: 1000,
    maxDataPoints: 60,
    enableHistoricalData: true
  });

  // Track operation timing
  useEffect(() => {
    if (isActive && !operationStartTime) {
      setOperationStartTime(new Date());
      startCollection();
    } else if (!isActive && operationStartTime) {
      setOperationStartTime(null);
      stopCollection();
    }
  }, [isActive, operationStartTime, startCollection, stopCollection]);

  // Update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && operationStartTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - operationStartTime.getTime());
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, operationStartTime]);

  // Default steps if none provided
  const defaultSteps: ProgressStep[] = [
    {
      id: 'init',
      name: 'Initialize Sovereign AI',
      status: 'completed',
      progress: 100,
      agentId: 'orchestrator'
    },
    {
      id: 'analyze',
      name: 'Analyze Requirements',
      status: isActive ? 'in_progress' : 'pending',
      progress: isActive ? 65 : 0,
      agentId: 'architect'
    },
    {
      id: 'plan',
      name: 'Generate Build Plan',
      status: 'pending',
      progress: 0,
      agentId: 'architect'
    },
    {
      id: 'code',
      name: 'Generate Code',
      status: 'pending',
      progress: 0,
      agentId: 'builder'
    },
    {
      id: 'validate',
      name: 'Validate & Test',
      status: 'pending',
      progress: 0,
      agentId: 'validator'
    },
    {
      id: 'deploy',
      name: 'Deploy Application',
      status: 'pending',
      progress: 0,
      agentId: 'optimizer'
    }
  ];

  const progressSteps = steps.length > 0 ? steps : defaultSteps;
  const completedSteps = progressSteps.filter(step => step.status === 'completed').length;
  const totalSteps = progressSteps.length;
  const overallProgress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'in_progress':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
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
      case 'in_progress':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getAgentIcon = (agentId?: string) => {
    switch (agentId) {
      case 'orchestrator':
        return <Crown className="w-3 h-3" />;
      case 'architect':
        return <Network className="w-3 h-3" />;
      case 'builder':
        return <Cpu className="w-3 h-3" />;
      case 'validator':
        return <CheckCircle className="w-3 h-3" />;
      case 'optimizer':
        return <Zap className="w-3 h-3" />;
      default:
        return <Bot className="w-3 h-3" />;
    }
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const selectedStepData = progressSteps.find(step => step.id === selectedStep);

  return (
    <div className="h-full flex flex-col bg-slate-950 text-white">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold">Sovereign Progress</h3>
            <Badge variant="outline" className={isActive ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}>
              {isActive ? 'Active' : 'Idle'}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="text-slate-400">
              Operation: <span className="text-white">{currentOperation}</span>
            </div>
            {isActive && (
              <div className="text-slate-400">
                Elapsed: <span className="text-white">{formatTime(elapsedTime)}</span>
              </div>
            )}
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
            <span>{completedSteps}/{totalSteps} steps completed</span>
            <span>
              Tokens/sec: {currentMetrics.tokensPerSecond.toFixed(1)} | 
              Response: {currentMetrics.responseTime.toFixed(0)}ms
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Steps List */}
        <div className="flex-1 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-3">
              {progressSteps.map((step, index) => (
                <Card 
                  key={step.id}
                  className={`bg-slate-800 border-slate-600 cursor-pointer transition-all duration-200 hover:bg-slate-700 ${
                    selectedStep === step.id ? 'border-blue-500 bg-slate-700' : ''
                  }`}
                  onClick={() => {
                    setSelectedStep(selectedStep === step.id ? null : step.id);
                    onStepClick?.(step.id);
                  }}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1">
                          <span className="text-xs text-slate-500 w-6">{index + 1}</span>
                          {getStatusIcon(step.status)}
                          {step.agentId && getAgentIcon(step.agentId)}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-white">{step.name}</h4>
                          {step.agentId && (
                            <p className="text-xs text-slate-400">Agent: {step.agentId}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {step.progress > 0 && (
                          <div className="text-right">
                            <div className="text-xs text-slate-400">{step.progress}%</div>
                            <Progress value={step.progress} className="w-16 h-1" />
                          </div>
                        )}
                        <Badge variant="outline" className={`text-xs ${getStatusColor(step.status)}`}>
                          {step.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {step.status === 'in_progress' && step.progress > 0 && (
                      <div className="mt-2">
                        <Progress value={step.progress} className="h-1" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Side Panel - Metrics & Details */}
        <div className="w-80 border-l border-slate-700 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-4">
              {/* Real-time Metrics */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center">
                    <Activity className="w-4 h-4 mr-2" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-slate-400">CPU Usage</div>
                      <div className="text-white">{currentMetrics.cpuUsage.toFixed(1)}%</div>
                      <Progress value={currentMetrics.cpuUsage} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="text-slate-400">Memory</div>
                      <div className="text-white">{currentMetrics.memoryUsage.toFixed(1)}%</div>
                      <Progress value={currentMetrics.memoryUsage} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="text-slate-400">Accuracy</div>
                      <div className="text-white">{currentMetrics.accuracy.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Connections</div>
                      <div className="text-white">{currentMetrics.activeConnections}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selected Step Details */}
              {selectedStepData && (
                <Card className="bg-slate-800 border-slate-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Step Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-white">{selectedStepData.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        {getStatusIcon(selectedStepData.status)}
                        <Badge variant="outline" className={`text-xs ${getStatusColor(selectedStepData.status)}`}>
                          {selectedStepData.status}
                        </Badge>
                        {selectedStepData.agentId && (
                          <Badge variant="outline" className="text-xs">
                            {selectedStepData.agentId}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {selectedStepData.progress > 0 && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Progress</span>
                          <span className="text-white">{selectedStepData.progress}%</span>
                        </div>
                        <Progress value={selectedStepData.progress} className="h-2" />
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {selectedStepData.estimatedTime && (
                        <div>
                          <div className="text-slate-400">Est. Time</div>
                          <div className="text-white">{selectedStepData.estimatedTime}s</div>
                        </div>
                      )}
                      {selectedStepData.actualTime && (
                        <div>
                          <div className="text-slate-400">Actual Time</div>
                          <div className="text-white">{selectedStepData.actualTime}s</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Operation Summary */}
              <Card className="bg-slate-800 border-slate-600">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Operation Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="text-white">{isActive ? 'Running' : 'Idle'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Steps:</span>
                      <span className="text-white">{completedSteps}/{totalSteps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Duration:</span>
                      <span className="text-white">{formatTime(elapsedTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Throughput:</span>
                      <span className="text-white">{currentMetrics.throughput.toFixed(1)}/min</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
