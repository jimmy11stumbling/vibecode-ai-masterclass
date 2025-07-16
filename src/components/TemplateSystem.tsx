
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Code, 
  Smartphone, 
  Globe, 
  Database, 
  CreditCard, 
  Search,
  Star,
  Download,
  GitFork,
  Clock,
  User,
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  preview: string;
  features: string[];
  technologies: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  downloads: number;
  rating: number;
  author: string;
  lastUpdated: string;
  tags: string[];
  sourceCode: {
    files: Array<{
      path: string;
      content: string;
    }>;
  };
  isOfficial: boolean;
  isFeatured: boolean;
}

interface TemplateSystemProps {
  onTemplateSelect: (template: ProjectTemplate) => void;
}

export const TemplateSystem: React.FC<TemplateSystemProps> = ({
  onTemplateSelect
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const { toast } = useToast();

  const projectTemplates: ProjectTemplate[] = [
    // React Templates
    {
      id: 'react-dashboard',
      name: 'Admin Dashboard',
      description: 'Complete admin dashboard with charts, tables, and user management',
      category: 'react',
      icon: Globe,
      preview: '/templates/dashboard-preview.png',
      features: ['Authentication', 'Charts & Analytics', 'User Management', 'Responsive Design'],
      technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts', 'Supabase'],
      difficulty: 'Intermediate',
      estimatedTime: '2-3 hours',
      downloads: 15420,
      rating: 4.8,
      author: 'Official',
      lastUpdated: '2024-01-15',
      tags: ['dashboard', 'admin', 'analytics', 'crud'],
      isOfficial: true,
      isFeatured: true,
      sourceCode: {
        files: [
          {
            path: 'src/App.tsx',
            content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Users } from './pages/Users';
import { Analytics } from './pages/Analytics';
import { Sidebar } from './components/Sidebar';

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;`
          },
          {
            path: 'src/pages/Dashboard.tsx',
            content: `import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Dashboard = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">1,234</p>
          </CardContent>
        </Card>
        {/* More dashboard cards */}
      </div>
    </div>
  );
};`
          }
        ]
      }
    },
    {
      id: 'ecommerce-store',
      name: 'E-commerce Store',
      description: 'Full-featured online store with shopping cart and payment integration',
      category: 'react',
      icon: CreditCard,
      preview: '/templates/ecommerce-preview.png',
      features: ['Product Catalog', 'Shopping Cart', 'Payment Processing', 'Order Management'],
      technologies: ['React', 'TypeScript', 'Stripe', 'Supabase', 'Tailwind CSS'],
      difficulty: 'Advanced',
      estimatedTime: '4-6 hours',
      downloads: 8930,
      rating: 4.7,
      author: 'Official',
      lastUpdated: '2024-01-10',
      tags: ['ecommerce', 'store', 'payments', 'products'],
      isOfficial: true,
      isFeatured: true,
      sourceCode: {
        files: [
          {
            path: 'src/App.tsx',
            content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProductProvider } from './contexts/ProductContext';
import { CartProvider } from './contexts/CartContext';
import { Header } from './components/Header';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';

function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <Routes>
              <Route path="/" element={<ProductList />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;`
          }
        ]
      }
    },

    // Mobile Templates
    {
      id: 'react-native-todo',
      name: 'Todo Mobile App',
      description: 'Cross-platform todo app with offline sync and push notifications',
      category: 'mobile',
      icon: Smartphone,
      preview: '/templates/mobile-todo-preview.png',
      features: ['Offline Sync', 'Push Notifications', 'Dark Mode', 'Gesture Support'],
      technologies: ['React Native', 'Expo', 'TypeScript', 'AsyncStorage', 'Supabase'],
      difficulty: 'Intermediate',
      estimatedTime: '3-4 hours',
      downloads: 12340,
      rating: 4.6,
      author: 'Community',
      lastUpdated: '2024-01-12',
      tags: ['mobile', 'todo', 'productivity', 'offline'],
      isOfficial: false,
      isFeatured: true,
      sourceCode: {
        files: [
          {
            path: 'App.tsx',
            content: `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TodoProvider } from './contexts/TodoContext';
import { TodoList } from './screens/TodoList';
import { AddTodo } from './screens/AddTodo';
import { Settings } from './screens/Settings';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <TodoProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Todos" component={TodoList} />
          <Tab.Screen name="Add" component={AddTodo} />
          <Tab.Screen name="Settings" component={Settings} />
        </Tab.Navigator>
      </NavigationContainer>
    </TodoProvider>
  );
}`
          }
        ]
      }
    },
    {
      id: 'fitness-tracker',
      name: 'Fitness Tracker',
      description: 'Track workouts, nutrition, and health metrics with social features',
      category: 'mobile',
      icon: Smartphone,
      preview: '/templates/fitness-preview.png',
      features: ['Workout Tracking', 'Nutrition Logging', 'Progress Charts', 'Social Sharing'],
      technologies: ['React Native', 'Expo', 'HealthKit', 'Charts', 'Firebase'],
      difficulty: 'Advanced',
      estimatedTime: '5-7 hours',
      downloads: 6780,
      rating: 4.5,
      author: 'Community',
      lastUpdated: '2024-01-08',
      tags: ['fitness', 'health', 'tracking', 'social'],
      isOfficial: false,
      isFeatured: false,
      sourceCode: {
        files: [
          {
            path: 'App.tsx',
            content: `import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { WorkoutProvider } from './contexts/WorkoutContext';
import { HomeScreen } from './screens/HomeScreen';
import { WorkoutScreen } from './screens/WorkoutScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <WorkoutProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Workout" component={WorkoutScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </WorkoutProvider>
  );
}`
          }
        ]
      }
    },

    // Full-stack Templates
    {
      id: 'saas-starter',
      name: 'SaaS Starter Kit',
      description: 'Complete SaaS application with authentication, billing, and admin panel',
      category: 'fullstack',
      icon: Zap,
      preview: '/templates/saas-preview.png',
      features: ['User Authentication', 'Subscription Billing', 'Admin Panel', 'API Routes'],
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
      difficulty: 'Advanced',
      estimatedTime: '6-8 hours',
      downloads: 9870,
      rating: 4.9,
      author: 'Official',
      lastUpdated: '2024-01-14',
      tags: ['saas', 'billing', 'authentication', 'admin'],
      isOfficial: true,
      isFeatured: true,
      sourceCode: {
        files: [
          {
            path: 'src/App.tsx',
            content: `import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Billing } from './pages/Billing';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <SubscriptionProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </SubscriptionProvider>
    </AuthProvider>
  );
}

export default App;`
          }
        ]
      }
    },

    // API Templates
    {
      id: 'rest-api-boilerplate',
      name: 'REST API Boilerplate',
      description: 'Production-ready REST API with authentication, validation, and documentation',
      category: 'api',
      icon: Database,
      preview: '/templates/api-preview.png',
      features: ['JWT Authentication', 'Input Validation', 'API Documentation', 'Rate Limiting'],
      technologies: ['Node.js', 'Express', 'PostgreSQL', 'Swagger', 'Jest'],
      difficulty: 'Intermediate',
      estimatedTime: '2-3 hours',
      downloads: 14560,
      rating: 4.7,
      author: 'Official',
      lastUpdated: '2024-01-11',
      tags: ['api', 'backend', 'authentication', 'documentation'],
      isOfficial: true,
      isFeatured: false,
      sourceCode: {
        files: [
          {
            path: 'server.js',
            content: `const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`);
});`
          }
        ]
      }
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: projectTemplates.length },
    { id: 'react', name: 'React', count: projectTemplates.filter(t => t.category === 'react').length },
    { id: 'mobile', name: 'Mobile', count: projectTemplates.filter(t => t.category === 'mobile').length },
    { id: 'fullstack', name: 'Full-stack', count: projectTemplates.filter(t => t.category === 'fullstack').length },
    { id: 'api', name: 'API', count: projectTemplates.filter(t => t.category === 'api').length }
  ];

  const filteredTemplates = projectTemplates
    .filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'featured':
          return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
        case 'popular':
          return b.downloads - a.downloads;
        case 'rating':
          return b.rating - a.rating;
        case 'recent':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default:
          return 0;
      }
    });

  const handleUseTemplate = (template: ProjectTemplate) => {
    onTemplateSelect(template);
    toast({
      title: "Template Selected",
      description: `Starting new project with ${template.name} template`,
    });
  };

  const handleForkTemplate = (template: ProjectTemplate) => {
    // Create a copy of the template for customization
    const forkedTemplate = {
      ...template,
      id: `${template.id}-fork-${Date.now()}`,
      name: `${template.name} (Fork)`,
      author: 'You',
      isOfficial: false
    };
    
    onTemplateSelect(forkedTemplate);
    toast({
      title: "Template Forked",
      description: `Created a fork of ${template.name} that you can customize`,
    });
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-400" />
              Template System
            </h3>
            <p className="text-sm text-slate-400">Start with production-ready templates</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-800 border border-slate-600 rounded px-3 py-1 text-sm text-white"
            >
              <option value="featured">Featured</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="recent">Recently Updated</option>
            </select>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
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
              <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredTemplates.map(template => (
                  <Card key={template.id} className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center">
                            <template.icon className="w-5 h-5 text-slate-300" />
                          </div>
                          <div>
                            <CardTitle className="text-white flex items-center space-x-2">
                              <span>{template.name}</span>
                              {template.isOfficial && (
                                <Badge className="bg-purple-500/20 text-purple-400 text-xs">Official</Badge>
                              )}
                              {template.isFeatured && (
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              )}
                            </CardTitle>
                            <p className="text-sm text-slate-400">{template.description}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-4">
                            <span className="text-slate-400">
                              <User className="w-3 h-3 inline mr-1" />
                              {template.author}
                            </span>
                            <span className="text-slate-400">
                              <Download className="w-3 h-3 inline mr-1" />
                              {template.downloads.toLocaleString()}
                            </span>
                            <span className="text-slate-400">
                              <Star className="w-3 h-3 inline mr-1" />
                              {template.rating}
                            </span>
                          </div>
                          <Badge className={
                            template.difficulty === 'Beginner' ? 'bg-green-500/20 text-green-400' :
                            template.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }>
                            {template.difficulty}
                          </Badge>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400 mb-2">Technologies</p>
                          <div className="flex flex-wrap gap-1">
                            {template.technologies.map(tech => (
                              <Badge key={tech} variant="outline" className="text-xs border-slate-600 text-slate-300">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400 mb-2">Features</p>
                          <div className="flex flex-wrap gap-1">
                            {template.features.slice(0, 3).map(feature => (
                              <Badge key={feature} className="bg-blue-500/20 text-blue-400 text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {template.features.length > 3 && (
                              <Badge className="bg-slate-600/20 text-slate-400 text-xs">
                                +{template.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            <span>{template.estimatedTime}</span>
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleForkTemplate(template)}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <GitFork className="w-3 h-3 mr-1" />
                              Fork
                            </Button>
                            <Button
                              onClick={() => handleUseTemplate(template)}
                              className="bg-purple-600 hover:bg-purple-700"
                              size="sm"
                            >
                              Use Template
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {filteredTemplates.length === 0 && (
                  <div className="col-span-full text-center text-slate-500 py-8">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No templates found matching your criteria</p>
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
