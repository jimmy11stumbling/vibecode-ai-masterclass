
export interface CodeGenerationRequest {
  prompt: string;
  projectContext: {
    files: Array<{
      name: string;
      content: string;
      type: string;
    }>;
    framework: string;
    database?: string;
    features: string[];
    mcpServers?: string[];
    ragEnabled?: boolean;
  };
  operation: 'create' | 'update' | 'refactor' | 'optimize';
}

export interface CodeGenerationResult {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
  }>;
  explanation?: string;
  suggestions?: string[];
  errors?: string[];
}

export class AICodeGenerator {
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL: string = 'https://api.deepseek.com/v1') {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResult> {
    try {
      const systemPrompt = this.buildSystemPrompt(request);
      const userPrompt = this.buildUserPrompt(request);

      const response = await fetch(`${this.baseURL}/chat/completions`, {
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
          temperature: 0.7,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;

      return this.parseGeneratedCode(generatedContent);
    } catch (error) {
      return {
        success: false,
        files: [],
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private buildSystemPrompt(request: CodeGenerationRequest): string {
    return `You are a sovereign AI code generation assistant specializing in ${request.projectContext.framework} development.

Context:
- Framework: ${request.projectContext.framework}
- Database: ${request.projectContext.database || 'None'}
- Features: ${request.projectContext.features.join(', ')}
- MCP Servers: ${request.projectContext.mcpServers?.join(', ') || 'None'}
- RAG Enabled: ${request.projectContext.ragEnabled ? 'Yes' : 'No'}

Your task is to generate high-quality, production-ready code that follows best practices and integrates seamlessly with the existing project structure.

Guidelines:
1. Generate complete, functional code
2. Follow established patterns in the existing codebase
3. Include proper error handling and validation
4. Add appropriate comments and documentation
5. Ensure type safety (TypeScript)
6. Follow accessibility guidelines
7. Optimize for performance
8. Include proper styling with Tailwind CSS

Response format:
Return your response as a JSON object with the following structure:
{
  "success": boolean,
  "files": [
    {
      "path": "src/components/Example.tsx",
      "content": "// Generated code here",
      "operation": "create" | "update" | "delete"
    }
  ],
  "explanation": "Brief explanation of what was generated",
  "suggestions": ["Additional suggestions for improvement"]
}`;
  }

  private buildUserPrompt(request: CodeGenerationRequest): string {
    const existingFiles = request.projectContext.files.map(file => 
      `File: ${file.name} (${file.type})\n${file.content}`
    ).join('\n\n---\n\n');

    return `Operation: ${request.operation}
Request: ${request.prompt}

Existing project files:
${existingFiles}

Please generate the necessary code changes to fulfill this request.`;
  }

  private parseGeneratedCode(content: string): CodeGenerationResult {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(content);
      if (parsed.success !== undefined && parsed.files) {
        return parsed;
      }
    } catch (e) {
      // If not JSON, extract code blocks
    }

    // Fallback: extract code blocks from markdown
    const codeBlocks = this.extractCodeBlocks(content);
    
    return {
      success: codeBlocks.length > 0,
      files: codeBlocks.map(block => ({
        path: block.filename || 'generated-code.tsx',
        content: block.code,
        operation: 'create' as const
      })),
      explanation: 'Code generated from AI response'
    };
  }

  private extractCodeBlocks(content: string): Array<{filename?: string; code: string; language?: string}> {
    const codeBlockRegex = /```(?:(\w+))?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const language = match[1];
      const code = match[2];
      
      // Try to extract filename from comments
      const filenameMatch = code.match(/\/\*\s*filename:\s*([^\s]+)\s*\*\/|\/\/\s*filename:\s*([^\s]+)/);
      const filename = filenameMatch ? (filenameMatch[1] || filenameMatch[2]) : undefined;
      
      blocks.push({
        filename,
        code,
        language
      });
    }

    return blocks;
  }
}
