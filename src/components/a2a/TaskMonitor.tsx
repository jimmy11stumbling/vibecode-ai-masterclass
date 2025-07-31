import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Send } from 'lucide-react';
import type { A2ATask, A2AMessage } from '@/services/advancedMCPIntegration';

interface TaskMonitorProps {
  selectedTask: A2ATask | null;
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSendMessage: () => void;
}

export const TaskMonitor: React.FC<TaskMonitorProps> = ({
  selectedTask,
  messageInput,
  setMessageInput,
  onSendMessage
}) => {
  if (!selectedTask) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500">
        <p>Select a task to monitor messages</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Task Header */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-white font-medium">{selectedTask.title}</h3>
        <div className="flex items-center space-x-2 mt-2">
          <Badge variant="outline" className="text-xs">
            {selectedTask.participants.length} agents
          </Badge>
          <Badge variant="outline" className="text-xs">
            {selectedTask.messages.length} messages
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {selectedTask.messages.map((message: A2AMessage) => (
            <Card key={message.id} className="bg-slate-800 border-slate-600">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-white">
                    {message.from} → {message.to}
                  </CardTitle>
                  <span className="text-xs text-slate-400">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-slate-300 text-sm">{message.content}</p>
                {message.parts && message.parts.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.parts.map((part, index) => (
                      <Badge key={index} variant="outline" className="text-xs mr-1">
                        {part.type}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Message Input */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex space-x-2">
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Send message to coordination agents..."
            className="bg-slate-700 border-slate-600 text-white"
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
          />
          <Button
            onClick={onSendMessage}
            disabled={!messageInput.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};