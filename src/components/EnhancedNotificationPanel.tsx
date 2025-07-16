
import React, { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Clock,
  X,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface EnhancedNotificationPanelProps {
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onClearAll?: () => void;
}

export const EnhancedNotificationPanel: React.FC<EnhancedNotificationPanelProps> = ({
  notifications = [],
  onMarkAsRead,
  onClearAll
}) => {
  const [localNotifications, setLocalNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'success',
      title: 'Code Generated Successfully',
      message: 'React component has been created and is ready for use',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      type: 'info',
      title: 'AI Processing Started',
      message: 'DeepSeek agent is analyzing your request and generating code',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      read: false
    },
    {
      id: '3',
      type: 'warning',
      title: 'API Rate Limit Approaching',
      message: 'You have used 80% of your hourly API quota',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true
    },
    {
      id: '4',
      type: 'error',
      title: 'Generation Failed',
      message: 'Failed to generate component due to invalid API key',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      read: true
    }
  ]);

  const allNotifications = [...notifications, ...localNotifications];
  const unreadCount = allNotifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return CheckCircle;
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'error': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'info': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const handleMarkAsRead = (id: string) => {
    setLocalNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    onMarkAsRead?.(id);
  };

  const handleClearAll = () => {
    setLocalNotifications([]);
    onClearAll?.();
  };

  return (
    <div className="h-full flex flex-col bg-slate-900 rounded-lg border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Bell className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              {unreadCount} new
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-slate-400 hover:text-white"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-3">
            {allNotifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400">No notifications</p>
                <p className="text-sm text-slate-500">You're all caught up!</p>
              </div>
            ) : (
              allNotifications.map((notification) => {
                const Icon = getNotificationIcon(notification.type);
                const colorClasses = getNotificationColor(notification.type);
                
                return (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      notification.read 
                        ? 'bg-slate-800 border-slate-600 opacity-60' 
                        : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className={`text-sm font-medium ${
                            notification.read ? 'text-slate-400' : 'text-white'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className={`text-sm mt-1 ${
                          notification.read ? 'text-slate-500' : 'text-slate-300'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <div className="flex items-center mt-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3 mr-1" />
                          {notification.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Footer with explanation */}
      <div className="p-3 border-t border-slate-700 bg-slate-800 rounded-b-lg">
        <div className="text-xs text-slate-400">
          <strong>Notification Types:</strong>
          <div className="mt-1 space-y-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-3 h-3 text-green-400" />
              <span>Success - Task completed successfully</span>
            </div>
            <div className="flex items-center space-x-2">
              <Info className="w-3 h-3 text-blue-400" />
              <span>Info - General updates and progress</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3 h-3 text-yellow-400" />
              <span>Warning - Important notices</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>Error - Failed operations</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
