
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Code, 
  Brain, 
  FileText, 
  Download, 
  Copy,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { realAICodeGenerator } from '@/services/realAICodeGenerator';
import { useToast } from '@/hooks/use-toast';

interface GeneratedFile {
  path: string;
  content: string;
  operation: 'create' | 'update' | 'delete';
  explanation: string;
}

interface CodeContext {
  files: Array<{
    name: string;
    content: string;
    type: string;
  }>;
  framework: string;
  requirements: string[];
}

interface ContextAwareCodeGeneratorProps {
  projectContext?: CodeContext;
  onCodeGenerated?: (files: GeneratedFile[]) => void;
}

export const ContextAwareCodeGenerator: React.FC<ContextAwareCodeGeneratorProps> = ({
  projectContext,
  onCodeGenerated
}) => {
  const [prompt, setPrompt] = useState('');
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const result = await realAICodeGenerator.generateCode({
        prompt,
        context: projectContext || {
          files: [],
          framework: 'React',
          requirements: ['TypeScript', 'Tailwind CSS', 'Modern patterns']
        },
        operation: 'create',
        target: {}
      });

      if (result.success) {
        setGeneratedFiles(result.files);
        setAnalysisResult(result.analysis);
        onCodeGenerated?.(result.files);
        
        toast({
          title: "Code Generated",
          description: `Generated ${result.files.length} files with ${result.analysis.complexity} complexity`,
        });
      } else {
        throw new Error(result.errors?.join(', ') || 'Code generation failed');
      }
    } catch (error) {
      console.error('Code generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Code copied to clipboard",
    });
  };

  const downloadFile = (file: GeneratedFile) => {
    const blob = new Blob([file.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.path.split('/').pop() || 'generated-file.tsx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="h-full bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Context-Aware Code Generator</h2>
              <p className="text-sm text-slate-400">AI-powered code generation with project context</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className="bg-blue-500/20 text-blue-400">
              {generatedFiles.length} Files
            </Badge>
            {analysisResult && (
              <Badge className={`text-xs ${getComplexityColor(analysisResult.complexity)}`}>
                {analysisResult.complexity} complexity
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="h-full flex">
        {/* Input Panel */}
        <div className="w-2/5 border-r border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Code Generation Prompt</h3>
            <p className="text-sm text-slate-400">Describe what you want to build in detail</p>
          </div>
          
          <div className="flex-1 p-4">
            <Textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create a responsive user profile component with avatar upload, form validation, and dark mode support..."
              className="h-40 bg-slate-800 border-slate-600 text-white placeholder-slate-400 resize-none"
              disabled={isGenerating}
            />
            
            <Button 
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Generate Code
                </>
              )}
            </Button>
          </div>

          {/* Project Context */}
          {projectContext && (
            <div className="p-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-white mb-2">Project Context</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Framework</span>
                  <Badge variant="outline" className="text-xs">
                    {projectContext.framework}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Files</span>
                  <Badge variant="outline" className="text-xs">
                    {projectContext.files.length}
                  </Badge>
                </div>
                <div className="text-xs text-slate-400">
                  Requirements: {projectContext.requirements.join(', ')}
                </div>
              </div>
            </div>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <div className="p-4 border-t border-slate-700">
              <h4 className="text-sm font-medium text-white mb-2">Analysis</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Estimated Time</span>
                  <span className="text-xs text-white">{analysisResult.estimatedTime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Dependencies</span>
                  <span className="text-xs text-white">{analysisResult.dependencies.length}</span>
                </div>
                <div className="text-xs text-slate-400">
                  <p className="font-medium mb-1">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {analysisResult.recommendations.slice(0, 3).map((rec: string, index: number) => (
                      <li key={index} className="text-xs">{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generated Files Panel */}
        <div className="flex-1 flex">
          {/* File List */}
          <div className="w-1/3 border-r border-slate-700">
            <div className="p-4 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">Generated Files</h3>
            </div>
            
            <ScrollArea className="h-[calc(100vh-200px)]">
              <div className="p-2">
                {generatedFiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">No files generated yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {generatedFiles.map((file, index) => (
                      <Card
                        key={index}
                        className={`cursor-pointer transition-all ${
                          selectedFile === file
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <p className="text-sm text-white font-medium truncate">
                              {file.path.split('/').pop()}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              {file.operation}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2">
                            {file.explanation}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* File Content */}
          <div className="flex-1">
            {selectedFile ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-slate-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{selectedFile.path}</h3>
                      <p className="text-sm text-slate-400">{selectedFile.explanation}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(selectedFile.content)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(selectedFile)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
                
                <ScrollArea className="flex-1">
                  <pre className="p-4 text-sm text-slate-200 bg-slate-950 h-full overflow-auto">
                    <code>{selectedFile.content}</code>
                  </pre>
                </ScrollArea>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Code className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-400">Select a file to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
