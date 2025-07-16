import { supabase } from '@/integrations/supabase/client';

export interface ReasoningContext {
  projectId: string;
  userQuery: string;
  previousContext?: string;
  systemInstructions?: string;
  ragContext?: any[];
}

export interface ReasoningResult {
  id: string;
  reasoning: string;
  conclusion: string;
  nextActions: string[];
  confidence: number;
  contextUsed: any[];
  timestamp: Date;
}

export class DeepSeekReasonerCore {
  private apiKey: string;
  private baseUrl = 'https://api.deepseek.com/v1';
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async performAdvancedReasoning(context: ReasoningContext): Promise<ReasoningResult> {
    console.log('🧠 DeepSeek Reasoner: Starting advanced reasoning process');
    
    // Fetch RAG context from database
    const ragContext = await this.fetchRAGContext(context.userQuery);
    
    // Construct reasoning prompt with context
    const reasoningPrompt = this.constructReasoningPrompt(context, ragContext);
    
    // Execute reasoning with DeepSeek
    const reasoningResponse = await this.executeReasoning(reasoningPrompt);
    
    // Process and structure the response
    const result = await this.processReasoningResult(reasoningResponse, context);
    
    // Store reasoning session in database
    await this.storeReasoningSession(result, context);
    
    return result;
  }

  private async fetchRAGContext(query: string): Promise<any[]> {
    try {
      const { data: knowledgeData, error } = await supabase
        .from('knowledge_base')
        .select('*')
        .textSearch('content', query)
        .limit(10);

      if (error) throw error;

      const { data: documentData, error: docError } = await supabase
        .from('documents')
        .select('*')
        .textSearch('extracted_text', query)
        .limit(5);

      if (docError) throw docError;

      return [...(knowledgeData || []), ...(documentData || [])];
    } catch (error) {
      console.error('RAG context fetch error:', error);
      return [];
    }
  }

  private constructReasoningPrompt(context: ReasoningContext, ragContext: any[]): string {
    return `
# DeepSeek Advanced Reasoning Session

## User Query
${context.userQuery}

## System Instructions
${context.systemInstructions || 'You are an expert software architect and developer with deep knowledge of modern web technologies.'}

## Previous Context
${context.previousContext || 'No previous context available.'}

## Relevant Knowledge Base Context
${ragContext.map(item => `- ${item.title || item.filename}: ${item.content || item.extracted_text}`.substring(0, 500)).join('\n')}

## Reasoning Framework
Please follow this structured reasoning approach:

1. **Problem Analysis**: Break down the user's request into its core components
2. **Context Integration**: How does the available knowledge base information inform this problem?
3. **Solution Architecture**: What is the optimal technical approach?
4. **Implementation Strategy**: What are the concrete next steps?
5. **Risk Assessment**: What potential issues should be considered?
6. **Success Metrics**: How will we know this solution is effective?

Provide your response in the following JSON structure:
{
  "reasoning": "Your detailed step-by-step reasoning process",
  "conclusion": "Your final conclusion and recommended approach",
  "nextActions": ["Array of specific actionable steps"],
  "confidence": 0.95,
  "contextUsed": ["List of knowledge base items that were particularly relevant"]
}
`;
  }

  private async executeReasoning(prompt: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: [
          {
            role: 'system',
            content: 'You are DeepSeek Reasoner, an advanced AI system capable of deep analysis and structured reasoning. Always respond with valid JSON when requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async processReasoningResult(response: string, context: ReasoningContext): Promise<ReasoningResult> {
    try {
      // Try to parse JSON response
      const parsed = JSON.parse(response);
      
      return {
        id: `reasoning-${Date.now()}`,
        reasoning: parsed.reasoning || response,
        conclusion: parsed.conclusion || 'Advanced reasoning completed',
        nextActions: parsed.nextActions || [],
        confidence: parsed.confidence || 0.8,
        contextUsed: parsed.contextUsed || [],
        timestamp: new Date()
      };
    } catch (error) {
      // Fallback for non-JSON responses
      return {
        id: `reasoning-${Date.now()}`,
        reasoning: response,
        conclusion: 'Reasoning analysis completed',
        nextActions: ['Review reasoning output', 'Implement suggested approach'],
        confidence: 0.7,
        contextUsed: [],
        timestamp: new Date()
      };
    }
  }

  private async storeReasoningSession(result: ReasoningResult, context: ReasoningContext): Promise<void> {
    try {
      const { error } = await supabase
        .from('generation_history')
        .insert({
          task_id: result.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'completed',
          project_spec: {
            userQuery: context.userQuery,
            reasoning: result.reasoning,
            conclusion: result.conclusion,
            nextActions: result.nextActions,
            confidence: result.confidence
          },
          result: result.conclusion,
          progress: 100
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to store reasoning session:', error);
    }
  }

  async streamReasoningProcess(
    context: ReasoningContext,
    onProgress: (progress: { step: string; details: string; progress: number }) => void
  ): Promise<ReasoningResult> {
    onProgress({ step: 'Initializing', details: 'Starting DeepSeek reasoning process', progress: 10 });
    
    onProgress({ step: 'Context Gathering', details: 'Fetching relevant knowledge from RAG database', progress: 30 });
    const ragContext = await this.fetchRAGContext(context.userQuery);
    
    onProgress({ step: 'Prompt Construction', details: 'Building structured reasoning prompt', progress: 50 });
    const reasoningPrompt = this.constructReasoningPrompt(context, ragContext);
    
    onProgress({ step: 'Deep Reasoning', details: 'Executing advanced reasoning with DeepSeek', progress: 70 });
    const reasoningResponse = await this.executeReasoning(reasoningPrompt);
    
    onProgress({ step: 'Processing Results', details: 'Analyzing and structuring reasoning output', progress: 90 });
    const result = await this.processReasoningResult(reasoningResponse, context);
    
    onProgress({ step: 'Complete', details: 'Reasoning process completed successfully', progress: 100 });
    await this.storeReasoningSession(result, context);
    
    return result;
  }
}

export const createDeepSeekReasonerCore = (apiKey: string) => new DeepSeekReasonerCore(apiKey);
