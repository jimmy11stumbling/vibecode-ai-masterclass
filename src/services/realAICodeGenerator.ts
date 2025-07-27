
import { supabase } from '@/integrations/supabase/client';

export interface CodeGenerationRequest {
  prompt: string;
  context: {
    files: Array<{
      name: string;
      content: string;
      type: string;
    }>;
    framework: string;
    requirements: string[];
  };
  operation: 'create' | 'modify' | 'refactor' | 'debug' | 'optimize';
  target?: {
    fileName?: string;
    lineRange?: [number, number];
    component?: string;
  };
}

export interface CodeGenerationResult {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
    explanation: string;
  }>;
  analysis: {
    complexity: 'low' | 'medium' | 'high';
    estimatedTime: string;
    dependencies: string[];
    recommendations: string[];
  };
  errors?: string[];
}

export class RealAICodeGenerator {
  private apiKey: string | null = null;

  constructor() {
    this.loadApiKey();
  }

  private async loadApiKey() {
    try {
      const { data } = await supabase.functions.invoke('get-deepseek-key');
      this.apiKey = data?.key;
    } catch (error) {
      console.error('Failed to load DeepSeek API key:', error);
    }
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    if (!this.apiKey) {
      await this.loadApiKey();
      if (!this.apiKey) {
        throw new Error('DeepSeek API key not configured');
      }
    }

    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-reasoner',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 8000,
          response_format: { type: 'json_object' }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);

      return this.validateAndEnhanceResult(result, request);
    } catch (error) {
      console.error('Code generation failed:', error);
      return {
        success: false,
        files: [],
        analysis: {
          complexity: 'high',
          estimatedTime: 'unknown',
          dependencies: [],
          recommendations: ['Please check API configuration and try again']
        },
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  async streamChatResponse(
    messages: Array<{ id: string; role: 'system' | 'user' | 'assistant'; content: string; timestamp: Date }>,
    onToken: (token: string) => void,
    onProgress?: (stats: any) => void
  ): Promise<void> {
    if (!this.apiKey) {
      await this.loadApiKey();
      if (!this.apiKey) {
        throw new Error('DeepSeek API key not configured');
      }
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          temperature: 0.7,
          max_tokens: 8000,
          stream: true
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      if (!response.body) {
        throw new Error('No response stream available');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let tokenCount = 0;
      const startTime = Date.now();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        
        for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i].trim();
          if (part.startsWith('data: ')) {
            const jsonStr = part.slice(6).trim();
            if (jsonStr === '[DONE]') {
              onProgress?.({
                tokensReceived: tokenCount,
                responseTime: Date.now() - startTime,
                status: 'complete'
              });
              return;
            }
            
            try {
              const parsed = JSON.parse(jsonStr);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) {
                onToken(token);
                tokenCount++;
                
                if (onProgress && tokenCount % 10 === 0) {
                  onProgress({
                    tokensReceived: tokenCount,
                    responseTime: Date.now() - startTime,
                    status: 'streaming'
                  });
                }
              }
            } catch (e) {
              console.warn('JSON parse error:', e);
            }
          }
        }
        
        buffer = parts[parts.length - 1];
      }

    } catch (error) {
      console.error('Streaming error:', error);
      throw error;
    }
  }

  private buildSystemPrompt(request: CodeGenerationRequest): string {
    return `You are an expert software engineer specializing in ${request.context.framework} development.

CRITICAL INSTRUCTIONS:
- Generate production-ready, type-safe, and well-documented code
- Follow best practices for React, TypeScript, and Tailwind CSS
- Ensure proper error handling and accessibility
- Use semantic HTML and proper component composition
- Implement proper state management and performance optimization
- Always return valid JSON with the exact structure specified

RESPONSE FORMAT (JSON):
{
  "success": boolean,
  "files": [
    {
      "path": "string",
      "content": "string", 
      "operation": "create|update|delete",
      "explanation": "string"
    }
  ],
  "analysis": {
    "complexity": "low|medium|high",
    "estimatedTime": "string",
    "dependencies": ["string"],
    "recommendations": ["string"]
  }
}

Context: ${request.context.framework} application
Operation: ${request.operation}
Requirements: ${request.context.requirements.join(', ')}`;
  }

  private buildUserPrompt(request: CodeGenerationRequest): string {
    const filesContext = request.context.files.map(file => 
      `// ${file.name}\n${file.content}`
    ).join('\n\n---\n\n');

    let prompt = `Task: ${request.prompt}\n\n`;

    if (request.target) {
      prompt += `Target: ${JSON.stringify(request.target)}\n\n`;
    }

    if (filesContext) {
      prompt += `Current codebase:\n${filesContext}\n\n`;
    }

    prompt += `Please ${request.operation} the code according to the requirements. Return only valid JSON.`;

    return prompt;
  }

  private validateAndEnhanceResult(result: any, request: CodeGenerationRequest): CodeGenerationResult {
    // Validate structure
    if (!result.files || !Array.isArray(result.files)) {
      result.files = [];
    }

    if (!result.analysis) {
      result.analysis = {
        complexity: 'medium',
        estimatedTime: '5-10 minutes',
        dependencies: [],
        recommendations: []
      };
    }

    // Enhance with automatic analysis
    result.files.forEach((file: any) => {
      if (!file.explanation) {
        file.explanation = `Generated ${file.operation} for ${file.path}`;
      }
    });

    return result as CodeGenerationResult;
  }
}

export const realAICodeGenerator = new RealAICodeGenerator();
