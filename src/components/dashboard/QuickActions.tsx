import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Code, 
  FileText, 
  Play, 
  PlusCircle,
  Zap
} from 'lucide-react';

interface QuickActionsProps {
  onNavigate: (path: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onNavigate }) => {
  const quickActions = [
    {
      title: "Start AI Chat",
      description: "Begin a conversation with our AI assistant",
      icon: Bot,
      action: () => onNavigate('/chat'),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Code Editor",
      description: "Write and test code in our integrated editor",
      icon: Code,
      action: () => onNavigate('/editor'),
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "New Project",
      description: "Create a new project from scratch",
      icon: PlusCircle,
      action: () => onNavigate('/projects'),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "AI Builder",
      description: "Build applications with AI assistance",
      icon: Zap,
      action: () => onNavigate('/ai-builder'),
      color: "bg-orange-500 hover:bg-orange-600"
    },
    {
      title: "Run Code",
      description: "Execute code in our secure environment",
      icon: Play,
      action: () => onNavigate('/code-executor'),
      color: "bg-red-500 hover:bg-red-600"
    },
    {
      title: "Documentation",
      description: "Browse templates and documentation",
      icon: FileText,
      action: () => onNavigate('/templates'),
      color: "bg-indigo-500 hover:bg-indigo-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {quickActions.map((action, index) => (
        <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={action.action}>
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <div className={`p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-base">{action.title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>{action.description}</CardDescription>
            <Button variant="ghost" size="sm" className="w-full mt-3">
              Get Started
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};