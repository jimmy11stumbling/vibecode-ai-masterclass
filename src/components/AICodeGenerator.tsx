
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Zap, FileCode, Brain, Sparkles, Settings } from 'lucide-react';
import { useDeepSeekAPI } from '@/hooks/useDeepSeekAPI';
import { dynamicCodeModifier, CodeModificationRequest } from '@/services/dynamicCodeModifier';
import { useToast } from '@/hooks/use-toast';

interface GeneratedCode {
  id: string;
  fileName: string;
  content: string;
  language: string;
  description: string;
  timestamp: Date;
}

interface AICodeGeneratorProps {
  onCodeGenerated?: (code: GeneratedCode) => void;
}

export const AICodeGenerator: React.FC<AICodeGeneratorProps> = ({ onCodeGenerated }) => {
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState<GeneratedCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('component');
  const { streamChatResponse, apiKey } = useDeepSeekAPI();
  const { toast } = useToast();

  const templates = [
    { id: 'component', name: 'React Component', icon: Code2, description: 'Create a new React component' },
    { id: 'hook', name: 'Custom Hook', icon: Zap, description: 'Generate a custom React hook' },
    { id: 'service', name: 'Service Class', icon: FileCode, description: 'Create a service or utility class' },
    { id: 'page', name: 'Full Page', icon: Brain, description: 'Generate a complete page component' },
    { id: 'api', name: 'API Function', icon: Sparkles, description: 'Create an API endpoint or function' },
    { id: 'config', name: 'Configuration', icon: Settings, description: 'Generate configuration files' }
  ];

  const generateCode = useCallback(async () => {
    if (!prompt.trim() || !apiKey) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt and ensure API key is set',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);

    try {
      const projectStructure = await dynamicCodeModifier.getProjectStructure();
      const contextPrompt = `
        Template: ${selectedTemplate}
        Project Structure: ${JSON.stringify(projectStructure, null, 2)}
        Request: ${prompt}
        
        Generate production-ready code with:
        1. TypeScript interfaces and proper typing
        2. Error handling and validation
        3. Responsive design with Tailwind CSS
        4. Accessibility features
        5. Performance optimizations
        6. Proper file organization

        Return the response as JSON with this structure:
        {
          "files": [
            {
              "path": "src/components/Example.tsx",
              "content": "// Generated code here",
              "description": "Brief description"
            }
          ],
          "instructions": "Any additional setup instructions"
        }
      `;

      let fullResponse = '';
      await streamChatResponse(
        [{ id: '1', role: 'user', content: contextPrompt, timestamp: new Date() }],
        (token) => {
          fullResponse += token;
        }
      );

      // Parse the response
      try {
        const parsed = JSON.parse(fullResponse);
        if (parsed.files && Array.isArray(parsed.files)) {
          const modifications: CodeModificationRequest[] = [];
          const newGeneratedCode: GeneratedCode[] = [];

          for (const file of parsed.files) {
            const generatedItem: GeneratedCode = {
              id: Date.now().toString() + Math.random(),
              fileName: file.path.split('/').pop() || 'generated-file',
              content: file.content,
              language: getLanguageFromPath(file.path),
              description: file.description || 'AI generated code',
              timestamp: new Date()
            };

            newGeneratedCode.push(generatedItem);
            modifications.push({
              operation: 'create',
              filePath: file.path,
              content: file.content
            });

            onCodeGenerated?.(generatedItem);
          }

          // Apply the changes to the file system
          const success = await dynamicCodeModifier.applyChanges(modifications);
          
          if (success) {
            setGeneratedCode(prev => [...prev, ...newGeneratedCode]);
            toast({
              title: 'Code Generated Successfully',
              description: `Generated ${modifications.length} file(s) and applied changes to project`
            });
          } else {
            toast({
              title: 'Generation Successful, Application Failed',
              description: 'Code was generated but could not be applied to project files',
              variant: 'destructive'
            });
          }

          if (parsed.instructions) {
            toast({
              title: 'Additional Instructions',
              description: parsed.instructions
            });
          }
        }
      } catch (parseError) {
        // Fallback: extract code blocks manually
        const codeBlocks = extractCodeBlocks(fullResponse);
        if (codeBlocks.length > 0) {
          const generatedItem: GeneratedCode = {
            id: Date.now().toString(),
            fileName: `generated-${selectedTemplate}.tsx`,
            content: codeBlocks[0].code,
            language: codeBlocks[0].language || 'typescript',
            description: 'AI generated code',
            timestamp: new Date()
          };

          setGeneratedCode(prev => [...prev, generatedItem]);
          onCodeGenerated?.(generatedItem);

          toast({
            title: 'Code Generated',
            description: 'Code generated successfully (manual extraction)'
          });
        }
      }

    } catch (error) {
      console.error('Code generation error:', error);
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedTemplate, apiKey, streamChatResponse, onCodeGenerated, toast]);

  const extractCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(?:(\w+))?\n([\s\S]*?)```/g;
    const blocks = [];
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      blocks.push({
        language: match[1] || 'text',
        code: match[2]
      });
    }

    return blocks;
  };

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'tsx': 'typescript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'js': 'javascript',
      'css': 'css',
      'json': 'json',
      'md': 'markdown'
    };
    return languageMap[ext || ''] || 'text';
  };

  const applyGeneratedCode = async (code: GeneratedCode) => {
    const filePath = `src/generated/${code.fileName}`;
    const success = await dynamicCodeModifier.applyChanges([{
      operation: 'create',
      filePath,
      content: code.content
    }]);

    if (success) {
      toast({
        title: 'Code Applied',
        description: `Applied ${code.fileName} to project`
      });
    } else {
      toast({
        title: 'Application Failed',
        description: 'Could not apply code to project',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-2">AI Code Generator</h3>
        <p className="text-sm text-slate-400">Generate production-ready code with DeepSeek AI</p>
      </div>

      <Tabs defaultValue="generate" className="flex-1 flex flex-col">
        <TabsList className="mx-4 mt-4 bg-slate-800">
          <TabsTrigger value="generate">Generate</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="flex-1 p-4 space-y-4">
          {/* Template Selection */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Template Type</label>
            <div className="grid grid-cols-2 gap-2">
              {templates.map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTemplate(template.id)}
                  className="justify-start"
                >
                  <template.icon className="w-4 h-4 mr-2" />
                  {template.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Prompt Input */}
          <div>
            <label className="text-sm font-medium text-white mb-2 block">Describe what you want to create</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Create a user profile component with avatar, name, email, and edit functionality"
              className="bg-slate-800 border-slate-600 text-white min-h-[100px]"
            />
          </div>

          <Button
            onClick={generateCode}
            disabled={isGenerating || !apiKey}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Code
              </>
            )}
          </Button>

          {!apiKey && (
            <p className="text-xs text-amber-400 text-center">
              Please set your DeepSeek API key in settings to enable code generation
            </p>
          )}
        </TabsContent>

        <TabsContent value="history" className="flex-1">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-3">
              {generatedCode.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  <Code2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No generated code yet</p>
                </div>
              ) : (
                generatedCode.slice().reverse().map((code) => (
                  <Card key={code.id} className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-white">{code.fileName}</CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {code.language}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{code.description}</p>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          {code.timestamp.toLocaleString()}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => applyGeneratedCode(code)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Apply to Project
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};
