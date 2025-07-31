import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TaskCreatorProps {
  onCreateTask: (task: { title: string; description: string; capabilities: string[] }) => void;
}

export const TaskCreator: React.FC<TaskCreatorProps> = ({ onCreateTask }) => {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    capabilities: [] as string[]
  });

  const availableCapabilities = [
    'reasoning', 'code_generation', 'data_analysis', 'testing', 
    'deployment', 'documentation', 'optimization', 'debugging'
  ];

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !newTask.description.trim()) return;
    
    onCreateTask(newTask);
    setNewTask({ title: '', description: '', capabilities: [] });
  };

  const toggleCapability = (capability: string) => {
    setNewTask(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }));
  };

  return (
    <div className="p-4">
      <Card className="bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white">Create New A2A Task</CardTitle>
          <p className="text-slate-400 text-sm">Define a multi-agent collaboration task</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Task Title
            </label>
            <Input
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Task Description
            </label>
            <Textarea
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what you want the agents to accomplish..."
              className="bg-slate-700 border-slate-600 text-white min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-300 mb-2 block">
              Required Capabilities
            </label>
            <div className="flex flex-wrap gap-2">
              {availableCapabilities.map((capability) => (
                <Badge
                  key={capability}
                  className={`cursor-pointer transition-colors ${
                    newTask.capabilities.includes(capability)
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : 'bg-slate-600/20 text-slate-400 border-slate-600/30 hover:bg-slate-500/20'
                  }`}
                  onClick={() => toggleCapability(capability)}
                >
                  {capability}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setNewTask({ title: '', description: '', capabilities: [] })}
              className="bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600"
            >
              Clear
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!newTask.title.trim() || !newTask.description.trim()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Create Task
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};