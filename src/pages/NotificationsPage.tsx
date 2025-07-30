import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  Bell, 
  Check, 
  X, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  XCircle,
  Bot,
  Code,
  Database,
  Zap,
  Settings,
  Archive,
  Trash2,
  MarkAsUnread
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'system' | 'ai' | 'project' | 'agent' | 'rag';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  metadata?: any;
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  system: boolean;
  ai: boolean;
  project: boolean;
  agent: boolean;
  rag: boolean;
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    system: true,
    ai: true,
    project: true,
    agent: true,
    rag: true
  });
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    loadNotifications();
    loadSettings();
  }, []);

  const loadNotifications = async () => {
    try {
      // Mock notifications for demo - in production, load from database
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'RAG Database Updated',
          message: 'Your knowledge base has been synchronized with 15 new documents.',
          type: 'success',
          category: 'rag',
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 minutes ago
        },
        {
          id: '2',
          title: 'Agent Task Completed',
          message: 'Code generation task has been completed successfully. 3 files were created.',
          type: 'success',
          category: 'agent',
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
        },
        {
          id: '3',
          title: 'DeepSeek API Limit Warning',
          message: 'You have used 80% of your monthly API quota. Consider upgrading your plan.',
          type: 'warning',
          category: 'ai',
          read: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
        },
        {
          id: '4',
          title: 'Project Build Failed',
          message: 'Build failed for project "Web Dashboard". Check the logs for details.',
          type: 'error',
          category: 'project',
          read: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() // 3 hours ago
        },
        {
          id: '5',
          title: 'System Maintenance',
          message: 'Scheduled maintenance will occur tomorrow at 2 AM UTC. Services may be temporarily unavailable.',
          type: 'info',
          category: 'system',
          read: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() // 6 hours ago
        }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('notification_settings')
        .eq('user_id', user?.id)
        .single();

      if (data && data.notification_settings) {
        setSettings(data.notification_settings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user?.id,
          notification_settings: settings,
          updated_at: new Date().toISOString()
        });

      if (!error) {
        toast({
          title: "Settings saved",
          description: "Your notification preferences have been updated."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: false } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ai':
        return <Bot className="h-4 w-4" />;
      case 'project':
        return <Code className="h-4 w-4" />;
      case 'rag':
        return <Database className="h-4 w-4" />;
      case 'agent':
        return <Zap className="h-4 w-4" />;
      default:
        return <Settings className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now.getTime() - notifTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Bell className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Manage your notifications and preferences
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount} unread
                </Badge>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'read' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </Button>
          </div>

          <div className="space-y-3">
            {filteredNotifications.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {filter === 'unread' 
                      ? "You're all caught up! No unread notifications."
                      : "You don't have any notifications yet."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card key={notification.id} className={`transition-all ${!notification.read ? 'border-primary/50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex items-center space-x-2 mt-1">
                        {getTypeIcon(notification.type)}
                        {getCategoryIcon(notification.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className={`font-medium ${!notification.read ? 'font-bold' : ''}`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          )}
                          <Badge variant="outline" className="text-xs capitalize">
                            {notification.category}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          
                          <div className="flex items-center space-x-1">
                            {notification.read ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsUnread(notification.id)}
                              >
                                <MarkAsUnread className="h-3 w-3" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAsRead(notification.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteNotification(notification.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how and when you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Delivery Methods</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.email}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.push}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, push: checked }))}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h4 className="font-medium">Notification Categories</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>System Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      Maintenance, security updates, and system alerts
                    </p>
                  </div>
                  <Switch
                    checked={settings.system}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, system: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>AI & Model Updates</Label>
                    <p className="text-sm text-muted-foreground">
                      AI task completions, model updates, and API limits
                    </p>
                  </div>
                  <Switch
                    checked={settings.ai}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, ai: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Project Activities</Label>
                    <p className="text-sm text-muted-foreground">
                      Build status, deployments, and project updates
                    </p>
                  </div>
                  <Switch
                    checked={settings.project}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, project: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Agent Activities</Label>
                    <p className="text-sm text-muted-foreground">
                      Agent task completions and multi-agent communications
                    </p>
                  </div>
                  <Switch
                    checked={settings.agent}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, agent: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>RAG Database</Label>
                    <p className="text-sm text-muted-foreground">
                      Document indexing, knowledge base updates, and search activities
                    </p>
                  </div>
                  <Switch
                    checked={settings.rag}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, rag: checked }))}
                  />
                </div>
              </div>

              <Button onClick={saveSettings} disabled={loading} className="w-full">
                Save Notification Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}