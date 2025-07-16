
export interface MCPAgent {
  id: string;
  name: string;
  type: 'conversation' | 'document' | 'rag' | 'router';
  status: 'active' | 'idle' | 'processing' | 'offline';
  capabilities: string[];
  config: Record<string, any>;
}

export interface MCPMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'notification';
  method?: string;
  params?: any;
  result?: any;
  error?: any;
  timestamp: Date;
}

export interface MCPTool {
  name: string;
  description: string;
  input_schema: any;
  execute: (params: any) => Promise<any>;
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  tools: MCPTool[];
  status: 'connected' | 'disconnected' | 'error';
}
