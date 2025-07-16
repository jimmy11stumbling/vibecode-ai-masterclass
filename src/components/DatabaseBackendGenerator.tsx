
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Database,
  Server,
  Code,
  Zap,
  Play,
  Download,
  Copy,
  CheckCircle,
  Clock,
  Settings,
  FileText,
  Globe,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { databaseSchemaGenerator, type DatabaseSchema } from '@/services/databaseSchemaGenerator';
import { apiEndpointGenerator, type APISpecification } from '@/services/apiEndpointGenerator';
import { backendServiceScaffolder, type BackendService } from '@/services/backendServiceScaffolder';

interface DatabaseBackendGeneratorProps {
  onGenerated?: (result: any) => void;
}

export const DatabaseBackendGenerator: React.FC<DatabaseBackendGeneratorProps> = ({
  onGenerated
}) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generatedSchema, setGeneratedSchema] = useState<DatabaseSchema | null>(null);
  const [generatedAPI, setGeneratedAPI] = useState<APISpecification | null>(null);
  const [generatedServices, setGeneratedServices] = useState<BackendService[]>([]);
  const [generatedSQL, setGeneratedSQL] = useState<string>('');
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe the application you want to generate",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Step 1: Generate Database Schema
      setGenerationProgress(20);
      console.log('🗄️ Generating database schema...');
      const schema = databaseSchemaGenerator.generateSchema(prompt);
      setGeneratedSchema(schema);

      // Step 2: Generate SQL
      setGenerationProgress(40);
      console.log('📜 Generating SQL migration...');
      const sql = databaseSchemaGenerator.generateMigrationSQL(schema);
      setGeneratedSQL(sql);

      // Step 3: Generate API Endpoints
      setGenerationProgress(60);
      console.log('🔌 Generating API endpoints...');
      const api = apiEndpointGenerator.generateAPIFromSchema(schema.tables);
      setGeneratedAPI(api);

      // Step 4: Generate Backend Services
      setGenerationProgress(80);
      console.log('🏗️ Generating backend services...');
      const services = [
        backendServiceScaffolder.generateService(prompt, 'crud'),
        backendServiceScaffolder.generateService(prompt, 'auth')
      ];
      setGeneratedServices(services);

      setGenerationProgress(100);

      toast({
        title: "Generation Complete!",
        description: `Generated ${schema.tables.length} tables, ${api.endpoints.length} endpoints, and ${services.length} services`,
      });

      if (onGenerated) {
        onGenerated({
          schema,
          api,
          services,
          sql
        });
      }

    } catch (error) {
      console.error('Generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Content has been copied to your clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const samplePrompts = [
    "Create a task management application with projects, tasks, users, and team collaboration features",
    "Build an e-commerce platform with products, orders, customers, inventory, and payment processing",
    "Design a blog platform with posts, comments, categories, authors, and content management",
    "Create a booking system with appointments, services, customers, staff, and scheduling"
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-6 h-6 text-blue-500" />
            <span>Database & Backend Generator</span>
          </CardTitle>
          <CardDescription>
            Automatically generate database schemas, API endpoints, and backend services from natural language descriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Application Description</label>
            <Textarea
              placeholder="Describe the application you want to create..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px]"
              disabled={isGenerating}
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600">Quick Start Examples:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {samplePrompts.map((sample, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  className="text-left justify-start h-auto p-3 text-gray-600 hover:text-gray-900"
                  onClick={() => setPrompt(sample)}
                  disabled={isGenerating}
                >
                  {sample}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="flex items-center space-x-2"
            >
              {isGenerating ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Generate Backend</span>
                </>
              )}
            </Button>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generation Progress</span>
                <span>{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generated Results */}
      {(generatedSchema || generatedAPI || generatedServices.length > 0) && (
        <Tabs defaultValue="schema" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schema" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Database Schema</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center space-x-2">
              <Globe className="w-4 h-4" />
              <span>API Endpoints</span>
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center space-x-2">
              <Server className="w-4 h-4" />
              <span>Backend Services</span>
            </TabsTrigger>
            <TabsTrigger value="sql" className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>SQL Migration</span>
            </TabsTrigger>
          </TabsList>

          {/* Database Schema Tab */}
          <TabsContent value="schema" className="space-y-4">
            {generatedSchema && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Database Schema</span>
                    <Badge variant="secondary">{generatedSchema.tables.length} Tables</Badge>
                  </CardTitle>
                  <CardDescription>Generated database schema with tables and relationships</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {generatedSchema.tables.map((table, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-lg">{table.name}</h4>
                            <div className="flex space-x-2">
                              <Badge variant="outline" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                RLS
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {table.columns.length} columns
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {table.columns.map((column, colIndex) => (
                              <div key={colIndex} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded">
                                <div className="flex items-center space-x-2">
                                  <span className="font-mono text-sm">{column.name}</span>
                                  <Badge variant="outline" className="text-xs">{column.type}</Badge>
                                  {column.primaryKey && <Badge className="text-xs bg-blue-500">PK</Badge>}
                                  {column.unique && <Badge className="text-xs bg-green-500">UNIQUE</Badge>}
                                  {column.foreignKey && (
                                    <Badge className="text-xs bg-purple-500">
                                      FK → {column.foreignKey.table}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  {column.nullable ? '?' : '!'}
                                  {column.defaultValue && `= ${column.defaultValue}`}
                                </div>
                              </div>
                            ))}
                          </div>

                          {table.rlsPolicies && table.rlsPolicies.length > 0 && (
                            <div className="mt-3">
                              <h5 className="text-sm font-medium mb-2">RLS Policies:</h5>
                              <div className="space-y-1">
                                {table.rlsPolicies.map((policy, policyIndex) => (
                                  <div key={policyIndex} className="text-xs bg-blue-50 p-2 rounded">
                                    <span className="font-semibold">{policy.operation}:</span> {policy.name}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* API Endpoints Tab */}
          <TabsContent value="api" className="space-y-4">
            {generatedAPI && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{generatedAPI.title}</span>
                    <Badge variant="secondary">{generatedAPI.endpoints.length} Endpoints</Badge>
                  </CardTitle>
                  <CardDescription>{generatedAPI.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {generatedAPI.endpoints.map((endpoint, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant={endpoint.method === 'GET' ? 'default' : 
                                        endpoint.method === 'POST' ? 'secondary' :
                                        endpoint.method === 'PUT' ? 'outline' : 'destructive'}
                                className="font-mono"
                              >
                                {endpoint.method}
                              </Badge>
                              <code className="font-mono text-sm">{endpoint.path}</code>
                            </div>
                            {endpoint.authentication && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="w-3 h-3 mr-1" />
                                Auth
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3">{endpoint.description}</p>

                          {endpoint.parameters.length > 0 && (
                            <div className="mb-3">
                              <h5 className="text-sm font-medium mb-1">Parameters:</h5>
                              <div className="space-y-1">
                                {endpoint.parameters.map((param, paramIndex) => (
                                  <div key={paramIndex} className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                      <code>{param.name}</code>
                                      <Badge variant="outline" className="text-xs">{param.type}</Badge>
                                      <Badge variant="outline" className="text-xs">{param.location}</Badge>
                                    </div>
                                    {param.required && <span className="text-red-500">*</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div>
                            <h5 className="text-sm font-medium mb-1">Responses:</h5>
                            <div className="space-y-1">
                              {endpoint.responses.map((response, responseIndex) => (
                                <div key={responseIndex} className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between">
                                  <Badge 
                                    variant={response.statusCode < 300 ? 'default' : 
                                            response.statusCode < 400 ? 'secondary' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {response.statusCode}
                                  </Badge>
                                  <span>{response.description}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  <Separator className="my-4" />
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(apiEndpointGenerator.generateOpenAPISpec(generatedAPI), null, 2))}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy OpenAPI Spec
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadFile(
                        JSON.stringify(apiEndpointGenerator.generateOpenAPISpec(generatedAPI), null, 2),
                        'openapi-spec.json'
                      )}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Spec
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Backend Services Tab */}
          <TabsContent value="services" className="space-y-4">
            {generatedServices.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generatedServices.map((service, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="text-base">{service.name}</span>
                        <Badge variant="secondary">{service.type}</Badge>
                      </CardTitle>
                      <CardDescription>Backend service for {service.type} operations</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Endpoints:</h5>
                          <div className="space-y-1">
                            {service.endpoints.map((endpoint, endpointIndex) => (
                              <div key={endpointIndex} className="text-xs bg-gray-50 p-2 rounded flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline" className="text-xs">{endpoint.method}</Badge>
                                  <code className="text-xs">{endpoint.path}</code>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {service.dependencies.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium mb-1">Dependencies:</h5>
                            <div className="flex flex-wrap gap-1">
                              {service.dependencies.map((dep, depIndex) => (
                                <Badge key={depIndex} variant="outline" className="text-xs">{dep}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(service.implementation.code)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy Code
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadFile(
                              service.implementation.code,
                              `${service.name.toLowerCase().replace(/\s+/g, '-')}.ts`
                            )}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* SQL Migration Tab */}
          <TabsContent value="sql" className="space-y-4">
            {generatedSQL && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>SQL Migration</span>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(generatedSQL)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Copy SQL
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => downloadFile(generatedSQL, 'migration.sql')}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Ready-to-run SQL migration for your database schema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <pre className="text-sm bg-gray-50 p-4 rounded overflow-x-auto">
                      <code>{generatedSQL}</code>
                    </pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
