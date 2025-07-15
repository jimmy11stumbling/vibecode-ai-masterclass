import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Rocket, 
  Globe, 
  Server, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Settings,
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Deployment {
  id: string;
  name: string;
  url: string;
  status: 'building' | 'ready' | 'failed' | 'deploying';
  environment: 'development' | 'staging' | 'production';
  branch: string;
  timestamp: Date;
  buildTime?: number;
  logs?: string[];
}

interface DeploymentTarget {
  id: string;
  name: string;
  provider: 'vercel' | 'netlify' | 'github-pages' | 'custom';
  connected: boolean;
  lastDeploy?: Date;
}

export const DeploymentManager: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([
    {
      id: '1',
      name: 'Production Deploy',
      url: 'https://sovereign-ai-ide.vercel.app',
      status: 'ready',
      environment: 'production',
      branch: 'main',
      timestamp: new Date(Date.now() - 3600000),
      buildTime: 180
    },
    {
      id: '2',
      name: 'Staging Deploy',
      url: 'https://staging-sovereign-ai.vercel.app',
      status: 'building',
      environment: 'staging',
      branch: 'develop',
      timestamp: new Date(Date.now() - 600000)
    }
  ]);

  const [targets, setTargets] = useState<DeploymentTarget[]>([
    {
      id: '1',
      name: 'Vercel Production',
      provider: 'vercel',
      connected: true,
      lastDeploy: new Date(Date.now() - 3600000)
    },
    {
      id: '2',
      name: 'Netlify Staging',
      provider: 'netlify',
      connected: false
    }
  ]);

  const [customDomain, setCustomDomain] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  const deployToTarget = async (targetId: string, environment: 'development' | 'staging' | 'production') => {
    setIsDeploying(true);
    
    try {
      const newDeployment: Deployment = {
        id: Date.now().toString(),
        name: `${environment} Deploy`,
        url: `https://${environment}-sovereign-ai.vercel.app`,
        status: 'deploying',
        environment,
        branch: environment === 'production' ? 'main' : 'develop',
        timestamp: new Date()
      };

      setDeployments(prev => [newDeployment, ...prev]);

      // Simulate deployment process
      setTimeout(() => {
        setDeployments(prev => 
          prev.map(d => 
            d.id === newDeployment.id 
              ? { ...d, status: 'building' as const }
              : d
          )
        );
      }, 2000);

      setTimeout(() => {
        setDeployments(prev => 
          prev.map(d => 
            d.id === newDeployment.id 
              ? { ...d, status: 'ready' as const, buildTime: 145 }
              : d
          )
        );
        
        toast({
          title: 'Deployment Successful',
          description: `${environment} environment deployed successfully`
        });
      }, 8000);

    } catch (error) {
      toast({
        title: 'Deployment Failed',
        description: 'Failed to deploy to target environment',
        variant: 'destructive'
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const connectTarget = (targetId: string) => {
    setTargets(prev => 
      prev.map(t => 
        t.id === targetId 
          ? { ...t, connected: true, lastDeploy: new Date() }
          : t
      )
    );
    
    toast({
      title: 'Target Connected',
      description: 'Deployment target configured successfully'
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL Copied',
      description: 'Deployment URL copied to clipboard'
    });
  };

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'building':
      case 'deploying':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: Deployment['status']) => {
    switch (status) {
      case 'ready':
        return 'bg-green-900 text-green-100';
      case 'building':
      case 'deploying':
        return 'bg-blue-900 text-blue-100';
      case 'failed':
        return 'bg-red-900 text-red-100';
      default:
        return 'bg-yellow-900 text-yellow-100';
    }
  };

  const getEnvironmentColor = (env: Deployment['environment']) => {
    switch (env) {
      case 'production':
        return 'bg-red-900 text-red-100';
      case 'staging':
        return 'bg-yellow-900 text-yellow-100';
      case 'development':
        return 'bg-green-900 text-green-100';
    }
  };

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white">Deployment Manager</h3>
        <p className="text-sm text-slate-400">Deploy and manage your application</p>
      </div>

      <Tabs defaultValue="deployments" className="flex-1">
        <TabsList className="mx-4 mt-4 bg-slate-800">
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="targets">Targets</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
        </TabsList>

        <div className="p-4">
          <TabsContent value="deployments" className="space-y-4">
            {/* Quick Deploy Actions */}
            <div className="flex space-x-2">
              <Button
                onClick={() => deployToTarget('1', 'development')}
                disabled={isDeploying}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy Dev
              </Button>
              <Button
                onClick={() => deployToTarget('1', 'staging')}
                disabled={isDeploying}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy Staging
              </Button>
              <Button
                onClick={() => deployToTarget('1', 'production')}
                disabled={isDeploying}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Deploy Production
              </Button>
            </div>

            {/* Deployment History */}
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {deployments.map((deployment) => (
                  <Card key={deployment.id} className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(deployment.status)}
                          <h4 className="font-medium text-white">{deployment.name}</h4>
                          <Badge className={getEnvironmentColor(deployment.environment)}>
                            {deployment.environment}
                          </Badge>
                        </div>
                        <Badge className={getStatusColor(deployment.status)}>
                          {deployment.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Globe className="w-4 h-4 text-slate-400" />
                          <span className="text-sm text-slate-300">{deployment.url}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyUrl(deployment.url)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(deployment.url, '_blank')}
                            className="h-6 w-6 p-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span>Branch: {deployment.branch}</span>
                          <span>{deployment.timestamp.toLocaleString()}</span>
                          {deployment.buildTime && (
                            <span>Build: {deployment.buildTime}s</span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="targets" className="space-y-4">
            <div className="grid gap-4">
              {targets.map((target) => (
                <Card key={target.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Server className="w-5 h-5 text-slate-400" />
                        <div>
                          <h4 className="font-medium text-white">{target.name}</h4>
                          <p className="text-sm text-slate-400 capitalize">{target.provider}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {target.connected ? (
                          <Badge className="bg-green-900 text-green-100">Connected</Badge>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => connectTarget(target.id)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Connect
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {target.lastDeploy && (
                      <p className="text-xs text-slate-500 mt-2">
                        Last deploy: {target.lastDeploy.toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="domains" className="space-y-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Custom Domain</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder="your-domain.com"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Add Domain
                  </Button>
                </div>
                
                <div className="text-sm text-slate-400">
                  <p className="mb-2">To configure your custom domain:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Add your domain above</li>
                    <li>Configure DNS records with your provider</li>
                    <li>Wait for SSL certificate provisioning</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
            
            {/* Domain List */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Configured Domains</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-slate-500 py-4">
                  <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No custom domains configured</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
