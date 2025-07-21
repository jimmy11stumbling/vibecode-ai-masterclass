
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SovereignTask } from '@/services/sovereignOrchestrator';

interface TaskPipelineProps {
  tasks: SovereignTask[];
}

export const TaskPipeline = ({ tasks }: TaskPipelineProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      case 'pending': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (tasks.length === 0) return null;

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Execution Pipeline</h3>
        <Badge variant="outline" className="border-slate-600">
          {tasks.filter(t => t.status === 'completed').length} / {tasks.length} Completed
        </Badge>
      </div>

      <div className="grid gap-3">
        {tasks.map((task) => (
          <Card key={task.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(task.status)}`} />
                  <span className="font-medium">{task.description}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                  <Badge variant="outline" className="border-slate-600">
                    {task.type}
                  </Badge>
                </div>
              </div>
              
              {task.dependencies && task.dependencies.length > 0 && (
                <div className="text-sm text-slate-400 mb-2">
                  Dependencies: {task.dependencies.join(', ')}
                </div>
              )}
              
              {task.progress && (
                <Progress value={task.progress} className="h-2" />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
