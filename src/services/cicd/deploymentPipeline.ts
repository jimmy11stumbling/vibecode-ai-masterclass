
import { PipelineConfigManager, PipelineConfig, DeploymentPipeline, PipelineStage } from './pipelineConfig';
import { PipelineStageExecutor } from './pipelineStages';

export type { PipelineStage, DeploymentPipeline, PipelineConfig };

export class DeploymentPipelineManager {
  private pipelines: Map<string, DeploymentPipeline> = new Map();
  private config: PipelineConfig = PipelineConfigManager.getDefaultConfig();

  async createPipeline(
    branch: string,
    environment: 'development' | 'staging' | 'production',
    triggeredBy: string,
    commitHash?: string
  ): Promise<string> {
    const pipelineId = `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pipeline: DeploymentPipeline = {
      id: pipelineId,
      name: `${environment} deployment`,
      branch,
      environment,
      stages: PipelineConfigManager.createStages(this.config),
      status: 'pending',
      triggeredBy,
      createdAt: new Date(),
      commitHash
    };

    this.pipelines.set(pipelineId, pipeline);
    
    console.log(`🚀 Created deployment pipeline: ${pipelineId}`);
    
    this.executePipeline(pipelineId);
    
    return pipelineId;
  }

  private async executePipeline(pipelineId: string): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return;

    pipeline.status = 'running';
    console.log(`⚡ Starting pipeline execution: ${pipelineId}`);

    try {
      for (const stage of pipeline.stages) {
        await this.executeStage(pipeline, stage);
        
        if (stage.status === 'failed') {
          pipeline.status = 'failed';
          break;
        }
      }

      if (pipeline.status !== 'failed') {
        pipeline.status = 'completed';
        pipeline.completedAt = new Date();
        console.log(`✅ Pipeline completed successfully: ${pipelineId}`);
      } else {
        console.log(`❌ Pipeline failed: ${pipelineId}`);
      }

    } catch (error) {
      pipeline.status = 'failed';
      console.error(`🚨 Pipeline execution error: ${pipelineId}`, error);
    }

    this.pipelines.set(pipelineId, pipeline);
  }

  private async executeStage(pipeline: DeploymentPipeline, stage: PipelineStage): Promise<void> {
    stage.status = 'running';
    stage.startTime = new Date();
    stage.logs.push(`Starting ${stage.name}...`);

    console.log(`🔄 Executing stage: ${stage.name}`);

    try {
      switch (stage.id) {
        case 'checkout':
          await PipelineStageExecutor.executeCheckout(stage, pipeline);
          break;
        case 'install':
          await PipelineStageExecutor.executeInstall(stage);
          break;
        case 'lint':
          await PipelineStageExecutor.executeLint(stage);
          break;
        case 'test':
          await PipelineStageExecutor.executeTests(stage);
          break;
        case 'security':
          await PipelineStageExecutor.executeSecurity(stage);
          break;
        case 'build':
          await PipelineStageExecutor.executeBuild(stage, pipeline);
          break;
        case 'deploy':
          await PipelineStageExecutor.executeDeploy(stage, pipeline, this.config.deploymentTargets);
          break;
        case 'performance':
          await PipelineStageExecutor.executePerformance(stage);
          break;
        case 'notify':
          await PipelineStageExecutor.executeNotifications(stage, this.config);
          break;
        default:
          throw new Error(`Unknown stage: ${stage.id}`);
      }

      stage.status = 'completed';
      stage.endTime = new Date();
      stage.duration = stage.endTime.getTime() - (stage.startTime?.getTime() || 0);
      stage.logs.push(`✅ ${stage.name} completed in ${stage.duration}ms`);

    } catch (error) {
      stage.status = 'failed';
      stage.endTime = new Date();
      stage.duration = stage.endTime.getTime() - (stage.startTime?.getTime() || 0);
      stage.logs.push(`❌ ${stage.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  getPipeline(pipelineId: string): DeploymentPipeline | undefined {
    return this.pipelines.get(pipelineId);
  }

  getAllPipelines(): DeploymentPipeline[] {
    return Array.from(this.pipelines.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  updateConfig(config: Partial<PipelineConfig>): void {
    this.config = PipelineConfigManager.updateConfig(this.config, config);
    console.log('📝 Pipeline configuration updated:', this.config);
  }

  getConfig(): PipelineConfig {
    return { ...this.config };
  }

  async cancelPipeline(pipelineId: string): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return;

    pipeline.status = 'failed';
    pipeline.completedAt = new Date();
    
    pipeline.stages.forEach(stage => {
      if (stage.status === 'running') {
        stage.status = 'failed';
        stage.logs.push('❌ Stage cancelled by user');
      }
    });

    console.log(`🛑 Pipeline cancelled: ${pipelineId}`);
  }
}

export const deploymentPipelineManager = new DeploymentPipelineManager();
