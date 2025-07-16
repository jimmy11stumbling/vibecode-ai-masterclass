
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Star, 
  Download, 
  Shield, 
  Zap, 
  Database, 
  CreditCard,
  MessageSquare,
  Mail,
  Calendar,
  Users,
  BarChart3,
  Camera,
  Music,
  ShoppingCart,
  Globe,
  Lock,
  CheckCircle,
  ExternalLink,
  Settings,
  Plus,
  Filter,
  Sliders
} from 'lucide-react';

interface Integration {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  provider: string;
  pricing: 'Free' | 'Freemium' | 'Paid';
  rating: number;
  downloads: number;
  features: string[];
  setupTime: string;
  documentation: string;
  isInstalled: boolean;
  tags: string[];
}

const integrations: Integration[] = [
  {
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Accept payments online with comprehensive payment processing',
    category: 'Payments',
    icon: CreditCard,
    provider: 'Stripe',
    pricing: 'Freemium',
    rating: 4.9,
    downloads: 15420,
    features: ['Credit card processing', 'Subscription billing', 'Global payments', 'Fraud protection'],
    setupTime: '10 minutes',
    documentation: 'https://stripe.com/docs',
    isInstalled: false,
    tags: ['payments', 'ecommerce', 'billing']
  },
  {
    id: 'supabase',
    name: 'Supabase Database',
    description: 'Open source Firebase alternative with PostgreSQL database',
    category: 'Database',
    icon: Database,
    provider: 'Supabase',
    pricing: 'Freemium',
    rating: 4.8,
    downloads: 8930,
    features: ['PostgreSQL database', 'Real-time subscriptions', 'Auth', 'Storage'],
    setupTime: '5 minutes',
    documentation: 'https://supabase.com/docs',
    isInstalled: true,
    tags: ['database', 'backend', 'auth']
  },
  {
    id: 'sendgrid',
    name: 'SendGrid Email',
    description: 'Reliable email delivery with marketing and transactional emails',
    category: 'Communication',
    icon: Mail,
    provider: 'SendGrid',
    pricing: 'Freemium',
    rating: 4.7,
    downloads: 12340,
    features: ['Transactional emails', 'Marketing campaigns', 'Analytics', 'Templates'],
    setupTime: '8 minutes',
    documentation: 'https://sendgrid.com/docs',
    isInstalled: false,
    tags: ['email', 'marketing', 'communication']
  },
  {
    id: 'auth0',
    name: 'Auth0 Authentication',
    description: 'Universal authentication & authorization platform',
    category: 'Authentication',
    icon: Shield,
    provider: 'Auth0',
    pricing: 'Freemium',
    rating: 4.8,
    downloads: 9870,
    features: ['Social login', 'Multi-factor auth', 'SSO', 'User management'],
    setupTime: '15 minutes',
    documentation: 'https://auth0.com/docs',
    isInstalled: false,
    tags: ['auth', 'security', 'login']
  },
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Web analytics and user behavior tracking',
    category: 'Analytics',
    icon: BarChart3,
    provider: 'Google',
    pricing: 'Free',
    rating: 4.6,
    downloads: 18520,
    features: ['User tracking', 'Conversion analytics', 'Real-time data', 'Custom reports'],
    setupTime: '5 minutes',
    documentation: 'https://developers.google.com/analytics',
    isInstalled: true,
    tags: ['analytics', 'tracking', 'insights']
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    description: 'Programmable SMS, voice, and messaging APIs',
    category: 'Communication',
    icon: MessageSquare,
    provider: 'Twilio',
    pricing: 'Paid',
    rating: 4.7,
    downloads: 6540,
    features: ['SMS messaging', 'Voice calls', 'WhatsApp API', 'Video calls'],
    setupTime: '12 minutes',
    documentation: 'https://twilio.com/docs',
    isInstalled: false,
    tags: ['sms', 'voice', 'messaging']
  },
  {
    id: 'cloudinary',
    name: 'Cloudinary Media',
    description: 'Cloud-based image and video management',
    category: 'Media',
    icon: Camera,
    provider: 'Cloudinary',
    pricing: 'Freemium',
    rating: 4.5,
    downloads: 4320,
    features: ['Image optimization', 'Video processing', 'CDN delivery', 'AI tagging'],
    setupTime: '10 minutes',
    documentation: 'https://cloudinary.com/docs',
    isInstalled: false,
    tags: ['media', 'images', 'video']
  },
  {
    id: 'google-calendar',
    name: 'Google Calendar',
    description: 'Calendar integration for scheduling and events',
    category: 'Productivity',
    icon: Calendar,
    provider: 'Google',
    pricing: 'Free',
    rating: 4.4,
    downloads: 7890,
    features: ['Event creation', 'Calendar sync', 'Reminders', 'Availability'],
    setupTime: '8 minutes',
    documentation: 'https://developers.google.com/calendar',
    isInstalled: false,
    tags: ['calendar', 'scheduling', 'events']
  }
];

const categories = ['All', ...Array.from(new Set(integrations.map(i => i.category)))];

export const IntegrationMarketplace: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isInstalling, setIsInstalling] = useState<string | null>(null);

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || integration.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = async (integrationId: string) => {
    setIsInstalling(integrationId);
    
    // Simulate installation process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update integration status
    const integration = integrations.find(i => i.id === integrationId);
    if (integration) {
      integration.isInstalled = true;
    }
    
    setIsInstalling(null);
  };

  const getPricingColor = (pricing: Integration['pricing']) => {
    switch (pricing) {
      case 'Free': return 'text-green-400 bg-green-400/10';
      case 'Freemium': return 'text-blue-400 bg-blue-400/10';
      case 'Paid': return 'text-orange-400 bg-orange-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  return (
    <div className="h-full bg-slate-900 text-white flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-slate-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Integration Marketplace</h2>
              <p className="text-slate-400">Extend your application with powerful integrations</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Submit Integration
            </Button>
          </div>
          
          {/* Search and Filters */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search integrations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600"
              />
            </div>
            <div className="flex space-x-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Integrations Grid */}
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIntegrations.map((integration) => {
                const IconComponent = integration.icon;
                return (
                  <Card
                    key={integration.id}
                    className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:shadow-lg ${
                      selectedIntegration?.id === integration.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedIntegration(integration)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-600/20 rounded-lg">
                            <IconComponent className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-base">{integration.name}</CardTitle>
                            <CardDescription className="text-slate-400 text-sm">
                              by {integration.provider}
                            </CardDescription>
                          </div>
                        </div>
                        {integration.isInstalled && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                        {integration.description}
                      </p>
                      
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-slate-400">{integration.rating}</span>
                          </div>
                          <span className="text-slate-500">•</span>
                          <div className="flex items-center space-x-1">
                            <Download className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-400">{integration.downloads.toLocaleString()}</span>
                          </div>
                        </div>
                        <Badge className={getPricingColor(integration.pricing)}>
                          {integration.pricing}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {integration.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button
                        className="w-full"
                        variant={integration.isInstalled ? "outline" : "default"}
                        size="sm"
                        disabled={isInstalling === integration.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!integration.isInstalled) {
                            handleInstall(integration.id);
                          }
                        }}
                      >
                        {isInstalling === integration.id ? (
                          <>Installing...</>
                        ) : integration.isInstalled ? (
                          <>
                            <Settings className="w-4 h-4 mr-1" />
                            Configure
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1" />
                            Install
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Integration Details Sidebar */}
      {selectedIntegration && (
        <div className="w-80 border-l border-slate-700 flex flex-col">
          <div className="border-b border-slate-700 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">{selectedIntegration.name}</h3>
              <Button size="sm" variant="ghost" onClick={() => setSelectedIntegration(null)}>
                ×
              </Button>
            </div>
            <p className="text-slate-400 text-sm">by {selectedIntegration.provider}</p>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Description</h4>
                <p className="text-slate-300 text-sm">{selectedIntegration.description}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Features</h4>
                <ul className="space-y-1">
                  {selectedIntegration.features.map((feature, index) => (
                    <li key={index} className="text-sm text-slate-300 flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Rating</h4>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-slate-300">{selectedIntegration.rating}</span>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Downloads</h4>
                  <span className="text-slate-300">{selectedIntegration.downloads.toLocaleString()}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Setup Time</h4>
                  <span className="text-slate-300">{selectedIntegration.setupTime}</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white mb-1">Pricing</h4>
                  <Badge className={getPricingColor(selectedIntegration.pricing)}>
                    {selectedIntegration.pricing}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedIntegration.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full"
                  variant={selectedIntegration.isInstalled ? "outline" : "default"}
                  disabled={isInstalling === selectedIntegration.id}
                  onClick={() => {
                    if (!selectedIntegration.isInstalled) {
                      handleInstall(selectedIntegration.id);
                    }
                  }}
                >
                  {isInstalling === selectedIntegration.id ? (
                    <>Installing...</>
                  ) : selectedIntegration.isInstalled ? (
                    <>
                      <Settings className="w-4 h-4 mr-1" />
                      Configure
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-1" />
                      Install Integration
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.open(selectedIntegration.documentation, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Documentation
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};
