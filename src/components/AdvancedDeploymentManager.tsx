
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Rocket, 
  Globe, 
  Server, 
  Database, 
  Shield, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ExternalLink,
  Copy,
  Download,
  Upload,
  Zap,
  Monitor,
  BarChart3,
  Users,
  Lock,
  Key,
  CloudLightning,
  Github,
  GitBranch
} from 'lucide-react';

interface DeploymentPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  type: 'static' | 'serverless' | 'container' | 'vps';
  pricing: string;
  features: string[];
  setupTime: string;
  difficulty: 'Easy' | 'Medium' | 'Advanced';
}

interface Deployment {
  id: string;
  name: string;
  platform: string;
  status: 'deploying' | 'live' | 'failed' | 'stopped';
  url: string;
  lastDeploy: Date;
  branch: string;
  environment: 'production' | 'staging' | 'development';
}

const platforms: DeploymentPlatform[] = [
  {
    id: 'vercel',
    name: 'Vercel',
    icon: Zap,
    type: 'static',
    pricing: 'Free tier available',
    features: ['Automatic deployments', 'CDN', 'SSL certificates', 'Analytics'],
    setupTime: '2 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'netlify',
    name: 'Netlify',
    icon: Globe,
    type: 'static',
    pricing: 'Free tier available',
    features: ['Git integration', 'Form handling', 'Functions', 'Split testing'],
    setupTime: '3 minutes',
    difficulty: 'Easy'
  },
  {
    id: 'railway',
    name: 'Railway',
    icon: Server,
    type: 'container',
    pricing: '$5/month',
    features: ['Database hosting', 'Auto scaling', 'GitHub integration', 'Metrics'],
    setupTime: '5 minutes',
    difficulty: 'Medium'
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    icon: CloudLightning,
    type: 'vps',
    pricing: '$4/month',
    features: ['Full control', 'Custom domains', 'SSH access', 'Load balancers'],
    setupTime: '15 minutes',
    difficulty: 'Advanced'
  }
];

const mockDeployments: Deployment[] = [
  {
    id: '1',
    name: 'my-react-app',
    platform: 'vercel',
    status: 'live',
    url: 'https://my-react-app.vercel.app',
    lastDeploy: new Date('2024-01-15T10:30:00'),
    branch: 'main',
    environment: 'production'
  },
  {
    id: '2',
    name: 'staging-app',
    platform: 'netlify',
    status: 'deploying',
    url: 'https://staging-app.netlify.app',
    lastDeploy: new Date('2024-01-15T11:00:00'),
    branch: 'develop',
    environment: 'staging'
  }
];

export const AdvancedDeploymentManager: React.FC = () => {
  const [deployments, setDeployments] = useState<Deployment[]>(mockDeployments);
  const [selectedPlatform, setSelectedPlatform] = useState<DeploymentPlatform | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState({
    appName: '',
    environment: 'production',
    branch: 'main',
    buildCommand: 'npm run build',
    outputDir: 'dist',
    envVars: {}
  });

  const getStatusColor = (status: Deployment['status']) => {
    switch (status) {
      case 'live': return 'text-green-500 bg-green-500/10';
      case 'deploying': return 'text-yellow-500 bg-yellow-500/10';
      case 'failed': return 'text-red-500 bg-red-500/10';
      case 'stopped': return 'text-gray-500 bg-gray-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getStatusIcon = (status: Deployment['status']) => {
    switch (status) {
      case 'live': return CheckCircle;
      case 'deploying': return Clock;
      case 'failed': return AlertTriangle;
      case 'stopped': return Monitor;
      default: return Monitor;
    }
  };

  const handleDeploy = async () => {
    if (!selectedPlatform) return;
    
    setIsDeploying(true);
    
    // Simulate deployment process
    const newDeployment: Deployment = {
      id: Date.now().toString(),
      name: deploymentConfig.appName,
      platform: selectedPlatform.id,
      status: 'deploying',
      url: `https://${deploymentConfig.appName}.${selectedPlatform.id === 'vercel' ? 'vercel.app' : 'netlify.app'}`,
      lastDeploy: new Date(),
      branch: deploymentConfig.branch,
      environment: deploymentConfig.environment as any
    };
    
    setDeployments(prev => [...prev, newDeployment]);
    
    // Simulate deployment completion
    setTimeout(() => {
      setDeployments(prev => prev.map(d => 
        d.id === newDeployment.id 
          ? { ...d, status: 'live' as const }
          : d
      ));
      setIsDeploying(false);
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full bg-slate-900 text-white">
      <Tabs defaultValue="deployments" className="h-full flex flex-col">
        <div className="border-b border-slate-700 px-4 py-2">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="deployments" className="data-[state=active]:bg-slate-700">
              <Rocket className="w-4 h-4 mr-2" />
              Deployments
            </TabsTrigger>
            <TabsTrigger value="platforms" className="data-[state=active]:bg-slate-700">
              <Server className="w-4 h-4 mr-2" />
              Platforms
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-slate-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="deployments" className="h-full m-0">
            <div className="h-full flex">
              {/* Deployments List */}
              <div className="w-1/2 border-r border-slate-700">
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Active Deployments</h3>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Rocket className="w-4 h-4 mr-1" />
                      New Deployment
                    </Button>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-3">
                    {deployments.map((deployment) => {
                      const StatusIcon = getStatusIcon(deployment.status);
                      return (
                        <Card key={deployment.id} className="bg-slate-800 border-slate-700">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <CardTitle className="text-white text-base">{deployment.name}</CardTitle>
                                <CardDescription className="text-slate-400">
                                  {deployment.platform} • {deployment.environment}
                                </CardDescription>
                              </div>
                              <Badge className={getStatusColor(deployment.status)}>
                                <StatusIcon className="w-3 h-3 mr-1" />
                                {deployment.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">URL:</span>
                                <div className="flex items-center space-x-2">
                                  <span className="text-blue-400 truncate max-w-48">{deployment.url}</span>
                                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(deployment.url)}>
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => window.open(deployment.url, '_blank')}>
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Branch:</span>
                                <div className="flex items-center space-x-1">
                                  <GitBranch className="w-3 h-3 text-slate-400" />
                                  <span className="text-slate-300">{deployment.branch}</span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">Last Deploy:</span>
                                <span className="text-slate-300">{deployment.lastDeploy.toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2 mt-4">
                              <Button size="sm" variant="outline" className="flex-1">
                                <Upload className="w-3 h-3 mr-1" />
                                Redeploy
                              </Button>
                              <Button size="sm" variant="outline">
                                <Monitor className="w-3 h-3 mr-1" />
                                Logs
                              </Button>
                              <Button size="sm" variant="outline">
                                <Settings className="w-3 h-3" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Deployment Form */}
              <div className="w-1/2">
                <div className="p-4 border-b border-slate-700">
                  <h3 className="text-lg font-semibold">Deploy New Project</h3>
                  <p className="text-slate-400 text-sm">Configure and deploy your application</p>
                </div>
                
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    <div>
                      <Label htmlFor="appName">Application Name</Label>
                      <Input
                        id="appName"
                        value={deploymentConfig.appName}
                        onChange={(e) => setDeploymentConfig(prev => ({ ...prev, appName: e.target.value }))}
                        placeholder="my-awesome-app"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="environment">Environment</Label>
                      <select
                        id="environment"
                        value={deploymentConfig.environment}
                        onChange={(e) => setDeploymentConfig(prev => ({ ...prev, environment: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white"
                      >
                        <option value="production">Production</option>
                        <option value="staging">Staging</option>
                        <option value="development">Development</option>
                      </select>
                    </div>
                    
                    <div>
                      <Label htmlFor="branch">Git Branch</Label>
                      <Input
                        id="branch"
                        value={deploymentConfig.branch}
                        onChange={(e) => setDeploymentConfig(prev => ({ ...prev, branch: e.target.value }))}
                        placeholder="main"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="buildCommand">Build Command</Label>
                      <Input
                        id="buildCommand"
                        value={deploymentConfig.buildCommand}
                        onChange={(e) => setDeploymentConfig(prev => ({ ...prev, buildCommand: e.target.value }))}
                        placeholder="npm run build"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="outputDir">Output Directory</Label>
                      <Input
                        id="outputDir"
                        value={deploymentConfig.outputDir}
                        onChange={(e) => setDeploymentConfig(prev => ({ ...prev, outputDir: e.target.value }))}
                        placeholder="dist"
                        className="bg-slate-800 border-slate-600"
                      />
                    </div>
                    
                    <div>
                      <Label>Platform</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {platforms.map((platform) => {
                          const IconComponent = platform.icon;
                          return (
                            <Button
                              key={platform.id}
                              variant={selectedPlatform?.id === platform.id ? "default" : "outline"}
                              className="flex items-center space-x-2 p-3 h-auto"
                              onClick={() => setSelectedPlatform(platform)}
                            >
                              <IconComponent className="w-4 h-4" />
                              <span>{platform.name}</span>
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleDeploy} 
                      disabled={!selectedPlatform || !deploymentConfig.appName || isDeploying}
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
                          Deploy Application
                        </>
                      )}
                    </Button>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Deployment Platforms</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {platforms.map((platform) => {
                    const IconComponent = platform.icon;
                    return (
                      <Card key={platform.id} className="bg-slate-800 border-slate-700">
                        <CardHeader>
                          <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-600/20 rounded-lg">
                              <IconComponent className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                              <CardTitle className="text-white">{platform.name}</CardTitle>
                              <CardDescription className="text-slate-400">{platform.type}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 text-sm">Pricing:</span>
                              <span className="text-green-400 text-sm">{platform.pricing}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 text-sm">Setup Time:</span>
                              <span className="text-slate-300 text-sm">{platform.setupTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-slate-400 text-sm">Difficulty:</span>
                              <Badge variant="outline" className={`text-xs ${
                                platform.difficulty === 'Easy' ? 'text-green-400 border-green-400' :
                                platform.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-400' :
                                'text-red-400 border-red-400'
                              }`}>
                                {platform.difficulty}
                              </Badge>
                            </div>
                            <div>
                              <span className="text-slate-400 text-sm block mb-2">Features:</span>
                              <div className="space-y-1">
                                {platform.features.map((feature, index) => (
                                  <div key={index} className="flex items-center text-sm text-slate-300">
                                    <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <Button className="w-full mt-4" variant="outline">
                              Connect {platform.name}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="settings" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Deployment Settings</h3>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Github className="w-5 h-5 mr-2" />
                        Git Integration
                      </CardTitle>
                      <CardDescription>Connect your Git repositories for automatic deployments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button variant="outline" className="w-full">
                        Connect GitHub
                      </Button>
                      <Button variant="outline" className="w-full">
                        Connect GitLab
                      </Button>
                      <Button variant="outline" className="w-full">
                        Connect Bitbucket
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Key className="w-5 h-5 mr-2" />
                      Environment Variables
                    </CardTitle>
                    <CardDescription>Manage environment variables for your deployments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <Input placeholder="Variable name" className="bg-slate-700 border-slate-600" />
                        <Input placeholder="Value" className="bg-slate-700 border-slate-600" />
                        <Button size="sm">Add</Button>
                      </div>
                      <div className="text-xs text-slate-400">
                        Add environment variables that will be available during build and runtime
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Shield className="w-5 h-5 mr-2" />
                      Security Settings
                    </CardTitle>
                    <CardDescription>Configure security and access controls</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Auto-deploy on push</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Password protection</span>
                      <input type="checkbox" className="toggle" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">SSL certificates</span>
                      <input type="checkbox" className="toggle" defaultChecked />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="analytics" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-4">Deployment Analytics</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Total Deployments</p>
                          <p className="text-2xl font-bold text-white">127</p>
                        </div>
                        <Rocket className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Success Rate</p>
                          <p className="text-2xl font-bold text-green-400">98.4%</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-slate-800 border-slate-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-sm">Avg. Build Time</p>
                          <p className="text-2xl font-bold text-yellow-400">2.3m</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="bg-slate-800 border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <div>
                            <p className="text-white text-sm">my-react-app deployed to production</p>
                            <p className="text-slate-400 text-xs">2 minutes ago</p>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">Success</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-yellow-400 animate-spin" />
                          <div>
                            <p className="text-white text-sm">staging-app building...</p>
                            <p className="text-slate-400 text-xs">5 minutes ago</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500/20 text-yellow-400">Building</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                          <div>
                            <p className="text-white text-sm">test-app deployment failed</p>
                            <p className="text-slate-400 text-xs">1 hour ago</p>
                          </div>
                        </div>
                        <Badge className="bg-red-500/20 text-red-400">Failed</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
