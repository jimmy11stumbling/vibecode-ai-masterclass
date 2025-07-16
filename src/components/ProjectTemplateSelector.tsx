
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { 
  Code, 
  Database, 
  Globe, 
  Smartphone, 
  ShoppingCart, 
  Users, 
  Search,
  Star,
  Download,
  Zap,
  Layers
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  techStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  features: string[];
  demoCode: string;
  popularity: number;
  downloads: number;
}

interface ProjectTemplateSelectorProps {
  onTemplateSelect?: (template: ProjectTemplate) => void;
  onCreateFromTemplate?: (template: ProjectTemplate) => void;
}

export const ProjectTemplateSelector: React.FC<ProjectTemplateSelectorProps> = ({
  onTemplateSelect,
  onCreateFromTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const categories = [
    { id: 'all', name: 'All Templates', icon: Layers },
    { id: 'web', name: 'Web Apps', icon: Globe },
    { id: 'mobile', name: 'Mobile Apps', icon: Smartphone },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart },
    { id: 'dashboard', name: 'Dashboards', icon: Database },
    { id: 'social', name: 'Social Apps', icon: Users }
  ];

  const templates: ProjectTemplate[] = [
    {
      id: 'react-dashboard',
      name: 'Analytics Dashboard',
      description: 'Modern dashboard with charts, tables, and real-time data visualization',
      category: 'dashboard',
      icon: Database,
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Supabase'],
      difficulty: 'Intermediate',
      estimatedTime: '2-3 hours',
      features: ['Real-time charts', 'Data tables', 'User authentication', 'Dark mode'],
      popularity: 95,
      downloads: 12500,
      demoCode: `// Analytics Dashboard Component
const Dashboard = () => {
  const [metrics, setMetrics] = useState([]);
  
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-4">
              <h3 className="font-semibold">{metric.title}</h3>
              <p className="text-2xl font-bold text-blue-600">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};`
    },
    {
      id: 'ecommerce-store',
      name: 'E-commerce Store',
      description: 'Full-featured online store with product catalog, shopping cart, and checkout',
      category: 'ecommerce',
      icon: ShoppingCart,
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Stripe', 'Supabase'],
      difficulty: 'Advanced',
      estimatedTime: '4-6 hours',
      features: ['Product catalog', 'Shopping cart', 'Payment processing', 'Order management'],
      popularity: 88,
      downloads: 8900,
      demoCode: `// E-commerce Store Component
const EcommerceStore = () => {
  const [products] = useState([
    { id: 1, name: 'Wireless Headphones', price: 99.99, image: '/headphones.jpg' },
    { id: 2, name: 'Smart Watch', price: 199.99, image: '/watch.jpg' },
    { id: 3, name: 'Laptop Stand', price: 49.99, image: '/stand.jpg' }
  ]);
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">TechStore</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Cart ({cart.length})</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">$\{product.price}</p>
                <button
                  onClick={() => addToCart(product)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};`
    },
    {
      id: 'social-media-app',
      name: 'Social Media App',
      description: 'Social platform with posts, comments, likes, and user profiles',
      category: 'social',
      icon: Users,
      techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Supabase', 'Real-time'],
      difficulty: 'Advanced',
      estimatedTime: '5-7 hours',
      features: ['User profiles', 'Post creation', 'Real-time comments', 'Like system'],
      popularity: 92,
      downloads: 15200,
      demoCode: `// Social Media App Component
const SocialApp = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  
  const createPost = () => {
    const post = {
      id: Date.now(),
      content: newPost,
      author: 'User',
      timestamp: new Date(),
      likes: 0,
      comments: []
    };
    setPosts([post, ...posts]);
    setNewPost('');
  };
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="What's on your mind?"
          className="w-full p-3 border rounded-lg"
        />
        <Button onClick={createPost} className="mt-2">
          Post
        </Button>
      </div>
      
      {posts.map((post) => (
        <Card key={post.id} className="mb-4">
          <CardContent className="p-4">
            <p>{post.content}</p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">{post.timestamp.toLocaleString()}</span>
              <Button variant="ghost" size="sm">
                ❤️ {post.likes}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};`
    }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Project Templates</h2>
            <p className="text-sm text-slate-400">Choose from curated templates to kickstart your project</p>
          </div>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {filteredTemplates.length} templates
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white"
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Categories Sidebar */}
        <div className="w-64 border-r border-slate-700 p-4">
          <h3 className="text-sm font-medium text-slate-400 mb-3">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span className="text-sm">{category.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 flex">
          <div className="flex-1 p-4">
            <ScrollArea className="h-full">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTemplates.map((template) => (
                  <Card 
                    key={template.id}
                    className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:border-slate-600 ${
                      selectedTemplate?.id === template.id ? 'border-blue-500 bg-slate-700' : ''
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <template.icon className="w-6 h-6 text-blue-400" />
                          <div>
                            <CardTitle className="text-white text-base">{template.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getDifficultyColor(template.difficulty)}>
                                {template.difficulty}
                              </Badge>
                              <span className="text-xs text-slate-400">{template.estimatedTime}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-yellow-400 text-sm">
                            <Star className="w-3 h-3 mr-1" />
                            {template.popularity}%
                          </div>
                          <div className="flex items-center text-slate-400 text-xs mt-1">
                            <Download className="w-3 h-3 mr-1" />
                            {template.downloads.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-slate-300 text-sm mb-3">{template.description}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {template.techStack.slice(0, 4).map((tech) => (
                          <Badge key={tech} variant="secondary" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {template.techStack.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{template.techStack.length - 4}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-xs text-slate-400">
                          {template.features.length} features
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateFromTemplate?.(template);
                          }}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Zap className="w-3 h-3 mr-1" />
                          Use Template
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Template Details Panel */}
          {selectedTemplate && (
            <div className="w-96 border-l border-slate-700 p-4">
              <ScrollArea className="h-full">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{selectedTemplate.name}</h3>
                    <p className="text-slate-300 text-sm">{selectedTemplate.description}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Features</h4>
                    <ul className="space-y-1">
                      {selectedTemplate.features.map((feature) => (
                        <li key={feature} className="text-sm text-slate-300 flex items-center">
                          <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.techStack.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Preview Code</h4>
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-700">
                      <pre className="text-xs text-slate-300 overflow-x-auto">
                        {selectedTemplate.demoCode}
                      </pre>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => onCreateFromTemplate?.(selectedTemplate)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Create Project
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onTemplateSelect?.(selectedTemplate)}
                      className="border-slate-600 text-slate-300"
                    >
                      Preview
                    </Button>
                  </div>
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
