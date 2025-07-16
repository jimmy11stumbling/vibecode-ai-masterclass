
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Cpu, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Brain,
  Bot,
  Gauge
} from 'lucide-react';

interface ProcessingMetrics {
  tokensPerSecond: number;
  responseTime: number;
  totalTokens: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  accuracy: number;
  throughput: number;
}

interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  startTime?: Date;
  endTime?: Date;
  details?: string;
}

interface SovereignRealTimeProgressProps {
  isActive: boolean;
  currentOperation?: string;
  metrics?: Partial<ProcessingMetrics>;
  steps?: ProcessingStep[];
  onCancel?: () => void;
}

export const SovereignRealTimeProgress: React.FC<SovereignRealTimeProgressProps> = ({
  isActive,
  currentOperation = 'Idle',
  metrics = {},
  steps = [],
  onCancel
}) => {
  const [realTimeMetrics, setRealTimeMetrics] = useState<ProcessingMetrics>({
    tokensPerSecond: 0,
    responseTime: 0,
    totalTokens: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    accuracy: 0,
    throughput: 0,
    ...metrics
  });

  const [activeSteps, setActiveSteps] = useState<ProcessingStep[]>(steps);

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        // Simulate real-time metrics updates
        setRealTimeMetrics(prev => ({
          ...prev,
          tokensPerSecond: Math.max(0, prev.tokensPerSecond + (Math.random() - 0.5) * 50),
          responseTime: Math.max(0, prev.responseTime + (Math.random() - 0.5) * 100),
          memoryUsage: Math.min(100, Math.max(0, prev.memoryUsage + (Math.random() - 0.5) * 5)),
          cpuUsage: Math.min(100, Math.max(0, prev.cpuUsage + (Math.random() - 0.5) * 10)),
          networkLatency: Math.max(0, prev.networkLatency + (Math.random() - 0.5) * 10),
          accuracy: Math.min(100, Math.max(0, prev.accuracy + (Math.random() - 0.5) * 2)),
          throughput: Math.max(0, prev.throughput + (Math.random() - 0.5) * 20)
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  useEffect(() => {
    setActiveSteps(steps);
  }, [steps]);

  const getStatusIcon = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusColor = (status: ProcessingStep['status']) => {
    switch (status) {
      case 'completed':
        return 'border-green-500/30 bg-green-500/10';
      case 'processing':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-slate-600 bg-slate-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* System Status Overview */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center">
            <Gauge className="w-4 h-4 mr-2 text-purple-400" />
            System Performance Monitor
            {isActive && (
              <Badge className="ml-2 bg-green-500/20 text-green-400">
                <Activity className="w-3 h-3 mr-1" />
                Active
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">CPU Usage</span>
                <span className="text-xs text-white">{Math.round(realTimeMetrics.cpuUsage)}%</span>
              </div>
              <Progress value={realTimeMetrics.cpuUsage} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Memory</span>
                <span className="text-xs text-white">{Math.round(realTimeMetrics.memoryUsage)}%</span>
              </div>
              <Progress value={realTimeMetrics.memoryUsage} className="h-2" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Tokens/s</span>
                <span className="text-xs text-white">{Math.round(realTimeMetrics.tokensPerSecond)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (realTimeMetrics.tokensPerSecond / 200) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Latency</span>
                <span className="text-xs text-white">{Math.round(realTimeMetrics.networkLatency)}ms</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="w-3 h-3 text-yellow-400" />
                <div className="flex-1 bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (realTimeMetrics.networkLatency / 500) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-700">
            <div className="text-center">
              <p className="text-xs text-slate-400">Total Tokens</p>
              <p className="text-sm font-medium text-white">{Math.round(realTimeMetrics.totalTokens).toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Accuracy</p>
              <p className="text-sm font-medium text-white">{Math.round(realTimeMetrics.accuracy)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400">Throughput</p>
              <p className="text-sm font-medium text-white">{Math.round(realTimeMetrics.throughput)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Operation */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center">
            <Brain className="w-4 h-4 mr-2 text-blue-400" />
            Current Operation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-3">
            {isActive ? (
              <Activity className="w-5 h-5 text-blue-400 animate-pulse" />
            ) : (
              <Clock className="w-5 h-5 text-slate-400" />
            )}
            <div className="flex-1">
              <p className="text-sm text-white font-medium">{currentOperation}</p>
              <p className="text-xs text-slate-400">
                {isActive ? 'Processing...' : 'Waiting for next operation'}
              </p>
            </div>
            {isActive && realTimeMetrics.responseTime > 0 && (
              <Badge variant="outline" className="text-xs">
                {Math.round(realTimeMetrics.responseTime)}ms
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Processing Steps */}
      {activeSteps.length > 0 && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-sm flex items-center">
              <Bot className="w-4 h-4 mr-2 text-purple-400" />
              Processing Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {activeSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center space-x-3 p-2 rounded-lg border ${getStatusColor(step.status)}`}
                  >
                    {getStatusIcon(step.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{step.name}</p>
                      {step.details && (
                        <p className="text-xs text-slate-400 truncate">{step.details}</p>
                      )}
                      {step.status === 'processing' && step.progress > 0 && (
                        <Progress value={step.progress} className="h-1 mt-1" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Real-time Analytics */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center">
            <BarChart3 className="w-4 h-4 mr-2 text-green-400" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Efficiency</span>
                <span className="text-xs text-green-400">
                  {Math.round((realTimeMetrics.accuracy + realTimeMetrics.throughput) / 2)}%
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-1000"
                  style={{ width: `${Math.round((realTimeMetrics.accuracy + realTimeMetrics.throughput) / 2)}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Performance</span>
                <span className="text-xs text-blue-400">
                  {Math.round(100 - (realTimeMetrics.cpuUsage + realTimeMetrics.memoryUsage) / 2)}%
                </span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-1000"
                  style={{ width: `${Math.round(100 - (realTimeMetrics.cpuUsage + realTimeMetrics.memoryUsage) / 2)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
