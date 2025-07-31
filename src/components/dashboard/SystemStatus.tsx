import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Database, 
  Cpu, 
  Users, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface SystemStatusProps {
  isOnline: boolean;
  agentCount: number;
  activeConnections: number;
  systemLoad: number;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({
  isOnline,
  agentCount,
  activeConnections,
  systemLoad
}) => {
  const getLoadColor = (load: number) => {
    if (load < 50) return 'text-green-600';
    if (load < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getLoadBgColor = (load: number) => {
    if (load < 50) return 'bg-green-500';
    if (load < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>System Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {isOnline ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            )}
            <span className="text-sm font-medium">System Status</span>
          </div>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm">Active Agents</span>
            </div>
            <span className="text-sm font-medium">{agentCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Connections</span>
            </div>
            <span className="text-sm font-medium">{activeConnections}</span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-orange-600" />
                <span className="text-sm">System Load</span>
              </div>
              <span className={`text-sm font-medium ${getLoadColor(systemLoad)}`}>
                {systemLoad}%
              </span>
            </div>
            <Progress 
              value={systemLoad} 
              className="h-2"
              style={{
                background: `linear-gradient(to right, ${getLoadBgColor(systemLoad)} 0%, transparent 0%)`
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};