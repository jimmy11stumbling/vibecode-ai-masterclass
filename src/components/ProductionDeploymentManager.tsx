import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { VirtualizedList } from '@/components/VirtualizedList';
import { deploymentPipelineManager, DeploymentPipeline, PipelineStage } from '@/services/cicd/deploymentPipeline';
import { deploymentOrchestrator } from '@/services/deploymentOrchestrator';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
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
  Container,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const ProductionDeploymentManager: React.FC = () => {
  const [pipelines, setPipelines] = useState<DeploymentPipeline[]>([]);
  const [selectedPipeline, setSelectedPipeline] = useState<DeploymentPipeline | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [activeTab, setActiveTab] = useState('pipelines');
  const { measureRenderTime, measureMemoryUsage } = usePerformanceOptimization();
  const { toast } = useToast();

  useEffect(() => {
    const endMeasure = measureRenderTime('ProductionDeploymentManager');
    measureMemoryUsage();
    
    loadPipelines();
    
    // Poll for pipeline updates
    const interval = setInterval(loadPipelines, 5000);
    
    return () => {
      endMeasure();
      clearInterval(interval);
    };
  }, [measureRenderTime, measureMemoryUsage]);

  const loadPipelines = () => {
    const allPipelines = deploymentPipelineManager.getAllPipelines();
    setPipelines(allPipelines);
  };

  const createNewPipeline = async (environment: 'development' | 'staging' | 'production') => {
    setIsDeploying(true);
    
    try {
      const pipelineId = await deploymentPipelineManager.createPipeline(
        'main',
        environment,
        'user',
        'latest'
      );
      
      toast({
        title: "Pipeline Created",
        description: `${environment} deployment pipeline started`,
      });
      
      loadPipelines();
      
    } catch (error) {
      toast({
        title: "Pipeline Creation Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const getStageIcon = (stage: PipelineStage) => {
    switch (stage.status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'running': return <Clock className="w-4 h-4 text-blue-400 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 border-green-400';
      case 'failed': return 'text-red-400 border-red-400';
      case 'running': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <ErrorBoundary>
      <div className="h-full bg-slate-900 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Rocket className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Production Deployment Manager</h2>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={() => createNewPipeline('development')}
              disabled={isDeploying}
              variant="outline"
            >
              Deploy Dev
            </Button>
            <Button
              onClick={() => createNewPipeline('staging')}
              disabled={isDeploying}
              variant="outline"
            >
              Deploy Staging
            </Button>
            <Button
              onClick={() => createNewPipeline('production')}
              disabled={isDeploying}
              className="bg-green-600 hover:bg-green-700"
            >
              {isDeploying ? (
                <Clock className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4 mr-2" />
              )}
              Deploy Production
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800">
            <TabsTrigger value="pipelines">Pipelines</TabsTrigger>
            <TabsTrigger value="stages">Stages</TabsTrigger>
            <TabsTrigger value="environments">Environments</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="pipelines" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pipelines List */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Recent Pipelines</CardTitle>
                  <CardDescription>CI/CD pipeline execution history</CardDescription>
                </CardHeader>
                <CardContent>
                  <VirtualizedList
                    items={pipelines}
                    itemHeight={80}
                    containerHeight={400}
                    renderItem={(pipeline, index) => (
                      <div
                        key={pipeline.id}
                        className={`p-3 border border-slate-700 rounded-lg cursor-pointer transition-all ${
                          selectedPipeline?.id === pipeline.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedPipeline(pipeline)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <GitBranch className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-medium">{pipeline.name}</span>
                          </div>
                          <Badge variant="outline" className={getStatusColor(pipeline.status)}>
                            {pipeline.status}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-slate-400">
                          <span>{pipeline.branch} • {pipeline.environment}</span>
                          <span>{pipeline.createdAt.toLocaleTimeString()}</span>
                        </div>
                      </div>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Pipeline Details */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Pipeline Details</CardTitle>
                  <CardDescription>
                    {selectedPipeline ? `Pipeline: ${selectedPipeline.name}` : 'Select a pipeline to view details'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedPipeline ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Environment:</span>
                          <Badge className="ml-2 capitalize">{selectedPipeline.environment}</Badge>
                        </div>
                        <div>
                          <span className="text-slate-400">Branch:</span>
                          <span className="ml-2 text-white">{selectedPipeline.branch}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Triggered by:</span>
                          <span className="ml-2 text-white">{selectedPipeline.triggeredBy}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Status:</span>
                          <Badge variant="outline" className={`ml-2 ${getStatusColor(selectedPipeline.status)}`}>
                            {selectedPipeline.status}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-white font-medium">Stages Progress</h4>
                        {selectedPipeline.stages.map((stage, index) => (
                          <div key={stage.id} className="flex items-center space-x-3 p-2 bg-slate-700 rounded">
                            {getStageIcon(stage)}
                            <span className="text-white flex-1">{stage.name}</span>
                            {stage.duration && (
                              <span className="text-slate-400 text-sm">{stage.duration}ms</span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex space-x-2 pt-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deploymentPipelineManager.cancelPipeline(selectedPipeline.id)}
                          disabled={selectedPipeline.status === 'completed'}
                        >
                          <Square className="w-4 h-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a pipeline to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="stages" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pipeline Stages</CardTitle>
                <CardDescription>Detailed view of each stage in the deployment process</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedPipeline ? (
                  <ScrollArea className="h-[450px]">
                    <div className="space-y-4">
                      {selectedPipeline.stages.map((stage) => (
                        <div key={stage.id} className="p-4 bg-slate-700 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getStageIcon(stage)}
                              <h4 className="text-white font-medium">{stage.name}</h4>
                            </div>
                            <Badge variant="outline" className={getStatusColor(stage.status)}>
                              {stage.status}
                            </Badge>
                          </div>
                          <p className="text-slate-400 text-sm">
                            {stage.startTime ? stage.startTime.toLocaleString() : 'Pending'}
                          </p>
                          <div className="mt-2 space-y-1">
                            {stage.logs.map((log, index) => (
                              <p key={index} className="text-xs text-slate-300 font-mono">
                                {log}
                              </p>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center text-slate-400 py-8">
                    <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a pipeline to view stage details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="environments" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Deployment Environments</CardTitle>
                <CardDescription>Manage and monitor your deployment environments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {['development', 'staging', 'production'].map((env) => (
                    <div key={env} className="p-4 bg-slate-700 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium capitalize">{env}</h4>
                        <Badge variant="outline" className="text-green-400 border-green-400">
                          Active
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm">
                        Last deployed: {new Date().toLocaleTimeString()}
                      </p>
                      <div className="flex space-x-2 pt-4">
                        <Button size="sm" variant="outline">
                          <Play className="w-4 h-4 mr-1" />
                          Deploy
                        </Button>
                        <Button size="sm" variant="outline">
                          <Pause className="w-4 h-4 mr-1" />
                          Pause
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="mt-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Pipeline Configuration</CardTitle>
                <CardDescription>Customize your deployment pipeline settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Enable Tests</span>
                    <Button size="sm" variant="outline">
                      Toggle
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Enable Linting</span>
                    <Button size="sm" variant="outline">
                      Toggle
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white">Deployment Targets</span>
                    <Button size="sm" variant="outline">
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
};
