
import { supabase } from '@/integrations/supabase/client';

export interface ModelConfiguration {
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  frequencyPenalty: number;
  presencePenalty: number;
  stopSequences?: string[];
  systemPrompt?: string;
}

export interface OptimizationMetrics {
  responseTime: number;
  tokenUsage: number;
  qualityScore: number;
  coherenceScore: number;
  relevanceScore: number;
  timestamp: Date;
}

export interface ModelProfile {
  id: string;
  name: string;
  description: string;
  configuration: ModelConfiguration;
  metrics: OptimizationMetrics[];
  isOptimized: boolean;
  optimizationHistory: any[];
}

export class DeepSeekModelOptimizer {
  private apiKey: string = '';
  private profiles: Map<string, ModelProfile> = new Map();
  private currentProfile: string = 'default';

  constructor() {
    this.initializeDefaultProfiles();
    this.loadApiKey();
  }

  private async loadApiKey() {
    try {
      const { data } = await supabase.functions.invoke('get-deepseek-key');
      if (data?.key) {
        this.apiKey = data.key;
        console.log('🔑 DeepSeek Model Optimizer: API key loaded');
      }
    } catch (error) {
      console.error('Failed to load DeepSeek API key:', error);
    }
  }

  private initializeDefaultProfiles() {
    // Default balanced profile
    this.profiles.set('default', {
      id: 'default',
      name: 'Balanced Reasoning',
      description: 'Optimal balance between speed and quality',
      configuration: {
        model: 'deepseek-reasoner',
        temperature: 0.3,
        maxTokens: 4000,
        topP: 0.9,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        systemPrompt: 'You are an expert AI assistant with advanced reasoning capabilities.'
      },
      metrics: [],
      isOptimized: false,
      optimizationHistory: []
    });

    // Creative profile
    this.profiles.set('creative', {
      id: 'creative',
      name: 'Creative Generation',
      description: 'Higher creativity for content generation',
      configuration: {
        model: 'deepseek-reasoner',
        temperature: 0.7,
        maxTokens: 6000,
        topP: 0.95,
        frequencyPenalty: 0.3,
        presencePenalty: 0.3,
        systemPrompt: 'You are a creative AI assistant capable of generating innovative and original content.'
      },
      metrics: [],
      isOptimized: false,
      optimizationHistory: []
    });

    // Precision profile
    this.profiles.set('precision', {
      id: 'precision',
      name: 'Precision Mode',
      description: 'Maximum accuracy and consistency',
      configuration: {
        model: 'deepseek-reasoner',
        temperature: 0.1,
        maxTokens: 3000,
        topP: 0.8,
        frequencyPenalty: 0.0,
        presencePenalty: 0.0,
        systemPrompt: 'You are a precise AI assistant focused on accuracy and factual correctness.'
      },
      metrics: [],
      isOptimized: false,
      optimizationHistory: []
    });

    // Code-focused profile
    this.profiles.set('code', {
      id: 'code',
      name: 'Code Generation',
      description: 'Optimized for code generation and technical tasks',
      configuration: {
        model: 'deepseek-reasoner',
        temperature: 0.2,
        maxTokens: 8000,
        topP: 0.85,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1,
        systemPrompt: 'You are an expert software engineer and code generator. Focus on writing clean, efficient, and well-documented code.'
      },
      metrics: [],
      isOptimized: false,
      optimizationHistory: []
    });
  }

  async optimizeModel(profileId: string, testPrompts: string[]): Promise<ModelConfiguration> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    console.log(`🔧 Starting optimization for profile: ${profile.name}`);

    // Test different configurations
    const configVariations = this.generateConfigurationVariations(profile.configuration);
    const results: Array<{ config: ModelConfiguration; metrics: OptimizationMetrics }> = [];

    for (const config of configVariations) {
      console.log(`Testing configuration: temp=${config.temperature}, tokens=${config.maxTokens}`);
      
      const metrics = await this.testConfiguration(config, testPrompts);
      results.push({ config, metrics });
    }

    // Find the best configuration based on weighted score
    const bestResult = this.selectBestConfiguration(results);
    
    // Update the profile with optimized configuration
    profile.configuration = bestResult.config;
    profile.isOptimized = true;
    profile.optimizationHistory.push({
      timestamp: new Date(),
      previousConfig: profile.configuration,
      newConfig: bestResult.config,
      metrics: bestResult.metrics
    });

    console.log(`✅ Optimization complete for ${profile.name}`);
    
    return bestResult.config;
  }

  private generateConfigurationVariations(baseConfig: ModelConfiguration): ModelConfiguration[] {
    const variations: ModelConfiguration[] = [];
    
    // Temperature variations
    const temperatures = [0.1, 0.3, 0.5, 0.7];
    const topPs = [0.8, 0.9, 0.95];
    const maxTokensOptions = [2000, 4000, 6000];

    for (const temp of temperatures) {
      for (const topP of topPs) {
        for (const maxTokens of maxTokensOptions) {
          variations.push({
            ...baseConfig,
            temperature: temp,
            topP: topP,
            maxTokens: maxTokens
          });
        }
      }
    }

    return variations.slice(0, 10); // Limit to 10 variations for efficiency
  }

  private async testConfiguration(
    config: ModelConfiguration, 
    testPrompts: string[]
  ): Promise<OptimizationMetrics> {
    const startTime = Date.now();
    let totalTokens = 0;
    let qualityScores: number[] = [];

    for (const prompt of testPrompts.slice(0, 3)) { // Test with first 3 prompts
      try {
        const response = await this.makeAPICall(config, prompt);
        
        // Calculate quality metrics
        const quality = this.assessResponseQuality(response, prompt);
        qualityScores.push(quality);
        
        // Estimate token usage (rough calculation)
        totalTokens += (prompt.length + response.length) / 4; // Approximate tokens
        
      } catch (error) {
        console.error('Configuration test failed:', error);
        qualityScores.push(0); // Failed test
      }
    }

    const endTime = Date.now();
    const avgQuality = qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length;

    return {
      responseTime: endTime - startTime,
      tokenUsage: totalTokens,
      qualityScore: avgQuality,
      coherenceScore: avgQuality * 0.9, // Simplified calculation
      relevanceScore: avgQuality * 0.95, // Simplified calculation
      timestamp: new Date()
    };
  }

  private async makeAPICall(config: ModelConfiguration, prompt: string): Promise<string> {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private assessResponseQuality(response: string, prompt: string): number {
    // Simple quality assessment - in a real implementation, this would be more sophisticated
    let score = 0.5; // Base score

    // Length appropriateness
    if (response.length > 50 && response.length < 2000) {
      score += 0.1;
    }

    // Contains structured information
    if (response.includes('\n') || response.includes('•') || response.includes('-')) {
      score += 0.1;
    }

    // Relevance check (simplified)
    const promptWords = prompt.toLowerCase().split(' ');
    const responseWords = response.toLowerCase().split(' ');
    const overlap = promptWords.filter(word => responseWords.includes(word)).length;
    score += Math.min(overlap / promptWords.length, 0.3);

    return Math.min(score, 1.0);
  }

  private selectBestConfiguration(
    results: Array<{ config: ModelConfiguration; metrics: OptimizationMetrics }>
  ): { config: ModelConfiguration; metrics: OptimizationMetrics } {
    // Weight different factors
    const weights = {
      quality: 0.4,
      speed: 0.3,
      efficiency: 0.3
    };

    let bestScore = -1;
    let bestResult = results[0];

    for (const result of results) {
      const { metrics } = result;
      
      // Normalize metrics (0-1 scale)
      const qualityNorm = metrics.qualityScore;
      const speedNorm = Math.max(0, 1 - (metrics.responseTime / 30000)); // 30s max
      const efficiencyNorm = Math.max(0, 1 - (metrics.tokenUsage / 10000)); // 10k tokens max

      const score = (qualityNorm * weights.quality) + 
                   (speedNorm * weights.speed) + 
                   (efficiencyNorm * weights.efficiency);

      if (score > bestScore) {
        bestScore = score;
        bestResult = result;
      }
    }

    return bestResult;
  }

  getCurrentProfile(): ModelProfile | undefined {
    return this.profiles.get(this.currentProfile);
  }

  setCurrentProfile(profileId: string): void {
    if (this.profiles.has(profileId)) {
      this.currentProfile = profileId;
      console.log(`🔄 Switched to profile: ${profileId}`);
    } else {
      throw new Error(`Profile ${profileId} not found`);
    }
  }

  getAllProfiles(): ModelProfile[] {
    return Array.from(this.profiles.values());
  }

  createCustomProfile(profile: Omit<ModelProfile, 'metrics' | 'isOptimized' | 'optimizationHistory'>): void {
    const fullProfile: ModelProfile = {
      ...profile,
      metrics: [],
      isOptimized: false,
      optimizationHistory: []
    };
    
    this.profiles.set(profile.id, fullProfile);
    console.log(`📝 Created custom profile: ${profile.name}`);
  }

  async benchmarkProfile(profileId: string): Promise<OptimizationMetrics> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const testPrompts = [
      "Explain quantum computing in simple terms",
      "Write a React component for a todo list",
      "Analyze the causes of climate change",
      "Create a business plan for a startup",
      "Solve this math problem: What is the derivative of x^3 + 2x^2 - 5x + 1?"
    ];

    console.log(`📊 Benchmarking profile: ${profile.name}`);
    const metrics = await this.testConfiguration(profile.configuration, testPrompts);
    
    profile.metrics.push(metrics);
    console.log(`✅ Benchmark complete for ${profile.name}`);
    
    return metrics;
  }

  getOptimizationRecommendations(profileId: string): string[] {
    const profile = this.profiles.get(profileId);
    if (!profile || profile.metrics.length === 0) {
      return ['Run a benchmark first to get recommendations'];
    }

    const recommendations: string[] = [];
    const latestMetrics = profile.metrics[profile.metrics.length - 1];

    if (latestMetrics.responseTime > 10000) {
      recommendations.push('Consider reducing max_tokens or temperature for faster responses');
    }

    if (latestMetrics.qualityScore < 0.7) {
      recommendations.push('Try increasing temperature or top_p for better quality');
    }

    if (latestMetrics.tokenUsage > 8000) {
      recommendations.push('Reduce max_tokens to improve cost efficiency');
    }

    if (recommendations.length === 0) {
      recommendations.push('Profile is well-optimized for current use case');
    }

    return recommendations;
  }
}

export const deepSeekModelOptimizer = new DeepSeekModelOptimizer();
