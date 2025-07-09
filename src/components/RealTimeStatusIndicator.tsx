
import React from 'react';
import { Wifi, WifiOff, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

interface RealTimeStatusIndicatorProps {
  isConnected: boolean;
  isStreaming: boolean;
  tokensPerSecond?: number;
  lastResponseTime?: number;
}

export const RealTimeStatusIndicator: React.FC<RealTimeStatusIndicatorProps> = ({
  isConnected,
  isStreaming,
  tokensPerSecond = 0,
  lastResponseTime = 0
}) => {
  const getStatusIcon = () => {
    if (!isConnected) {
      return <WifiOff className="w-3 h-3 text-red-400" />;
    }
    
    if (isStreaming) {
      return <Zap className="w-3 h-3 text-blue-400 animate-pulse" />;
    }
    
    return <CheckCircle className="w-3 h-3 text-green-400" />;
  };

  const getStatusText = () => {
    if (!isConnected) {
      return 'Disconnected';
    }
    
    if (isStreaming) {
      return `Streaming (${tokensPerSecond.toFixed(0)} t/s)`;
    }
    
    return 'Ready';
  };

  const getPerformanceIndicator = () => {
    if (lastResponseTime > 0) {
      if (lastResponseTime < 1000) {
        return <div className="w-2 h-2 bg-green-400 rounded-full" title="Excellent performance" />;
      } else if (lastResponseTime < 3000) {
        return <div className="w-2 h-2 bg-yellow-400 rounded-full" title="Good performance" />;
      } else {
        return <div className="w-2 h-2 bg-red-400 rounded-full" title="Slow performance" />;
      }
    }
    return null;
  };

  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-black/20 backdrop-blur-sm rounded-full border border-white/10">
      {getStatusIcon()}
      <span className="text-xs text-white/80">{getStatusText()}</span>
      {getPerformanceIndicator()}
      
      {lastResponseTime > 0 && (
        <span className="text-xs text-gray-400">
          {lastResponseTime}ms
        </span>
      )}
    </div>
  );
};
