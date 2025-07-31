import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import type { A2ATask } from '@/services/advancedMCPIntegration';

interface TaskDetailsProps {
  selectedTask: A2ATask | null;
  getTaskStatusColor: (status: string) => string;
  getStepStatusColor: (status: string) => string;
  getAgentTypeIcon: (type: string) => React.ReactNode;
  calculateTaskProgress: (task: A2ATask) => number;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  selectedTask,
  getTaskStatusColor,
  getStepStatusColor,
  getAgentTypeIcon,
  calculateTaskProgress
}) => {
  if (!selectedTask) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <div className="text-center">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Select a task to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-4">
          {/* Task Info */}
          <Card className="bg-slate-800 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">{selectedTask.title}</CardTitle>
              <p className="text-slate-400 text-sm">{selectedTask.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge className={getTaskStatusColor(selectedTask.status)}>
                    {selectedTask.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Progress</p>
                  <p className="text-white">{Math.round(calculateTaskProgress(selectedTask))}%</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-400 mb-2">Participants</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTask.participants.map((agent) => (
                      <Badge key={agent.id} className="bg-blue-500/20 text-blue-400">
                        {getAgentTypeIcon(agent.type)}
                        <span className="ml-1">{agent.name}</span>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-2">Workflow Steps</p>
                  <div className="space-y-2">
                    {selectedTask.workflow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getStepStatusColor(step.status)}`} />
                        <div className="flex-1">
                          <span className="text-sm text-white">{step.name}</span>
                          <p className="text-xs text-slate-400">
                            Assigned to: {step.assignedAgent}
                          </p>
                        </div>
                        <Badge className={getTaskStatusColor(step.status)}>
                          {step.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTask.artifacts.length > 0 && (
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Artifacts</p>
                    <div className="space-y-2">
                      {selectedTask.artifacts.map((artifact) => (
                        <div key={artifact.id} className="bg-slate-700 p-2 rounded flex items-center justify-between">
                          <div>
                            <span className="text-sm text-white">{artifact.name}</span>
                            <p className="text-xs text-slate-400">{artifact.type}</p>
                          </div>
                          <Badge className="text-xs">
                            {artifact.immutable ? 'Immutable' : 'Mutable'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};