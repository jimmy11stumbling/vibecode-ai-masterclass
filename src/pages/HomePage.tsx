import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Code, 
  Database, 
  FileText, 
  Play, 
  BarChart3, 
  Users, 
  Zap,
  TrendingUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  PlusCircle
} from 'lucide-react';

interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ElementType;
}

interface RecentActivity {
  id: string;
  type: 'code' | 'chat' | 'project' | 'agent';
  title: string;
  timestamp: string;
  status: 'completed' | 'in-progress' | 'failed';
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading dashboard data
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMetrics([
        {
          title: "Active Projects",
          value: "12",
          change: "+2 this week",
          trend: 'up',
          icon: FileText
        },
        {
          title: "Code Executions",
          value: "1,234",
          change: "+15% from last week",
          trend: 'up',
          icon: Play
        },
        {
          title: "AI Conversations",
          value: "89",
          change: "+5 today",
          trend: 'up',
          icon: Bot
        },
        {
          title: "System Uptime",
          value: "99.9%",
          change: "All systems operational",
          trend: 'stable',
          icon: Activity
        }
      ]);

      setRecentActivity([
        {
          id: '1',
          type: 'code',
          title: 'Executed Python script: data_analysis.py',
          timestamp: '2 minutes ago',
          status: 'completed'
        },
        {
          id: '2',
          type: 'chat',
          title: 'AI conversation about React hooks',
          timestamp: '5 minutes ago',
          status: 'completed'
        },
        {
          id: '3',
          type: 'project',
          title: 'Created new project: E-commerce Dashboard',
          timestamp: '1 hour ago',
          status: 'completed'
        },
        {
          id: '4',
          type: 'agent',
          title: 'Agent workflow execution',
          timestamp: '2 hours ago',
          status: 'in-progress'
        }
      ]);

      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'code': return Code;
      case 'chat': return Bot;
      case 'project': return FileText;
      case 'agent': return Zap;
      default: return Activity;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in-progress': return Clock;
      case 'failed': return AlertCircle;
      default: return Activity;
    }
  };

  const quickActions = [
    {
      title: "Start AI Chat",
      description: "Begin a new conversation with DeepSeek AI",
      icon: Bot,
      action: () => navigate('/chat'),
      color: "bg-blue-500"
    },
    {
      title: "Create Project",
      description: "Start a new development project",
      icon: PlusCircle,
      action: () => navigate('/projects'),
      color: "bg-green-500"
    },
    {
      title: "Code Executor",
      description: "Run and test your code instantly",
      icon: Play,
      action: () => navigate('/code-executor'),
      color: "bg-purple-500"
    },
    {
      title: "View Analytics",
      description: "Check your development metrics",
      icon: BarChart3,
      action: () => navigate('/analytics'),
      color: "bg-orange-500"
    }
  ];

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded-md w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your development environment today.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <TrendingUp className={`h-3 w-3 ${
                    metric.trend === 'up' ? 'text-green-500' : 
                    metric.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                  }`} />
                  <span>{metric.change}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Jump into your most common tasks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4"
                    onClick={action.action}
                  >
                    <div className={`p-2 rounded-md ${action.color} mr-3`}>
                      <IconComponent className="h-4 w-4 text-white" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest actions and system events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.type);
                  const StatusIcon = getStatusIcon(activity.status);
                  
                  return (
                    <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <div className="p-2 bg-primary/10 rounded-md">
                        <ActivityIcon className="h-4 w-4 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.timestamp}
                        </p>
                      </div>
                      
                      <div className="flex items-center">
                        <StatusIcon className={`h-4 w-4 ${
                          activity.status === 'completed' ? 'text-green-500' :
                          activity.status === 'in-progress' ? 'text-yellow-500' :
                          'text-red-500'
                        }`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current status of all system components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">DeepSeek AI</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">RAG Database</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <Progress value={98} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">MCP Services</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <Progress value={95} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}