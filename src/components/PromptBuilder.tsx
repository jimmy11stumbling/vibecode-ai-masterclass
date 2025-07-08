
import React, { useState } from 'react';
import { Wand2, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export const PromptBuilder = () => {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');

  const templates = [
    {
      id: 'react-component',
      title: 'React Component',
      description: 'Create a reusable React component',
      prompt: 'Create a React component that'
    },
    {
      id: 'api-integration',
      title: 'API Integration',
      description: 'Integrate with external APIs',
      prompt: 'Build an API integration that'
    },
    {
      id: 'state-management',
      title: 'State Management',
      description: 'Implement state management logic',
      prompt: 'Implement state management for'
    },
    {
      id: 'styling',
      title: 'CSS Styling',
      description: 'Style components with CSS',
      prompt: 'Style the component with'
    },
    {
      id: 'testing',
      title: 'Testing',
      description: 'Write tests for components',
      prompt: 'Write tests for'
    },
    {
      id: 'optimization',
      title: 'Performance',
      description: 'Optimize for performance',
      prompt: 'Optimize the performance of'
    }
  ];

  const toggleTemplate = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const buildPrompt = () => {
    const selectedPrompts = templates
      .filter(t => selectedTemplates.includes(t.id))
      .map(t => t.prompt)
      .join(', ');
    
    return selectedPrompts + (customPrompt ? ` ${customPrompt}` : '');
  };

  const copyPrompt = () => {
    navigator.clipboard.writeText(buildPrompt());
  };

  return (
    <ScrollArea className="h-full p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Prompt Builder</h3>
          <p className="text-gray-400 text-sm">
            Select templates and customize your prompt for better AI responses
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-white mb-3">Templates</h4>
          <div className="grid grid-cols-2 gap-3">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => toggleTemplate(template.id)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedTemplates.includes(template.id)
                    ? 'bg-purple-500/20 border-purple-400/50'
                    : 'bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-white">{template.title}</h5>
                  {selectedTemplates.includes(template.id) && (
                    <Badge className="bg-purple-500 text-white">Selected</Badge>
                  )}
                </div>
                <p className="text-xs text-gray-400">{template.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-white mb-3">Custom Instructions</h4>
          <Textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="Add your specific requirements here..."
            className="bg-slate-800 border-slate-600 text-white placeholder:text-slate-400"
            rows={4}
          />
        </div>

        <div>
          <h4 className="text-sm font-medium text-white mb-3">Generated Prompt</h4>
          <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <p className="text-sm text-gray-300 mb-4">
              {buildPrompt() || 'Select templates and add custom instructions to build your prompt'}
            </p>
            <div className="flex space-x-2">
              <Button
                size="sm"
                onClick={copyPrompt}
                disabled={!buildPrompt()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!buildPrompt()}
                className="border-slate-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-white mb-3">Tips</h4>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <ul className="text-sm text-blue-300 space-y-2">
              <li>• Be specific about what you want to build</li>
              <li>• Mention the technologies you want to use</li>
              <li>• Include any constraints or requirements</li>
              <li>• Ask for explanations if you want to learn</li>
            </ul>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};
