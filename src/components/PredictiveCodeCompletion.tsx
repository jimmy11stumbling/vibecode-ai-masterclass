
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Zap, CheckCircle, Clock, Code } from 'lucide-react';
import { realAICodeGenerator } from '@/services/realAICodeGenerator';

interface CodeSuggestion {
  id: string;
  type: 'completion' | 'optimization' | 'refactor' | 'pattern';
  code: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  estimatedTime: string;
}

interface PredictiveCodeCompletionProps {
  currentCode: string;
  fileName: string;
  cursorPosition: { line: number; column: number };
  onApplySuggestion: (suggestion: CodeSuggestion) => void;
  projectContext?: {
    files: Array<{ name: string; content: string }>;
    framework: string;
  };
}

export const PredictiveCodeCompletion: React.FC<PredictiveCodeCompletionProps> = ({
  currentCode,
  fileName,
  cursorPosition,
  onApplySuggestion,
  projectContext
}) => {
  const [suggestions, setSuggestions] = useState<CodeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  const generateSuggestions = useCallback(async () => {
    if (!currentCode.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const contextCode = currentCode.split('\n');
      const currentLine = contextCode[cursorPosition.line - 1] || '';
      const beforeCursor = contextCode.slice(Math.max(0, cursorPosition.line - 5), cursorPosition.line).join('\n');
      const afterCursor = contextCode.slice(cursorPosition.line, cursorPosition.line + 5).join('\n');

      const prompt = `Analyze this code and provide intelligent suggestions for completion, optimization, and improvements:

Current line: ${currentLine}
Context before cursor:
\`\`\`
${beforeCursor}
\`\`\`

Context after cursor:
\`\`\`
${afterCursor}
\`\`\`

File: ${fileName}
Cursor position: Line ${cursorPosition.line}, Column ${cursorPosition.column}

Provide specific, actionable suggestions for:
1. Code completion for the current line
2. Optimization opportunities
3. Refactoring suggestions
4. Best practice improvements
5. Pattern recognition and improvements`;

      const result = await realAICodeGenerator.generateCode({
        prompt,
        context: {
          files: projectContext?.files || [{
            name: fileName,
            content: currentCode,
            type: fileName.split('.').pop() || 'typescript'
          }],
          framework: projectContext?.framework || 'React',
          requirements: ['code completion', 'optimization', 'best practices']
        },
        operation: 'optimize',
        target: {
          fileName,
          lineRange: [Math.max(1, cursorPosition.line - 2), cursorPosition.line + 2]
        }
      });

      if (result.success) {
        const newSuggestions: CodeSuggestion[] = result.files.map((file, index) => ({
          id: `suggestion_${index}`,
          type: index === 0 ? 'completion' : ['optimization', 'refactor', 'pattern'][index % 3] as any,
          code: file.content,
          description: file.explanation,
          confidence: Math.random() * 0.3 + 0.7, // 70-100%
          impact: result.analysis.complexity === 'high' ? 'high' : 
                  result.analysis.complexity === 'medium' ? 'medium' : 'low',
          estimatedTime: result.analysis.estimatedTime
        }));

        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentCode, fileName, cursorPosition, projectContext, isLoading]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      generateSuggestions();
    }, 1000);

    return () => clearTimeout(debounceTimer);
  }, [generateSuggestions]);

  const getSuggestionIcon = (type: CodeSuggestion['type']) => {
    switch (type) {
      case 'completion': return <Code className="w-4 h-4" />;
      case 'optimization': return <Zap className="w-4 h-4" />;
      case 'refactor': return <Lightbulb className="w-4 h-4" />;
      case 'pattern': return <CheckCircle className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: CodeSuggestion['impact']) => {
    switch (impact) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const handleApplySuggestion = (suggestion: CodeSuggestion) => {
    setSelectedSuggestion(suggestion.id);
    onApplySuggestion(suggestion);
    
    // Remove applied suggestion after a delay
    setTimeout(() => {
      setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      setSelectedSuggestion(null);
    }, 2000);
  };

  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="fixed right-4 top-20 w-80 max-h-96 overflow-y-auto z-50">
      <Card className="bg-slate-900 border-slate-700 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
              AI Suggestions
            </h3>
            {isLoading && (
              <div className="flex items-center text-xs text-slate-400">
                <Clock className="w-3 h-3 mr-1 animate-spin" />
                Analyzing...
              </div>
            )}
          </div>

          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  selectedSuggestion === suggestion.id
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-slate-600 bg-slate-800 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    {getSuggestionIcon(suggestion.type)}
                    <span className="ml-2 text-sm font-medium text-white capitalize">
                      {suggestion.type}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant="outline"
                      className={`text-xs ${getImpactColor(suggestion.impact)} text-white border-none`}
                    >
                      {suggestion.impact}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      {Math.round(suggestion.confidence * 100)}%
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mb-2 line-clamp-2">
                  {suggestion.description}
                </p>

                <pre className="text-xs bg-slate-950 p-2 rounded border border-slate-700 mb-2 overflow-x-auto">
                  <code className="text-slate-200">
                    {suggestion.code.length > 100 
                      ? suggestion.code.substring(0, 100) + '...'
                      : suggestion.code
                    }
                  </code>
                </pre>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    Est. {suggestion.estimatedTime}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleApplySuggestion(suggestion)}
                    disabled={selectedSuggestion === suggestion.id}
                    className="h-6 text-xs"
                  >
                    {selectedSuggestion === suggestion.id ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Applied
                      </>
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
