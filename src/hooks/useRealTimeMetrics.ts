
import { useState, useEffect, useCallback } from 'react';

interface MetricsData {
  timestamp: number;
  tokensPerSecond: number;
  responseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  networkLatency: number;
  accuracy: number;
  throughput: number;
  activeConnections: number;
  errorRate: number;
}

interface UseRealTimeMetricsOptions {
  updateInterval?: number;
  maxDataPoints?: number;
  enableHistoricalData?: boolean;
}

export const useRealTimeMetrics = (
  isActive: boolean = false,
  options: UseRealTimeMetricsOptions = {}
) => {
  const {
    updateInterval = 1000,
    maxDataPoints = 60,
    enableHistoricalData = true
  } = options;

  const [currentMetrics, setCurrentMetrics] = useState<MetricsData>({
    timestamp: Date.now(),
    tokensPerSecond: 0,
    responseTime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    networkLatency: 0,
    accuracy: 0,
    throughput: 0,
    activeConnections: 0,
    errorRate: 0
  });

  const [historicalData, setHistoricalData] = useState<MetricsData[]>([]);
  const [isCollecting, setIsCollecting] = useState(false);

  const generateMetrics = useCallback((): MetricsData => {
    const now = Date.now();
    const baseVariation = isActive ? 1 : 0.1;
    
    return {
      timestamp: now,
      tokensPerSecond: Math.max(0, currentMetrics.tokensPerSecond + (Math.random() - 0.5) * 50 * baseVariation),
      responseTime: Math.max(50, currentMetrics.responseTime + (Math.random() - 0.5) * 100 * baseVariation),
      memoryUsage: Math.min(95, Math.max(10, currentMetrics.memoryUsage + (Math.random() - 0.5) * 5 * baseVariation)),
      cpuUsage: Math.min(90, Math.max(5, currentMetrics.cpuUsage + (Math.random() - 0.5) * 10 * baseVariation)),
      networkLatency: Math.max(10, currentMetrics.networkLatency + (Math.random() - 0.5) * 20 * baseVariation),
      accuracy: Math.min(100, Math.max(85, currentMetrics.accuracy + (Math.random() - 0.5) * 3 * baseVariation)),
      throughput: Math.max(0, currentMetrics.throughput + (Math.random() - 0.5) * 30 * baseVariation),
      activeConnections: Math.max(0, Math.round(currentMetrics.activeConnections + (Math.random() - 0.5) * 5 * baseVariation)),
      errorRate: Math.min(10, Math.max(0, currentMetrics.errorRate + (Math.random() - 0.5) * 2 * baseVariation))
    };
  }, [currentMetrics, isActive]);

  const resetMetrics = useCallback(() => {
    setCurrentMetrics({
      timestamp: Date.now(),
      tokensPerSecond: 0,
      responseTime: 100,
      memoryUsage: 25,
      cpuUsage: 15,
      networkLatency: 50,
      accuracy: 95,
      throughput: 100,
      activeConnections: 1,
      errorRate: 0.5
    });
    setHistoricalData([]);
  }, []);

  const startCollection = useCallback(() => {
    setIsCollecting(true);
  }, []);

  const stopCollection = useCallback(() => {
    setIsCollecting(false);
  }, []);

  const getMetricsSnapshot = useCallback(() => {
    return {
      current: currentMetrics,
      historical: historicalData,
      summary: {
        avgTokensPerSecond: historicalData.length > 0 
          ? historicalData.reduce((sum, m) => sum + m.tokensPerSecond, 0) / historicalData.length 
          : 0,
        avgResponseTime: historicalData.length > 0 
          ? historicalData.reduce((sum, m) => sum + m.responseTime, 0) / historicalData.length 
          : 0,
        peakCpuUsage: historicalData.length > 0 
          ? Math.max(...historicalData.map(m => m.cpuUsage)) 
          : 0,
        totalDataPoints: historicalData.length
      }
    };
  }, [currentMetrics, historicalData]);

  useEffect(() => {
    if (!isActive && !isCollecting) return;

    const interval = setInterval(() => {
      const newMetrics = generateMetrics();
      setCurrentMetrics(newMetrics);

      if (enableHistoricalData) {
        setHistoricalData(prev => {
          const updated = [...prev, newMetrics];
          return updated.slice(-maxDataPoints);
        });
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isActive, isCollecting, updateInterval, maxDataPoints, enableHistoricalData, generateMetrics]);

  return {
    currentMetrics,
    historicalData,
    isCollecting,
    startCollection,
    stopCollection,
    resetMetrics,
    getMetricsSnapshot
  };
};

export type { MetricsData, UseRealTimeMetricsOptions };
