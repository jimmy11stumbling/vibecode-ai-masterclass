
export interface A2AAgent {
  id: string;
  name: string;
  type: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'busy' | 'offline';
  lastActivity: Date;
  currentTasks?: string[];
  role: string;
  description: string;
}

export interface A2AMessage {
  id: string;
  fromAgent: string;
  toAgent: string;
  type: 'task' | 'response' | 'coordination' | 'heartbeat';
  content: any;
  timestamp: Date;
  priority?: 'low' | 'medium' | 'high';
}
