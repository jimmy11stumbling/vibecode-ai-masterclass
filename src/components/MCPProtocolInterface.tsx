import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Workflow, 
  Plug, 
  Settings, 
  Play, 
  Square, 
  RefreshCw,
  Zap,
  Server,
  Code,
  Database,
  MessageCircle,
  Shield,
  Monitor
} from 'lucide-react';
import { advancedMCPIntegration } from '@/services/advancedMCPIntegration';
import { supabase } from '@/integrations/supabase/client';
import type { MCPAgentCard, MCPCapability } from '@/services/advancedMCPIntegration';

interface MCPProtocolInterfaceProps {
  onAgentSelect?: (agent: MCPAgentCard) => void;
  onToolInvoke?: (agentId: string, toolName: string, params: any) => void;
}

export const MCPProtocolInterface: React.FC<MCPProtocolInterfaceProps> = ({
  onAgentSelect,
  onToolInvoke
}) => {
  const [agents, setAgents] = useState<MCPAgentCard[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<MCPAgentCard | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [toolInvocations, setToolInvocations] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'connected' | 'disconnected' | 'error'>>({});
  const [activeTab, setActiveTab] = useState<'agents' | 'tools' | 'monitor'>('agents');

  // Initialize service
  const service = advancedMCPIntegration.init(supabase);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const discoveredAgents = await service.discoverMCPAgents();
      setAgents(discoveredAgents);
      
      // Initialize connection status
      const status: Record<string, 'connected' | 'disconnected' | 'error'> = {};
      discoveredAgents.forEach(agent => {
        status[agent.id] = 'connected';
      });
      setConnectionStatus(status);
    } catch (error) {
      console.error('Failed to load MCP agents:', error);
    }
  };

  const handleDiscoverAgents = async () => {
    setIsDiscovering(true);
    try {
      await loadAgents();
    } catch (error) {
      console.error('Agent discovery failed:', error);
    }
    setIsDiscovering(false);
  };

  const handleAgentSelect = (agent: MCPAgentCard) => {
    setSelectedAgent(agent);
    onAgentSelect?.(agent);
  };

  const handleToolInvocation = async (capability: MCPCapability) => {
    if (!selectedAgent) return;

    try {
      const result = await service.invokeMCPTool(
        selectedAgent.id, 
        capability.name, 
        capability.parameters
      );

      const invocation = {
        id: Date.now().toString(),
        agentId: selectedAgent.id,
        toolName: capability.name,
        parameters: capability.parameters,
        result,
        timestamp: new Date(),
        status: 'success'
      };

      setToolInvocations(prev => [invocation, ...prev]);
      onToolInvoke?.(selectedAgent.id, capability.name, capability.parameters);
    } catch (error) {
      const invocation = {
        id: Date.now().toString(),
        agentId: selectedAgent.id,
        toolName: capability.name,
        parameters: capability.parameters,
        error: error.message,
        timestamp: new Date(),
        status: 'error'
      };

      setToolInvocations(prev => [invocation, ...prev]);
      console.error('Tool invocation failed:', error);
    }
  };

  const getCapabilityIcon = (type: string) => {
    switch (type) {
      case 'tool': return <Zap className="w-4 h-4" />;
      case 'resource': return <Database className="w-4 h-4" />;
      case 'prompt': return <MessageCircle className="w-4 h-4" />;
      case 'reasoning': return <Workflow className="w-4 h-4" />;
      case 'collaboration': return <Server className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getCapabilityColor = (type: string) => {
    switch (type) {
      case 'tool': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'resource': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'prompt': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'reasoning': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'collaboration': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getConnectionStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500';
      case 'disconnected': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-xl border border-slate-700">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plug className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">MCP Protocol</h3>
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
              v2.0 Standard
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDiscoverAgents}
              disabled={isDiscovering}
              className="text-slate-400 hover:text-white"
            >
              {isDiscovering ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
        <div className="border-b border-slate-700 px-4">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="agents" className="data-[state=active]:bg-slate-700">
              <Server className="w-4 h-4 mr-2" />
              Agents
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-slate-700">
              <Zap className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
            <TabsTrigger value="monitor" className="data-[state=active]:bg-slate-700">
              <Monitor className="w-4 h-4 mr-2" />
              Monitor
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="agents" className="flex-1 m-0">
          <div className="flex h-full">
            {/* Agent List */}
            <div className="w-1/2 border-r border-slate-700">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-3">
                  {agents.map((agent) => (
                    <Card 
                      key={agent.id}
                      className={`cursor-pointer transition-colors ${
                        selectedAgent?.id === agent.id 
                          ? 'bg-slate-700 border-blue-500' 
                          : 'bg-slate-800 border-slate-600 hover:border-slate-500'
                      }`}
                      onClick={() => handleAgentSelect(agent)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Server className="w-5 h-5 text-blue-400" />
                            <div>
                              <CardTitle className="text-white text-sm">{agent.name}</CardTitle>
                              <p className="text-xs text-slate-400">v{agent.version}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getConnectionStatusColor(connectionStatus[agent.id])}`} />
                            <Badge variant="outline" className="text-xs">
                              {connectionStatus[agent.id]}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <p className="text-slate-300 text-xs mb-3">{agent.description}</p>
                        
                        <div className="flex flex-wrap gap-1 mb-2">
                          {agent.capabilities.slice(0, 3).map((cap) => (
                            <Badge key={cap.name} className={`text-xs ${getCapabilityColor(cap.type)}`}>
                              {getCapabilityIcon(cap.type)}
                              <span className="ml-1">{cap.type}</span>
                            </Badge>
                          ))}
                          {agent.capabilities.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 3}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-slate-400">
                          {agent.endpoints.length} endpoint(s) • {agent.capabilities.length} capability(s)
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {agents.length === 0 && (
                    <div className="text-center py-8">
                      <Server className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">No MCP agents discovered</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleDiscoverAgents}
                        className="mt-2"
                      >
                        Discover Agents
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Agent Details */}
            <div className="flex-1">
              {selectedAgent ? (
                <ScrollArea className="h-full">
                  <div className="p-4 space-y-4">
                    <Card className="bg-slate-800 border-slate-600">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Server className="w-5 h-5 mr-2" />
                          {selectedAgent.name}
                        </CardTitle>
                        <p className="text-slate-400 text-sm">{selectedAgent.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-sm text-slate-400">Version</p>
                            <p className="text-white">{selectedAgent.version}</p>
                          </div>
                          <div>
                            <p className="text-sm text-slate-400">Authentication</p>
                            <p className="text-white">{selectedAgent.authentication.type}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-slate-400 mb-2">Endpoints</p>
                            <div className="space-y-2">
                              {selectedAgent.endpoints.map((endpoint) => (
                                <div key={endpoint.name} className="flex items-center justify-between bg-slate-700 p-2 rounded">
                                  <div>
                                    <span className="text-sm text-white">{endpoint.name}</span>
                                    <p className="text-xs text-slate-400">{endpoint.url}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className="text-xs">{endpoint.method}</Badge>
                                    {endpoint.authentication && (
                                      <Shield className="w-3 h-3 text-green-400" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="text-sm text-slate-400 mb-2">Metadata</p>
                            <div className="bg-slate-700 p-3 rounded">
                              <pre className="text-xs text-slate-300 overflow-x-auto">
                                {JSON.stringify(selectedAgent.metadata, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  <div className="text-center">
                    <Server className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select an agent to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="flex-1 m-0">
          <div className="p-4">
            {selectedAgent ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-medium text-white">Available Capabilities</h4>
                  <Badge className="bg-blue-500/20 text-blue-400">
                    {selectedAgent.capabilities.length} total
                  </Badge>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {selectedAgent.capabilities.map((capability) => (
                      <Card key={capability.name} className="bg-slate-800 border-slate-600">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getCapabilityIcon(capability.type)}
                              <div>
                                <CardTitle className="text-white text-sm">{capability.name}</CardTitle>
                                <p className="text-xs text-slate-400">{capability.description}</p>
                              </div>
                            </div>
                            <Badge className={getCapabilityColor(capability.type)}>
                              {capability.type}
                            </Badge>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm text-slate-400 mb-2">Parameters</p>
                              <div className="bg-slate-700 p-2 rounded">
                                <pre className="text-xs text-slate-300 overflow-x-auto">
                                  {JSON.stringify(capability.parameters, null, 2)}
                                </pre>
                              </div>
                            </div>
                            
                            <div className="flex justify-end">
                              <Button
                                size="sm"
                                onClick={() => handleToolInvocation(capability)}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Invoke
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500">
                <div className="text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an agent to view its capabilities</p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="monitor" className="flex-1 m-0">
          <div className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium text-white">Tool Invocations</h4>
                <Badge className="bg-green-500/20 text-green-400">
                  {toolInvocations.length} total
                </Badge>
              </div>

              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {toolInvocations.map((invocation) => (
                    <Card key={invocation.id} className="bg-slate-800 border-slate-600">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Zap className="w-4 h-4 text-blue-400" />
                            <div>
                              <CardTitle className="text-white text-sm">{invocation.toolName}</CardTitle>
                              <p className="text-xs text-slate-400">
                                Agent: {invocation.agentId} • {invocation.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge className={
                            invocation.status === 'success' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-red-500/20 text-red-400'
                          }>
                            {invocation.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          {invocation.result && (
                            <div>
                              <p className="text-sm text-slate-400 mb-1">Result</p>
                              <div className="bg-slate-700 p-2 rounded">
                                <pre className="text-xs text-slate-300 overflow-x-auto">
                                  {JSON.stringify(invocation.result, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                          
                          {invocation.error && (
                            <div>
                              <p className="text-sm text-slate-400 mb-1">Error</p>
                              <div className="bg-red-900/20 p-2 rounded border border-red-500/30">
                                <p className="text-xs text-red-400">{invocation.error}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {toolInvocations.length === 0 && (
                    <div className="text-center py-8">
                      <Monitor className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">No tool invocations yet</p>
                      <p className="text-sm text-slate-500">Select an agent and invoke its capabilities to see activity</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
