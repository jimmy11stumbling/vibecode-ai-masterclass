
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, Search, Star, Clock, Zap, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template_text: string;
  variables: string[] | null;
  category: string | null;
  usage_count: number | null;
}

interface PromptBuilderProps {
  onPromptGenerated?: (prompt: string) => void;
}

export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  onPromptGenerated
}) => {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    // Mock templates for now
    const mockTemplates: PromptTemplate[] = [
      {
        id: '1',
        name: 'E-commerce Platform',
        description: 'Complete online store with payment processing',
        template_text: 'Create a comprehensive e-commerce platform with {features} and {payment_methods}',
        variables: ['features', 'payment_methods'],
        category: 'E-commerce',
        usage_count: 45
      },
      {
        id: '2',
        name: 'Task Management App',
        description: 'Project management with collaboration tools',
        template_text: 'Build a task management application with {collaboration_features} and {notification_system}',
        variables: ['collaboration_features', 'notification_system'],
        category: 'Productivity',
        usage_count: 32
      },
      {
        id: '3',
        name: 'Social Media Dashboard',
        description: 'Analytics and content management',
        template_text: 'Develop a social media dashboard with {analytics_features} and {platforms}',
        variables: ['analytics_features', 'platforms'],
        category: 'Analytics',
        usage_count: 28
      }
    ];
    setTemplates(mockTemplates);
  };

  const handleTemplateSelect = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setCustomPrompt(template.template_text);
    
    // Initialize variable values
    const vars: Record<string, string> = {};
    const templateVariables = template.variables || [];
    templateVariables.slice(0, 5).forEach(variable => {
      vars[variable] = '';
    });
    setVariableValues(vars);
  };

  const handleVariableChange = (variable: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const generatePrompt = () => {
    let finalPrompt = customPrompt;
    
    // Replace variables with values
    Object.entries(variableValues).forEach(([variable, value]) => {
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      finalPrompt = finalPrompt.replace(regex, value || `[${variable}]`);
    });

    if (onPromptGenerated) {
      onPromptGenerated(finalPrompt);
    }

    toast({
      title: "Prompt Generated",
      description: "Your prompt has been generated and is ready to use!"
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Template copied to clipboard!"
    });
  };

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (template.category && template.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-full flex flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-4">
        <div className="flex items-center space-x-3">
          <Wand2 className="w-6 h-6 text-purple-400" />
          <div>
            <h1 className="text-xl font-bold">Prompt Builder</h1>
            <p className="text-sm text-slate-400">Create powerful prompts from templates or build your own</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="templates" className="h-full flex flex-col">
          <TabsList className="w-full bg-slate-800 border-b border-slate-700">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Prompt</TabsTrigger>
            <TabsTrigger value="builder">Visual Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-6">
              {/* Template Library */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Template Library</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-3">
                      {filteredTemplates.map((template) => (
                        <div
                          key={template.id}
                          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                            selectedTemplate?.id === template.id
                              ? 'bg-purple-900/20 border-purple-500'
                              : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                          }`}
                          onClick={() => handleTemplateSelect(template)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium text-white">{template.name}</h3>
                              <p className="text-sm text-slate-400 mt-1">{template.description}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                {template.category && (
                                  <Badge variant="secondary" className="text-xs">
                                    {template.category}
                                  </Badge>
                                )}
                                <div className="flex items-center space-x-1 text-xs text-slate-400">
                                  <Star className="w-3 h-3" />
                                  <span>{template.usage_count}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(template.template_text);
                              }}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Prompt Customization */}
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle>Customize Prompt</CardTitle>
                  <CardDescription>
                    {selectedTemplate ? 'Customize the selected template' : 'Select a template to customize'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedTemplate && (
                    <>
                      <div>
                        <label className="text-sm font-medium text-slate-300">Template Variables</label>
                        <div className="space-y-2 mt-2">
                          {Object.keys(variableValues).map((variable) => (
                            <div key={variable}>
                              <label className="text-xs text-slate-400 capitalize">
                                {variable.replace('_', ' ')}
                              </label>
                              <Input
                                placeholder={`Enter ${variable}...`}
                                value={variableValues[variable]}
                                onChange={(e) => handleVariableChange(variable, e.target.value)}
                                className="bg-slate-700 border-slate-600 mt-1"
                              />
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-slate-300">Generated Prompt</label>
                        <Textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="bg-slate-700 border-slate-600 mt-2 min-h-[200px]"
                          placeholder="Your customized prompt will appear here..."
                        />
                      </div>

                      <Button
                        onClick={generatePrompt}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Generate Application
                      </Button>
                    </>
                  )}

                  {!selectedTemplate && (
                    <div className="text-center py-8">
                      <Wand2 className="w-12 h-12 mx-auto text-slate-600 mb-4" />
                      <p className="text-slate-400">Select a template to start customizing</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="flex-1 p-6">
            <Card className="bg-slate-800 border-slate-700 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Custom Prompt Builder</CardTitle>
                <CardDescription>
                  Create your own prompt from scratch with AI assistance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Describe your application idea in detail..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="bg-slate-700 border-slate-600 min-h-[300px]"
                />
                <Button
                  onClick={generatePrompt}
                  disabled={!customPrompt.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-500"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Application
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="flex-1 p-6">
            <Card className="bg-slate-800 border-slate-700 max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle>Visual Prompt Builder</CardTitle>
                <CardDescription>
                  Build prompts using a guided interface (Coming Soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                  <h3 className="text-lg font-medium text-slate-300 mb-2">Coming Soon</h3>
                  <p className="text-slate-400">
                    Visual prompt builder with drag-and-drop components
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
