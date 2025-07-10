
interface CodeGenerationRequest {
  prompt: string;
  projectContext: {
    files: Array<{ name: string; content: string; type: string }>;
    framework: string;
    database?: string;
    features: string[];
  };
  operation: 'create' | 'modify' | 'delete' | 'refactor';
  targetFiles?: string[];
}

interface CodeGenerationResponse {
  success: boolean;
  files: Array<{
    path: string;
    content: string;
    operation: 'create' | 'update' | 'delete';
  }>;
  explanation: string;
  dependencies?: string[];
  migrations?: string[];
}

export class AICodeGenerator {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateCode(request: CodeGenerationRequest): Promise<CodeGenerationResponse> {
    const systemPrompt = `You are an expert full-stack developer AI assistant. You can:
    - Create complete React components with TypeScript
    - Generate backend APIs and database schemas
    - Set up authentication and authorization
    - Create responsive UI with Tailwind CSS
    - Handle file operations and state management
    - Generate Supabase edge functions and database migrations
    - Create complete CRUD operations
    - Set up real-time features
    - Handle form validation and error handling

    Always provide complete, production-ready code with proper error handling.
    Include TypeScript types and interfaces.
    Use modern React patterns (hooks, functional components).
    Follow best practices for security and performance.`;

    const contextPrompt = `
    Current project context:
    - Framework: ${request.projectContext.framework}
    - Database: ${request.projectContext.database || 'None'}
    - Features: ${request.projectContext.features.join(', ')}
    - Files: ${request.projectContext.files.length} files
    
    Operation: ${request.operation}
    ${request.targetFiles ? `Target files: ${request.targetFiles.join(', ')}` : ''}
    
    User request: ${request.prompt}
    
    Provide a JSON response with the following structure:
    {
      "success": boolean,
      "files": [
        {
          "path": "src/components/Example.tsx",
          "content": "complete file content",
          "operation": "create|update|delete"
        }
      ],
      "explanation": "What was implemented and why",
      "dependencies": ["package-name@version"],
      "migrations": ["SQL migration statements if needed"]
    }`;

    try {
      const response = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: contextPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4000,
        }),
      });

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;
      
      try {
        return JSON.parse(aiResponse);
      } catch (parseError) {
        // Fallback: extract JSON from response if it's wrapped in text
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('AI Code Generation Error:', error);
      return {
        success: false,
        files: [],
        explanation: `Error generating code: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}
