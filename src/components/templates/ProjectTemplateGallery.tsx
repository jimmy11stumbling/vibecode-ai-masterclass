
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Star, Download, Code, Globe, Smartphone, Database, Bot } from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  downloads: number;
  thumbnail: string;
  features: string[];
  techStack: string[];
  estimatedTime: string;
  author: string;
  lastUpdated: Date;
}

const sampleTemplates: ProjectTemplate[] = [
  {
    id: 'react-dashboard',
    name: 'Admin Dashboard',
    description: 'Modern admin dashboard with charts, tables, and user management',
    category: 'web-app',
    tags: ['dashboard', 'admin', 'charts'],
    difficulty: 'Intermediate',
    rating: 4.8,
    downloads: 1250,
    thumbnail: '/api/placeholder/300/200',
    features: ['User Authentication', 'Data Visualization', 'Role Management', 'Dark Mode'],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Chart.js'],
    estimatedTime: '2-3 hours',
    author: 'AI Templates',
    lastUpdated: new Date('2024-01-15')
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Full-featured online store with shopping cart and payments',
    category: 'web-app',
    tags: ['ecommerce', 'shopping', 'payments'],
    difficulty: 'Advanced',
    rating: 4.9,
    downloads: 890,
    thumbnail: '/api/placeholder/300/200',
    features: ['Product Catalog', 'Shopping Cart', 'Payment Integration', 'Order Management'],
    techStack: ['React', 'Node.js', 'Stripe', 'PostgreSQL'],
    estimatedTime: '4-6 hours',
    author: 'Community',
    lastUpdated: new Date('2024-01-10')
  },
  {
    id: 'blog-platform',
    name: 'Blog Platform',
    description: 'Content management system for bloggers and writers',
    category: 'cms',
    tags: ['blog', 'cms', 'content'],
    difficulty: 'Beginner',
    rating: 4.6,
    downloads: 2100,
    thumbnail: '/api/placeholder/300/200',
    features: ['Rich Text Editor', 'Post Scheduling', 'Comments', 'SEO Optimization'],
    techStack: ['React', 'Markdown', 'Supabase'],
    estimatedTime: '1-2 hours',
    author: 'AI Templates',
    lastUpdated: new Date('2024-01-12')
  },
  {
    id: 'mobile-app',
    name: 'Mobile App Starter',
    description: 'Cross-platform mobile app with navigation and state management',
    category: 'mobile',
    tags: ['mobile', 'react-native', 'cross-platform'],
    difficulty: 'Intermediate',
    rating: 4.7,
    downloads: 675,
    thumbnail: '/api/placeholder/300/200',
    features: ['Navigation', 'State Management', 'Push Notifications', 'Offline Support'],
    techStack: ['React Native', 'Expo', 'Redux'],
    estimatedTime: '3-4 hours',
    author: 'Mobile Team',
    lastUpdated: new Date('2024-01-08')
  },
  {
    id: 'ai-chatbot',
    name: 'AI Chatbot',
    description: 'Intelligent chatbot with natural language processing',
    category: 'ai',
    tags: ['ai', 'chatbot', 'nlp'],
    difficulty: 'Advanced',
    rating: 4.9,
    downloads: 445,
    thumbnail: '/api/placeholder/300/200',
    features: ['NLP Processing', 'Context Awareness', 'Multi-language', 'API Integration'],
    techStack: ['React', 'OpenAI', 'WebSocket', 'Node.js'],
    estimatedTime: '4-5 hours',
    author: 'AI Team',
    lastUpdated: new Date('2024-01-14')
  },
  {
    id: 'portfolio-site',
    name: 'Portfolio Website',
    description: 'Personal portfolio website for developers and designers',
    category: 'portfolio',
    tags: ['portfolio', 'personal', 'showcase'],
    difficulty: 'Beginner',
    rating: 4.5,
    downloads: 3200,
    thumbnail: '/api/placeholder/300/200',
    features: ['Project Showcase', 'Contact Form', 'Resume Download', 'Blog Integration'],
    techStack: ['React', 'Tailwind CSS', 'Framer Motion'],
    estimatedTime: '1-2 hours',
    author: 'Design Team',
    lastUpdated: new Date('2024-01-11')
  }
];

export const ProjectTemplateGallery: React.FC = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>(sampleTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>(sampleTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All Templates', icon: Globe },
    { id: 'web-app', name: 'Web Apps', icon: Code },
    { id: 'mobile', name: 'Mobile Apps', icon: Smartphone },
    { id: 'cms', name: 'CMS', icon: Database },
    { id: 'ai', name: 'AI/ML', icon: Bot },
    { id: 'portfolio', name: 'Portfolio', icon: Star }
  ];

  useEffect(() => {
    let filtered = templates;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(template => template.difficulty === selectedDifficulty);
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, selectedCategory, selectedDifficulty, templates]);

  const handleUseTemplate = async (template: ProjectTemplate) => {
    try {
      toast({
        title: "Creating Project",
        description: `Setting up ${template.name}...`,
      });

      // Simulate project creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      toast({
        title: "Project Created!",
        description: `${template.name} has been set up successfully.`,
      });

      // Update download count
      setTemplates(prev =>
        prev.map(t =>
          t.id === template.id
            ? { ...t, downloads: t.downloads + 1 }
            : t
        )
      );
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: "Failed to create project from template",
        variant: "destructive"
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Templates</h1>
          <p className="text-gray-600">Start your project with pre-built templates</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
      </div>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center space-x-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-gray-100 relative">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent(
                          `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af">${template.name}</text></svg>`
                        )}`;
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <Badge className={getDifficultyColor(template.difficulty)}>
                        {template.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {template.description}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        {renderStars(template.rating)}
                        <span>{template.rating}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{template.downloads.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Tech Stack:</span>
                        <p className="text-gray-600">{template.techStack.join(', ')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Setup Time:</span>
                        <span className="text-gray-600 ml-2">{template.estimatedTime}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="font-medium text-sm">Key Features:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {template.features.slice(0, 3).map((feature) => (
                          <li key={feature} className="flex items-center space-x-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <Button
                      onClick={() => handleUseTemplate(template)}
                      className="w-full"
                    >
                      Use This Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No templates found matching your criteria</p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
