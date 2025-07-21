
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

export class PipelineConfigManager {
  private static defaultConfig: PipelineConfig = {
    enableTests: true,
    enableLinting: true,
    enableSecurity: true,
    enablePerformance: true,
    deploymentTargets: ['vercel', 'netlify'],
    notifications: {}
  };

  static createStages(config: PipelineConfig): PipelineStage[] {
    const stages: PipelineStage[] = [
      { id: 'checkout', name: 'Checkout Code', status: 'pending', logs: [] },
      { id: 'install', name: 'Install Dependencies', status: 'pending', logs: [] }
    ];

    if (config.enableLinting) {
      stages.push({ id: 'lint', name: 'Code Linting', status: 'pending', logs: [] });
    }

    if (config.enableTests) {
      stages.push({ id: 'test', name: 'Run Tests', status: 'pending', logs: [] });
    }

    if (config.enableSecurity) {
      stages.push({ id: 'security', name: 'Security Scan', status: 'pending', logs: [] });
    }

    stages.push(
      { id: 'build', name: 'Build Application', status: 'pending', logs: [] },
      { id: 'deploy', name: 'Deploy to Target', status: 'pending', logs: [] }
    );

    if (config.enablePerformance) {
      stages.push({ id: 'performance', name: 'Performance Tests', status: 'pending', logs: [] });
    }

    stages.push({ id: 'notify', name: 'Send Notifications', status: 'pending', logs: [] });

    return stages;
  }

  static getDefaultConfig(): PipelineConfig {
    return { ...this.defaultConfig };
  }

  static updateConfig(current: PipelineConfig, updates: Partial<PipelineConfig>): PipelineConfig {
    return { ...current, ...updates };
  }
}
