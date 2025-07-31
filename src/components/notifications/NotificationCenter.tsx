import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Document uploaded',
      message: 'Your document has been successfully processed and added to the knowledge base.',
      timestamp: new Date(Date.now() - 300000).toISOString(),
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'Agent communication',
      message: 'New A2A protocol task completed successfully.',
      timestamp: new Date(Date.now() - 600000).toISOString(),
      read: true
    }
  ]);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      {notifications.map((notification) => (
        <Card key={notification.id} className={!notification.read ? 'border-primary' : ''}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                {getIcon(notification.type)}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{notification.title}</h3>
                    {!notification.read && <Badge variant="default" className="text-xs">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!notification.read && (
                  <Button size="sm" variant="ghost" onClick={() => markAsRead(notification.id)}>
                    Mark as read
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => deleteNotification(notification.id)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};