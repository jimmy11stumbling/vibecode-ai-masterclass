import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Bell } from 'lucide-react';

const NotificationsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationCenter />
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;