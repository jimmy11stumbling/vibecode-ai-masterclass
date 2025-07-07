
import React, { useState } from 'react';
import { Wand2, Copy, Play, BookOpen, Target, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const promptTemplates = [
  {
    id: 1,
    name: "React Component",
    description: "Create a reusable React component",
    template: "Create a React component called {componentName} that {functionality}. Make it responsive and include TypeScript types. Add proper error handling and accessibility features.",
    tags: ["React", "TypeScript", "Accessibility"]
  },
  {
    id: 2,
    name: "API Endpoint",
    description: "Build a RESTful API endpoint",
    template: "Create a {method} API endpoint for {resource} that {functionality}. Include proper error handling, validation, and response formatting. Use Express.js and TypeScript.",
    tags: ["API", "Express", "Backend"]
  },
  {
    id: 3,
    name: "Database Schema",
    description: "Design database structure",
    template: "Design a database schema for {domain} with tables for {entities}. Include proper relationships, constraints, and indexes. Provide both SQL and Prisma schema.",
    tags: ["Database", "SQL", "Prisma"]
  }
];

export const PromptBuilder = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(promptTemplates[0]);
  const [prompt, setPrompt] = useState(selectedTemplate.template);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const extractVariables = (template: string) => {
    const matches = template.match(/\{([^}]+)\}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const buildPrompt = () => {
    let builtPrompt = prompt;
    Object.entries(variables).forEach(([key, value]) => {
      builtPrompt = builtPrompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return builtPrompt;
  };

  const currentVariables = extractVariables(prompt);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full mb-4">
            <Wand2 className="w-4 h-4" />
            <span className="font-medium">Prompt Builder</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Craft Perfect Prompts</h2>
          <p className="text-gray-400">Use our templates to create effective prompts for any development task</p>
        </div>

        {/* Template Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promptTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => {
                setSelectedTemplate(template);
                setPrompt(template.template);
                setVariables({});
              }}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                selectedTemplate.id === template.id
                  ? 'bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-400/50'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-white">{template.name}</h3>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Code2 className="w-4 h-4 text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-3">{template.description}</p>
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-white/10 text-gray-300">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt Editor */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">Customize Your Prompt</h3>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(buildPrompt())}
                className="border-white/20 text-gray-300 hover:text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Run Prompt
              </Button>
            </div>
          </div>

          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="bg-gray-900/50 border-gray-700/50 text-white min-h-[120px] mb-4 font-mono text-sm"
            placeholder="Write your custom prompt here..."
          />

          {/* Variable Inputs */}
          {currentVariables.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-300 flex items-center">
                <Target className="w-4 h-4 mr-2" />
                Fill in Variables
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentVariables.map((variable) => (
                  <div key={variable}>
                    <label className="block text-sm text-gray-400 mb-1 capitalize">
                      {variable.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    <input
                      type="text"
                      value={variables[variable] || ''}
                      onChange={(e) => setVariables(prev => ({ ...prev, [variable]: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      placeholder={`Enter ${variable}...`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview */}
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
              <BookOpen className="w-4 h-4 mr-2" />
              Preview
            </h4>
            <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4">
              <pre className="text-sm text-gray-100 whitespace-pre-wrap">{buildPrompt()}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
