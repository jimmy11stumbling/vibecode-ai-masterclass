
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Server, 
  Database, 
  Zap, 
  Activity, 
  CheckCircle, 
  AlertCircle,
  Settings,
  RefreshCw
} from 'lucide-react';

interface MCPServer {
  id: string;
  name: string;
  type: 'database' | 'api' | 'tool' | 'agent';
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  config: Record<string, any>;
  lastHeartbeat?: Date;
}

interface MCPHubProps {
  onServerSelect?: (server: MCPServer) => void;
  onToolInvoke?: (tool: string, params: any) => void;
}

export const MCPHub: React.FC<MCPHubProps> = ({ onServerSelect, onToolInvoke }) => {
  const [servers, setServers] = useState<MCPServer[]>([
    {
      id: 'deepseek-reasoner',
      name: 'DeepSeek Reasoner',
      type: 'agent',
      status: 'active',
      capabilities: ['reasoning', 'code-generation', 'analysis'],
      config: { model: 'deepseek-reasoner', temperature: 0.7 },
      lastHeartbeat: new Date()
    },
    {
      id: 'rag-database',
      name: 'RAG 2.0 Database',
      type: 'database',
      status: 'active',
      capabilities: ['vector-search', 'knowledge-retrieval', 'context-augmentation'],
      config: { vectorDimensions: 1536, indexType: 'hnsw' },
      lastHeartbeat: new Date()
    },
    {
      id: 'code-executor',
      name: 'Code Execution Engine',
      type: 'tool',
      status: 'active',
      capabilities: ['code-execution', 'testing', 'validation'],
      config: { runtime: 'node', timeout: 30000 },
      lastHeartbeat: new Date()
    }
  ]);

  const [selectedServer, setSelectedServer] = useState<string | null>(null);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getServerIcon = (type: string) => {
    switch (type) {
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'agent':
        return <Zap className="w-5 h-5" />;
      case 'tool':
        return <Settings className="w-5 h-5" />;
      default:
        return <Server className="w-5 h-5" />;
    }
  };

  const handleServerSelect = (server: MCPServer) => {
    setSelectedServer(server.id);
    onServerSelect?.(server);
  };

  const refreshServers = () => {
    // Simulate server refresh
    setServers(prev => prev.map(server => ({
      ...server,
      lastHeartbeat: new Date()
    })));
  };

  return (
    <div className="h-full flex flex-col bg-slate-900">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">MCP Hub</h3>
            <p className="text-sm text-slate-400">Model Context Protocol Center</p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshServers}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {servers.map((server) => (
            <Card
              key={server.id}
              className={`cursor-pointer transition-colors ${
                selectedServer === server.id
                  ? 'bg-slate-800 border-blue-500'
                  : 'bg-slate-800 border-slate-700 hover:border-slate-600'
              }`}
              onClick={() => handleServerSelect(server)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getServerIcon(server.type)}
                    <div>
                      <CardTitle className="text-sm text-white">{server.name}</CardTitle>
                      <p className="text-xs text-slate-400 capitalize">{server.type}</p>
                    </div>
                  </div>
                  {getStatusIcon(server.status)}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-400 mb-2">Capabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {server.capabilities.map((capability) => (
                        <Badge
                          key={capability}
                          variant="secondary"
                          className="text-xs bg-slate-700 text-slate-300"
                        >
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {server.lastHeartbeat && (
                    <div className="text-xs text-slate-500">
                      Last seen: {server.lastHeartbeat.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{servers.length} servers</span>
          <span>{servers.filter(s => s.status === 'active').length} active</span>
        </div>
      </div>
    </div>
  );
};
