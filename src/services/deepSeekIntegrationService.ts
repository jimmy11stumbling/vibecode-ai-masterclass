
import { DeepSeekReasonerCore, ReasoningContext, ReasoningResult } from './deepSeekReasonerCore';
import { ragDatabase } from './ragDatabaseCore';
import { supabase } from '@/integrations/supabase/client';

export interface DeepSeekSession {
  id: string;
  userId: string;
  context: ReasoningContext;
  results: ReasoningResult[];
  status: 'active' | 'completed' | 'error';
  createdAt: Date;
  updatedAt: Date;
}

export interface EnhancedReasoningRequest {
  query: string;
  context?: string;
  projectId?: string;
  includeRAG?: boolean;
  reasoningDepth?: 'basic' | 'standard' | 'advanced' | 'expert';
  domainFocus?: string[];
}

export class DeepSeekIntegrationService {
  private reasonerCore: DeepSeekReasonerCore;
  private activeSessions: Map<string, DeepSeekSession> = new Map();

  constructor() {
    this.reasonerCore = new DeepSeekReasonerCore(this.getApiKey());
  }

  private getApiKey(): string {
    // This would be retrieved from Supabase secrets in production
    return process.env.DEEPSEEK_API_KEY || 'sk-your-deepseek-api-key';
  }

  async createReasoningSession(
    request: EnhancedReasoningRequest,
    userId?: string
  ): Promise<string> {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user ID from auth if not provided
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    const session: DeepSeekSession = {
      id: sessionId,
      userId: userId || 'anonymous',
      context: {
        projectId: request.projectId || 'default',
        userQuery: request.query,
        previousContext: request.context,
        systemInstructions: this.buildSystemInstructions(request)
      },
      results: [],
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.activeSessions.set(sessionId, session);
    
    console.log(`🧠 DeepSeek Integration: Created session ${sessionId}`);
    return sessionId;
  }

  async performAdvancedReasoning(
    sessionId: string,
    onProgress?: (progress: { step: string; details: string; progress: number }) => void
  ): Promise<ReasoningResult> {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    try {
      console.log(`🔍 DeepSeek Integration: Starting reasoning for session ${sessionId}`);

      // Enhanced context gathering with RAG
      if (onProgress) {
        onProgress({ step: 'Context Enhancement', details: 'Gathering relevant knowledge from RAG database', progress: 20 });
      }

      const ragResults = await ragDatabase.query({
        query: session.context.userQuery,
        limit: 15,
        threshold: 0.6
      });

      // Update context with RAG data
      session.context.ragContext = ragResults.chunks;

      // Perform streaming reasoning with progress updates
      const result = await this.reasonerCore.streamReasoningProcess(
        session.context,
        onProgress || (() => {})
      );

      // Store result
      session.results.push(result);
      session.status = 'completed';
      session.updatedAt = new Date();

      // Persist to database
      await this.persistSession(session);

      console.log(`✅ DeepSeek Integration: Reasoning completed for session ${sessionId}`);
      return result;

    } catch (error) {
      session.status = 'error';
      session.updatedAt = new Date();
      console.error(`❌ DeepSeek Integration: Reasoning failed for session ${sessionId}:`, error);
      throw error;
    }
  }

  async generateStreamingResponse(
    query: string,
    context?: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    console.log('🌊 DeepSeek Integration: Starting streaming response generation');
    
    try {
      // Create a streaming prompt with enhanced context
      const enhancedPrompt = await this.buildEnhancedPrompt(query, context);
      
      // Use the streaming capability of DeepSeek
      let fullResponse = '';
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.getApiKey()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: [
            {
              role: 'system',
              content: 'You are an advanced AI reasoning system. Provide detailed, step-by-step analysis and actionable insights.'
            },
            {
              role: 'user',
              content: enhancedPrompt
            }
          ],
          stream: true,
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                if (onChunk) {
                  onChunk(content);
                }
              }
            } catch (parseError) {
              // Skip invalid JSON chunks
            }
          }
        }
      }

      return fullResponse;

    } catch (error) {
      console.error('DeepSeek streaming error:', error);
      throw error;
    }
  }

  private async buildEnhancedPrompt(query: string, context?: string): Promise<string> {
    // Get relevant RAG context
    const ragResults = await ragDatabase.query({
      query: query,
      limit: 10,
      threshold: 0.7
    });

    const ragContext = ragResults.chunks
      .map(chunk => `[${chunk.category || 'General'}] ${chunk.content}`)
      .join('\n\n');

    return `
# Enhanced Reasoning Request

## User Query
${query}

## Additional Context
${context || 'No additional context provided'}

## Relevant Knowledge Base
${ragContext || 'No relevant knowledge base entries found'}

## Analysis Framework
Please provide a comprehensive analysis that includes:

1. **Problem Decomposition**: Break down the query into its core components
2. **Context Integration**: How does the available knowledge inform this analysis?
3. **Solution Architecture**: What is the optimal approach?
4. **Implementation Strategy**: Concrete steps to achieve the desired outcome
5. **Risk Assessment**: Potential challenges and mitigation strategies
6. **Success Metrics**: How to measure effectiveness

Provide detailed reasoning for each section and ensure your response is actionable and comprehensive.
    `.trim();
  }

  private buildSystemInstructions(request: EnhancedReasoningRequest): string {
    let instructions = `You are an advanced AI reasoning system with access to comprehensive knowledge bases and development tools.

Reasoning Depth: ${request.reasoningDepth || 'standard'}
Query Type: Software Development and Architecture

Core Capabilities:
- Advanced logical reasoning and problem decomposition
- Software architecture design and analysis
- Code generation and optimization
- System integration planning
- Risk assessment and mitigation

Please provide thorough, step-by-step analysis with actionable recommendations.`;

    if (request.domainFocus && request.domainFocus.length > 0) {
      instructions += `\n\nDomain Focus Areas: ${request.domainFocus.join(', ')}`;
    }

    return instructions;
  }

  private async persistSession(session: DeepSeekSession): Promise<void> {
    try {
      const { error } = await supabase
        .from('generation_history')
        .insert({
          task_id: session.id,
          user_id: session.userId,
          status: session.status,
          project_spec: {
            sessionId: session.id,
            context: session.context,
            results: session.results,
            createdAt: session.createdAt.toISOString(),
            updatedAt: session.updatedAt.toISOString()
          },
          result: session.results.length > 0 ? session.results[session.results.length - 1].conclusion : null,
          progress: session.status === 'completed' ? 100 : 0
        });

      if (error) {
        console.error('Failed to persist DeepSeek session:', error);
      }
    } catch (error) {
      console.error('Error persisting session:', error);
    }
  }

  async getSession(sessionId: string): Promise<DeepSeekSession | null> {
    return this.activeSessions.get(sessionId) || null;
  }

  async getAllSessions(userId?: string): Promise<DeepSeekSession[]> {
    if (!userId) {
      return Array.from(this.activeSessions.values());
    }
    
    return Array.from(this.activeSessions.values()).filter(
      session => session.userId === userId
    );
  }

  async clearSession(sessionId: string): Promise<boolean> {
    return this.activeSessions.delete(sessionId);
  }

  async updateReasonerApiKey(apiKey: string): Promise<void> {
    this.reasonerCore.setApiKey(apiKey);
    console.log('🔑 DeepSeek Integration: API key updated');
  }
}

export const deepSeekIntegration = new DeepSeekIntegrationService();
