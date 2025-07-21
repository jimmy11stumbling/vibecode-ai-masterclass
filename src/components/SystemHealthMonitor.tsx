
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RealTimeStatusIndicator } from '@/components/RealTimeStatusIndicator';
import { 
  Activity,
  Server,
  Database,
  Wifi,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  MemoryStick,
  HardDrive
} from 'lucide-react';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  responseTime: number;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  lastCheck: Date;
  uptime: number;
}

export const SystemHealthMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 68,
    disk: 32,
    network: 89,
    uptime: 99.9,
    responseTime: 120
  });

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Gateway',
      status: 'healthy',
      responseTime: 45,
      lastCheck: new Date(),
      uptime: 99.9
    },
    {
      name: 'Database',
      status: 'healthy', 
      responseTime: 23,
      lastCheck: new Date(),
      uptime: 99.8
    },
    {
      name: 'AI Service',
      status: 'healthy',
      responseTime: 156,
      lastCheck: new Date(),
      uptime: 98.5
    },
    {
      name: 'File Storage',
      status: 'degraded',
      responseTime: 342,
      lastCheck: new Date(),
      uptime: 97.2
    }
  ]);

  const [systemStatus, setSystemStatus] = useState<'connected' | 'disconnected' | 'processing'>('connected');

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate real-time metrics updates
      setMetrics(prev => ({
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        disk: Math.max(0, Math.min(100, prev.disk + (Math.random() - 0.5) * 2)),
        network: Math.max(0, Math.min(100, prev.network + (Math.random() - 0.5) * 15)),
        uptime: prev.uptime,
        responseTime: Math.max(50, prev.responseTime + (Math.random() - 0.5) * 20)
      }));

      // Update service statuses
      setServices(prev => prev.map(service => ({
        ...service,
        responseTime: Math.max(10, service.responseTime + (Math.random() - 0.5) * 50),
        lastCheck: new Date(),
        status: Math.random() > 0.95 ? 'degraded' : 'healthy'
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 border-green-400';
      case 'degraded': return 'text-yellow-400 border-yellow-400';
      case 'down': return 'text-red-400 border-red-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'down': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const overallHealth = services.every(s => s.status === 'healthy') ? 'healthy' : 
                       services.some(s => s.status === 'down') ? 'down' : 'degraded';

  return (
    <ErrorBoundary>
      <div className="space-y-6 p-4">
        {/* System Status Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">System Health Monitor</h2>
          <RealTimeStatusIndicator
            status={systemStatus}
            lastUpdate={new Date()}
            responseTime={metrics.responseTime}
            aiModel="Production System"
          />
        </div>

        {/* Overall Health */}
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Overall System Health</CardTitle>
              <Badge variant="outline" className={getStatusColor(overallHealth)}>
                {overallHealth.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>Real-time system performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {metrics.uptime.toFixed(1)}%
                </div>
                <div className="text-slate-400 text-sm">Uptime</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {metrics.responseTime.toFixed(0)}ms
                </div>
                <div className="text-slate-400 text-sm">Response Time</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {services.filter(s => s.status === 'healthy').length}/{services.length}
                </div>
                <div className="text-slate-400 text-sm">Services Online</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {Math.round((metrics.cpu + metrics.memory) / 2)}%
                </div>
                <div className="text-slate-400 text-sm">Resource Usage</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* System Metrics */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-400" />
                System Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">CPU Usage</span>
                  </div>
                  <span className="text-slate-300">{metrics.cpu.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.cpu} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <MemoryStick className="w-4 h-4 text-blue-400" />
                    <span className="text-white">Memory Usage</span>
                  </div>
                  <span className="text-slate-300">{metrics.memory.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.memory} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HardDrive className="w-4 h-4 text-green-400" />
                    <span className="text-white">Disk Usage</span>
                  </div>
                  <span className="text-slate-300">{metrics.disk.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.disk} className="h-2" />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wifi className="w-4 h-4 text-purple-400" />
                    <span className="text-white">Network I/O</span>
                  </div>
                  <span className="text-slate-300">{metrics.network.toFixed(1)}%</span>
                </div>
                <Progress value={metrics.network} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Service Status */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Server className="w-5 h-5 mr-2 text-green-400" />
                Service Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <p className="text-white font-medium">{service.name}</p>
                        <p className="text-slate-400 text-sm">
                          {service.responseTime}ms • {service.uptime.toFixed(1)}% uptime
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                      <p className="text-slate-400 text-xs mt-1">
                        {service.lastCheck.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
};
