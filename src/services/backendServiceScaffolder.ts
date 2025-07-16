
import { supabase } from '@/integrations/supabase/client';

export interface ServiceTemplate {
  name: string;
  type: 'edge-function' | 'database-function' | 'trigger' | 'view';
  description: string;
  dependencies: string[];
  files: ServiceFile[];
}

export interface ServiceFile {
  path: string;
  content: string;
  type: 'typescript' | 'sql' | 'json';
}

export interface BackendService {
  id: string;
  name: string;
  type: 'authentication' | 'crud' | 'business-logic' | 'integration' | 'utility';
  description: string;
  template: ServiceTemplate;
  configuration: Record<string, any>;
}

export class BackendServiceScaffolder {
  private templates: Map<string, ServiceTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // CRUD Service Template
    this.templates.set('crud-service', {
      name: 'CRUD Service',
      type: 'edge-function',
      description: 'Complete CRUD operations for a data entity',
      dependencies: ['@supabase/supabase-js'],
      files: [
        {
          path: 'supabase/functions/{{entity_name}}-api/index.ts',
          type: 'typescript',
          content: this.generateCRUDServiceTemplate()
        }
      ]
    });

    // Authentication Service Template
    this.templates.set('auth-service', {
      name: 'Authentication Service',
      type: 'edge-function',
      description: 'User authentication and authorization service',
      dependencies: ['@supabase/supabase-js', 'jsonwebtoken'],
      files: [
        {
          path: 'supabase/functions/auth-service/index.ts',
          type: 'typescript',
          content: this.generateAuthServiceTemplate()
        }
      ]
    });

    // Business Logic Service Template
    this.templates.set('business-logic', {
      name: 'Business Logic Service',
      type: 'edge-function',
      description: 'Custom business logic and workflows',
      dependencies: ['@supabase/supabase-js'],
      files: [
        {
          path: 'supabase/functions/{{service_name}}/index.ts',
          type: 'typescript',
          content: this.generateBusinessLogicTemplate()
        }
      ]
    });

    // Data Processing Service Template
    this.templates.set('data-processing', {
      name: 'Data Processing Service',
      type: 'edge-function',
      description: 'Data transformation and processing workflows',
      dependencies: ['@supabase/supabase-js'],
      files: [
        {
          path: 'supabase/functions/{{service_name}}-processor/index.ts',
          type: 'typescript',
          content: this.generateDataProcessingTemplate()
        }
      ]
    });

    // Database Trigger Template
    this.templates.set('database-trigger', {
      name: 'Database Trigger',
      type: 'trigger',
      description: 'Automated database operations on data changes',
      dependencies: [],
      files: [
        {
          path: 'migrations/{{timestamp}}_{{trigger_name}}.sql',
          type: 'sql',
          content: this.generateTriggerTemplate()
        }
      ]
    });

    // API Integration Service Template
    this.templates.set('api-integration', {
      name: 'API Integration Service',
      type: 'edge-function',
      description: 'External API integration and data synchronization',
      dependencies: ['@supabase/supabase-js'],
      files: [
        {
          path: 'supabase/functions/{{integration_name}}-sync/index.ts',
          type: 'typescript',
          content: this.generateAPIIntegrationTemplate()
        }
      ]
    });
  }

  async generateBackendServices(prompt: string, schema: any): Promise<BackendService[]> {
    console.log('🏗️ Generating backend services from prompt and schema');

    const services: BackendService[] = [];
    
    // Analyze prompt for service requirements
    const serviceRequirements = this.analyzeServiceRequirements(prompt);
    
    // Generate services for each table
    for (const table of schema.tables) {
      if (table.name === 'profiles') continue; // Skip system tables
      
      // Generate CRUD service
      services.push(this.generateCRUDService(table));
      
      // Generate business logic services based on entity type
      const businessServices = this.generateBusinessLogicServices(table, serviceRequirements);
      services.push(...businessServices);
    }

    // Generate integration services
    if (serviceRequirements.includes('email')) {
      services.push(this.generateEmailService());
    }
    
    if (serviceRequirements.includes('payment')) {
      services.push(this.generatePaymentService());
    }
    
    if (serviceRequirements.includes('notification')) {
      services.push(this.generateNotificationService());
    }

    return services;
  }

  private analyzeServiceRequirements(prompt: string): string[] {
    const requirements = [];
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes('email') || promptLower.includes('notification')) {
      requirements.push('email');
    }
    if (promptLower.includes('payment') || promptLower.includes('purchase') || promptLower.includes('checkout')) {
      requirements.push('payment');
    }
    if (promptLower.includes('notification') || promptLower.includes('alert')) {
      requirements.push('notification');
    }
    if (promptLower.includes('search') || promptLower.includes('filter')) {
      requirements.push('search');
    }
    if (promptLower.includes('report') || promptLower.includes('analytics')) {
      requirements.push('analytics');
    }
    if (promptLower.includes('upload') || promptLower.includes('file')) {
      requirements.push('file-upload');
    }

    return requirements;
  }

  private generateCRUDService(table: any): BackendService {
    const entityName = table.name.slice(0, -1); // Remove 's' for singular
    const template = this.templates.get('crud-service')!;
    
    return {
      id: `crud-${table.name}`,
      name: `${this.capitalize(entityName)} CRUD Service`,
      type: 'crud',
      description: `Complete CRUD operations for ${table.name}`,
      template: {
        ...template,
        files: template.files.map(file => ({
          ...file,
          path: file.path.replace('{{entity_name}}', table.name),
          content: this.replacePlaceholders(file.content, {
            entityName: this.capitalize(entityName),
            tableName: table.name,
            columns: table.columns
          })
        }))
      },
      configuration: {
        tableName: table.name,
        entityName,
        hasUserRelation: table.columns.some((col: any) => col.name === 'user_id')
      }
    };
  }

  private generateBusinessLogicServices(table: any, requirements: string[]): BackendService[] {
    const services: BackendService[] = [];
    const entityName = table.name.slice(0, -1);

    // Order processing service for orders table
    if (table.name === 'orders') {
      services.push({
        id: `order-processor`,
        name: 'Order Processing Service',
        type: 'business-logic',
        description: 'Handle order creation, validation, and status updates',
        template: this.generateOrderProcessingService(),
        configuration: {
          tableName: table.name,
          entityName
        }
      });
    }

    // User management service for users table
    if (table.name === 'users' || table.name === 'profiles') {
      services.push({
        id: `user-manager`,
        name: 'User Management Service',
        type: 'business-logic',
        description: 'Handle user registration, profile updates, and permissions',
        template: this.generateUserManagementService(),
        configuration: {
          tableName: table.name,
          entityName
        }
      });
    }

    return services;
  }

  private generateEmailService(): BackendService {
    return {
      id: 'email-service',
      name: 'Email Service',
      type: 'integration',
      description: 'Send transactional emails and notifications',
      template: {
        name: 'Email Service',
        type: 'edge-function',
        description: 'Email sending service with templates',
        dependencies: ['@supabase/supabase-js', 'resend'],
        files: [
          {
            path: 'supabase/functions/send-email/index.ts',
            type: 'typescript',
            content: this.generateEmailServiceTemplate()
          }
        ]
      },
      configuration: {
        provider: 'resend',
        templates: ['welcome', 'password-reset', 'notification']
      }
    };
  }

  private generatePaymentService(): BackendService {
    return {
      id: 'payment-service',
      name: 'Payment Service',
      type: 'integration',
      description: 'Handle payment processing and webhooks',
      template: {
        name: 'Payment Service',
        type: 'edge-function',
        description: 'Stripe payment integration',
        dependencies: ['@supabase/supabase-js', 'stripe'],
        files: [
          {
            path: 'supabase/functions/process-payment/index.ts',
            type: 'typescript',
            content: this.generatePaymentServiceTemplate()
          }
        ]
      },
      configuration: {
        provider: 'stripe',
        currency: 'usd',
        webhookEvents: ['payment_intent.succeeded', 'payment_intent.payment_failed']
      }
    };
  }

  private generateNotificationService(): BackendService {
    return {
      id: 'notification-service',
      name: 'Notification Service',
      type: 'integration',
      description: 'Send push notifications and alerts',
      template: {
        name: 'Notification Service',
        type: 'edge-function',
        description: 'Multi-channel notification service',
        dependencies: ['@supabase/supabase-js'],
        files: [
          {
            path: 'supabase/functions/send-notification/index.ts',
            type: 'typescript',
            content: this.generateNotificationServiceTemplate()
          }
        ]
      },
      configuration: {
        channels: ['email', 'push', 'sms'],
        providers: {
          email: 'resend',
          push: 'firebase',
          sms: 'twilio'
        }
      }
    };
  }

  private generateCRUDServiceTemplate(): string {
    return `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface {{entityName}} {
  {{#each columns}}
  {{#unless (eq name 'id')}}
  {{name}}: {{#eq type 'text'}}string{{/eq}}{{#eq type 'integer'}}number{{/eq}}{{#eq type 'boolean'}}boolean{{/eq}}{{#eq type 'timestamp'}}string{{/eq}}{{#eq type 'uuid'}}string{{/eq}}{{#eq type 'jsonb'}}any{{/eq}};
  {{/unless}}
  {{/each}}
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { method, url } = req;
    const urlObj = new URL(url);
    const pathSegments = urlObj.pathname.split('/').filter(Boolean);
    const id = pathSegments[pathSegments.length - 1];

    switch (method) {
      case 'GET':
        if (id && id !== '{{tableName}}') {
          // Get single item
          const { data, error } = await supabase
            .from('{{tableName}}')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          // Get all items
          const { data, error } = await supabase
            .from('{{tableName}}')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;
          return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

      case 'POST':
        const createData = await req.json();
        const { data: newItem, error: createError } = await supabase
          .from('{{tableName}}')
          .insert(createData)
          .select()
          .single();

        if (createError) throw createError;
        return new Response(JSON.stringify(newItem), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'PUT':
        const updateData = await req.json();
        const { data: updatedItem, error: updateError } = await supabase
          .from('{{tableName}}')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (updateError) throw updateError;
        return new Response(JSON.stringify(updatedItem), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'DELETE':
        const { error: deleteError } = await supabase
          .from('{{tableName}}')
          .delete()
          .eq('id', id);

        if (deleteError) throw deleteError;
        return new Response(null, {
          status: 204,
          headers: corsHeaders
        });

      default:
        return new Response('Method not allowed', { 
          status: 405,
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});`;
  }

  private generateAuthServiceTemplate(): string {
    return `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, email, password, userData } = await req.json();

    switch (action) {
      case 'signup':
        const { data: signupData, error: signupError } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: userData,
          email_confirm: true
        });

        if (signupError) throw signupError;

        return new Response(JSON.stringify({
          user: signupData.user,
          message: 'User created successfully'
        }), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'update-user':
        const { userId, updates } = await req.json();
        const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          updates
        );

        if (updateError) throw updateError;

        return new Response(JSON.stringify(updateData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'delete-user':
        const { userId: deleteUserId } = await req.json();
        const { error: deleteError } = await supabase.auth.admin.deleteUser(deleteUserId);

        if (deleteError) throw deleteError;

        return new Response(JSON.stringify({ message: 'User deleted successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response('Invalid action', { 
          status: 400,
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('Auth service error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});`;
  }

  private generateBusinessLogicTemplate(): string {
    return `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { operation, data } = await req.json();

    switch (operation) {
      case 'process':
        // Custom business logic implementation
        const result = await processBusinessLogic(supabase, data);
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response('Invalid operation', { 
          status: 400,
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('Business logic error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processBusinessLogic(supabase: any, data: any) {
  // Implement your custom business logic here
  console.log('Processing business logic with data:', data);
  
  // Example: validation, calculations, data transformations
  // Return processed result
  return {
    success: true,
    processedData: data,
    timestamp: new Date().toISOString()
  };
}`;
  }

  private generateDataProcessingTemplate(): string {
    return `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { processingType, inputData, options } = await req.json();

    let result;
    switch (processingType) {
      case 'transform':
        result = await transformData(inputData, options);
        break;
      case 'aggregate':
        result = await aggregateData(supabase, inputData, options);
        break;
      case 'validate':
        result = await validateData(inputData, options);
        break;
      default:
        throw new Error('Invalid processing type');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Data processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function transformData(data: any, options: any) {
  // Implement data transformation logic
  return { transformed: true, data, options };
}

async function aggregateData(supabase: any, data: any, options: any) {
  // Implement data aggregation logic
  return { aggregated: true, data, options };
}

async function validateData(data: any, options: any) {
  // Implement data validation logic
  return { valid: true, data, options };
}`;
  }

  private generateTriggerTemplate(): string {
    return `-- Trigger for {{trigger_name}}
CREATE OR REPLACE FUNCTION {{trigger_name}}_function()
RETURNS TRIGGER AS $$
BEGIN
  -- Implement trigger logic here
  -- Example: Update timestamps, log changes, validate data
  
  NEW.updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER {{trigger_name}}_trigger
  BEFORE UPDATE ON {{table_name}}
  FOR EACH ROW
  EXECUTE FUNCTION {{trigger_name}}_function();`;
  }

  private generateAPIIntegrationTemplate(): string {
    return `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, apiData } = await req.json();

    switch (action) {
      case 'sync':
        const syncResult = await syncWithExternalAPI(supabase, apiData);
        return new Response(JSON.stringify(syncResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'webhook':
        const webhookResult = await handleWebhook(supabase, apiData);
        return new Response(JSON.stringify(webhookResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response('Invalid action', { 
          status: 400,
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('API integration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function syncWithExternalAPI(supabase: any, data: any) {
  // Implement external API synchronization
  console.log('Syncing with external API:', data);
  return { synced: true, timestamp: new Date().toISOString() };
}

async function handleWebhook(supabase: any, data: any) {
  // Implement webhook handling
  console.log('Handling webhook:', data);
  return { processed: true, timestamp: new Date().toISOString() };
}`;
  }

  private generateOrderProcessingService(): ServiceTemplate {
    return {
      name: 'Order Processing Service',
      type: 'edge-function',
      description: 'Handle order lifecycle and business logic',
      dependencies: ['@supabase/supabase-js'],
      files: [
        {
          path: 'supabase/functions/process-order/index.ts',
          type: 'typescript',
          content: `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { action, orderId, orderData } = await req.json();

    switch (action) {
      case 'create':
        const newOrder = await createOrder(supabase, orderData);
        return new Response(JSON.stringify(newOrder), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'update-status':
        const updatedOrder = await updateOrderStatus(supabase, orderId, orderData.status);
        return new Response(JSON.stringify(updatedOrder), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'calculate-total':
        const total = await calculateOrderTotal(supabase, orderData.items);
        return new Response(JSON.stringify({ total }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response('Invalid action', { 
          status: 400,
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('Order processing error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function createOrder(supabase: any, orderData: any) {
  const total = await calculateOrderTotal(supabase, orderData.items);
  
  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      total,
      status: 'pending'
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateOrderStatus(supabase: any, orderId: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function calculateOrderTotal(supabase: any, items: any[]) {
  let total = 0;
  for (const item of items) {
    const { data: product } = await supabase
      .from('products')
      .select('price')
      .eq('id', item.product_id)
      .single();
    
    if (product) {
      total += product.price * item.quantity;
    }
  }
  return total;
}`
        }
      ]
    };
  }

  private generateUserManagementService(): ServiceTemplate {
    return {
      name: 'User Management Service',
      type: 'edge-function',
      description: 'Handle user operations and profile management',
      dependencies: ['@supabase/supabase-js'],
      files: [
        {
          path: 'supabase/functions/user-management/index.ts',
          type: 'typescript',
          content: `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, userId, userData } = await req.json();

    switch (action) {
      case 'create-profile':
        const profile = await createUserProfile(supabase, userData);
        return new Response(JSON.stringify(profile), {
          status: 201,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'update-profile':
        const updatedProfile = await updateUserProfile(supabase, userId, userData);
        return new Response(JSON.stringify(updatedProfile), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'deactivate':
        const result = await deactivateUser(supabase, userId);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response('Invalid action', { 
          status: 400,
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('User management error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function createUserProfile(supabase: any, userData: any) {
  const { data, error } = await supabase
    .from('profiles')
    .insert(userData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateUserProfile(supabase: any, userId: string, userData: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...userData, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deactivateUser(supabase: any, userId: string) {
  const { error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { active: false }
  });

  if (error) throw error;
  return { success: true, message: 'User deactivated successfully' };
}`
        }
      ]
    };
  }

  private generateEmailServiceTemplate(): string {
    return `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { template, to, data } = await req.json();

    const emailContent = generateEmailContent(template, data);
    
    const emailResponse = await resend.emails.send({
      from: "Your App <noreply@yourapp.com>",
      to: [to],
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return new Response(JSON.stringify(emailResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Email service error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

function generateEmailContent(template: string, data: any) {
  const templates = {
    welcome: {
      subject: "Welcome to Our Platform!",
      html: \`<h1>Welcome \${data.name}!</h1><p>Thank you for joining us.</p>\`
    },
    'password-reset': {
      subject: "Password Reset Request",
      html: \`<h1>Reset Your Password</h1><p>Click <a href="\${data.resetLink}">here</a> to reset your password.</p>\`
    },
    notification: {
      subject: data.subject || "Notification",
      html: \`<h1>Notification</h1><p>\${data.message}</p>\`
    }
  };

  return templates[template as keyof typeof templates] || templates.notification;
}`;
  }

  private generatePaymentServiceTemplate(): string {
    return `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, amount, currency = 'usd', metadata } = await req.json();

    switch (action) {
      case 'create-payment-intent':
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount * 100, // Convert to cents
          currency,
          metadata
        });

        return new Response(JSON.stringify({
          clientSecret: paymentIntent.client_secret
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      case 'handle-webhook':
        const signature = req.headers.get('stripe-signature');
        const body = await req.text();
        
        const event = stripe.webhooks.constructEvent(
          body,
          signature!,
          Deno.env.get("STRIPE_WEBHOOK_SECRET") || ""
        );

        // Handle the event
        await handleStripeEvent(event);

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

      default:
        return new Response('Invalid action', { 
          status: 400,
          headers: corsHeaders 
        });
    }
  } catch (error) {
    console.error('Payment service error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleStripeEvent(event: any) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Payment succeeded:', event.data.object);
      break;
    case 'payment_intent.payment_failed':
      console.log('Payment failed:', event.data.object);
      break;
    default:
      console.log(\`Unhandled event type: \${event.type}\`);
  }
}`;
  }

  private generateNotificationServiceTemplate(): string {
    return `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { channel, recipient, message, metadata } = await req.json();

    let result;
    switch (channel) {
      case 'email':
        result = await sendEmailNotification(recipient, message, metadata);
        break;
      case 'push':
        result = await sendPushNotification(recipient, message, metadata);
        break;
      case 'sms':
        result = await sendSMSNotification(recipient, message, metadata);
        break;
      default:
        throw new Error('Invalid notification channel');
    }

    // Log notification
    await supabase.from('notifications').insert({
      channel,
      recipient,
      message,
      status: 'sent',
      metadata
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Notification service error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function sendEmailNotification(recipient: string, message: string, metadata: any) {
  // Implement email notification
  console.log('Sending email to:', recipient);
  return { sent: true, channel: 'email' };
}

async function sendPushNotification(recipient: string, message: string, metadata: any) {
  // Implement push notification
  console.log('Sending push notification to:', recipient);
  return { sent: true, channel: 'push' };
}

async function sendSMSNotification(recipient: string, message: string, metadata: any) {
  // Implement SMS notification
  console.log('Sending SMS to:', recipient);
  return { sent: true, channel: 'sms' };
}`;
  }

  private replacePlaceholders(content: string, variables: Record<string, any>): string {
    let result = content;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value);
    }
    return result;
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async saveServices(services: BackendService[]): Promise<string[]> {
    const serviceIds = [];
    
    for (const service of services) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) continue;

        const { data, error } = await supabase
          .from('saved_project_specs')
          .insert({
            user_id: user.id,
            name: service.name,
            description: service.description,
            spec_data: {
              type: 'backend_service',
              service,
              generated_at: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (error) throw error;
        serviceIds.push(data.id);
      } catch (error) {
        console.error('Failed to save service:', service.name, error);
      }
    }

    return serviceIds;
  }

  getTemplate(name: string): ServiceTemplate | undefined {
    return this.templates.get(name);
  }

  listTemplates(): ServiceTemplate[] {
    return Array.from(this.templates.values());
  }
}

export const backendServiceScaffolder = new BackendServiceScaffolder();
