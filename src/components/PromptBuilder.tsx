
import React, { useState } from 'react';
import { Plus, Trash2, Sparkles, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  template: string;
  category: 'react' | 'javascript' | 'css' | 'general';
  variables: string[];
}

export const PromptBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [variables, setVariables] = useState<Record<string, string>>({});

  const templates: PromptTemplate[] = [
    {
      id: '1',
      title: 'React Component',
      description: 'Create a new React component with props and state',
      template: 'Create a React component called {{componentName}} that {{functionality}}. The component should use {{stateType}} for state management and accept the following props: {{propsList}}.',
      category: 'react',
      variables: ['componentName', 'functionality', 'stateType', 'propsList']
    },
    {
      id: '2',
      title: 'API Integration',
      description: 'Integrate with an external API',
      template: 'Create a function that fetches data from {{apiEndpoint}} using {{httpMethod}}. Handle loading states, errors, and success responses. The data should be {{dataProcessing}}.',
      category: 'javascript',
      variables: ['apiEndpoint', 'httpMethod', 'dataProcessing']
    },
    {
      id: '3',
      title: 'CSS Animation',
      description: 'Create smooth CSS animations',
      template: 'Create a CSS animation for {{element}} that {{animationType}} over {{duration}}. The animation should {{triggerCondition}} and include {{easingFunction}}.',
      category: 'css',
      variables: ['element', 'animationType', 'duration', 'triggerCondition', 'easingFunction']
    },
    {
      id: '4',
      title: 'Bug Fix',
      description: 'Debug and fix code issues',
      template: 'I have a {{issueType}} in my {{codeContext}}. The expected behavior is {{expectedBehavior}} but instead {{actualBehavior}}. Here\'s the relevant code: {{codeSnippet}}',
      category: 'general',
      variables: ['issueType', 'codeContext', 'expectedBehavior', 'actualBehavior', 'codeSnippet']
    }
  ];

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    const initialVariables: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialVariables[variable] = '';
    });
    setVariables(initialVariables);
  };

  const buildPrompt = () => {
    if (!selectedTemplate) return '';
    
    let prompt = selectedTemplate.template;
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), value || `[${key}]`);
    });
    return prompt;
  };

  const copyPrompt = () => {
    const prompt = buildPrompt();
    navigator.clipboard.writeText(prompt);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'react': return 'bg-blue-500/20 text-blue-400';
      case 'javascript': return 'bg-yellow-500/20 text-yellow-400';
      case 'css': return 'bg-purple-500/20 text-purple-400';
      case 'general': return 'bg-green-500/20 text-green-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-semibold text-white">Prompt Builder</h2>
        </div>
        <p className="text-sm text-gray-400">
          Build effective prompts using templates or create your own
        </p>
      </div>

      <div className="flex-1 flex">
        {/* Template Library */}
        <div className="w-1/3 border-r border-white/10">
          <div className="p-4">
            <h3 className="font-medium text-white mb-3">Templates</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'bg-white/20 border border-white/30'
                        : 'bg-white/5 hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-white text-sm">{template.title}</h4>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400">{template.description}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Prompt Builder */}
        <div className="flex-1 p-4">
          {selectedTemplate ? (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">Variables</h3>
                <div className="space-y-3">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm text-gray-300 mb-1">
                        {variable}
                      </label>
                      <input
                        type="text"
                        value={variables[variable] || ''}
                        onChange={(e) => setVariables(prev => ({
                          ...prev,
                          [variable]: e.target.value
                        }))}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder:text-gray-400"
                        placeholder={`Enter ${variable}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-white">Generated Prompt</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyPrompt}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-lg p-3">
                  <p className="text-white text-sm whitespace-pre-wrap">
                    {buildPrompt()}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              <div className="mb-4">
                <h3 className="font-medium text-white mb-2">Custom Prompt</h3>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Write your custom prompt here..."
                  className="bg-white/10 border border-white/20 text-white placeholder:text-gray-400 min-h-[200px]"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(customPrompt)}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
                <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use Prompt
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
