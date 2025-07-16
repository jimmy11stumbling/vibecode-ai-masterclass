
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Star, 
  Download, 
  GitBranch,
  Code,
  Database,
  Globe,
  Smartphone,
  Zap,
  Users,
  ShoppingCart,
  Calendar,
  MessageSquare,
  BarChart3,
  FileText,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: 'web' | 'mobile' | 'desktop' | 'api' | 'fullstack';
  tags: string[];
  techStack: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  rating: number;
  downloads: number;
  author: string;
  thumbnail: string;
  features: string[];
  files: {
    path: string;
    content: string;
    type: 'component' | 'service' | 'config' | 'style';
  }[];
  dependencies: string[];
  setupInstructions: string[];
  demoUrl?: string;
  githubUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const defaultTemplates: ProjectTemplate[] = [
  {
    id: 'react-dashboard',
    name: 'React Admin Dashboard',
    description: 'A modern admin dashboard with charts, tables, and user management',
    category: 'web',
    tags: ['dashboard', 'admin', 'charts', 'react'],
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'React Router'],
    difficulty: 'intermediate',
    estimatedTime: '2-3 hours',
    rating: 4.8,
    downloads: 1234,
    author: 'Sovereign IDE',
    thumbnail: '/placeholder.svg',
    features: [
      'Responsive layout',
      'Dark/light mode',
      'Interactive charts',
      'Data tables',
      'User authentication',
      'Role-based access'
    ],
    files: [],
    dependencies: ['react', 'react-router-dom', 'recharts', 'tailwindcss'],
    setupInstructions: [
      'Clone the template',
      'Install dependencies with npm install',
      'Configure environment variables',
      'Run npm start to launch'
    ],
    demoUrl: 'https://demo.example.com',
    githubUrl: 'https://github.com/example/react-dashboard',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Full-featured online store with cart, checkout, and payment integration',
    category: 'fullstack',
    tags: ['ecommerce', 'store', 'payment', 'nextjs'],
    techStack: ['Next.js', 'TypeScript', 'Prisma', 'Stripe', 'PostgreSQL'],
    difficulty: 'advanced',
    estimatedTime: '1-2 weeks',
    rating: 4.9,
    downloads: 856,
    author: 'Sovereign IDE',
    thumbnail: '/placeholder.svg',
    features: [
      'Product catalog',
      'Shopping cart',
      'Secure checkout',
      'Payment processing',
      'Order management',
      'Admin panel'
    ],
    files: [],
    dependencies: ['next', 'prisma', '@stripe/stripe-js', 'bcrypt'],
    setupInstructions: [
      'Set up database',
      'Configure Stripe keys',
      'Run database migrations',
      'Set up admin user'
    ],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'mobile-weather',
    name: 'Weather App',
    description: 'Cross-platform weather application with location services',
    category: 'mobile',
    tags: ['weather', 'mobile', 'location', 'api'],
    techStack: ['React Native', 'Expo', 'TypeScript', 'Weather API'],
    difficulty: 'beginner',
    estimatedTime: '1-2 days',
    rating: 4.6,
    downloads: 432,
    author: 'Sovereign IDE',
    thumbnail: '/placeholder.svg',
    features: [
      'Current weather',
      'Weekly forecast',
      'Location detection',
      'Weather maps',
      'Push notifications'
    ],
    files: [],
    dependencies: ['expo', 'react-native', 'expo-location'],
    setupInstructions: [
      'Install Expo CLI',
      'Get weather API key',
      'Configure API endpoint',
      'Test on device'
    ],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-16')
  },
  {
    id: 'chat-app',
    name: 'Real-time Chat Application',
    description: 'Multi-room chat app with real-time messaging and file sharing',
    category: 'fullstack',
    tags: ['chat', 'realtime', 'websocket', 'messaging'],
    techStack: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Express'],
    difficulty: 'intermediate',
    estimatedTime: '3-5 days',
    rating: 4.7,
    downloads: 678,
    author: 'Sovereign IDE',
    thumbnail: '/placeholder.svg',
    features: [
      'Real-time messaging',
      'Multiple chat rooms',
      'File sharing',
      'User presence',
      'Message history',
      'Emoji support'
    ],
    files: [],
    dependencies: ['socket.io', 'express', 'mongoose', 'multer'],
    setupInstructions: [
      'Set up MongoDB',
      'Configure socket server',
      'Set up file storage',
      'Configure CORS'
    ],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-14')
  }
];

export const ProjectTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>(defaultTemplates);
  const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>(defaultTemplates);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'rating'>('popular');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    filterAndSortTemplates();
  }, [searchQuery, selectedCategory, selectedDifficulty, sortBy, templates]);

  const filterAndSortTemplates = () => {
    let filtered = templates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort templates
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.downloads - a.downloads;
        case 'recent':
          return b.updatedAt.getTime() - a.updatedAt.getTime();
        case 'rating':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredTemplates(filtered);
  };

  const handleUseTemplate = (template: ProjectTemplate) => {
    toast({
      title: "Template Selected",
      description: `Creating project from "${template.name}" template`,
    });
    
    // Here you would integrate with the project creation system
    console.log('Creating project from template:', template);
  };

  const handleCreateTemplate = () => {
    setShowCreateForm(true);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'web': return <Globe className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'api': return <Code className="w-4 h-4" />;
      case 'fullstack': return <Database className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFeatureIcon = (feature: string) => {
    const icons: Record<string, React.ReactNode> = {
      'dashboard': <BarChart3 className="w-4 h-4" />,
      'ecommerce': <ShoppingCart className="w-4 h-4" />,
      'chat': <MessageSquare className="w-4 h-4" />,
      'calendar': <Calendar className="w-4 h-4" />,
      'auth': <Users className="w-4 h-4" />,
      'api': <Code className="w-4 h-4" />,
      'realtime': <Zap className="w-4 h-4" />
    };
    
    return icons[feature.toLowerCase()] || <FileText className="w-4 h-4" />;
  };

  return (
    <div className="h-full bg-slate-900 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <GitBranch className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">Project Templates</h2>
        </div>
        <Button onClick={handleCreateTemplate} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="bg-slate-800 border-slate-700 mb-6">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web">Web App</SelectItem>
                <SelectItem value="mobile">Mobile App</SelectItem>
                <SelectItem value="api">API/Backend</SelectItem>
                <SelectItem value="fullstack">Full Stack</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[150px] bg-slate-700 border-slate-600">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[140px] bg-slate-700 border-slate-600">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(template.category)}
                    <CardTitle className="text-sm text-white">{template.name}</CardTitle>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-slate-400">{template.rating}</span>
                  </div>
                </div>
                <CardDescription className="text-xs">{template.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge 
                    variant="secondary" 
                    className={`${getDifficultyColor(template.difficulty)} text-white text-xs`}
                  >
                    {template.difficulty}
                  </Badge>
                  <span className="text-xs text-slate-400">{template.estimatedTime}</span>
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.techStack.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs border-slate-600">
                      {tech}
                    </Badge>
                  ))}
                  {template.techStack.length > 3 && (
                    <Badge variant="outline" className="text-xs border-slate-600">
                      +{template.techStack.length - 3}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-xs font-medium text-white">Features:</h4>
                  <div className="space-y-1">
                    {template.features.slice(0, 3).map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <div className="w-1 h-1 bg-green-400 rounded-full" />
                        <span className="text-xs text-slate-300">{feature}</span>
                      </div>
                    ))}
                    {template.features.length > 3 && (
                      <div className="text-xs text-slate-400">
                        +{template.features.length - 3} more features
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>{template.downloads}</span>
                  </div>
                  <span>by {template.author}</span>
                </div>
                
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleUseTemplate(template)}
                  >
                    Use Template
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-slate-600"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <Eye className="w-3 h-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No templates found</h3>
            <p className="text-slate-400">Try adjusting your search criteria or create a new template</p>
          </div>
        )}
      </ScrollArea>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-700 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{selectedTemplate.name}</CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ×
                </Button>
              </div>
              <CardDescription>{selectedTemplate.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white text-sm">Category</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getCategoryIcon(selectedTemplate.category)}
                    <span className="text-slate-300 capitalize">{selectedTemplate.category}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-white text-sm">Difficulty</Label>
                  <Badge 
                    className={`${getDifficultyColor(selectedTemplate.difficulty)} text-white mt-1`}
                  >
                    {selectedTemplate.difficulty}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-white text-sm">Tech Stack</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedTemplate.techStack.map((tech) => (
                    <Badge key={tech} variant="outline" className="border-slate-600">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div>
                <Label className="text-white text-sm">Features</Label>
                <ul className="mt-2 space-y-1">
                  {selectedTemplate.features.map((feature) => (
                    <li key={feature} className="flex items-center space-x-2 text-slate-300">
                      <div className="w-1 h-1 bg-green-400 rounded-full" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <Label className="text-white text-sm">Setup Instructions</Label>
                <ol className="mt-2 space-y-1">
                  {selectedTemplate.setupInstructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-2 text-slate-300">
                      <span className="text-sm font-mono text-blue-400">{index + 1}.</span>
                      <span className="text-sm">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  onClick={() => {
                    handleUseTemplate(selectedTemplate);
                    setSelectedTemplate(null);
                  }}
                >
                  Use This Template
                </Button>
                {selectedTemplate.demoUrl && (
                  <Button variant="outline" className="border-slate-600">
                    View Demo
                  </Button>
                )}
                {selectedTemplate.githubUrl && (
                  <Button variant="outline" className="border-slate-600">
                    <GitBranch className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
