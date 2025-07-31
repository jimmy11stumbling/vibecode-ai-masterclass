import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  XCircle, 
  Clock,
  MoreHorizontal
} from 'lucide-react';

interface ExecutionInfo {
  id: string;
  status: string;
  progress: number;
  startTime: Date;
  tasksTotal: number;
  tasksCompleted: number;
  tasksFailed: number;
}

interface ExecutionListProps {
  executions: ExecutionInfo[];
  onExecutionAction: (id: string, action: 'pause' | 'resume' | 'stop') => void;
}

export const ExecutionList: React.FC<ExecutionListProps> = ({ 
  executions, 
  onExecutionAction 
}) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running': return <Play className="h-4 w-4 text-blue-600" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-600" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60)),
      'minute'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Executions</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {executions.map((execution) => (
              <div key={execution.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(execution.status)}
                    <span className="font-medium text-sm">
                      Execution {execution.id.slice(-8)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{execution.progress}%</span>
                  </div>
                  <Progress value={execution.progress} />
                </div>

                <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                  <div>
                    <p className="text-gray-600">Total</p>
                    <p className="font-medium">{execution.tasksTotal}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Completed</p>
                    <p className="font-medium text-green-600">{execution.tasksCompleted}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Failed</p>
                    <p className="font-medium text-red-600">{execution.tasksFailed}</p>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  Started {formatTime(execution.startTime)}
                </p>
              </div>
            ))}
            
            {executions.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active executions</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};