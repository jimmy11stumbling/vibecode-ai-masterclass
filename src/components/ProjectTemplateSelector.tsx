
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Zap, 
  Smartphone, 
  Globe, 
  Database, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  MessageSquare,
  Gamepad2,
  Camera,
  Music,
  FileText,
  Calendar,
  Settings,
  Download,
  Star,
  Clock,
  Code2
} from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  techStack: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  rating: number;
  downloads: number;
  previewImage?: string;
  files: {
    name: string;
    content: string;
    language: string;
  }[];
}

const templates: ProjectTemplate[] = [
  {
    id: 'react-dashboard',
    name: 'Analytics Dashboard',
    description: 'Modern analytics dashboard with charts, metrics, and real-time data visualization',
    category: 'Business',
    icon: BarChart3,
    features: ['Real-time charts', 'Data visualization', 'Responsive design', 'Dark mode'],
    techStack: ['React', 'TypeScript', 'Recharts', 'Tailwind CSS'],
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    rating: 4.8,
    downloads: 1250,
    files: [
      {
        name: 'App.tsx',
        content: `import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
];

const App = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Analytics Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">12,345</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Revenue</h3>
            <p className="text-3xl font-bold text-green-600">$45,678</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700">Growth</h3>
            <p className="text-3xl font-bold text-purple-600">+23%</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default App;`,
        language: 'typescript'
      }
    ]
  },
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Complete e-commerce solution with product catalog, cart, and checkout',
    category: 'E-commerce',
    icon: ShoppingCart,
    features: ['Product catalog', 'Shopping cart', 'Payment integration', 'User accounts'],
    techStack: ['React', 'TypeScript', 'Stripe', 'Supabase'],
    difficulty: 'Advanced',
    estimatedTime: '4-6 hours',
    rating: 4.9,
    downloads: 890,
    files: [
      {
        name: 'App.tsx',
        content: `import React, { useState } from 'react';

const products = [
  { id: 1, name: 'Wireless Headphones', price: 99.99, image: '/api/placeholder/300/300' },
  { id: 2, name: 'Smart Watch', price: 199.99, image: '/api/placeholder/300/300' },
  { id: 3, name: 'Bluetooth Speaker', price: 79.99, image: '/api/placeholder/300/300' },
];

const App = () => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
                <p className="text-2xl font-bold text-green-600 mt-2">${product.price}</p>
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
};

export default App;`,
        language: 'typescript'
      }
    ]
  },
  {
    id: 'chat-app',
    name: 'Real-time Chat App',
    description: 'Modern chat application with real-time messaging and user presence',
    category: 'Social',
    icon: MessageSquare,
    features: ['Real-time messaging', 'User presence', 'File sharing', 'Emoji reactions'],
    techStack: ['React', 'TypeScript', 'Socket.io', 'Node.js'],
    difficulty: 'Advanced',
    estimatedTime: '3-5 hours',
    rating: 4.7,
    downloads: 567,
    files: [
      {
        name: 'App.tsx',
        content: `import React, { useState } from 'react';

const App = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alice', text: 'Hey everyone!', time: '10:30 AM' },
    { id: 2, user: 'Bob', text: 'How is everyone doing?', time: '10:32 AM' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        user: 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-xl font-semibold text-gray-900">Team Chat</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
              {message.user[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{message.user}</span>
                <span className="text-xs text-gray-500">{message.time}</span>
              </div>
              <p className="text-gray-700 mt-1">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-white border-t p-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessage}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;`,
        language: 'typescript'
      }
    ]
  },
  {
    id: 'todo-app',
    name: 'Task Manager',
    description: 'Powerful task management app with categories, deadlines, and progress tracking',
    category: 'Productivity',
    icon: FileText,
    features: ['Task categories', 'Due dates', 'Progress tracking', 'Search & filter'],
    techStack: ['React', 'TypeScript', 'Local Storage', 'Tailwind CSS'],
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    rating: 4.6,
    downloads: 2100,
    files: [
      {
        name: 'App.tsx',
        content: `import React, { useState } from 'react';

const App = () => {
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete project proposal', completed: false, priority: 'high' },
    { id: 2, text: 'Review code changes', completed: true, priority: 'medium' },
    { id: 3, text: 'Update documentation', completed: false, priority: 'low' },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, {
        id: tasks.length + 1,
        text: newTask,
        completed: false,
        priority: 'medium'
      }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Task Manager</h1>
        
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTask()}
              placeholder="Add a new task..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-3">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                className="w-5 h-5 text-blue-600"
              />
              <span className={\`flex-1 \${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}\`}>
                {task.text}
              </span>
              <span className={\`px-2 py-1 text-xs rounded-full \${
                task.priority === 'high' ? 'bg-red-100 text-red-800' :
                task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }\`}>
                {task.priority}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;`,
        language: 'typescript'
      }
    ]
  },
  {
    id: 'portfolio-site',
    name: 'Portfolio Website',
    description: 'Professional portfolio website with projects showcase and contact form',
    category: 'Personal',
    icon: Globe,
    features: ['Project showcase', 'Contact form', 'Responsive design', 'Smooth animations'],
    techStack: ['React', 'TypeScript', 'Framer Motion', 'Tailwind CSS'],
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    rating: 4.8,
    downloads: 1850,
    files: [
      {
        name: 'App.tsx',
        content: `import React from 'react';

const App = () => {
  const projects = [
    { id: 1, title: 'E-commerce Platform', tech: 'React, Node.js', description: 'Full-stack e-commerce solution' },
    { id: 2, title: 'Mobile App', tech: 'React Native', description: 'Cross-platform mobile application' },
    { id: 3, title: 'Data Dashboard', tech: 'React, D3.js', description: 'Interactive data visualization' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h1 className="text-5xl font-bold mb-4">John Doe</h1>
          <p className="text-xl text-gray-300 mb-8">Full Stack Developer & UI/UX Designer</p>
          <div className="flex justify-center space-x-4">
            <a href="#projects" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
              View Projects
            </a>
            <a href="#contact" className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-gray-900 transition-colors">
              Contact Me
            </a>
          </div>
        </div>
      </header>

      {/* About */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">About Me</h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            I'm a passionate full-stack developer with 5+ years of experience creating web applications
            that solve real-world problems. I specialize in React, Node.js, and modern web technologies.
          </p>
        </div>
      </section>

      {/* Projects */}
      <section id="projects" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Featured Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600"></div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{project.title}</h3>
                  <p className="text-blue-600 text-sm font-medium mb-3">{project.tech}</p>
                  <p className="text-gray-600">{project.description}</p>
                  <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium">
                    View Project →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Get In Touch</h2>
          <div className="bg-white border border-gray-200 rounded-lg p-8">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea rows="4" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;`,
        language: 'typescript'
      }
    ]
  }
];

interface ProjectTemplateSelectorProps {
  onTemplateSelect: (template: ProjectTemplate) => void;
  onClose?: () => void;
}

export const ProjectTemplateSelector: React.FC<ProjectTemplateSelectorProps> = ({
  onTemplateSelect,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null);

  const categories = ['All', ...Array.from(new Set(templates.map(t => t.category)))];
  
  const filteredTemplates = selectedCategory === 'All' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleTemplateSelect = (template: ProjectTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onTemplateSelect(selectedTemplate);
      onClose?.();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-700">
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Choose a Template</h2>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </div>
        <p className="text-slate-400 mt-2">Start with a pre-built template to accelerate your development</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Categories & Templates */}
        <div className="w-2/3 flex flex-col border-r border-slate-700">
          {/* Category Filter */}
          <div className="border-b border-slate-700 p-4">
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map((category) => (
                <Button
                  key={category}
                  size="sm"
                  variant={selectedCategory === category ? "default" : "ghost"}
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <ScrollArea className="flex-1">
            <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => {
                const IconComponent = template.icon;
                return (
                  <Card
                    key={template.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <IconComponent className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {template.category}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  template.difficulty === 'Beginner' ? 'text-green-600 border-green-600' :
                                  template.difficulty === 'Intermediate' ? 'text-yellow-600 border-yellow-600' :
                                  'text-red-600 border-red-600'
                                }`}
                              >
                                {template.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{template.rating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm mb-3">
                        {template.description}
                      </CardDescription>
                      
                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-slate-600 dark:text-slate-400">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>{template.estimatedTime}</span>
                          <span className="mx-2">•</span>
                          <Download className="w-3 h-3 mr-1" />
                          <span>{template.downloads.toLocaleString()} downloads</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {template.techStack.map((tech) => (
                            <Badge key={tech} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Template Details */}
        <div className="w-1/3 flex flex-col">
          {selectedTemplate ? (
            <>
              <div className="border-b border-slate-700 p-4">
                <h3 className="text-lg font-semibold text-white mb-2">{selectedTemplate.name}</h3>
                <p className="text-slate-300 text-sm">{selectedTemplate.description}</p>
              </div>
              
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Features</h4>
                    <ul className="space-y-1">
                      {selectedTemplate.features.map((feature, index) => (
                        <li key={index} className="text-sm text-slate-400 flex items-center">
                          <Zap className="w-3 h-3 mr-2 text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Tech Stack</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.techStack.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-white mb-2">Files Included</h4>
                    <div className="space-y-1">
                      {selectedTemplate.files.map((file, index) => (
                        <div key={index} className="flex items-center text-sm text-slate-400">
                          <Code2 className="w-3 h-3 mr-2" />
                          <span>{file.name}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {file.language}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              
              <div className="border-t border-slate-700 p-4">
                <Button 
                  onClick={handleUseTemplate} 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Use This Template
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Select a template to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
