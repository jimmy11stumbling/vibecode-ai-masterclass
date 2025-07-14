
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Wifi, 
  WifiOff,
  Activity,
  Loader2
} from 'lucide-react';

interface RealTimeStatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'connecting' | 'processing' | 'error';
  lastUpdate?: Date;
  responseTime?: number;
  aiModel?: string;
  onRetry?: () => void;
}

export const RealTimeStatusIndicator: React.FC<RealTimeStatusIndicatorProps> = ({
  status,
  lastUpdate,
  responseTime,
  aiModel = 'DeepSeek Reasoner',
  onRetry
}) => {
  const [pulseCount, setPulseCount] = useState(0);

  useEffect(() => {
    console.log('📡 Real-time status changed:', {
      status,
      lastUpdate,
      responseTime,
      aiModel,
      timestamp: new Date().toISOString()
    });

    if (status === 'processing') {
      const interval = setInterval(() => {
        setPulseCount(prev => prev + 1);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [status, lastUpdate, responseTime, aiModel]);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="w-3 h-3" />,
          color: 'bg-green-500',
          textColor: 'text-green-400',
          label: 'Connected',
          description: 'Real-time connection active'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="w-3 h-3" />,
          color: 'bg-red-500',
          textColor: 'text-red-400',
          label: 'Disconnected',
          description: 'Connection lost'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          color: 'bg-blue-500',
          textColor: 'text-blue-400',
          label: 'Connecting',
          description: 'Establishing connection'
        };
      case 'processing':
        return {
          icon: <Activity className="w-3 h-3 animate-pulse" />,
          color: 'bg-yellow-500',
          textColor: 'text-yellow-400',
          label: 'Processing',
          description: 'AI is thinking...'
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-3 h-3" />,
          color: 'bg-red-500',
          textColor: 'text-red-400',
          label: 'Error',
          description: 'Connection error'
        };
      default:
        return {
          icon: <Clock className="w-3 h-3" />,
          color: 'bg-gray-500',
          textColor: 'text-gray-400',
          label: 'Unknown',
          description: 'Status unknown'
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
      {/* Status Indicator */}
      <div className="flex items-center space-x-2">
        <div className={`w-2 h-2 rounded-full ${statusConfig.color}`}></div>
        <div className="flex items-center space-x-1">
          {statusConfig.icon}
          <span className={`text-xs font-medium ${statusConfig.textColor}`}>
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* AI Model Badge */}
      <Badge variant="secondary" className="text-xs">
        {aiModel}
      </Badge>

      {/* Response Time */}
      {responseTime && (
        <div className="flex items-center space-x-1 text-xs text-slate-400">
          <Zap className="w-3 h-3" />
          <span>{responseTime}ms</span>
        </div>
      )}

      {/* Last Update */}
      {lastUpdate && (
        <div className="text-xs text-slate-500">
          {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Processing Pulse Count */}
      {status === 'processing' && (
        <div className="text-xs text-yellow-400">
          {pulseCount} pulses
        </div>
      )}

      {/* Retry Button for Errors */}
      {status === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="text-xs text-blue-400 hover:text-blue-300 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};
