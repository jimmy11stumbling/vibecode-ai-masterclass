
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Globe, 
  Database, 
  Key, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  ExternalLink
} from 'lucide-react';

interface DeploymentStatus {
  frontend: 'pending' | 'building' | 'deployed' | 'failed';
  backend: 'pending' | 'building' | 'deployed' | 'failed';
  database: 'pending' | 'migrating' | 'ready' | 'failed';
}

interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret: boolean;
}

export const DeploymentManager: React.FC = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    frontend: 'pending',
    backend: 'pending',
    database: 'ready'
  });
  
  const [envVars, setEnvVars] = useState<EnvironmentVariable[]>([
    { key: 'SUPABASE_URL', value: 'https://agojvddqyfcozjxrllav.supabase.co', isSecret: false },
    { key: 'SUPABASE_ANON_KEY', value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', isSecret: true }
  ]);
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [newEnvKey, setNewEnvKey] = useState('');
  const [newEnvValue, setNewEnvValue] = useState('');

  const deploymentSteps = [
    { id: 'build', name: 'Build Application', status: 'completed' },
    { id: 'test', name: 'Run Tests', status: 'completed' },
    { id: 'deploy-frontend', name: 'Deploy Frontend', status: 'in-progress' },
    { id: 'deploy-backend', name: 'Deploy Backend', status: 'pending' },
    { id: 'migrate-db', name: 'Run Database Migrations', status: 'pending' },
    { id: 'health-check', name: 'Health Check', status: 'pending' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 border-2 border-slate-600 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'pending': { variant: 'secondary' as const, text: 'Pending' },
      'building': { variant: 'default' as const, text: 'Building' },
      'deployed': { variant: 'default' as const, text: 'Deployed' },
      'ready': { variant: 'default' as const, text: 'Ready' },
      'failed': { variant: 'destructive' as const, text: 'Failed' }
    };
    
    const config = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    // Simulate deployment process
    try {
      setDeploymentStatus(prev => ({ ...prev, frontend: 'building' }));
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDeploymentStatus(prev => ({ ...prev, frontend: 'deployed', backend: 'building' }));
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDeploymentStatus(prev => ({ ...prev, backend: 'deployed', database: 'migrating' }));
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setDeploymentStatus(prev => ({ ...prev, database: 'ready' }));
    } catch (error) {
      setDeploymentStatus(prev => ({ 
        ...prev, 
        frontend: 'failed', 
        backend: 'failed', 
        database: 'failed' 
      }));
    } finally {
      setIsDeploying(false);
    }
  };

  const addEnvironmentVariable = () => {
    if (newEnvKey && newEnvValue) {
      setEnvVars(prev => [...prev, {
        key: newEnvKey,
        value: newEnvValue,
        isSecret: newEnvKey.toLowerCase().includes('secret') || newEnvKey.toLowerCase().includes('key')
      }]);
      setNewEnvKey('');
      setNewEnvValue('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="font-semibold text-white">Deployment Manager</h3>
          </div>
          <Button 
            onClick={handleDeploy} 
            disabled={isDeploying}
            className="bg-green-600 hover:bg-green-700"
          >
            {isDeploying ? 'Deploying...' : 'Deploy Now'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="status" className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="status">Status</TabsTrigger>
            <TabsTrigger value="environment">Environment</TabsTrigger>
            <TabsTrigger value="domains">Domains</TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="status" className="h-full m-0 p-4">
            <div className="space-y-6">
              {/* Service Status Overview */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200 flex items-center">
                      <Globe className="w-4 h-4 mr-2" />
                      Frontend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getStatusBadge(deploymentStatus.frontend)}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200 flex items-center">
                      <Zap className="w-4 h-4 mr-2" />
                      Backend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getStatusBadge(deploymentStatus.backend)}
                  </CardContent>
                </Card>

                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-slate-200 flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      Database
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getStatusBadge(deploymentStatus.database)}
                  </CardContent>
                </Card>
              </div>

              {/* Deployment Steps */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Deployment Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {deploymentSteps.map((step) => (
                      <div key={step.id} className="flex items-center space-x-3">
                        {getStatusIcon(step.status)}
                        <span className={`text-sm ${
                          step.status === 'completed' ? 'text-green-400' :
                          step.status === 'in-progress' ? 'text-yellow-400' :
                          step.status === 'failed' ? 'text-red-400' :
                          'text-slate-400'
                        }`}>
                          {step.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Deployments */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Deployments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white">Production Deploy #42</div>
                        <div className="text-xs text-slate-400">2 minutes ago</div>
                      </div>
                      <Badge variant="default">Success</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white">Production Deploy #41</div>
                        <div className="text-xs text-slate-400">1 hour ago</div>
                      </div>
                      <Badge variant="default">Success</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-white">Production Deploy #40</div>
                        <div className="text-xs text-slate-400">3 hours ago</div>
                      </div>
                      <Badge variant="destructive">Failed</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="environment" className="h-full m-0 p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-200">Environment Variables</h4>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Variable name"
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    className="w-32 bg-slate-800 border-slate-600"
                  />
                  <Input
                    placeholder="Value"
                    value={newEnvValue}
                    onChange={(e) => setNewEnvValue(e.target.value)}
                    className="w-32 bg-slate-800 border-slate-600"
                  />
                  <Button size="sm" onClick={addEnvironmentVariable}>
                    Add
                  </Button>
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {envVars.map((envVar, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700">
                      <div className="flex items-center space-x-3">
                        {envVar.isSecret && <Key className="w-4 h-4 text-yellow-400" />}
                        <div>
                          <div className="text-sm font-medium text-white">{envVar.key}</div>
                          <div className="text-xs text-slate-400">
                            {envVar.isSecret ? '••••••••' : envVar.value}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="domains" className="h-full m-0 p-4">
            <div className="space-y-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    Production Domain
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white">your-app.lovable.app</div>
                      <div className="text-sm text-slate-400">Active • SSL Certificate Valid</div>
                    </div>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Visit
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Custom Domain</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <Input
                        placeholder="yourdomain.com"
                        className="bg-slate-700 border-slate-600"
                      />
                      <Button>Add Domain</Button>
                    </div>
                    <div className="text-sm text-slate-400">
                      Add your custom domain to make your app accessible at your own URL
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
