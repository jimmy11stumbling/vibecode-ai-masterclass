
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Server, 
  Zap, 
  Settings, 
  Play, 
  Square, 
  RefreshCw,
  Database,
  Code,
  Brain,
  Workflow,
  Search,
  Filter
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  type: 'reasoning' | 'database' | 'code' | 'workflow';
  status: 'active' | 'inactive' | 'connecting';
  description: string;
  capabilities: string[];
  version: string;
  lastUsed?: Date;
  config?: any;
}

interface MCPTool {
  id: string;
  serverId: string;
  name: string;
  description: string;
  parameters: any;
  schema: any;
}

interface MCPHubProps {
  onServerSelect: (server: MCPServer) => void;
  onToolInvoke: (tool: MCPTool, params: any) => void;
}

export const MCPHub: React.FC<MCPHubProps> = ({
  onServerSelect,
  onToolInvoke
}) => {
  const [servers, setServers] = useState<MCPServer[]>([
    {
      id: '1',
      name: 'DeepSeek Reasoner',
      type: 'reasoning',
      status: 'active',
      description: 'Advanced reasoning and problem-solving capabilities',
      capabilities: ['reasoning', 'analysis', 'problem-solving', 'code-generation'],
      version: '2.0.0',
      lastUsed: new Date()
    },
    {
      id: '2',
      name: 'RAG Database',
      type: 'database',
      status: 'active',
      description: 'Knowledge retrieval and embedding search',
      capabilities: ['search', 'embeddings', 'retrieval', 'indexing'],
      version: '1.5.0',
      lastUsed: new Date()
    },
    {
      id: '3',
      name: 'Code Executor',
      type: 'code',
      status: 'inactive',
      description: 'Safe code execution and testing environment',
      capabilities: ['execution', 'testing', 'sandboxing', 'validation'],
      version: '1.2.0'
    },
    {
      id: '4',
      name: 'Workflow Engine',
      type: 'workflow',
      status: 'connecting',
      description: 'Automated workflow processing and orchestration',
      capabilities: ['automation', 'orchestration', 'scheduling', 'monitoring'],
      version: '1.0.0'
    }
  ]);

  const [selectedServer, setSelectedServer] = useState<MCPServer | null>(null);
  const [tools, setTools] = useState<MCPTool[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'reasoning' | 'database' | 'code' | 'workflow'>('all');

  useEffect(() => {
    // Mock tools based on selected server
    if (selectedServer) {
      const mockTools: MCPTool[] = [
        {
          id: '1',
          serverId: selectedServer.id,
          name: 'analyze_code',
          description: 'Analyze code structure and suggest improvements',
          parameters: { code: 'string', language: 'string' },
          schema: { type: 'object', properties: {} }
        },
        {
          id: '2',
          serverId: selectedServer.id,
          name: 'generate_component',
          description: 'Generate React component based on specifications',
          parameters: { spec: 'string', framework: 'string' },
          schema: { type: 'object', properties: {} }
        }
      ];
      setTools(mockTools);
    }
  }, [selectedServer]);

  const getServerIcon = (type: string) => {
    switch (type) {
      case 'reasoning': return <Brain className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'code': return <Code className="w-5 h-5" />;
      case 'workflow': return <Workflow className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'connecting': return 'bg-yellow-500 animate-pulse';
      default: return 'bg-gray-500';
    }
  };

  const handleServerToggle = (server: MCPServer) => {
    setServers(prev => prev.map(s => 
      s.id === server.id 
        ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' }
        : s
    ));
  };

  const filteredServers = servers.filter(server => {
    const matchesSearch = server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         server.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || server.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Server className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">MCP Hub</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.location.reload()}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search servers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-400 focus:outline-none"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="w-full p-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-blue-400 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="reasoning">Reasoning</option>
            <option value="database">Database</option>
            <option value="code">Code</option>
            <option value="workflow">Workflow</option>
          </select>
        </div>
      </div>

      {/* Server List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {filteredServers.map((server) => (
              <Card key={server.id} className="bg-slate-800 border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getServerIcon(server.type)}
                      <div>
                        <CardTitle className="text-white text-sm">{server.name}</CardTitle>
                        <CardDescription className="text-slate-400 text-xs">
                          v{server.version}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(server.status)}`} />
                      <Badge variant="outline" className="text-xs">
                        {server.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <p className="text-slate-300 text-xs mb-3">{server.description}</p>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {server.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant={server.status === 'active' ? 'destructive' : 'default'}
                      onClick={() => handleServerToggle(server)}
                      className="text-xs"
                    >
                      {server.status === 'active' ? (
                        <>
                          <Square className="w-3 h-3 mr-1" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedServer(server);
                        onServerSelect(server);
                      }}
                      className="text-xs"
                    >
                      <Settings className="w-3 h-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Tools Panel */}
      {selectedServer && (
        <div className="border-t border-slate-700 p-4 max-h-48 overflow-y-auto">
          <h4 className="text-sm font-medium text-white mb-2">Available Tools</h4>
          <div className="space-y-2">
            {tools.map((tool) => (
              <div key={tool.id} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                <div>
                  <span className="text-sm text-white">{tool.name}</span>
                  <p className="text-xs text-slate-400">{tool.description}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onToolInvoke(tool, {})}
                  className="text-xs"
                >
                  <Zap className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
