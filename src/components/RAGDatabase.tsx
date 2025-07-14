
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Database, 
  Search, 
  Plus, 
  Trash2, 
  RefreshCw,
  Brain,
  FileText,
  Link,
  Tag,
  Filter,
  Upload
} from 'lucide-react';

interface KnowledgeChunk {
  id: string;
  title: string;
  content: string;
  source: string;
  category: string;
  tags: string[];
  embedding?: number[];
  similarity?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface RAGDatabaseProps {
  onChunkSelect: (chunk: KnowledgeChunk) => void;
  onSearch: (query: string) => Promise<KnowledgeChunk[]>;
}

export const RAGDatabase: React.FC<RAGDatabaseProps> = ({
  onChunkSelect,
  onSearch
}) => {
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([
    {
      id: '1',
      title: 'React Component Best Practices',
      content: 'When creating React components, follow these best practices: Use functional components with hooks, implement proper prop validation, optimize with React.memo for performance...',
      source: 'documentation',
      category: 'react',
      tags: ['react', 'components', 'best-practices'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '2',
      title: 'TypeScript Interface Design',
      content: 'TypeScript interfaces should be designed with extensibility in mind. Use generic types where appropriate, implement proper inheritance patterns...',
      source: 'manual',
      category: 'typescript',
      tags: ['typescript', 'interfaces', 'design'],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: '3',
      title: 'Supabase Integration Guide',
      content: 'Integrating Supabase with React applications requires proper setup of authentication, database connections, and real-time subscriptions...',
      source: 'documentation',
      category: 'database',
      tags: ['supabase', 'database', 'integration'],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<KnowledgeChunk[]>([]);
  const [newChunk, setNewChunk] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });
  const [isAdding, setIsAdding] = useState(false);

  const categories = ['all', 'react', 'typescript', 'database', 'ai', 'documentation'];

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const results = await onSearch(searchQuery);
      setSearchResults(results);
    } catch (error) {
      // Fallback to local search
      const localResults = chunks.filter(chunk =>
        chunk.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chunk.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chunk.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setSearchResults(localResults);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddChunk = () => {
    if (newChunk.title.trim() && newChunk.content.trim()) {
      const chunk: KnowledgeChunk = {
        id: Date.now().toString(),
        title: newChunk.title,
        content: newChunk.content,
        source: 'manual',
        category: newChunk.category || 'general',
        tags: newChunk.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setChunks(prev => [...prev, chunk]);
      setNewChunk({ title: '', content: '', category: '', tags: '' });
      setIsAdding(false);
    }
  };

  const handleDeleteChunk = (id: string) => {
    setChunks(prev => prev.filter(chunk => chunk.id !== id));
  };

  const filteredChunks = chunks.filter(chunk => {
    const matchesCategory = selectedCategory === 'all' || chunk.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' || searchResults.some(result => result.id === chunk.id);
    return matchesCategory && (searchQuery.trim() === '' || matchesSearch);
  });

  const displayChunks = searchQuery.trim() ? searchResults : filteredChunks;

  const getCategoryColor = (category: string) => {
    const colors = {
      react: 'bg-blue-500',
      typescript: 'bg-purple-500',
      database: 'bg-green-500',
      ai: 'bg-orange-500',
      documentation: 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || 'bg-slate-500';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">RAG Knowledge Base</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAdding(true)}
              className="text-slate-400 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.location.reload()}
              className="text-slate-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800 border-slate-600 text-white"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-1">
          {categories.map((category) => (
            <Button
              key={category}
              size="sm"
              variant={selectedCategory === category ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category)}
              className="text-xs capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Add New Chunk Form */}
      {isAdding && (
        <div className="p-4 border-b border-slate-700 bg-slate-800">
          <div className="space-y-3">
            <Input
              placeholder="Title"
              value={newChunk.title}
              onChange={(e) => setNewChunk(prev => ({ ...prev, title: e.target.value }))}
              className="bg-slate-700 border-slate-600 text-white"
            />
            <textarea
              placeholder="Content"
              value={newChunk.content}
              onChange={(e) => setNewChunk(prev => ({ ...prev, content: e.target.value }))}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm resize-none"
              rows={3}
            />
            <div className="flex space-x-2">
              <Input
                placeholder="Category"
                value={newChunk.category}
                onChange={(e) => setNewChunk(prev => ({ ...prev, category: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
              <Input
                placeholder="Tags (comma-separated)"
                value={newChunk.tags}
                onChange={(e) => setNewChunk(prev => ({ ...prev, tags: e.target.value }))}
                className="bg-slate-700 border-slate-600 text-white"
              />
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleAddChunk} className="bg-green-600 hover:bg-green-700">
                Add
              </Button>
              <Button size="sm" variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Chunks */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {displayChunks.map((chunk) => (
            <Card key={chunk.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-sm mb-1">{chunk.title}</CardTitle>
                    <div className="flex items-center space-x-2 text-xs text-slate-400">
                      <Database className="w-3 h-3" />
                      <span>{chunk.source}</span>
                      <span>•</span>
                      <span>{chunk.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCategoryColor(chunk.category)} text-white`}
                    >
                      {chunk.category}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteChunk(chunk.id)}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-slate-300 text-sm mb-3 line-clamp-3">{chunk.content}</p>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {chunk.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="w-2 h-2 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-400">
                    <FileText className="w-3 h-3" />
                    <span>{chunk.content.length} chars</span>
                    {chunk.similarity && (
                      <>
                        <span>•</span>
                        <span>{Math.round(chunk.similarity * 100)}% match</span>
                      </>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onChunkSelect(chunk)}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    <Link className="w-3 h-3 mr-1" />
                    Use
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {displayChunks.length === 0 && (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">
                {searchQuery.trim() ? 'No matching knowledge found' : 'No knowledge chunks available'}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAdding(true)}
                className="mt-2"
              >
                Add Knowledge
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
