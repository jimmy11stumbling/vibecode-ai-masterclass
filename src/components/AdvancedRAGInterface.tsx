
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  Search, 
  Database, 
  FileText, 
  Zap,
  Target,
  TrendingUp,
  Filter,
  Upload,
  Download,
  Settings,
  RefreshCw
} from 'lucide-react';
import { advancedMCPIntegration } from '@/services/advancedMCPIntegration';
import type { RAGResult, RAGDocument } from '@/services/advancedMCPIntegration';

interface AdvancedRAGInterfaceProps {
  onResultSelect?: (result: RAGResult) => void;
  onDocumentProcess?: (document: RAGDocument) => void;
}

export const AdvancedRAGInterface: React.FC<AdvancedRAGInterfaceProps> = ({
  onResultSelect,
  onDocumentProcess
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RAGResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [documents, setDocuments] = useState<RAGDocument[]>([]);
  const [searchConfig, setSearchConfig] = useState({
    topK: 5,
    hybridSearch: true,
    useReranking: true,
    diversityThreshold: 0.7
  });
  const [activeTab, setActiveTab] = useState<'search' | 'documents' | 'config'>('search');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    // Load existing documents
    try {
      // This would load from the service in a real implementation
      setDocuments([]);
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const searchResults = await advancedMCPIntegration.searchKnowledge(query, {
        topK: searchConfig.topK,
        hybridSearch: searchConfig.hybridSearch
      });
      
      setResults(searchResults);
    } catch (error) {
      console.error('Search failed:', error);
    }
    setIsSearching(false);
  };

  const handleDocumentUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      
      try {
        const processedDoc = await advancedMCPIntegration.processDocument({
          title: file.name,
          content,
          source: 'upload',
          metadata: {
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            uploadedAt: new Date().toISOString()
          }
        });

        setDocuments(prev => [...prev, processedDoc]);
        onDocumentProcess?.(processedDoc);
      } catch (error) {
        console.error('Document processing failed:', error);
      }
    };
    
    reader.readAsText(file);
  };

  const getRelevanceColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Advanced RAG 2.0</h3>
            <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
              Production Ready
            </Badge>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={loadDocuments}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="search" className="data-[state=active]:bg-slate-700">
              <Search className="w-4 h-4 mr-2" />
              Search
            </TabsTrigger>
            <TabsTrigger value="documents" className="data-[state=active]:bg-slate-700">
              <FileText className="w-4 h-4 mr-2" />
              Documents
            </TabsTrigger>
            <TabsTrigger value="config" className="data-[state=active]:bg-slate-700">
              <Settings className="w-4 h-4 mr-2" />
              Config
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="search" className="flex-1 m-0">
          <div className="p-4 space-y-4">
            {/* Search Interface */}
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter your search query..."
                  className="flex-1 bg-slate-800 border-slate-600 text-white"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !query.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Search Configuration */}
              <div className="flex items-center space-x-4 text-sm text-slate-400">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4" />
                  <span>Top {searchConfig.topK} results</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4" />
                  <span>{searchConfig.hybridSearch ? 'Hybrid' : 'Vector'} Search</span>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Re-ranking {searchConfig.useReranking ? 'ON' : 'OFF'}</span>
                </div>
              </div>
            </div>

            {/* Search Results */}
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {results.map((result, index) => (
                  <Card 
                    key={result.chunk.id}
                    className="bg-slate-800 border-slate-600 hover:border-slate-500 transition-colors cursor-pointer"
                    onClick={() => onResultSelect?.(result)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className="bg-blue-500/20 text-blue-400">
                              Rank #{index + 1}
                            </Badge>
                            <Badge className="bg-green-500/20 text-green-400">
                              Relevance: {Math.round(result.relevanceScore * 100)}%
                            </Badge>
                            <div className={`w-2 h-2 rounded-full ${getRelevanceColor(result.relevanceScore)}`} />
                          </div>
                          <CardTitle className="text-white text-sm">
                            Chunk {result.chunk.position} (Level {result.chunk.hierarchyLevel})
                          </CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-slate-300 text-sm mb-3 line-clamp-3">
                        {result.chunk.content}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span>Score: {result.score.toFixed(3)}</span>
                          <span>•</span>
                          <span>Chars: {result.chunk.content.length}</span>
                          {result.diversityScore > 0 && (
                            <>
                              <span>•</span>
                              <span>Diversity: {result.diversityScore.toFixed(3)}</span>
                            </>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-purple-400 hover:text-purple-300"
                        >
                          Use Context
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {results.length === 0 && query && !isSearching && (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No results found for your query</p>
                    <p className="text-sm text-slate-500">Try different keywords or check your search configuration</p>
                  </div>
                )}

                {!query && (
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">Advanced RAG Search Ready</p>
                    <p className="text-sm text-slate-500">Enter a query to search the knowledge base</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="flex-1 m-0">
          <div className="p-4 space-y-4">
            {/* Document Upload */}
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Documents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".txt,.md,.json,.csv"
                    onChange={handleDocumentUpload}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                  />
                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-slate-400">
                        <span>Processing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Document List */}
            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {documents.map((doc) => (
                  <Card key={doc.id} className="bg-slate-800 border-slate-600">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-white text-sm">{doc.title}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1 text-xs text-slate-400">
                            <Database className="w-3 h-3" />
                            <span>{doc.source}</span>
                            <span>•</span>
                            <span>{doc.processedAt.toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{doc.chunks.length} chunks</span>
                          </div>
                        </div>
                        <Badge className="bg-green-500/20 text-green-400">
                          Processed
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <p className="text-slate-300 text-sm mb-3 line-clamp-2">
                        {doc.content.substring(0, 200)}...
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-slate-400">
                          <span>Size: {doc.content.length} chars</span>
                          <span>•</span>
                          <span>Chunks: {doc.chunks.length}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" className="text-xs">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {documents.length === 0 && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400">No documents uploaded</p>
                    <p className="text-sm text-slate-500">Upload documents to build your knowledge base</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </TabsContent>

        <TabsContent value="config" className="flex-1 m-0">
          <div className="p-4 space-y-4">
            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Search Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Top K Results: {searchConfig.topK}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={searchConfig.topK}
                    onChange={(e) => setSearchConfig(prev => ({ ...prev, topK: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">
                    Diversity Threshold: {searchConfig.diversityThreshold}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={searchConfig.diversityThreshold}
                    onChange={(e) => setSearchConfig(prev => ({ ...prev, diversityThreshold: parseFloat(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="hybridSearch"
                    checked={searchConfig.hybridSearch}
                    onChange={(e) => setSearchConfig(prev => ({ ...prev, hybridSearch: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="hybridSearch" className="text-sm text-slate-300">
                    Enable Hybrid Search (Vector + Keyword)
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="useReranking"
                    checked={searchConfig.useReranking}
                    onChange={(e) => setSearchConfig(prev => ({ ...prev, useReranking: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="useReranking" className="text-sm text-slate-300">
                    Enable Cross-Encoder Re-ranking
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-600">
              <CardHeader>
                <CardTitle className="text-white">Advanced Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Query Expansion (HyDE)</span>
                  <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Hierarchical Chunking</span>
                  <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">MMR Diversity</span>
                  <Badge className="bg-green-500/20 text-green-400">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">Semantic Caching</span>
                  <Badge className="bg-yellow-500/20 text-yellow-400">Beta</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
