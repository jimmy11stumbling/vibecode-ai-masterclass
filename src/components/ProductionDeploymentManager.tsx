
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Cloud, 
  Server, 
  Settings, 
  Rocket,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  GitBranch,
  Globe,
  Docker,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deploymentOrchestrator } from '@/services/deploymentOrchestrator';

interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'docker';
  environment: 'development' | 'staging' | 'production';
  domain?: string;
  environmentVariables: Record<string, string>;
  buildCommand?: string;
  deploymentPath?: string;
}

export const ProductionDeploymentManager: React.FC = () => {
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig>({
    platform: 'vercel',
    environment: 'production',
    environmentVariables: {},
    buildCommand: 'npm run build',
    deploymentPath: 'dist'
  });
  
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentProgress, setDeploymentProgress] = useState(0);
  const [deploymentLogs, setDeploymentLogs] = useState<string[]>([]);
  const [deploymentTargets, setDeploymentTargets] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('configure');
  const { toast } = useToast();

  useEffect(() => {
    loadDeploymentTargets();
  }, []);

  const loadDeploymentTargets = async () => {
    try {
      const targets = deploymentOrchestrator.getDeploymentTargets();
      setDeploymentTargets(targets);
    } catch (error) {
      console.error('Failed to load deployment targets:', error);
    }
  };

  const handleDeploy = async () => {
    if (!deploymentConfig.platform) {
      toast({
        title: "Configuration Required",
        description: "Please select a deployment platform",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    setDeploymentProgress(0);
    setDeploymentLogs([]);

    try {
      // Create deployment target if it doesn't exist
      const targetId = await deploymentOrchestrator.addDeploymentTarget({
        name: `${deploymentConfig.platform}-${deploymentConfig.environment}`,
        type: deploymentConfig.platform,
        status: 'idle',
        config: {
          environment: deploymentConfig.environment,
          domain: deploymentConfig.domain,
          buildCommand: deploymentConfig.buildCommand,
          deploymentPath: deploymentConfig.deploymentPath,
          environmentVariables: deploymentConfig.environmentVariables
        }
      });

      // Simulate deployment progress
      const progressInterval = setInterval(() => {
        setDeploymentProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 500);

      // Start deployment
      const deploymentUrl = await deploymentOrchestrator.deploy(targetId, [], deploymentConfig);
      
      setDeploymentLogs(prev => [...prev, `✅ Deployment successful: ${deploymentUrl}`]);
      
      toast({
        title: "Deployment Successful",
        description: `Your application is now live at ${deploymentUrl}`,
      });

      // Refresh targets
      await loadDeploymentTargets();
      
    } catch (error) {
      setDeploymentLogs(prev => [...prev, `❌ Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`]);
      
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const addEnvironmentVariable = () => {
    const key = prompt('Environment variable name:');
    const value = prompt('Environment variable value:');
    
    if (key && value) {
      setDeploymentConfig(prev => ({
        ...prev,
        environmentVariables: {
          ...prev.environmentVariables,
          [key]: value
        }
      }));
    }
  };

  const removeEnvironmentVariable = (key: string) => {
    setDeploymentConfig(prev => ({
      ...prev,
      environmentVariables: Object.fromEntries(
        Object.entries(prev.environmentVariables).filter(([k]) => k !== key)
      )
    }));
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'vercel': return <Globe className="w-4 h-4" />;
      case 'netlify': return <Globe className="w-4 h-4" />;
      case 'aws': return <Cloud className="w-4 h-4" />;
      case 'gcp': return <Cloud className="w-4 h-4" />;
      case 'azure': return <Cloud className="w-4 h-4" />;
      case 'docker': return <Docker className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full bg-slate-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Rocket className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Production Deployment</h2>
        </div>
        <Badge variant="outline" className="text-green-400 border-green-400">
          Production Ready
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800">
          <TabsTrigger value="configure">Configure</TabsTrigger>
          <TabsTrigger value="deploy">Deploy</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="configure" className="space-y-6 mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Deployment Configuration</CardTitle>
              <CardDescription>Configure your deployment settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform" className="text-white">Platform</Label>
                  <Select 
                    value={deploymentConfig.platform} 
                    onValueChange={(value: any) => setDeploymentConfig(prev => ({ ...prev, platform: value }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vercel">Vercel</SelectItem>
                      <SelectItem value="netlify">Netlify</SelectItem>
                      <SelectItem value="aws">AWS S3 + CloudFront</SelectItem>
                      <SelectItem value="gcp">Google Cloud Platform</SelectItem>
                      <SelectItem value="azure">Microsoft Azure</SelectItem>
                      <SelectItem value="docker">Docker Container</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="environment" className="text-white">Environment</Label>
                  <Select 
                    value={deploymentConfig.environment} 
                    onValueChange={(value: any) => setDeploymentConfig(prev => ({ ...prev, environment: value }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select environment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain" className="text-white">Custom Domain (Optional)</Label>
                <Input
                  id="domain"
                  placeholder="yourdomain.com"
                  value={deploymentConfig.domain || ''}
                  onChange={(e) => setDeploymentConfig(prev => ({ ...prev, domain: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="buildCommand" className="text-white">Build Command</Label>
                  <Input
                    id="buildCommand"
                    placeholder="npm run build"
                    value={deploymentConfig.buildCommand || ''}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, buildCommand: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deploymentPath" className="text-white">Output Directory</Label>
                  <Input
                    id="deploymentPath"
                    placeholder="dist"
                    value={deploymentConfig.deploymentPath || ''}
                    onChange={(e) => setDeploymentConfig(prev => ({ ...prev, deploymentPath: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                Environment Variables
                <Button onClick={addEnvironmentVariable} size="sm" variant="outline">
                  Add Variable
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(deploymentConfig.environmentVariables).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-slate-700 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-white">{key}</span>
                      <span className="text-sm text-slate-400">=</span>
                      <span className="text-sm font-mono text-green-400">{value}</span>
                    </div>
                    <Button
                      onClick={() => removeEnvironmentVariable(key)}
                      size="sm"
                      variant="ghost"
                      className="text-red-400 hover:text-red-300"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {Object.keys(deploymentConfig.environmentVariables).length === 0 && (
                  <p className="text-slate-400 text-sm">No environment variables configured</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deploy" className="mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Deploy Application</CardTitle>
              <CardDescription>Deploy your application to the configured platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isDeploying && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300">Deploying...</span>
                    <span className="text-sm text-slate-300">{deploymentProgress}%</span>
                  </div>
                  <Progress value={deploymentProgress} className="h-2" />
                </div>
              )}

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {getPlatformIcon(deploymentConfig.platform)}
                  <span className="text-white capitalize">{deploymentConfig.platform}</span>
                </div>
                <Badge variant="outline" className="capitalize">
                  {deploymentConfig.environment}
                </Badge>
              </div>

              <Button
                onClick={handleDeploy}
                disabled={isDeploying}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isDeploying ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy to {deploymentConfig.platform}
                  </>
                )}
              </Button>

              {deploymentLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white">Deployment Logs</h4>
                  <ScrollArea className="h-32 w-full bg-slate-700 rounded p-2">
                    {deploymentLogs.map((log, index) => (
                      <div key={index} className="text-xs font-mono text-slate-300 mb-1">
                        {log}
                      </div>
                    ))}
                  </ScrollArea>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deploymentTargets.map((target) => (
              <Card key={target.id} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getPlatformIcon(target.type)}
                      <CardTitle className="text-sm text-white">{target.name}</CardTitle>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={
                        target.status === 'deployed' ? 'text-green-400 border-green-400' :
                        target.status === 'deploying' ? 'text-blue-400 border-blue-400' :
                        target.status === 'failed' ? 'text-red-400 border-red-400' :
                        'text-gray-400 border-gray-400'
                      }
                    >
                      {target.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {target.url && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">URL:</span>
                      <a 
                        href={target.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center"
                      >
                        Visit
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                  
                  {target.lastDeployed && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Last deployed:</span>
                      <span className="text-xs text-slate-300">
                        {new Date(target.lastDeployed).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" className="flex-1 border-slate-600">
                      Redeploy
                    </Button>
                    <Button size="sm" variant="outline" className="border-slate-600">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Deployment History</CardTitle>
              <CardDescription>Recent deployment activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deploymentOrchestrator.getDeploymentHistory().slice(0, 10).map((deployment) => (
                  <div key={deployment.id} className="flex items-center justify-between p-3 bg-slate-700 rounded">
                    <div className="flex items-center space-x-3">
                      {deployment.status === 'success' ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : deployment.status === 'failed' ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <GitBranch className="w-4 h-4 text-blue-500" />
                      )}
                      <div>
                        <span className="text-sm font-medium text-white">
                          {deploymentTargets.find(t => t.id === deployment.targetId)?.name || deployment.targetId}
                        </span>
                        <p className="text-xs text-slate-400">
                          {deployment.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant="outline" 
                        className={
                          deployment.status === 'success' ? 'text-green-400 border-green-400' :
                          deployment.status === 'failed' ? 'text-red-400 border-red-400' :
                          'text-blue-400 border-blue-400'
                        }
                      >
                        {deployment.status}
                      </Badge>
                      <p className="text-xs text-slate-400 mt-1">
                        {Math.round(deployment.duration / 1000)}s
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
