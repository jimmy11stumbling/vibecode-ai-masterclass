
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Bell, 
  Activity, 
  FileText, 
  Zap, 
  Info,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface ChatInterfaceExplainerProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const ChatInterfaceExplainer: React.FC<ChatInterfaceExplainerProps> = ({
  activeTab,
  onTabChange
}) => {
  const tabs = [
    {
      id: 'chat',
      title: 'Chat Messages',
      icon: MessageSquare,
      description: 'Main conversation with AI assistant',
      features: [
        'Real-time streaming responses',
        'Code generation requests',
        'Project discussions',
        'Interactive Q&A'
      ],
      color: 'blue'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      description: 'System alerts and status updates',
      features: [
        'Task completion alerts',
        'Error notifications',
        'Progress updates',
        'System status changes'
      ],
      color: 'green'
    },
    {
      id: 'activity',
      title: 'Activity Feed',
      icon: Activity,
      description: 'Real-time activity and processing status',
      features: [
        'Live processing status',
        'Token consumption tracking',
        'Response time metrics',
        'API call monitoring'
      ],
      color: 'purple'
    },
    {
      id: 'files',
      title: 'Generated Files',
      icon: FileText,
      description: 'Code files created by the AI',
      features: [
        'View generated code',
        'Download files',
        'Copy to clipboard',
        'File history tracking'
      ],
      color: 'orange'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'processing': return Clock;
      case 'error': return AlertTriangle;
      default: return Info;
    }
  };

  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center mb-2">
          <Info className="w-5 h-5 mr-2 text-blue-400" />
          Chat Interface Guide
        </h3>
        <p className="text-sm text-slate-400">
          Navigate between different sections to view responses, notifications, and generated content
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tabs.map((tab) => {
          const StatusIcon = getStatusIcon('active');
          const isActive = activeTab === tab.id;
          
          return (
            <Card 
              key={tab.id}
              className={`cursor-pointer transition-all hover:border-slate-600 ${
                isActive 
                  ? 'bg-slate-700 border-blue-500' 
                  : 'bg-slate-800 border-slate-700'
              }`}
              onClick={() => onTabChange(tab.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg bg-${tab.color}-500/20 flex items-center justify-center`}>
                      <tab.icon className={`w-4 h-4 text-${tab.color}-400`} />
                    </div>
                    <div>
                      <CardTitle className="text-sm text-white">{tab.title}</CardTitle>
                    </div>
                  </div>
                  {isActive && (
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      Active
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-slate-400">
                  {tab.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-xs font-medium text-slate-300 mb-2">Features:</div>
                  {tab.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-xs text-slate-400">
                      <CheckCircle className="w-3 h-3 mr-2 text-green-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-slate-700 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-medium text-white">Quick Tips</span>
        </div>
        <div className="text-xs text-slate-400 space-y-1">
          <div>• <strong>Chat tab:</strong> See real-time AI responses with streaming text</div>
          <div>• <strong>Notifications tab:</strong> Monitor system alerts and task status</div>
          <div>• <strong>Activity tab:</strong> Track processing metrics and performance</div>
          <div>• <strong>Files tab:</strong> Access and download generated code files</div>
        </div>
      </div>
    </div>
  );
};
