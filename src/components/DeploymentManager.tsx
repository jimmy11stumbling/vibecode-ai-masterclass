
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Rocket, 
  Globe, 
  Server, 
  Settings, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

interface DeploymentTarget {
  id: string;
  name: string;
  type: 'static' | 'serverless' | 'container';
  status: 'idle' | 'deploying' | 'deployed' | 'failed';
  url?: string;
  lastDeployed?: Date;
  buildTime?: number;
}

export const DeploymentManager: React.FC = () => {
  const [deployments, setDeployments] = useState<DeploymentTarget[]>([
    {
      id: '1',
      name: 'Production',
      type: 'static',
      status: 'deployed',
      url: 'https://my-app.com',
      lastDeployed: new Date(Date.now() - 3600000),
      buildTime: 45
    },
    {
      id: '2',
      name: 'Staging',
      type: 'serverless',
      status: 'idle',
      lastDeployed: new Date(Date.now() - 86400000),
      buildTime: 32
    }
  ]);

  const [isDeploying, setIsDeploying] = useState(false);
  const [deployProgress, setDeployProgress] = useState(0);

  const handleDeploy = async (deploymentId: string) => {
    setIsDeploying(true);
    setDeployProgress(0);
    
    setDeployments(prev => prev.map(dep => 
      dep.id === deploymentId 
        ? { ...dep, status: 'deploying' as const }
        : dep
    ));

    // Simulate deployment progress
    const progressInterval = setInterval(() => {
      setDeployProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setIsDeploying(false);
          setDeployments(prevDeps => prevDeps.map(dep => 
            dep.id === deploymentId 
              ? { 
                  ...dep, 
                  status: 'deployed' as const,
                  lastDeployed: new Date(),
                  buildTime: Math.floor(Math.random() * 60) + 20
                }
              : dep
          ));
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const getStatusIcon = (status: DeploymentTarget['status']) => {
    switch (status) {
      case 'deployed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'deploying':
        return <Activity className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: DeploymentTarget['status']) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-500';
      case 'deploying':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Rocket className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Deployment</h2>
        </div>
        <Button size="sm" variant="outline" className="border-slate-600">
          <Settings className="w-4 h-4 mr-1" />
          Config
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-4">
          {/* Quick Deploy */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Quick Deploy</CardTitle>
              <CardDescription>Deploy current project instantly</CardDescription>
            </CardHeader>
            <CardContent>
              {isDeploying && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">Deploying...</span>
                    <span className="text-sm text-slate-300">{deployProgress}%</span>
                  </div>
                  <Progress value={deployProgress} className="h-2" />
                </div>
              )}
              <Button 
                onClick={() => handleDeploy('1')} 
                disabled={isDeploying}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy to Production
              </Button>
            </CardContent>
          </Card>

          {/* Deployment Targets */}
          {deployments.map((deployment) => (
            <Card key={deployment.id} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {deployment.type === 'static' ? (
                        <Globe className="w-4 h-4 text-green-400" />
                      ) : (
                        <Server className="w-4 h-4 text-blue-400" />
                      )}
                      <CardTitle className="text-white text-sm">{deployment.name}</CardTitle>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={`${getStatusColor(deployment.status)} text-white text-xs`}
                    >
                      {deployment.status}
                    </Badge>
                  </div>
                  {getStatusIcon(deployment.status)}
                </div>
                <CardDescription className="capitalize">
                  {deployment.type} deployment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {deployment.url && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">URL:</span>
                    <a 
                      href={deployment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
                    >
                      {deployment.url}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
                
                {deployment.lastDeployed && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Last deployed:</span>
                    <span className="text-sm text-slate-300">
                      {deployment.lastDeployed.toLocaleString()}
                    </span>
                  </div>
                )}
                
                {deployment.buildTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Build time:</span>
                    <span className="text-sm text-slate-300">{deployment.buildTime}s</span>
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  <Button
                    size="sm"
                    onClick={() => handleDeploy(deployment.id)}
                    disabled={deployment.status === 'deploying'}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {deployment.status === 'deploying' ? 'Deploying...' : 'Deploy'}
                  </Button>
                  {deployment.url && (
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Deployment History */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-white text-sm">Recent Deployments</CardTitle>
              <CardDescription>Latest deployment activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  { time: '2 hours ago', status: 'success', branch: 'main', commit: 'abc123f' },
                  { time: '1 day ago', status: 'success', branch: 'develop', commit: 'def456a' },
                  { time: '3 days ago', status: 'failed', branch: 'feature/auth', commit: 'ghi789b' }
                ].map((deploy, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-b-0">
                    <div className="flex items-center space-x-3">
                      {deploy.status === 'success' ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      )}
                      <div>
                        <span className="text-sm text-slate-300">{deploy.branch}</span>
                        <span className="text-xs text-slate-500 ml-2">{deploy.commit}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">{deploy.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};
