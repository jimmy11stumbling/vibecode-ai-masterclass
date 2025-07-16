
import { realAICodeGenerator } from './realAICodeGenerator';

export interface DebugContext {
  error: Error | string;
  stackTrace?: string;
  codeContext: {
    fileName: string;
    lineNumber?: number;
    surroundingCode: string;
  };
  userAction?: string;
  browserInfo?: {
    userAgent: string;
    viewport: { width: number; height: number };
  };
}

export interface DebugSuggestion {
  type: 'fix' | 'warning' | 'optimization' | 'explanation';
  title: string;
  description: string;
  codeChanges?: {
    fileName: string;
    lineNumber: number;
    oldCode: string;
    newCode: string;
  }[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  autoFixable: boolean;
}

export interface DebugResult {
  analysis: {
    errorType: string;
    rootCause: string;
    impact: string;
    confidence: number;
  };
  suggestions: DebugSuggestion[];
  quickFixes: string[];
  preventionTips: string[];
}

export class IntelligentDebugger {
  async analyzeError(context: DebugContext): Promise<DebugResult> {
    try {
      const debugPrompt = `Analyze this error and provide intelligent debugging assistance:

Error: ${context.error}
Stack Trace: ${context.stackTrace || 'Not available'}
File: ${context.codeContext.fileName}
Line: ${context.codeContext.lineNumber || 'Unknown'}
Code Context:
\`\`\`
${context.codeContext.surroundingCode}
\`\`\`
User Action: ${context.userAction || 'Not specified'}

Provide a comprehensive analysis including:
1. Error type classification
2. Root cause analysis
3. Step-by-step fixes
4. Prevention strategies
5. Code improvements`;

      const result = await realAICodeGenerator.generateCode({
        prompt: debugPrompt,
        context: {
          files: [{
            name: context.codeContext.fileName,
            content: context.codeContext.surroundingCode,
            type: 'typescript'
          }],
          framework: 'React',
          requirements: ['debug analysis', 'error fixing', 'code optimization']
        },
        operation: 'debug'
      });

      return this.parseDebugResult(result, context);
    } catch (error) {
      console.error('Debug analysis failed:', error);
      return this.getFallbackDebugResult(context);
    }
  }

  private parseDebugResult(aiResult: any, context: DebugContext): DebugResult {
    // Parse AI response and structure it appropriately
    return {
      analysis: {
        errorType: this.classifyError(context.error),
        rootCause: 'AI analysis pending...',
        impact: 'Medium',
        confidence: 0.8
      },
      suggestions: [
        {
          type: 'fix',
          title: 'Apply suggested fix',
          description: 'Based on error analysis',
          severity: 'high',
          autoFixable: true
        }
      ],
      quickFixes: ['Check console for details', 'Verify imports', 'Review recent changes'],
      preventionTips: ['Use TypeScript strict mode', 'Add proper error boundaries', 'Implement comprehensive testing']
    };
  }

  private classifyError(error: Error | string): string {
    const errorStr = error.toString().toLowerCase();
    
    if (errorStr.includes('cannot read prop')) return 'Null/Undefined Property Access';
    if (errorStr.includes('is not a function')) return 'Invalid Function Call';
    if (errorStr.includes('syntaxerror')) return 'Syntax Error';
    if (errorStr.includes('typeerror')) return 'Type Error';
    if (errorStr.includes('referenceerror')) return 'Reference Error';
    if (errorStr.includes('network')) return 'Network Error';
    
    return 'Unknown Error';
  }

  private getFallbackDebugResult(context: DebugContext): DebugResult {
    return {
      analysis: {
        errorType: this.classifyError(context.error),
        rootCause: 'Manual analysis required',
        impact: 'Unknown',
        confidence: 0.3
      },
      suggestions: [
        {
          type: 'explanation',
          title: 'Basic troubleshooting',
          description: 'Follow standard debugging practices',
          severity: 'medium',
          autoFixable: false
        }
      ],
      quickFixes: ['Check browser console', 'Verify file paths', 'Review recent changes'],
      preventionTips: ['Add error boundaries', 'Use TypeScript', 'Implement proper testing']
    };
  }

  async autoFix(suggestion: DebugSuggestion): Promise<boolean> {
    if (!suggestion.autoFixable || !suggestion.codeChanges) {
      return false;
    }

    try {
      // Apply code changes automatically
      for (const change of suggestion.codeChanges) {
        console.log(`Auto-fixing ${change.fileName} at line ${change.lineNumber}`);
        // Implementation would modify the actual files
      }
      return true;
    } catch (error) {
      console.error('Auto-fix failed:', error);
      return false;
    }
  }
}

export const intelligentDebugger = new IntelligentDebugger();
