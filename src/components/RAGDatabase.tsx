
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  Search, 
  Brain, 
  FileText, 
  Zap,
  Plus,
  Trash2,
  Filter,
  BarChart3
} from 'lucide-react';

interface KnowledgeChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: string;
    timestamp: Date;
    tokens: number;
    relevanceScore?: number;
  };
  embeddings: number[];
  tags: string[];
}

interface RAGDatabaseProps {
  onChunkSelect?: (chunk: KnowledgeChunk) => void;
  onSearch?: (query: string) => Promise<KnowledgeChunk[]>;
}

export const RAGDatabase: React.FC<RAGDatabaseProps> = ({ onChunkSelect, onSearch }) => {
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KnowledgeChunk[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('browse');

  // Sample data
  useEffect(() => {
    const sampleChunks: KnowledgeChunk[] = [
      {
        id: '1',
        content: 'React component patterns and best practices for building scalable applications...',
        metadata: {
          source: 'react-patterns.md',
          type: 'documentation',
          timestamp: new Date(),
          tokens: 1024
        },
        embeddings: Array(1536).fill(0).map(() => Math.random()),
        tags: ['react', 'patterns', 'components']
      },
      {
        id: '2',
        content: 'TypeScript advanced types and utility types for better type safety...',
        metadata: {
          source: 'typescript-guide.md',
          type: 'documentation',
          timestamp: new Date(),
          tokens: 892
        },
        embeddings: Array(1536).fill(0).map(() => Math.random()),
        tags: ['typescript', 'types', 'safety']
      }
    ];
    setChunks(sampleChunks);
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      if (onSearch) {
        const results = await onSearch(searchQuery);
        setSearchResults(results);
      } else {
        // Mock search
        const results = chunks.filter(chunk =>
          chunk.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chunk.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(results);
      }
      setActiveTab('search');
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleChunkSelect = (chunk: KnowledgeChunk) => {
    setSelectedChunk(chunk.id);
    onChunkSelect?.(chunk);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation':
        return <FileText className="w-4 h-4" />;
      case 'code':
        return <Zap className="w-4 h-4" />;
      default:
        return <Brain className="w-4 h-4" />;
    }
  };

  const ChunkCard = ({ chunk }: { chunk: KnowledgeChunk }) => (
    <Card
      className={`cursor-pointer transition-colors ${
        selectedChunk === chunk.id
          ? 'bg-slate-800 border-blue-500'
          : 'bg-slate-800 border-slate-700 hover:border-slate-600'
      }`}
      onClick={() => handleChunkSelect(chunk)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(chunk.metadata.type)}
            <CardTitle className="text-sm text-white">{chunk.metadata.source}</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs">
            {chunk.metadata.tokens} tokens
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-slate-300 mb-3 line-clamp-3">
          {chunk.content}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-2">
          {chunk.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs border-slate-600 text-slate-400"
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="text-xs text-slate-500">
          {chunk.metadata.timestamp.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2 mb-4">
          <Database className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-semibold text-white">RAG 2.0 Database</h3>
            <p className="text-sm text-slate-400">Knowledge & Context Store</p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search knowledge base..."
            className="bg-slate-800 border-slate-600 text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-slate-700 px-4 py-2">
            <TabsList className="bg-slate-800">
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="browse" className="h-full m-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  {chunks.map((chunk) => (
                    <ChunkCard key={chunk.id} chunk={chunk} />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="search" className="h-full m-0">
              <ScrollArea className="h-full p-4">
                {searchResults.length > 0 ? (
                  <div className="space-y-4">
                    <div className="text-sm text-slate-400 mb-4">
                      {searchResults.length} results for "{searchQuery}"
                    </div>
                    {searchResults.map((chunk) => (
                      <ChunkCard key={chunk.id} chunk={chunk} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-400 mt-8">
                    {searchQuery ? 'No results found' : 'Enter a search query'}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="analytics" className="h-full m-0">
              <ScrollArea className="h-full p-4">
                <div className="space-y-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Database Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-400">Total Chunks</p>
                          <p className="text-white font-semibold">{chunks.length}</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Total Tokens</p>
                          <p className="text-white font-semibold">
                            {chunks.reduce((sum, chunk) => sum + chunk.metadata.tokens, 0)}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-400">Vector Dimensions</p>
                          <p className="text-white font-semibold">1536</p>
                        </div>
                        <div>
                          <p className="text-slate-400">Index Type</p>
                          <p className="text-white font-semibold">HNSW</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
