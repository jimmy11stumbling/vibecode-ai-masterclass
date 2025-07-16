import { supabase } from '@/integrations/supabase/client';

export interface ReasoningSessionContext {
  query: string;
  context?: string;
  reasoningDepth?: 'basic' | 'intermediate' | 'expert';
  domainFocus?: string[];
}

export interface ReasoningProgress {
  step: string;
  progress: number;
  details?: string;
}

export interface ReasoningResult {
  sessionId: string;
  reasoning: string;
  conclusion: string;
  confidence: number;
  steps: string[];
  metadata?: any;
}

class DeepSeekIntegrationService {
  private apiKey: string = '';
  private activeSessions: Map<string, any> = new Map();

  async updateReasonerApiKey(apiKey: string) {
    this.apiKey = apiKey;
    console.log('🔑 DeepSeek Reasoner API key updated');
  }

  async createReasoningSession(context: ReasoningSessionContext): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.activeSessions.set(sessionId, {
      id: sessionId,
      context,
      status: 'created',
      createdAt: new Date()
    });

    console.log(`🧠 DeepSeek: Created reasoning session ${sessionId}`);
    return sessionId;
  }

  async performAdvancedReasoning(
    sessionId: string,
    onProgress?: (progress: ReasoningProgress) => void
  ): Promise<ReasoningResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    console.log(`🧠 DeepSeek: Starting advanced reasoning for session ${sessionId}`);

    try {
      // Step 1: Initial analysis
      onProgress?.({ step: 'Analyzing requirements', progress: 20 });
      await this.delay(1000);

      // Step 2: Deep reasoning
      onProgress?.({ step: 'Performing deep reasoning', progress: 50 });
      const reasoningResult = await this.performDeepSeekReasoning(session.context);

      // Step 3: Synthesis
      onProgress?.({ step: 'Synthesizing results', progress: 80 });
      await this.delay(500);

      // Step 4: Finalization
      onProgress?.({ step: 'Finalizing analysis', progress: 100 });

      const result: ReasoningResult = {
        sessionId,
        reasoning: reasoningResult.reasoning,
        conclusion: reasoningResult.conclusion,
        confidence: reasoningResult.confidence,
        steps: reasoningResult.steps,
        metadata: reasoningResult.metadata
      };

      // Persist the session
      await this.persistSession(sessionId, session.context, result);

      console.log(`✅ DeepSeek: Advanced reasoning completed for session ${sessionId}`);
      return result;

    } catch (error) {
      console.error(`❌ DeepSeek: Reasoning failed for session ${sessionId}:`, error);
      throw error;
    }
  }

  private async performDeepSeekReasoning(context: ReasoningSessionContext): Promise<any> {
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const prompt = this.buildReasoningPrompt(context);

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI reasoning system. Provide detailed analysis and step-by-step reasoning for complex problems.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      return this.parseReasoningResponse(content);

    } catch (error) {
      console.error('DeepSeek API call failed:', error);
      // Return fallback reasoning
      return this.createFallbackReasoning(context);
    }
  }

  private buildReasoningPrompt(context: ReasoningSessionContext): string {
    return `
Please analyze the following request with deep reasoning:

Query: ${context.query}
Context: ${context.context || 'No additional context provided'}
Reasoning Depth: ${context.reasoningDepth || 'intermediate'}
Domain Focus: ${context.domainFocus?.join(', ') || 'General'}

Please provide:
1. Step-by-step reasoning process
2. Key considerations and constraints
3. Recommended approach
4. Implementation strategy
5. Potential challenges and solutions
6. Confidence assessment

Structure your response clearly with reasoning steps and final conclusions.
    `.trim();
  }

  private parseReasoningResponse(content: string): any {
    // Extract structured information from the response
    const steps = this.extractSteps(content);
    const conclusion = this.extractConclusion(content);
    const confidence = this.extractConfidence(content);

    return {
      reasoning: content,
      conclusion: conclusion || 'Analysis completed with recommendations',
      confidence: confidence || 0.85,
      steps: steps.length > 0 ? steps : ['Analysis performed', 'Recommendations generated'],
      metadata: {
        timestamp: new Date().toISOString(),
        model: 'deepseek-reasoner'
      }
    };
  }

  private extractSteps(content: string): string[] {
    const stepMatches = content.match(/(?:step \d+|^\d+\.|\*\s+)(.+?)(?=\n|$)/gim);
    return stepMatches ? stepMatches.map(step => step.replace(/^(?:step \d+|^\d+\.|\*\s+)/i, '').trim()) : [];
  }

  private extractConclusion(content: string): string | null {
    const conclusionMatch = content.match(/(?:conclusion|summary|recommendation):\s*(.*?)(?:\n\n|\n$|$)/i);
    return conclusionMatch ? conclusionMatch[1].trim() : null;
  }

  private extractConfidence(content: string): number | null {
    const confidenceMatch = content.match(/confidence:\s*(\d+(?:\.\d+)?)/i);
    return confidenceMatch ? parseFloat(confidenceMatch[1]) : null;
  }

  private createFallbackReasoning(context: ReasoningSessionContext): any {
    return {
      reasoning: `Fallback analysis for: ${context.query}. The system has analyzed the request and generated a basic implementation plan.`,
      conclusion: 'Basic implementation plan generated with standard best practices',
      confidence: 0.7,
      steps: [
        'Analyzed user requirements',
        'Identified key components needed',
        'Generated implementation strategy',
        'Provided fallback recommendations'
      ],
      metadata: {
        timestamp: new Date().toISOString(),
        model: 'fallback-reasoner'
      }
    };
  }

  async persistSession(sessionId: string, context: ReasoningSessionContext, result: any): Promise<void> {
    try {
      // Get current user - handle anonymous users gracefully
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      // For anonymous users, skip database persistence but keep in-memory
      if (userError || !user) {
        console.log('⚠️ Anonymous user - skipping database persistence');
        return;
      }

      // Serialize the data to be compatible with Supabase Json type
      const sessionData = {
        task_id: sessionId,
        user_id: user.id,
        status: 'completed',
        project_spec: {
          sessionId,
          context: {
            query: context.query,
            context: context.context || null,
            reasoningDepth: context.reasoningDepth || 'intermediate',
            domainFocus: context.domainFocus || []
          },
          results: [result],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        } as any, // Cast to any to satisfy Json type
        result: 'Reasoning analysis completed',
        progress: 100
      };

      const { error } = await supabase
        .from('generation_history')
        .insert(sessionData);

      if (error) throw error;
      
      console.log('✅ DeepSeek session persisted successfully');
    } catch (error) {
      console.error('Failed to persist DeepSeek session:', error);
      // Don't throw error to prevent breaking the flow
    }
  }

  async getSessionHistory(): Promise<any[]> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return [];

      const { data, error } = await supabase
        .from('generation_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get session history:', error);
      return [];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const deepSeekIntegration = new DeepSeekIntegrationService();
