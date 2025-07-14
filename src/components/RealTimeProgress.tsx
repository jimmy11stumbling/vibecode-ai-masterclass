
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, Activity, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface RealTimeProgressProps {
  isStreaming: boolean;
  tokensReceived: number;
  responseTime: number;
  status: 'idle' | 'streaming' | 'complete' | 'error';
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
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Zap className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'streaming':
        return 'border-blue-500 bg-blue-50';
      case 'complete':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-slate-300 bg-slate-50';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className={`p-3 border-b border-slate-700 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-slate-700 capitalize">{status}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          {tokensReceived > 0 && (
            <Badge variant="secondary" className="text-xs">
              {tokensReceived} tokens
            </Badge>
          )}
          
          {responseTime > 0 && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-slate-500" />
              <span className="text-xs text-slate-600">{responseTime}ms</span>
            </div>
          )}
        </div>
      </div>
      
      {isStreaming && (
        <div className="space-y-2">
          <Progress value={Math.min((tokensReceived / 1000) * 100, 100)} className="h-2" />
          <div className="flex justify-between text-xs text-slate-600">
            <span>Processing sovereign AI response...</span>
            <span>{Math.round(tokensReceived / Math.max(responseTime / 1000, 1))} tokens/sec</span>
          </div>
        </div>
      )}
    </div>
  );
};
