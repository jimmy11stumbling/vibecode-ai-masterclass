
import { supabase } from '@/integrations/supabase/client';

export interface BackendService {
  name: string;
  type: 'crud' | 'auth' | 'business' | 'integration' | 'notification' | 'payment';
  endpoints: ServiceEndpoint[];
  dependencies: string[];
  config: ServiceConfig;
  implementation: ServiceImplementation;
}

export interface ServiceEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  parameters: EndpointParameter[];
  responses: EndpointResponse[];
  middleware: string[];
  authentication: boolean;
}

export interface EndpointParameter {
  name: string;
  type: string;
  required: boolean;
  location: 'path' | 'query' | 'body' | 'header';
  description: string;
  validation?: string;
}

export interface EndpointResponse {
  status: number;
  description: string;
  schema: any;
}

export interface ServiceConfig {
  database?: {
    tables: string[];
    migrations: string[];
  };
  external?: {
    apis: ExternalAPI[];
    webhooks: WebhookConfig[];
  };
  security?: {
    authentication: boolean;
    authorization: string[];
    rateLimit: RateLimitConfig;
  };
  caching?: {
    enabled: boolean;
    ttl: number;
    strategy: 'memory' | 'redis' | 'database';
  };
}

export interface ExternalAPI {
  name: string;
  baseUrl: string;
  authentication: 'apikey' | 'oauth' | 'bearer';
  headers: Record<string, string>;
}

export interface WebhookConfig {
  name: string;
  url: string;
  events: string[];
  secret?: string;
}

export interface RateLimitConfig {
  requests: number;
  window: number; // seconds
  skipSuccessfulRequests: boolean;
}

export interface ServiceImplementation {
  language: 'typescript' | 'python' | 'javascript';
  framework: 'express' | 'fastapi' | 'nestjs' | 'edge-functions';
  code: string;
  tests: string;
  documentation: string;
}

export class BackendServiceScaffolder {
  // Generate service based on requirements
  generateService(requirements: string, serviceType: BackendService['type']): BackendService {
    const service: BackendService = {
      name: this.extractServiceName(requirements),
      type: serviceType,
      endpoints: this.generateEndpoints(requirements, serviceType),
      dependencies: this.determineDependencies(serviceType),
      config: this.generateConfig(requirements, serviceType),
      implementation: this.generateImplementation(requirements, serviceType)
    };

    return service;
  }

  private extractServiceName(requirements: string): string {
    // Extract service name from requirements
    const words = requirements.split(' ').filter(word => word.length > 3);
    return words[0] || 'generated_service';
  }

  private generateEndpoints(requirements: string, type: BackendService['type']): ServiceEndpoint[] {
    const endpoints: ServiceEndpoint[] = [];

    switch (type) {
      case 'crud':
        endpoints.push(...this.generateCRUDEndpoints());
        break;
      case 'auth':
        endpoints.push(...this.generateAuthEndpoints());
        break;
      case 'business':
        endpoints.push(...this.generateBusinessEndpoints(requirements));
        break;
      case 'integration':
        endpoints.push(...this.generateIntegrationEndpoints());
        break;
      case 'notification':
        endpoints.push(...this.generateNotificationEndpoints());
        break;
      case 'payment':
        endpoints.push(...this.generatePaymentEndpoints());
        break;
    }

    return endpoints;
  }

  private generateCRUDEndpoints(): ServiceEndpoint[] {
    return [
      {
        path: '/api/resources',
        method: 'GET',
        description: 'Get all resources',
        parameters: [
          {
            name: 'page',
            type: 'number',
            required: false,
            location: 'query',
            description: 'Page number for pagination'
          },
          {
            name: 'limit',
            type: 'number',
            required: false,
            location: 'query',
            description: 'Number of items per page'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'List of resources',
            schema: { type: 'array', items: { type: 'object' } }
          }
        ],
        middleware: ['cors', 'validation'],
        authentication: true
      },
      {
        path: '/api/resources/:id',
        method: 'GET',
        description: 'Get resource by ID',
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            location: 'path',
            description: 'Resource ID'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Resource details',
            schema: { type: 'object' }
          },
          {
            status: 404,
            description: 'Resource not found',
            schema: { type: 'object', properties: { error: { type: 'string' } } }
          }
        ],
        middleware: ['cors', 'validation'],
        authentication: true
      },
      {
        path: '/api/resources',
        method: 'POST',
        description: 'Create new resource',
        parameters: [
          {
            name: 'body',
            type: 'object',
            required: true,
            location: 'body',
            description: 'Resource data'
          }
        ],
        responses: [
          {
            status: 201,
            description: 'Resource created',
            schema: { type: 'object' }
          }
        ],
        middleware: ['cors', 'validation'],
        authentication: true
      },
      {
        path: '/api/resources/:id',
        method: 'PUT',
        description: 'Update resource',
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            location: 'path',
            description: 'Resource ID'
          },
          {
            name: 'body',
            type: 'object',
            required: true,
            location: 'body',
            description: 'Updated resource data'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Resource updated',
            schema: { type: 'object' }
          }
        ],
        middleware: ['cors', 'validation'],
        authentication: true
      },
      {
        path: '/api/resources/:id',
        method: 'DELETE',
        description: 'Delete resource',
        parameters: [
          {
            name: 'id',
            type: 'string',
            required: true,
            location: 'path',
            description: 'Resource ID'
          }
        ],
        responses: [
          {
            status: 204,
            description: 'Resource deleted',
            schema: {}
          }
        ],
        middleware: ['cors', 'validation'],
        authentication: true
      }
    ];
  }

  private generateAuthEndpoints(): ServiceEndpoint[] {
    return [
      {
        path: '/auth/login',
        method: 'POST',
        description: 'User login',
        parameters: [
          {
            name: 'email',
            type: 'string',
            required: true,
            location: 'body',
            description: 'User email',
            validation: 'email'
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            location: 'body',
            description: 'User password',
            validation: 'min:6'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Login successful',
            schema: { 
              type: 'object',
              properties: {
                token: { type: 'string' },
                user: { type: 'object' }
              }
            }
          }
        ],
        middleware: ['cors', 'validation'],
        authentication: false
      },
      {
        path: '/auth/register',
        method: 'POST',
        description: 'User registration',
        parameters: [
          {
            name: 'email',
            type: 'string',
            required: true,
            location: 'body',
            description: 'User email'
          },
          {
            name: 'password',
            type: 'string',
            required: true,
            location: 'body',
            description: 'User password'
          },
          {
            name: 'name',
            type: 'string',
            required: true,
            location: 'body',
            description: 'User full name'
          }
        ],
        responses: [
          {
            status: 201,
            description: 'User registered',
            schema: { type: 'object' }
          }
        ],
        middleware: ['cors', 'validation'],
        authentication: false
      }
    ];
  }

  private generateBusinessEndpoints(requirements: string): ServiceEndpoint[] {
    // Generate business logic endpoints based on requirements
    return [
      {
        path: '/api/business/process',
        method: 'POST',
        description: 'Execute business process',
        parameters: [
          {
            name: 'data',
            type: 'object',
            required: true,
            location: 'body',
            description: 'Process input data'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Process completed',
            schema: { type: 'object' }
          }
        ],
        middleware: ['cors', 'validation', 'business-rules'],
        authentication: true
      }
    ];
  }

  private generateIntegrationEndpoints(): ServiceEndpoint[] {
    return [
      {
        path: '/api/integrations/webhook',
        method: 'POST',
        description: 'Handle webhook events',
        parameters: [
          {
            name: 'event',
            type: 'object',
            required: true,
            location: 'body',
            description: 'Webhook event data'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Event processed',
            schema: { type: 'object' }
          }
        ],
        middleware: ['cors', 'webhook-validation'],
        authentication: false
      }
    ];
  }

  private generateNotificationEndpoints(): ServiceEndpoint[] {
    return [
      {
        path: '/api/notifications/send',
        method: 'POST',
        description: 'Send notification',
        parameters: [
          {
            name: 'recipient',
            type: 'string',
            required: true,
            location: 'body',
            description: 'Notification recipient'
          },
          {
            name: 'message',
            type: 'string',
            required: true,
            location: 'body',
            description: 'Notification message'
          },
          {
            name: 'type',
            type: 'string',
            required: true,
            location: 'body',
            description: 'Notification type (email, sms, push)'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Notification sent',
            schema: { type: 'object' }
          }
        ],
        middleware: ['cors', 'validation'],
        authentication: true
      }
    ];
  }

  private generatePaymentEndpoints(): ServiceEndpoint[] {
    return [
      {
        path: '/api/payments/process',
        method: 'POST',
        description: 'Process payment',
        parameters: [
          {
            name: 'amount',
            type: 'number',
            required: true,
            location: 'body',
            description: 'Payment amount'
          },
          {
            name: 'currency',
            type: 'string',
            required: true,
            location: 'body',
            description: 'Payment currency'
          },
          {
            name: 'payment_method',
            type: 'string',
            required: true,
            location: 'body',
            description: 'Payment method'
          }
        ],
        responses: [
          {
            status: 200,
            description: 'Payment processed',
            schema: { type: 'object' }
          }
        ],
        middleware: ['cors', 'validation', 'payment-security'],
        authentication: true
      }
    ];
  }

  private determineDependencies(type: BackendService['type']): string[] {
    const baseDependencies = ['@supabase/supabase-js', 'cors'];
    
    switch (type) {
      case 'crud':
        return [...baseDependencies, 'zod', 'express-validator'];
      case 'auth':
        return [...baseDependencies, 'jsonwebtoken', 'bcrypt', 'passport'];
      case 'payment':
        return [...baseDependencies, 'stripe', 'express-rate-limit'];
      case 'notification':
        return [...baseDependencies, 'nodemailer', 'twilio', 'firebase-admin'];
      default:
        return baseDependencies;
    }
  }

  private generateConfig(requirements: string, type: BackendService['type']): ServiceConfig {
    const config: ServiceConfig = {
      security: {
        authentication: true,
        authorization: ['user'],
        rateLimit: {
          requests: 100,
          window: 3600,
          skipSuccessfulRequests: false
        }
      },
      caching: {
        enabled: false,
        ttl: 3600,
        strategy: 'memory'
      }
    };

    if (type === 'crud') {
      config.database = {
        tables: ['resources'],
        migrations: []
      };
    }

    if (type === 'payment') {
      config.external = {
        apis: [
          {
            name: 'stripe',
            baseUrl: 'https://api.stripe.com',
            authentication: 'bearer',
            headers: {}
          }
        ],
        webhooks: []
      };
    }

    return config;
  }

  private generateImplementation(requirements: string, type: BackendService['type']): ServiceImplementation {
    return {
      language: 'typescript',
      framework: 'edge-functions',
      code: this.generateServiceCode(type),
      tests: this.generateTestCode(type),
      documentation: this.generateDocumentation(requirements, type)
    };
  }

  private generateServiceCode(type: BackendService['type']): string {
    const templates = {
      crud: `
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    const { method } = req;
    const url = new URL(req.url);
    
    switch (method) {
      case 'GET':
        return await handleGet(supabase, url);
      case 'POST':
        return await handlePost(supabase, req);
      case 'PUT':
        return await handlePut(supabase, req, url);
      case 'DELETE':
        return await handleDelete(supabase, url);
      default:
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleGet(supabase: any, url: URL) {
  const { data, error } = await supabase.from('resources').select('*');
  
  if (error) throw error;
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handlePost(supabase: any, req: Request) {
  const body = await req.json();
  
  const { data, error } = await supabase.from('resources').insert(body).select();
  
  if (error) throw error;
  
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handlePut(supabase: any, req: Request, url: URL) {
  const id = url.pathname.split('/').pop();
  const body = await req.json();
  
  const { data, error } = await supabase
    .from('resources')
    .update(body)
    .eq('id', id)
    .select();
  
  if (error) throw error;
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleDelete(supabase: any, url: URL) {
  const id = url.pathname.split('/').pop();
  
  const { error } = await supabase.from('resources').delete().eq('id', id);
  
  if (error) throw error;
  
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}
`,
      auth: `
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  );

  try {
    const { method } = req;
    const url = new URL(req.url);
    const path = url.pathname;

    if (path === '/auth/login' && method === 'POST') {
      return await handleLogin(supabase, req);
    }
    
    if (path === '/auth/register' && method === 'POST') {
      return await handleRegister(supabase, req);
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleLogin(supabase: any, req: Request) {
  const { email, password } = await req.json();
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function handleRegister(supabase: any, req: Request) {
  const { email, password, name } = await req.json();
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });
  
  if (error) throw error;
  
  return new Response(JSON.stringify(data), {
    status: 201,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
`
    };

    return templates[type] || templates.crud;
  }

  private generateTestCode(type: BackendService['type']): string {
    return `
// Test suite for ${type} service
import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

Deno.test("Service endpoint tests", async () => {
  // Test GET endpoint
  const response = await fetch("http://localhost:8000/api/test");
  assertEquals(response.status, 200);
  
  // Add more tests...
});
`;
  }

  private generateDocumentation(requirements: string, type: BackendService['type']): string {
    return `
# ${type.toUpperCase()} Service Documentation

## Overview
${requirements}

## Endpoints
- GET /api/resources - Get all resources
- POST /api/resources - Create new resource
- PUT /api/resources/:id - Update resource
- DELETE /api/resources/:id - Delete resource

## Authentication
All endpoints require valid authentication token.

## Rate Limiting
100 requests per hour per user.
`;
  }

  // Save generated service
  async saveGeneratedService(service: BackendService, name: string): Promise<void> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('User authentication required');
    }

    const serviceData = {
      type: 'backend_service',
      service: JSON.parse(JSON.stringify(service)), // Convert to plain object
      generated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('saved_project_specs')
      .insert({
        name,
        description: `Generated ${service.type} service`,
        spec_data: serviceData as any,
        user_id: user.id
      });

    if (error) throw error;
  }

  // Load saved services
  async loadSavedServices(): Promise<Array<{ id: string; name: string; service: BackendService }>> {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return [];

    const { data, error } = await supabase
      .from('saved_project_specs')
      .select('*')
      .eq('user_id', user.id)
      .like('spec_data->type', 'backend_service');

    if (error) return [];

    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      service: (item.spec_data as any).service
    }));
  }
}

export const backendServiceScaffolder = new BackendServiceScaffolder();
