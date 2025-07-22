
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface WebSocketMessage {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  fromAgent?: string;
  toAgent?: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => void;
  subscribeToMessages: (callback: (message: WebSocketMessage) => void) => () => void;
  connectionState: 'connecting' | 'connected' | 'disconnected' | 'error';
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const { user } = useAuth();
  const { toast } = useToast();
  const wsRef = useRef<WebSocket | null>(null);
  const messageListeners = useRef<Set<(message: WebSocketMessage) => void>>(new Set());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    if (!user || wsRef.current?.readyState === WebSocket.OPEN) return;

    setConnectionState('connecting');
    
    // In production, this would connect to your WebSocket server
    // For now, we'll simulate the connection
    const simulateConnection = () => {
      setIsConnected(true);
      setConnectionState('connected');
      reconnectAttempts.current = 0;
      
      // Simulate periodic messages
      const interval = setInterval(() => {
        if (connectionState === 'connected') {
          const simulatedMessage: WebSocketMessage = {
            id: `msg_${Date.now()}`,
            type: 'system_heartbeat',
            payload: { status: 'alive', timestamp: new Date() },
            timestamp: new Date()
          };
          
          messageListeners.current.forEach(callback => callback(simulatedMessage));
        }
      }, 30000); // Every 30 seconds

      return () => clearInterval(interval);
    };

    const cleanup = simulateConnection();

    // Cleanup function
    return cleanup;
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setIsConnected(false);
    setConnectionState('disconnected');
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  };

  const sendMessage = (message: Omit<WebSocketMessage, 'id' | 'timestamp'>) => {
    if (!isConnected) {
      toast({
        title: "Connection Error",
        description: "WebSocket is not connected",
        variant: "destructive"
      });
      return;
    }

    const fullMessage: WebSocketMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    // In production, this would send via WebSocket
    // For now, we'll just echo it back
    setTimeout(() => {
      messageListeners.current.forEach(callback => callback(fullMessage));
    }, 100);
  };

  const subscribeToMessages = (callback: (message: WebSocketMessage) => void) => {
    messageListeners.current.add(callback);
    
    return () => {
      messageListeners.current.delete(callback);
    };
  };

  useEffect(() => {
    if (user) {
      const cleanup = connect();
      return cleanup;
    } else {
      disconnect();
    }
  }, [user]);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value = {
    isConnected,
    sendMessage,
    subscribeToMessages,
    connectionState
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};
