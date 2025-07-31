import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '@/components/realtime/WebSocketManager';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { SystemStatus } from '@/components/dashboard/SystemStatus';
import { 
  Bot, 
  Code, 
  Database, 
  FileText, 
  TrendingUp,
  Activity,
  Clock,
  CheckCircle
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
  const { isConnected } = useWebSocket();
  const [metrics, setMetrics] = useState<DashboardMetric[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Simulate loading dashboard data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMetrics: DashboardMetric[] = [
        {
          title: "AI Conversations",
          value: "24",
          change: "+12% from last week",
          trend: "up",
          icon: Bot
        },
        {
          title: "Code Executions",
          value: "156",
          change: "+8% from last week",
          trend: "up",
          icon: Code
        },
        {
          title: "Projects Created",
          value: "8",
          change: "+3 this week",
          trend: "up",
          icon: FileText
        },
        {
          title: "Database Queries",
          value: "2,847",
          change: "+15% from last week",
          trend: "up",
          icon: Database
        }
      ];

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'chat',
          title: 'Completed AI chat session',
          timestamp: '2 minutes ago',
          status: 'completed'
        },
        {
          id: '2',
          type: 'code',
          title: 'Executed Python script',
          timestamp: '15 minutes ago',
          status: 'completed'
        },
        {
          id: '3',
          type: 'project',
          title: 'Created new React project',
          timestamp: '1 hour ago',
          status: 'completed'
        },
        {
          id: '4',
          type: 'agent',
          title: 'Agent workflow processing',
          timestamp: '2 hours ago',
          status: 'in-progress'
        },
        {
          id: '5',
          type: 'code',
          title: 'Database migration failed',
          timestamp: '3 hours ago',
          status: 'failed'
        }
      ];

      setMetrics(mockMetrics);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.email?.split('@')[0] || 'User'}!
        </h1>
        <p className="text-blue-100">
          Your AI-powered development environment is ready. What would you like to build today?
        </p>
      </div>

      {/* Metrics Overview */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <TrendingUp className="h-6 w-6 mr-2" />
          Overview
        </h2>
        <DashboardMetrics metrics={metrics} />
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
        <QuickActions onNavigate={navigate} />
      </section>

      {/* Activity and Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity activities={recentActivity} />
        </div>
        <div>
          <SystemStatus
            isOnline={isConnected}
            agentCount={7}
            activeConnections={3}
            systemLoad={45}
          />
        </div>
      </div>
    </div>
  );
}