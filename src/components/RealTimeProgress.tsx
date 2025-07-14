
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Activity, Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface RealTimeProgressProps {
  isStreaming: boolean;
  tokensReceived: number;
  responseTime: number;
  status: 'idle' | 'connecting' | 'streaming' | 'complete' | 'error';
}

export const RealTimeProgress: React.FC<RealTimeProgressProps> = ({
  isStreaming,
  tokensReceived,
  responseTime,
  status
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'streaming':
        return <Activity className="w-4 h-4 animate-pulse text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'connecting':
        return <Zap className="w-4 h-4 animate-bounce text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'streaming':
        return 'bg-blue-500';
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'connecting':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressValue = () => {
    if (status === 'complete') return 100;
    if (status === 'error') return 0;
    if (tokensReceived > 0) return Math.min((tokensReceived / 100) * 100, 95);
    return 0;
  };

  if (status === 'idle') return null;

  return (
    <div className="px-4 py-2 border-b border-slate-700 bg-slate-800">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-white capitalize">{status}</span>
          {isStreaming && (
            <Badge variant="secondary" className="text-xs">
              Live
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-4 text-xs text-slate-400">
          <span>{tokensReceived} tokens</span>
          <span>{responseTime}ms</span>
        </div>
      </div>
      
      <Progress 
        value={getProgressValue()} 
        className="h-1"
        style={{
          '--progress-background': getStatusColor()
        } as React.CSSProperties}
      />
    </div>
  );
};
