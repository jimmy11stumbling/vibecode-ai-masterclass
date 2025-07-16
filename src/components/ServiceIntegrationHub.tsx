
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Mail, 
  Brain, 
  Cloud, 
  Search, 
  Settings,
  CheckCircle,
  Plus,
  ExternalLink,
  Zap,
  Database,
  Lock,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ServiceIntegration {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: React.ComponentType<any>;
  keywords: string[];
  status: 'available' | 'configured' | 'error';
  requiresApiKey: boolean;
  setupInstructions: string[];
  codeExample: string;
  features: string[];
  pricing?: string;
  documentation?: string;
}

interface ServiceIntegrationHubProps {
  onIntegrationAdd: (integration: ServiceIntegration) => void;
}

export const ServiceIntegrationHub: React.FC<ServiceIntegrationHubProps> = ({
  onIntegrationAdd
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [configuredServices, setConfiguredServices] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const serviceIntegrations: ServiceIntegration[] = [
    // Payment Services
    {
      id: 'stripe',
      name: 'Stripe',
      category: 'payment',
      description: 'Complete payment processing with subscriptions, one-time payments, and customer management',
      icon: CreditCard,
      keywords: ['stripe', 'payment', 'checkout', 'subscription', 'billing'],
      status: 'available',
      requiresApiKey: true,
      setupInstructions: [
        'Sign up at stripe.com',
        'Get your API keys from the dashboard',
        'Add STRIPE_SECRET_KEY to your environment',
        'Configure webhook endpoints'
      ],
      codeExample: `// Stripe Integration
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (items) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: items,
    mode: 'payment',
    success_url: 'https://yoursite.com/success',
    cancel_url: 'https://yoursite.com/cancel',
  });
  return session;
};`,
      features: ['Payment Processing', 'Subscriptions', 'Customer Portal', 'Webhooks'],
      pricing: 'Transaction fees apply',
      documentation: 'https://stripe.com/docs'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      category: 'payment',
      description: 'Alternative payment processing with PayPal checkout integration',
      icon: CreditCard,
      keywords: ['paypal', 'payment', 'checkout'],
      status: 'available',
      requiresApiKey: true,
      setupInstructions: [
        'Create PayPal developer account',
        'Get client ID and secret',
        'Configure sandbox/live environment'
      ],
      codeExample: `// PayPal Integration
const paypal = require('@paypal/checkout-server-sdk');

const createOrder = async (amount) => {
  const request = new paypal.orders.OrdersCreateRequest();
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: { currency_code: 'USD', value: amount }
    }]
  });
  return await client.execute(request);
};`,
      features: ['Payment Processing', 'Express Checkout', 'Recurring Payments'],
      pricing: 'Transaction fees apply',
      documentation: 'https://developer.paypal.com'
    },

    // Email Services
    {
      id: 'sendgrid',
      name: 'SendGrid',
      category: 'email',
      description: 'Reliable email delivery with templates, analytics, and automation',
      icon: Mail,
      keywords: ['sendgrid', 'email', 'smtp', 'transactional'],
      status: 'available',
      requiresApiKey: true,
      setupInstructions: [
        'Sign up at sendgrid.com',
        'Verify your domain',
        'Create API key with mail send permissions',
        'Add SENDGRID_API_KEY to environment'
      ],
      codeExample: `// SendGrid Integration
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: 'your-email@domain.com',
    subject,
    html,
  };
  await sgMail.send(msg);
};`,
      features: ['Transactional Email', 'Templates', 'Analytics', 'A/B Testing'],
      pricing: 'Free tier available',
      documentation: 'https://docs.sendgrid.com'
    },
    {
      id: 'resend',
      name: 'Resend',
      category: 'email',
      description: 'Modern email API built for developers with React email templates',
      icon: Mail,
      keywords: ['resend', 'email', 'react', 'templates'],
      status: 'available',
      requiresApiKey: true,
      setupInstructions: [
        'Sign up at resend.com',
        'Verify your domain',
        'Create API key',
        'Add RESEND_API_KEY to environment'
      ],
      codeExample: `// Resend Integration
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async () => {
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: 'user@example.com',
    subject: 'Hello World',
    html: '<p>Welcome to our service!</p>'
  });
};`,
      features: ['React Email Templates', 'Domain Verification', 'Analytics'],
      pricing: 'Free tier available',
      documentation: 'https://resend.com/docs'
    },

    // AI Services
    {
      id: 'openai',
      name: 'OpenAI',
      category: 'ai',
      description: 'GPT models for text generation, embeddings, and AI-powered features',
      icon: Brain,
      keywords: ['openai', 'gpt', 'ai', 'chatgpt', 'completion'],
      status: 'available',
      requiresApiKey: true,
      setupInstructions: [
        'Sign up at platform.openai.com',
        'Add billing information',
        'Create API key',
        'Add OPENAI_API_KEY to environment'
      ],
      codeExample: `// OpenAI Integration
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateText = async (prompt) => {
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'gpt-4o-mini',
  });
  return completion.choices[0].message.content;
};`,
      features: ['Text Generation', 'Embeddings', 'Image Generation', 'Function Calling'],
      pricing: 'Pay per token',
      documentation: 'https://platform.openai.com/docs'
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      category: 'ai',
      description: 'Claude AI models for advanced reasoning and conversational AI',
      icon: Brain,
      keywords: ['anthropic', 'claude', 'ai', 'reasoning'],
      status: 'available',
      requiresApiKey: true,
      setupInstructions: [
        'Sign up at console.anthropic.com',
        'Create API key',
        'Add ANTHROPIC_API_KEY to environment'
      ],
      codeExample: `// Anthropic Integration
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const generateText = async (prompt) => {
  const completion = await anthropic.messages.create({
    model: 'claude-3-sonnet-20240229',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });
  return completion.content[0].text;
};`,
      features: ['Advanced Reasoning', 'Large Context Window', 'Safety Features'],
      pricing: 'Pay per token',
      documentation: 'https://docs.anthropic.com'
    },

    // Authentication
    {
      id: 'supabase-auth',
      name: 'Supabase Auth',
      category: 'auth',
      description: 'Complete authentication with social logins, email verification, and user management',
      icon: Lock,
      keywords: ['supabase', 'auth', 'authentication', 'login', 'oauth'],
      status: 'configured',
      requiresApiKey: false,
      setupInstructions: [
        'Already configured in your project',
        'Configure social providers in Supabase dashboard',
        'Set up email templates'
      ],
      codeExample: `// Supabase Auth Integration
import { supabase } from '@/lib/supabase';

const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
};

const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};`,
      features: ['Email/Password Auth', 'OAuth Providers', 'MFA', 'User Management'],
      pricing: 'Included with Supabase',
      documentation: 'https://supabase.com/docs/guides/auth'
    },

    // Database
    {
      id: 'supabase-db',
      name: 'Supabase Database',
      category: 'database',
      description: 'PostgreSQL database with real-time subscriptions and row-level security',
      icon: Database,
      keywords: ['supabase', 'database', 'postgresql', 'realtime'],
      status: 'configured',
      requiresApiKey: false,
      setupInstructions: [
        'Already configured in your project',
        'Create tables through dashboard or SQL',
        'Set up Row Level Security policies'
      ],
      codeExample: `// Supabase Database Integration
import { supabase } from '@/lib/supabase';

const fetchData = async () => {
  const { data, error } = await supabase
    .from('your_table')
    .select('*');
  return { data, error };
};

const insertData = async (newData) => {
  const { data, error } = await supabase
    .from('your_table')
    .insert(newData);
  return { data, error };
};`,
      features: ['PostgreSQL', 'Real-time Updates', 'Row Level Security', 'Auto APIs'],
      pricing: 'Included with Supabase',
      documentation: 'https://supabase.com/docs/guides/database'
    },

    // Cloud Services
    {
      id: 'vercel',
      name: 'Vercel',
      category: 'hosting',
      description: 'Fast deployment and hosting with automatic HTTPS and CDN',
      icon: Globe,
      keywords: ['vercel', 'hosting', 'deployment', 'cdn'],
      status: 'available',
      requiresApiKey: false,
      setupInstructions: [
        'Connect your GitHub repository',
        'Deploy automatically on push',
        'Configure custom domains'
      ],
      codeExample: `// Vercel Configuration (vercel.json)
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev"
}`,
      features: ['Auto Deployment', 'CDN', 'Custom Domains', 'Analytics'],
      pricing: 'Free tier available',
      documentation: 'https://vercel.com/docs'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Services', count: serviceIntegrations.length },
    { id: 'payment', name: 'Payments', count: serviceIntegrations.filter(s => s.category === 'payment').length },
    { id: 'email', name: 'Email', count: serviceIntegrations.filter(s => s.category === 'email').length },
    { id: 'ai', name: 'AI Services', count: serviceIntegrations.filter(s => s.category === 'ai').length },
    { id: 'auth', name: 'Authentication', count: serviceIntegrations.filter(s => s.category === 'auth').length },
    { id: 'database', name: 'Database', count: serviceIntegrations.filter(s => s.category === 'database').length },
    { id: 'hosting', name: 'Hosting', count: serviceIntegrations.filter(s => s.category === 'hosting').length }
  ];

  const filteredServices = serviceIntegrations.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleIntegrateService = (service: ServiceIntegration) => {
    if (service.requiresApiKey && service.status !== 'configured') {
      toast({
        title: "API Key Required",
        description: `Please configure your ${service.name} API key in the environment settings`,
        variant: "destructive"
      });
      return;
    }

    setConfiguredServices(prev => new Set([...prev, service.id]));
    onIntegrationAdd(service);
    
    toast({
      title: "Service Integrated",
      description: `${service.name} has been added to your project`,
    });
  };

  const detectKeywordInText = (text: string): ServiceIntegration[] => {
    const detected: ServiceIntegration[] = [];
    const lowerText = text.toLowerCase();
    
    serviceIntegrations.forEach(service => {
      const hasKeyword = service.keywords.some(keyword => 
        lowerText.includes(keyword.toLowerCase())
      );
      if (hasKeyword) {
        detected.push(service);
      }
    });
    
    return detected;
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Service Integration Hub
            </h3>
            <p className="text-sm text-slate-400">Connect external services to your application</p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {serviceIntegrations.length} Services
          </Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services or describe what you need..."
            className="pl-10 bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
          <div className="border-b border-slate-700 px-4">
            <ScrollArea className="w-full">
              <TabsList className="bg-slate-800 w-full justify-start">
                {categories.map(category => (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:bg-slate-700 whitespace-nowrap"
                  >
                    {category.name} ({category.count})
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>
          </div>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-4 grid grid-cols-1 gap-4">
                {filteredServices.map(service => (
                  <Card key={service.id} className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                            <service.icon className="w-5 h-5 text-slate-300" />
                          </div>
                          <div>
                            <CardTitle className="text-white flex items-center space-x-2">
                              <span>{service.name}</span>
                              {service.status === 'configured' && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                            </CardTitle>
                            <p className="text-sm text-slate-400">{service.description}</p>
                          </div>
                        </div>
                        
                        <Badge className={
                          service.status === 'configured' ? 'bg-green-500/20 text-green-400' :
                          service.status === 'error' ? 'bg-red-500/20 text-red-400' :
                          'bg-slate-600/20 text-slate-400'
                        }>
                          {service.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-slate-400 mb-2">Features</p>
                          <div className="flex flex-wrap gap-1">
                            {service.features.map(feature => (
                              <Badge key={feature} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                {feature}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {service.pricing && (
                              <span className="text-xs text-slate-400">{service.pricing}</span>
                            )}
                            {service.documentation && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => window.open(service.documentation, '_blank')}
                                className="text-xs text-slate-400 hover:text-white"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Docs
                              </Button>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => handleIntegrateService(service)}
                            disabled={configuredServices.has(service.id)}
                            className={
                              configuredServices.has(service.id) 
                                ? "bg-green-600/20 text-green-400 border border-green-600/30" 
                                : "bg-purple-600 hover:bg-purple-700"
                            }
                            size="sm"
                          >
                            {configuredServices.has(service.id) ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Integrated
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                Integrate
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredServices.length === 0 && (
                  <div className="text-center text-slate-500 py-8">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No services found matching your criteria</p>
                    <p className="text-sm">Try adjusting your search or category filter</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
