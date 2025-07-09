
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface RealTimeProgressProps {
  isStreaming: boolean;
  tokensReceived: number;
  estimatedTokens?: number;
  responseTime?: number;
  status: 'idle' | 'connecting' | 'streaming' | 'complete' | 'error';
}

export const RealTimeProgress: React.FC<RealTimeProgressProps> = ({
  isStreaming,
  tokensReceived,
  estimatedTokens = 100,
  responseTime = 0,
  status
}) => {
  const progress = estimatedTokens > 0 ? (tokensReceived / estimatedTokens) * 100 : 0;

  const getStatusIcon = () => {
    switch (status) {
      case 'connecting':
        return <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'streaming':
        return <Zap className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connecting':
        return 'Connecting to AI...';
      case 'streaming':
        return `Streaming response... (${tokensReceived} tokens)`;
      case 'complete':
        return `Response complete (${tokensReceived} tokens in ${responseTime}ms)`;
      case 'error':
        return 'Error occurred';
      default:
        return 'Ready';
    }
  };

  if (status === 'idle') return null;

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-3 mb-4">
      <div className="flex items-center space-x-3 mb-2">
        {getStatusIcon()}
        <span className="text-sm text-white">{getStatusText()}</span>
      </div>
      
      {(status === 'streaming' || status === 'connecting') && (
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-2 bg-white/10"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress: {Math.round(progress)}%</span>
            <span>Speed: {responseTime > 0 ? Math.round(tokensReceived / (responseTime / 1000)) : 0} tokens/s</span>
          </div>
        </div>
      )}
      
      {status === 'complete' && (
        <div className="text-xs text-green-400">
          ✓ Response generated successfully
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-xs text-red-400">
          ✗ Failed to generate response
        </div>
      )}
    </div>
  );
};
