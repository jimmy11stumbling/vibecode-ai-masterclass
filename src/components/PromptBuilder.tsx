
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Lightbulb, 
  Code, 
  Database, 
  Smartphone, 
  Globe, 
  Bot,
  Zap,
  Copy,
  Download
} from 'lucide-react';

interface PromptTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  template: string;
  icon: React.ComponentType<any>;
}

const promptTemplates: PromptTemplate[] = [
  {
    id: '1',
    title: 'React Component',
    description: 'Create a new React component with TypeScript',
    category: 'frontend',
    template: 'Create a React component called {ComponentName} that {functionality}. Include proper TypeScript types, styling with Tailwind CSS, and handle {state} state management.',
    icon: Code
  },
  {
    id: '2',
    title: 'Full-Stack App',
    description: 'Build a complete application with backend',
    category: 'fullstack',
    template: 'Build a full-stack {appType} application with React frontend and Node.js backend. Include {features} features, database integration with {database}, and authentication.',
    icon: Globe
  },
  {
    id: '3',
    title: 'Database Schema',
    description: 'Design database tables and relationships',
    category: 'backend',
    template: 'Create a database schema for {domain} with tables for {entities}. Include proper relationships, indexes, and constraints. Use {database} as the database.',
    icon: Database
  },
  {
    id: '4',
    title: 'Mobile App',
    description: 'Create a mobile app with Expo',
    category: 'mobile',
    template: 'Create a mobile app for {platform} using Expo and React Native. Include {screens} screens, navigation, and {features} functionality.',
    icon: Smartphone
  },
  {
    id: '5',
    title: 'AI Integration',
    description: 'Add AI capabilities to your app',
    category: 'ai',
    template: 'Integrate {aiService} AI into my application to {aiFunction}. Include proper error handling, streaming responses, and user-friendly interface.',
    icon: Bot
  },
  {
    id: '6',
    title: 'API Integration',
    description: 'Connect to external APIs',
    category: 'integration',
    template: 'Integrate {apiName} API into my application. Include authentication, error handling, and implement {endpoints} endpoints.',
    icon: Zap
  }
];

export const PromptBuilder: React.FC = () => {
  const [customPrompt, setCustomPrompt] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    const templateVars = template.template.match(/\{([^}]+)\}/g) || [];
    const newVariables: Record<string, string> = {};
    templateVars.forEach(varMatch => {
      const varName = varMatch.slice(1, -1);
      newVariables[varName] = '';
    });
    setVariables(newVariables);
  };

  const buildPrompt = () => {
    if (!selectedTemplate) return '';
    
    let prompt = selectedTemplate.template;
    Object.entries(variables).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`\\{${key}\\}`, 'g'), value || `[${key}]`);
    });
    return prompt;
  };

  const copyPrompt = () => {
    const prompt = customPrompt || buildPrompt();
    navigator.clipboard.writeText(prompt);
  };

  const categories = Array.from(new Set(promptTemplates.map(t => t.category)));

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-4">
        <h2 className="text-lg font-semibold">Prompt Builder</h2>
        <p className="text-sm text-slate-400">Create effective prompts for AI-powered development</p>
      </div>

      <Tabs defaultValue="templates" className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="templates" className="data-[state=active]:bg-slate-700">
              Templates
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-slate-700">
              Custom
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="templates" className="flex-1 flex flex-col m-0">
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {categories.map(category => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-slate-300 mb-2 capitalize">
                      {category}
                    </h3>
                    <div className="space-y-2">
                      {promptTemplates
                        .filter(t => t.category === category)
                        .map(template => (
                          <Card 
                            key={template.id}
                            className={`cursor-pointer transition-colors ${
                              selectedTemplate?.id === template.id 
                                ? 'bg-slate-700 border-blue-500' 
                                : 'bg-slate-800 border-slate-600 hover:bg-slate-750'
                            }`}
                            onClick={() => handleTemplateSelect(template)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start space-x-3">
                                <template.icon className="w-5 h-5 text-blue-400 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-white">{template.title}</h4>
                                  <p className="text-sm text-slate-400">{template.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {selectedTemplate && (
            <div className="border-t border-slate-700 p-4 space-y-4">
              <div>
                <h3 className="font-medium text-white mb-2">Configure Template</h3>
                <div className="space-y-2">
                  {Object.keys(variables).map(varName => (
                    <div key={varName}>
                      <label className="text-sm text-slate-300 capitalize">
                        {varName.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                      <input
                        type="text"
                        value={variables[varName]}
                        onChange={(e) => setVariables(prev => ({
                          ...prev,
                          [varName]: e.target.value
                        }))}
                        className="w-full mt-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
                        placeholder={`Enter ${varName}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-white mb-2">Generated Prompt</h3>
                <div className="bg-slate-800 border border-slate-600 rounded p-3">
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">
                    {buildPrompt()}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button size="sm" onClick={copyPrompt} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Prompt
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="custom" className="flex-1 flex flex-col m-0">
          <div className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300">
                  Custom Prompt
                </label>
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Write your custom prompt here..."
                  className="mt-2 bg-slate-800 border-slate-600 text-white min-h-[200px]"
                />
              </div>

              <div className="flex space-x-2">
                <Button size="sm" onClick={copyPrompt} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Prompt
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
