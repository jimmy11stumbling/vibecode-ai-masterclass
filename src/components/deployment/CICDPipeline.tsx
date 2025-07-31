import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  GitBranch, 
  Play, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  Settings,
  Activity,
  Terminal,
  Globe,
  Shield
} from 'lucide-react';

interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed' | 'cancelled';
  duration?: number;
  logs?: string[];
  startTime?: string;
  endTime?: string;
}

interface Deployment {
  id: string;
  branch: string;
  commit: string;
  author: string;
  message: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  stages: PipelineStage[];
  startTime: string;
  environment: 'development' | 'staging' | 'production';
  url?: string;
}

export const CICDPipeline: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [activeDeployment, setActiveDeployment] = useState<Deployment | null>(null);
  const [isAutoDeployEnabled, setIsAutoDeployEnabled] = useState(true);

  useEffect(() => {
    // Simulate deployments data
    const mockDeployments: Deployment[] = [
      {
        id: '1',
        branch: 'main',
        commit: 'a1b2c3d',
        author: 'John Doe',
        message: 'Add new RAG integration features',
        status: 'success',
        startTime: new Date(Date.now() - 1800000).toISOString(),
        environment: 'production',
        url: 'https://app.example.com',
        stages: [
          { id: '1', name: 'Build', status: 'success', duration: 120 },
          { id: '2', name: 'Test', status: 'success', duration: 180 },
          { id: '3', name: 'Security Scan', status: 'success', duration: 90 },
          { id: '4', name: 'Deploy', status: 'success', duration: 60 }
        ]
      },
      {
        id: '2',
        branch: 'feature/collaboration',
        commit: 'e4f5g6h',
        author: 'Jane Smith',
        message: 'Implement real-time collaboration',
        status: 'running',
        startTime: new Date(Date.now() - 300000).toISOString(),
        environment: 'staging',
        stages: [
          { id: '1', name: 'Build', status: 'success', duration: 95 },
          { id: '2', name: 'Test', status: 'running', startTime: new Date(Date.now() - 60000).toISOString() },
          { id: '3', name: 'Security Scan', status: 'pending' },
          { id: '4', name: 'Deploy', status: 'pending' }
        ]
      }
    ];

    setDeployments(mockDeployments);
    setActiveDeployment(mockDeployments.find(d => d.status === 'running') || null);
  }, []);

  const triggerDeployment = (branch: string, environment: 'development' | 'staging' | 'production') => {
    const newDeployment: Deployment = {
      id: crypto.randomUUID(),
      branch,
      commit: Math.random().toString(36).substring(7),
      author: 'Current User',
      message: `Deploy ${branch} to ${environment}`,
      status: 'running',
      startTime: new Date().toISOString(),
      environment,
      stages: [
        { id: '1', name: 'Build', status: 'running', startTime: new Date().toISOString() },
        { id: '2', name: 'Test', status: 'pending' },
        { id: '3', name: 'Security Scan', status: 'pending' },
        { id: '4', name: 'Deploy', status: 'pending' }
      ]
    };

    setDeployments(prev => [newDeployment, ...prev]);
    setActiveDeployment(newDeployment);
  };

  const cancelDeployment = (deploymentId: string) => {
    setDeployments(prev => prev.map(d => 
      d.id === deploymentId 
        ? { ...d, status: 'failed' as const, stages: d.stages.map(s => ({ ...s, status: s.status === 'running' ? 'cancelled' as const : s.status })) }
        : d
    ));
    if (activeDeployment?.id === deploymentId) {
      setActiveDeployment(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getEnvironmentColor = (environment: string) => {
    switch (environment) {
      case 'production':
        return 'bg-red-500';
      case 'staging':
        return 'bg-yellow-500';
      case 'development':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const calculateProgress = (stages: PipelineStage[]) => {
    const completed = stages.filter(s => s.status === 'success').length;
    return (completed / stages.length) * 100;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-5 h-5" />
              CI/CD Pipeline
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isAutoDeployEnabled ? "default" : "secondary"}>
                {isAutoDeployEnabled ? "Auto-deploy ON" : "Auto-deploy OFF"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAutoDeployEnabled(!isAutoDeployEnabled)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deployments" className="w-full">
            <TabsList>
              <TabsTrigger value="deployments">Deployments</TabsTrigger>
              <TabsTrigger value="environments">Environments</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="deployments" className="space-y-4">
              {/* Quick Deploy */}
              <div className="flex items-center gap-2 p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">Quick Deploy</h3>
                  <p className="text-sm text-muted-foreground">Deploy current branch to environment</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => triggerDeployment('main', 'development')}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Dev
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => triggerDeployment('main', 'staging')}
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    Staging
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => triggerDeployment('main', 'production')}
                  >
                    <Globe className="w-4 h-4 mr-1" />
                    Production
                  </Button>
                </div>
              </div>

              {/* Active Deployment */}
              {activeDeployment && (
                <Card className="border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <div>
                          <h3 className="font-medium">Active Deployment</h3>
                          <p className="text-sm text-muted-foreground">
                            {activeDeployment.branch} → {activeDeployment.environment}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => cancelDeployment(activeDeployment.id)}
                      >
                        <Square className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress value={calculateProgress(activeDeployment.stages)} className="h-2" />
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {activeDeployment.stages.map((stage) => (
                          <div key={stage.id} className="flex items-center gap-2 p-3 border rounded">
                            {getStatusIcon(stage.status)}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{stage.name}</p>
                              {stage.duration && (
                                <p className="text-xs text-muted-foreground">{stage.duration}s</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Deployment History */}
              <div className="space-y-3">
                <h3 className="font-medium">Recent Deployments</h3>
                {deployments.map((deployment) => (
                  <Card key={deployment.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(deployment.status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {deployment.branch}
                            </Badge>
                            <Badge className={`text-xs text-white ${getEnvironmentColor(deployment.environment)}`}>
                              {deployment.environment}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {deployment.commit}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{deployment.message}</p>
                          <p className="text-xs text-muted-foreground">
                            by {deployment.author} • {new Date(deployment.startTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {deployment.url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={deployment.url} target="_blank" rel="noopener noreferrer">
                              <Globe className="w-4 h-4 mr-1" />
                              View
                            </a>
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Terminal className="w-4 h-4 mr-1" />
                          Logs
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="environments" className="space-y-4">
              {['development', 'staging', 'production'].map((env) => (
                <Card key={env}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getEnvironmentColor(env)}`} />
                        <div>
                          <h3 className="font-medium capitalize">{env}</h3>
                          <p className="text-sm text-muted-foreground">
                            {env === 'production' ? 'https://app.example.com' : 
                             env === 'staging' ? 'https://staging.example.com' : 
                             'https://dev.example.com'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Healthy
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Deploy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Auto-deploy on push</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically deploy when code is pushed to main branch
                      </p>
                    </div>
                    <Button
                      variant={isAutoDeployEnabled ? "default" : "outline"}
                      onClick={() => setIsAutoDeployEnabled(!isAutoDeployEnabled)}
                    >
                      {isAutoDeployEnabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Security scanning</h3>
                      <p className="text-sm text-muted-foreground">
                        Run security scans before deployment
                      </p>
                    </div>
                    <Button variant="default">
                      <Shield className="w-4 h-4 mr-1" />
                      Enabled
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Rollback on failure</h3>
                      <p className="text-sm text-muted-foreground">
                        Automatically rollback if deployment fails
                      </p>
                    </div>
                    <Button variant="default">
                      Enabled
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};