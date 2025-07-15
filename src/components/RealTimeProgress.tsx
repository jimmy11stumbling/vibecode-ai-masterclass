
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface RealTimeProgressProps {
  isStreaming: boolean;
  tokensReceived: number;
  responseTime: number;
  status: 'idle' | 'streaming' | 'complete' | 'error';
  model?: string;
}

export const RealTimeProgress: React.FC<RealTimeProgressProps> = ({
  isStreaming,
  tokensReceived,
  responseTime,
  status,
  model = 'DeepSeek'
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'streaming':
        return <Activity className="w-3 h-3 animate-pulse text-blue-400" />;
      case 'complete':
        return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-3 h-3 text-red-400" />;
      default:
        return <Clock className="w-3 h-3 text-slate-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'streaming':
        return 'bg-blue-600';
      case 'complete':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-slate-600';
    }
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStreamingProgress = () => {
    if (!isStreaming || tokensReceived === 0) return 0;
    // Simulate progress based on tokens (this is approximate)
    return Math.min((tokensReceived / 100) * 100, 95);
  };

  if (status === 'idle') return null;

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
              {model}
            </Badge>
            
            <span className="text-xs text-slate-400">
              {status === 'streaming' && 'Generating response...'}
              {status === 'complete' && 'Response complete'}
              {status === 'error' && 'Error occurred'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs text-slate-400">
          {tokensReceived > 0 && (
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>{tokensReceived} tokens</span>
            </div>
          )}
          
          {responseTime > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(responseTime)}</span>
            </div>
          )}
        </div>
      </div>

      {isStreaming && (
        <div className="mt-2">
          <Progress 
            value={getStreamingProgress()} 
            className="h-1 bg-slate-700"
          />
        </div>
      )}
    </div>
  );
};
