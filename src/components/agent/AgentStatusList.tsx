import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Bot, CheckCircle, Clock, XCircle, Activity } from 'lucide-react';

interface AgentStatus {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'busy' | 'error';
  currentTask?: string;
  progress?: number;
  lastActivity: string;
}

interface AgentStatusListProps {
  agents: AgentStatus[];
}

export const AgentStatusList: React.FC<AgentStatusListProps> = ({ agents }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'idle': return <Clock className="h-4 w-4 text-gray-600" />;
      case 'busy': return <Activity className="h-4 w-4 text-blue-600" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Bot className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'idle': return 'bg-gray-100 text-gray-800';
      case 'busy': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {agents.map((agent) => (
        <Card key={agent.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center">
                <Bot className="h-4 w-4 mr-2" />
                {agent.name}
              </CardTitle>
              <Badge className={getStatusColor(agent.status)}>
                {getStatusIcon(agent.status)}
                <span className="ml-1">{agent.status}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {agent.currentTask && (
              <div className="space-y-2">
                <p className="text-xs text-gray-600">Current Task:</p>
                <p className="text-sm font-medium">{agent.currentTask}</p>
                {agent.progress !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Progress</span>
                      <span>{agent.progress}%</span>
                    </div>
                    <Progress value={agent.progress} className="h-2" />
                  </div>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Last activity: {agent.lastActivity}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};