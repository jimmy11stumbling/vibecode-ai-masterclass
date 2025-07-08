
import React, { useState } from 'react';
import { Book, Search, Filter, Download, ExternalLink, Star, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'documentation' | 'tutorial' | 'example' | 'tool';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  downloads: number;
  author: string;
  updatedAt: string;
  url?: string;
  tags: string[];
}

export const ResourceLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [resources] = useState<Resource[]>([
    {
      id: '1',
      title: 'React Hooks Complete Guide',
      description: 'Comprehensive guide to using React hooks effectively in modern applications.',
      type: 'documentation',
      category: 'React',
      difficulty: 'intermediate',
      rating: 4.8,
      downloads: 1250,
      author: 'React Team',
      updatedAt: '2024-01-15',
      tags: ['react', 'hooks', 'state', 'effects']
    },
    {
      id: '2',
      title: 'TypeScript Best Practices',
      description: 'Learn TypeScript patterns and practices for building scalable applications.',
      type: 'tutorial',
      category: 'TypeScript',
      difficulty: 'advanced',
      rating: 4.9,
      downloads: 890,
      author: 'Microsoft',
      updatedAt: '2024-01-10',
      tags: ['typescript', 'patterns', 'types', 'best-practices']
    },
    {
      id: '3',
      title: 'Responsive Design Examples',
      description: 'Collection of responsive design patterns using CSS Grid and Flexbox.',
      type: 'example',
      category: 'CSS',
      difficulty: 'beginner',
      rating: 4.6,
      downloads: 2100,
      author: 'CSS Masters',
      updatedAt: '2024-01-12',
      tags: ['css', 'responsive', 'grid', 'flexbox']
    },
    {
      id: '4',
      title: 'API Design Toolkit',
      description: 'Tools and templates for designing RESTful APIs with Node.js.',
      type: 'tool',
      category: 'Backend',
      difficulty: 'intermediate',
      rating: 4.7,
      downloads: 650,
      author: 'Node.js Community',
      updatedAt: '2024-01-08',
      tags: ['api', 'rest', 'nodejs', 'backend']
    },
    {
      id: '5',
      title: 'Database Schema Patterns',
      description: 'Common database schema patterns for modern web applications.',
      type: 'documentation',
      category: 'Database',
      difficulty: 'advanced',
      rating: 4.8,
      downloads: 450,
      author: 'DB Experts',
      updatedAt: '2024-01-05',
      tags: ['database', 'schema', 'sql', 'patterns']
    }
  ]);

  const categories = ['all', 'React', 'TypeScript', 'CSS', 'Backend', 'Database'];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: Resource['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/20 text-green-400';
      case 'intermediate': return 'bg-yellow-500/20 text-yellow-400';
      case 'advanced': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getTypeIcon = (type: Resource['type']) => {
    switch (type) {
      case 'documentation': return <Book className="w-4 h-4" />;
      case 'tutorial': return <Star className="w-4 h-4" />;
      case 'example': return <ExternalLink className="w-4 h-4" />;
      case 'tool': return <Download className="w-4 h-4" />;
      default: return <Book className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Book className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Resource Library</h2>
          </div>
          <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
            {filteredResources.length} Resources
          </Badge>
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
            />
          </div>
          <Button variant="outline" size="sm" className="border-white/20">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="bg-white/10 backdrop-blur-sm border border-white/20">
            {categories.map(category => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="data-[state=active]:bg-white/20 capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Resource List */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {filteredResources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white/5 rounded-xl p-6 hover:bg-white/10 transition-all duration-200 border border-white/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                    {getTypeIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-white mb-1">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {resource.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {resource.tags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant="secondary" 
                          className="text-xs bg-white/10 text-gray-300"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className={`${getDifficultyColor(resource.difficulty)} capitalize`}>
                    {resource.difficulty}
                  </Badge>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{resource.author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3" />
                    <span>Updated {resource.updatedAt}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Download className="w-3 h-3" />
                    <span>{resource.downloads} downloads</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400" />
                    <span>{resource.rating}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-6 px-2">
                    <Download className="w-3 h-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white h-6 px-2">
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <Book className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No resources found</h3>
            <p className="text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
