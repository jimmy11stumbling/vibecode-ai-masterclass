
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Save, 
  Wand2, 
  Code2,
  Database,
  Zap,
  Brain,
  FileText,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  category: string;
  tags: string[];
}

interface PromptVariable {
  name: string;
  value: string;
  description?: string;
}

export const PromptBuilder: React.FC = () => {
  const [activeTemplate, setActiveTemplate] = useState<PromptTemplate | null>(null);
  const [variables, setVariables] = useState<PromptVariable[]>([]);
  const [builtPrompt, setBuiltPrompt] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('templates');
  const { toast } = useToast();

  const defaultTemplates: PromptTemplate[] = [
    {
      id: '1',
      name: 'React Component Generator',
      description: 'Generate a React component with TypeScript and Tailwind CSS',
      template: `Create a React component called {{componentName}} that {{functionality}}. 

Requirements:
- Use TypeScript with proper type definitions
- Use Tailwind CSS for styling
- Include proper props interface
- Add JSDoc comments
- Follow React best practices
- Make it responsive and accessible

Additional requirements: {{additionalRequirements}}`,
      variables: ['componentName', 'functionality', 'additionalRequirements'],
      category: 'React',
      tags: ['component', 'typescript', 'tailwind']
    },
    {
      id: '2',
      name: 'API Integration',
      description: 'Create API integration with error handling',
      template: `Create an API integration for {{apiName}} that {{apiPurpose}}.

Requirements:
- Use fetch or axios for HTTP requests
- Include proper error handling
- Add TypeScript types for API responses
- Implement loading states
- Add retry mechanism if needed
- Include proper authentication: {{authMethod}}

Endpoints to integrate: {{endpoints}}`,
      variables: ['apiName', 'apiPurpose', 'authMethod', 'endpoints'],
      category: 'API',
      tags: ['api', 'integration', 'typescript']
    },
    {
      id: '3',
      name: 'Database Schema',
      description: 'Design database schema with relationships',
      template: `Design a database schema for {{entityName}} with the following requirements:

Entity Description: {{entityDescription}}

Required Fields: {{requiredFields}}

Relationships: {{relationships}}

Include:
- Primary and foreign keys
- Proper data types
- Constraints and validations
- Indexes for performance
- RLS policies if using Supabase`,
      variables: ['entityName', 'entityDescription', 'requiredFields', 'relationships'],
      category: 'Database',
      tags: ['database', 'schema', 'supabase']
    },
    {
      id: '4',
      name: 'Full-Stack Feature',
      description: 'Create a complete full-stack feature',
      template: `Create a complete full-stack feature for {{featureName}} that allows users to {{userAction}}.

Frontend Requirements:
- React components with TypeScript
- Responsive design with Tailwind CSS
- Form validation and error handling
- Loading states and user feedback

Backend Requirements:
- Database schema and tables
- API endpoints with proper validation
- Error handling and logging
- Authentication and authorization

User Flow: {{userFlow}}
Business Logic: {{businessLogic}}`,
      variables: ['featureName', 'userAction', 'userFlow', 'businessLogic'],
      category: 'Full-Stack',
      tags: ['full-stack', 'feature', 'complete']
    }
  ];

  const [templates] = useState<PromptTemplate[]>(defaultTemplates);

  useEffect(() => {
    if (activeTemplate) {
      const newVariables = activeTemplate.variables.map(varName => ({
        name: varName,
        value: variables.find(v => v.name === varName)?.value || '',
        description: getVariableDescription(varName)
      }));
      setVariables(newVariables);
      buildPrompt(activeTemplate.template, newVariables);
    }
  }, [activeTemplate]);

  const getVariableDescription = (varName: string): string => {
    const descriptions: Record<string, string> = {
      componentName: 'Name of the React component (e.g., UserProfile)',
      functionality: 'What the component should do (e.g., display user information)',
      additionalRequirements: 'Any specific requirements or features',
      apiName: 'Name of the API service (e.g., User API)',
      apiPurpose: 'What the API integration should accomplish',
      authMethod: 'Authentication method (e.g., Bearer token, API key)',
      endpoints: 'List of API endpoints to integrate',
      entityName: 'Name of the database entity (e.g., User, Product)',
      entityDescription: 'Description of what this entity represents',
      requiredFields: 'List of required fields and their types',
      relationships: 'How this entity relates to others',
      featureName: 'Name of the feature (e.g., User Management)',
      userAction: 'What users can do with this feature',
      userFlow: 'Step-by-step user interaction flow',
      businessLogic: 'Core business rules and logic'
    };
    return descriptions[varName] || 'Variable description';
  };

  const buildPrompt = (template: string, vars: PromptVariable[]) => {
    let prompt = template;
    vars.forEach(variable => {
      const placeholder = `{{${variable.name}}}`;
      prompt = prompt.replace(new RegExp(placeholder, 'g'), variable.value || `[${variable.name}]`);
    });
    setBuiltPrompt(prompt);
  };

  const handleVariableChange = (varName: string, value: string) => {
    const updatedVariables = variables.map(v => 
      v.name === varName ? { ...v, value } : v
    );
    setVariables(updatedVariables);
    
    if (activeTemplate) {
      buildPrompt(activeTemplate.template, updatedVariables);
    }
  };

  const handleCopyPrompt = async (prompt: string) => {
    try {
      await navigator.clipboard.writeText(prompt);
      toast({
        title: "Prompt copied",
        description: "Prompt has been copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy prompt to clipboard",
        variant: "destructive"
      });
    }
  };

  const handleSaveTemplate = () => {
    toast({
      title: "Template saved",
      description: "Custom template has been saved locally",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'React':
        return <Code2 className="w-4 h-4" />;
      case 'API':
        return <Zap className="w-4 h-4" />;
      case 'Database':
        return <Database className="w-4 h-4" />;
      case 'Full-Stack':
        return <Brain className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full bg-slate-900 rounded-lg border border-slate-700 flex flex-col">
      <div className="border-b border-slate-700 p-4">
        <h3 className="font-semibold text-white mb-2">Prompt Builder</h3>
        <p className="text-sm text-slate-400">Build sophisticated prompts for AI code generation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="templates" className="data-[state=active]:bg-slate-700">
              <Wand2 className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="builder" className="data-[state=active]:bg-slate-700">
              <Settings className="w-4 h-4 mr-2" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="custom" className="data-[state=active]:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              Custom
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="templates" className="h-full m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {templates.map((template) => (
                  <Card
                    key={template.id}
                    className={`p-4 cursor-pointer transition-all ${
                      activeTemplate?.id === template.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-600 bg-slate-800 hover:bg-slate-700'
                    }`}
                    onClick={() => setActiveTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        {getCategoryIcon(template.category)}
                        <h4 className="font-medium text-white">{template.name}</h4>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-slate-400 mb-3">{template.description}</p>
                    
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="builder" className="h-full m-0">
            {activeTemplate ? (
              <div className="h-full flex flex-col">
                <div className="border-b border-slate-700 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-white">{activeTemplate.name}</h4>
                      <p className="text-sm text-slate-400">{activeTemplate.description}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCopyPrompt(builtPrompt)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Prompt
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="h-full flex">
                    <div className="w-1/3 border-r border-slate-700 overflow-hidden">
                      <div className="p-4 border-b border-slate-700">
                        <h5 className="font-medium text-white">Variables</h5>
                      </div>
                      <ScrollArea className="flex-1">
                        <div className="p-4 space-y-4">
                          {variables.map((variable) => (
                            <div key={variable.name}>
                              <label className="block text-sm font-medium text-white mb-1">
                                {variable.name}
                              </label>
                              <p className="text-xs text-slate-400 mb-2">{variable.description}</p>
                              <Textarea
                                value={variable.value}
                                onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                                placeholder={`Enter ${variable.name}...`}
                                className="bg-slate-800 border-slate-600 text-white text-sm min-h-[80px]"
                              />
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <div className="p-4 border-b border-slate-700">
                        <h5 className="font-medium text-white">Generated Prompt</h5>
                      </div>
                      <ScrollArea className="flex-1">
                        <div className="p-4">
                          <pre className="text-sm text-slate-100 whitespace-pre-wrap font-mono">
                            {builtPrompt}
                          </pre>
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <Wand2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-semibold mb-2">Select a Template</h4>
                  <p className="text-sm">Choose a template from the Templates tab to start building</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="custom" className="h-full m-0">
            <div className="h-full flex flex-col">
              <div className="border-b border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-medium text-white">Custom Prompt</h5>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyPrompt(customPrompt)}
                      className="text-slate-400 hover:text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSaveTemplate}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-4">
                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Write your custom prompt here..."
                  className="w-full h-full bg-slate-800 border-slate-600 text-white resize-none font-mono"
                />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
