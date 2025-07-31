import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Network, 
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  Database,
  Globe
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    frequency: number;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    upload: number;
    download: number;
    latency: number;
  };
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  component: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

interface EndpointMetrics {
  endpoint: string;
  responseTime: number;
  requests: number;
  errors: number;
  uptime: number;
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: { usage: 45, cores: 8, frequency: 3.2 },
    memory: { used: 12.8, total: 32, percentage: 40 },
    disk: { used: 256, total: 1024, percentage: 25 },
    network: { upload: 1.2, download: 5.8, latency: 15 }
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([
    {
      id: '1',
      type: 'warning',
      component: 'RAG Service',
      message: 'Response time above normal threshold (2.3s)',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      component: 'Database',
      message: 'Connection pool optimized',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      resolved: true
    }
  ]);

  const [endpoints, setEndpoints] = useState<EndpointMetrics[]>([
    {
      endpoint: '/api/rag/search',
      responseTime: 235,
      requests: 1247,
      errors: 3,
      uptime: 99.8
    },
    {
      endpoint: '/api/agents/communicate',
      responseTime: 89,
      requests: 892,
      errors: 0,
      uptime: 100
    },
    {
      endpoint: '/api/documents/upload',
      responseTime: 456,
      requests: 234,
      errors: 1,
      uptime: 99.6
    }
  ]);

  useEffect(() => {
    // Simulate real-time metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpu: {
          ...prev.cpu,
          usage: Math.max(10, Math.min(90, prev.cpu.usage + (Math.random() - 0.5) * 10))
        },
        memory: {
          ...prev.memory,
          percentage: Math.max(20, Math.min(80, prev.memory.percentage + (Math.random() - 0.5) * 5))
        },
        disk: {
          ...prev.disk,
          percentage: Math.max(10, Math.min(90, prev.disk.percentage + (Math.random() - 0.5) * 2))
        },
        network: {
          ...prev.network,
          upload: Math.max(0, prev.network.upload + (Math.random() - 0.5) * 0.5),
          download: Math.max(0, prev.network.download + (Math.random() - 0.5) * 2),
          latency: Math.max(5, Math.min(100, prev.network.latency + (Math.random() - 0.5) * 10))
        }
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (percentage: number) => {
    if (percentage > 80) return 'text-red-500';
    if (percentage > 60) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">CPU Usage</p>
                        <p className={`text-2xl font-bold ${getStatusColor(metrics.cpu.usage)}`}>
                          {metrics.cpu.usage.toFixed(1)}%
                        </p>
                      </div>
                      <Cpu className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <Progress 
                      value={metrics.cpu.usage} 
                      className="mt-2 h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Memory</p>
                        <p className={`text-2xl font-bold ${getStatusColor(metrics.memory.percentage)}`}>
                          {metrics.memory.percentage.toFixed(1)}%
                        </p>
                      </div>
                      <HardDrive className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <Progress 
                      value={metrics.memory.percentage} 
                      className="mt-2 h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Disk Usage</p>
                        <p className={`text-2xl font-bold ${getStatusColor(metrics.disk.percentage)}`}>
                          {metrics.disk.percentage.toFixed(1)}%
                        </p>
                      </div>
                      <HardDrive className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <Progress 
                      value={metrics.disk.percentage} 
                      className="mt-2 h-2"
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Latency</p>
                        <p className={`text-2xl font-bold ${getStatusColor(metrics.network.latency)}`}>
                          {metrics.network.latency.toFixed(0)}ms
                        </p>
                      </div>
                      <Network className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      ↑ {metrics.network.upload.toFixed(1)} MB/s ↓ {metrics.network.download.toFixed(1)} MB/s
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Zap className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">System Health</h3>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Healthy</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Database</h3>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Connected</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">API Status</h3>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Operational</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      CPU & Memory
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">CPU Usage</span>
                          <span className="text-sm font-medium">{metrics.cpu.usage.toFixed(1)}%</span>
                        </div>
                        <Progress value={metrics.cpu.usage} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {metrics.cpu.cores} cores @ {metrics.cpu.frequency} GHz
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Memory</span>
                          <span className="text-sm font-medium">
                            {formatBytes(metrics.memory.used * 1024 * 1024 * 1024)} / {formatBytes(metrics.memory.total * 1024 * 1024 * 1024)}
                          </span>
                        </div>
                        <Progress value={metrics.memory.percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {metrics.memory.percentage.toFixed(1)}% used
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <HardDrive className="w-5 h-5" />
                      Storage & Network
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Disk Usage</span>
                          <span className="text-sm font-medium">
                            {metrics.disk.used} GB / {metrics.disk.total} GB
                          </span>
                        </div>
                        <Progress value={metrics.disk.percentage} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {(metrics.disk.total - metrics.disk.used)} GB available
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Network</span>
                          <span className="text-sm font-medium">{metrics.network.latency.toFixed(0)}ms</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-muted-foreground">Upload:</span>
                            <span className="ml-1 font-medium">{metrics.network.upload.toFixed(1)} MB/s</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Download:</span>
                            <span className="ml-1 font-medium">{metrics.network.download.toFixed(1)} MB/s</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="endpoints" className="space-y-4">
              <div className="space-y-4">
                {endpoints.map((endpoint, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {endpoint.endpoint}
                            </code>
                            <Badge variant={endpoint.uptime >= 99.5 ? "default" : "destructive"}>
                              {endpoint.uptime}% uptime
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Response Time:</span>
                              <div className="font-medium flex items-center gap-1">
                                {endpoint.responseTime}ms
                                {endpoint.responseTime < 200 ? (
                                  <TrendingDown className="w-3 h-3 text-green-500" />
                                ) : (
                                  <TrendingUp className="w-3 h-3 text-yellow-500" />
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Requests:</span>
                              <div className="font-medium">{endpoint.requests.toLocaleString()}</div>
                            </div>
                            
                            <div>
                              <span className="text-muted-foreground">Errors:</span>
                              <div className={`font-medium ${endpoint.errors > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                {endpoint.errors}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline">
                            <Clock className="w-4 h-4 mr-1" />
                            Logs
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Activity className="w-4 h-4 mr-1" />
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <div className="space-y-3">
                {alerts.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                      <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
                      <p className="text-muted-foreground">
                        System is running smoothly with no performance issues.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  alerts.map((alert) => (
                    <Card key={alert.id} className={alert.resolved ? 'opacity-60' : ''}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getAlertIcon(alert.type)}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium">{alert.component}</h3>
                                <Badge variant={
                                  alert.type === 'error' ? 'destructive' :
                                  alert.type === 'warning' ? 'secondary' : 'default'
                                }>
                                  {alert.type}
                                </Badge>
                                {alert.resolved && (
                                  <Badge variant="outline">Resolved</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {alert.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          {!alert.resolved && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => resolveAlert(alert.id)}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};