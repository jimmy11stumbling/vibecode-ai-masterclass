
import React from 'react';
import { Activity, Clock, Zap, CheckCircle, XCircle } from 'lucide-react';

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
  if (status === 'idle') return null;

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
        return <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />;
      case 'streaming':
        return <Activity className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting to AI...';
      case 'streaming':
        return `Streaming... ${tokensReceived} tokens`;
      case 'complete':
        return `Complete - ${tokensReceived} tokens in ${responseTime}ms`;
      case 'error':
        return 'Connection error';
      default:
        return '';
    }
  };

  return (
    <div className="px-4 py-2 border-b border-slate-700 bg-slate-800/50">
      <div className="flex items-center space-x-2 text-xs">
        {getStatusIcon()}
        <span className="text-slate-300">{getStatusText()}</span>
        {isStreaming && (
          <div className="flex items-center space-x-2 ml-auto">
            <Zap className="w-3 h-3 text-yellow-400" />
            <Clock className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400">{responseTime}ms</span>
          </div>
        )}
      </div>
    </div>
  );
};
