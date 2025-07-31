import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Workflow } from 'lucide-react';
import type { A2ATask } from '@/services/advancedMCPIntegration';

interface TaskListProps {
  tasks: A2ATask[];
  selectedTask: A2ATask | null;
  onTaskSelect: (task: A2ATask) => void;
  onCreateTask: () => void;
  getTaskStatusColor: (status: string) => string;
  getTaskStatusIcon: (status: string) => React.ReactNode;
  calculateTaskProgress: (task: A2ATask) => number;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  selectedTask,
  onTaskSelect,
  onCreateTask,
  getTaskStatusColor,
  getTaskStatusIcon,
  calculateTaskProgress
}) => {
  return (
    <div className="w-1/2 border-r border-slate-700">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-3">
          {tasks.map((task) => (
            <Card 
              key={task.id}
              className={`cursor-pointer transition-colors ${
                selectedTask?.id === task.id 
                  ? 'bg-slate-700 border-green-500' 
                  : 'bg-slate-800 border-slate-600 hover:border-slate-500'
              }`}
              onClick={() => onTaskSelect(task)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">{task.title}</CardTitle>
                  <Badge className={getTaskStatusColor(task.status)}>
                    {getTaskStatusIcon(task.status)}
                    <span className="ml-1">{task.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <p className="text-slate-300 text-xs mb-3 line-clamp-2">
                  {task.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{Math.round(calculateTaskProgress(task))}%</span>
                  </div>
                  <Progress value={calculateTaskProgress(task)} className="h-1" />
                </div>
                
                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                  <span>{task.participants.length} agents</span>
                  <span>{task.messages.length} messages</span>
                  <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {tasks.length === 0 && (
            <div className="text-center py-8">
              <Workflow className="w-12 h-12 text-slate-500 mx-auto mb-4" />
              <p className="text-slate-400">No A2A tasks created</p>
              <Button
                size="sm"
                variant="outline"
                onClick={onCreateTask}
                className="mt-2"
              >
                Create Task
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};