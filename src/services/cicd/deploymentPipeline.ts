
export interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  duration?: number;
  logs: string[];
  startTime?: Date;
  endTime?: Date;
}

export interface DeploymentPipeline {
  id: string;
  name: string;
  branch: string;
  environment: 'development' | 'staging' | 'production';
  stages: PipelineStage[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  triggeredBy: string;
  createdAt: Date;
  completedAt?: Date;
  commitHash?: string;
}

export interface PipelineConfig {
  enableTests: boolean;
  enableLinting: boolean;
  enableSecurity: boolean;
  enablePerformance: boolean;
  deploymentTargets: string[];
  notifications: {
    slack?: string;
    email?: string[];
  };
}

export class DeploymentPipelineManager {
  private pipelines: Map<string, DeploymentPipeline> = new Map();
  private config: PipelineConfig = {
    enableTests: true,
    enableLinting: true,
    enableSecurity: true,
    enablePerformance: true,
    deploymentTargets: ['vercel', 'netlify'],
    notifications: {}
  };

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
      stages: this.createStages(),
      status: 'pending',
      triggeredBy,
      createdAt: new Date(),
      commitHash
    };

    this.pipelines.set(pipelineId, pipeline);
    
    console.log(`🚀 Created deployment pipeline: ${pipelineId}`);
    
    // Start pipeline execution
    this.executePipeline(pipelineId);
    
    return pipelineId;
  }

  private createStages(): PipelineStage[] {
    const stages: PipelineStage[] = [
      {
        id: 'checkout',
        name: 'Checkout Code',
        status: 'pending',
        logs: []
      },
      {
        id: 'install',
        name: 'Install Dependencies',
        status: 'pending',
        logs: []
      }
    ];

    if (this.config.enableLinting) {
      stages.push({
        id: 'lint',
        name: 'Code Linting',
        status: 'pending',
        logs: []
      });
    }

    if (this.config.enableTests) {
      stages.push({
        id: 'test',
        name: 'Run Tests',
        status: 'pending',
        logs: []
      });
    }

    if (this.config.enableSecurity) {
      stages.push({
        id: 'security',
        name: 'Security Scan',
        status: 'pending',
        logs: []
      });
    }

    stages.push(
      {
        id: 'build',
        name: 'Build Application',
        status: 'pending',
        logs: []
      },
      {
        id: 'deploy',
        name: 'Deploy to Target',
        status: 'pending',
        logs: []
      }
    );

    if (this.config.enablePerformance) {
      stages.push({
        id: 'performance',
        name: 'Performance Tests',
        status: 'pending',
        logs: []
      });
    }

    stages.push({
      id: 'notify',
      name: 'Send Notifications',
      status: 'pending',
      logs: []
    });

    return stages;
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
          await this.executeCheckout(stage, pipeline);
          break;
        case 'install':
          await this.executeInstall(stage);
          break;
        case 'lint':
          await this.executeLint(stage);
          break;
        case 'test':
          await this.executeTests(stage);
          break;
        case 'security':
          await this.executeSecurity(stage);
          break;
        case 'build':
          await this.executeBuild(stage, pipeline);
          break;
        case 'deploy':
          await this.executeDeploy(stage, pipeline);
          break;
        case 'performance':
          await this.executePerformance(stage);
          break;
        case 'notify':
          await this.executeNotifications(stage, pipeline);
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

  private async executeCheckout(stage: PipelineStage, pipeline: DeploymentPipeline): Promise<void> {
    stage.logs.push(`Checking out branch: ${pipeline.branch}`);
    stage.logs.push(`Commit: ${pipeline.commitHash || 'latest'}`);
    await this.delay(1000);
    stage.logs.push('Code checkout completed');
  }

  private async executeInstall(stage: PipelineStage): Promise<void> {
    stage.logs.push('Installing npm dependencies...');
    await this.delay(3000);
    stage.logs.push('Dependencies installed successfully');
  }

  private async executeLint(stage: PipelineStage): Promise<void> {
    stage.logs.push('Running ESLint...');
    await this.delay(2000);
    
    // Simulate occasional linting failures
    if (Math.random() < 0.1) {
      throw new Error('Linting errors found');
    }
    
    stage.logs.push('Code linting passed');
  }

  private async executeTests(stage: PipelineStage): Promise<void> {
    stage.logs.push('Running test suite...');
    await this.delay(5000);
    
    // Simulate occasional test failures
    if (Math.random() < 0.05) {
      throw new Error('Test failures detected');
    }
    
    stage.logs.push('All tests passed');
  }

  private async executeSecurity(stage: PipelineStage): Promise<void> {
    stage.logs.push('Running security vulnerability scan...');
    await this.delay(3000);
    stage.logs.push('No security vulnerabilities found');
  }

  private async executeBuild(stage: PipelineStage, pipeline: DeploymentPipeline): Promise<void> {
    stage.logs.push(`Building for ${pipeline.environment} environment...`);
    await this.delay(4000);
    
    // Simulate occasional build failures
    if (Math.random() < 0.03) {
      throw new Error('Build compilation failed');
    }
    
    stage.logs.push('Build completed successfully');
    stage.logs.push('Build artifacts generated');
  }

  private async executeDeploy(stage: PipelineStage, pipeline: DeploymentPipeline): Promise<void> {
    for (const target of this.config.deploymentTargets) {
      stage.logs.push(`Deploying to ${target}...`);
      await this.delay(2000);
      
      // Simulate occasional deployment failures
      if (Math.random() < 0.02) {
        throw new Error(`Deployment to ${target} failed`);
      }
      
      const deploymentUrl = `https://${pipeline.id}.${target}.app`;
      stage.logs.push(`✅ Deployed to ${target}: ${deploymentUrl}`);
    }
  }

  private async executePerformance(stage: PipelineStage): Promise<void> {
    stage.logs.push('Running performance tests...');
    await this.delay(3000);
    stage.logs.push('Performance tests completed');
    stage.logs.push('Lighthouse score: 95/100');
  }

  private async executeNotifications(stage: PipelineStage, pipeline: DeploymentPipeline): Promise<void> {
    stage.logs.push('Sending deployment notifications...');
    
    if (this.config.notifications.slack) {
      stage.logs.push('Slack notification sent');
    }
    
    if (this.config.notifications.email?.length) {
      stage.logs.push(`Email notifications sent to ${this.config.notifications.email.length} recipients`);
    }
    
    await this.delay(500);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    this.config = { ...this.config, ...config };
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
    
    // Cancel any running stages
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
