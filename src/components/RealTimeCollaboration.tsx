
import React, { useState, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, MessageCircle, Share, Edit3, Eye, UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'idle' | 'offline';
  cursor?: {
    file: string;
    line: number;
    column: number;
  };
  role: 'owner' | 'editor' | 'viewer';
  lastSeen: Date;
}

interface CollaborationActivity {
  id: string;
  type: 'edit' | 'comment' | 'join' | 'leave' | 'share';
  user: {
    name: string;
    avatar?: string;
  };
  description: string;
  timestamp: Date;
  file?: string;
  line?: number;
}

interface RealTimeCollaborationProps {
  projectId: string;
  currentFile?: string;
  onUserJoin?: (user: Collaborator) => void;
  onUserLeave?: (userId: string) => void;
  onActivity?: (activity: CollaborationActivity) => void;
}

export const RealTimeCollaboration: React.FC<RealTimeCollaborationProps> = ({
  projectId,
  currentFile,
  onUserJoin,
  onUserLeave,
  onActivity
}) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [activities, setActivities] = useState<CollaborationActivity[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    initializeRealTimeCollaboration();
    return () => {
      cleanupCollaboration();
    };
  }, [projectId]);

  const initializeRealTimeCollaboration = async () => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      if (!user) return;

      // Subscribe to presence changes
      const channel = supabase
        .channel(`project:${projectId}`)
        .on('presence', { event: 'sync' }, () => {
          const presenceState = channel.presenceState();
          const users = Object.values(presenceState).flat() as any[];
          
          const activeCollaborators: Collaborator[] = users.map(userPresence => ({
            id: userPresence.user_id,
            name: userPresence.name || 'Anonymous',
            email: userPresence.email || '',
            avatar: userPresence.avatar_url,
            status: 'active',
            cursor: userPresence.cursor,
            role: userPresence.role || 'viewer',
            lastSeen: new Date()
          }));

          setCollaborators(activeCollaborators);
        })
        .on('presence', { event: 'join' }, ({ newPresences }) => {
          newPresences.forEach((presence: any) => {
            const newUser: Collaborator = {
              id: presence.user_id,
              name: presence.name || 'Anonymous',
              email: presence.email || '',
              avatar: presence.avatar_url,
              status: 'active',
              role: presence.role || 'viewer',
              lastSeen: new Date()
            };
            
            onUserJoin?.(newUser);
            
            const activity: CollaborationActivity = {
              id: crypto.randomUUID(),
              type: 'join',
              user: { name: newUser.name, avatar: newUser.avatar },
              description: `${newUser.name} joined the project`,
              timestamp: new Date()
            };
            
            setActivities(prev => [activity, ...prev].slice(0, 50));
            onActivity?.(activity);
          });
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }) => {
          leftPresences.forEach((presence: any) => {
            onUserLeave?.(presence.user_id);
            
            const activity: CollaborationActivity = {
              id: crypto.randomUUID(),
              type: 'leave',
              user: { name: presence.name || 'Anonymous', avatar: presence.avatar_url },
              description: `${presence.name || 'User'} left the project`,
              timestamp: new Date()
            };
            
            setActivities(prev => [activity, ...prev].slice(0, 50));
            onActivity?.(activity);
          });
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            // Track current user presence
            await channel.track({
              user_id: user.id,
              name: user.user_metadata.full_name || user.email?.split('@')[0] || 'Anonymous',
              email: user.email,
              avatar_url: user.user_metadata.avatar_url,
              role: 'editor', // This would be determined by project permissions
              online_at: new Date().toISOString(),
              current_file: currentFile
            });
          }
        });

      // Subscribe to real-time activities
      subscribeToActivities();
      
    } catch (error) {
      console.error('Failed to initialize collaboration:', error);
    }
  };

  const subscribeToActivities = () => {
    // Subscribe to file changes and other activities
    const activityChannel = supabase
      .channel(`activities:${projectId}`)
      .on('broadcast', { event: 'activity' }, (payload) => {
        const activity = payload.activity as CollaborationActivity;
        setActivities(prev => [activity, ...prev].slice(0, 50));
        onActivity?.(activity);
      })
      .subscribe();
  };

  const cleanupCollaboration = () => {
    supabase.removeAllChannels();
  };

  const updateCursorPosition = useCallback(async (file: string, line: number, column: number) => {
    if (!currentUser) return;

    try {
      const channel = supabase.channel(`project:${projectId}`);
      await channel.track({
        user_id: currentUser.id,
        cursor: { file, line, column },
        last_activity: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to update cursor position:', error);
    }
  }, [currentUser, projectId]);

  const broadcastActivity = async (activity: Omit<CollaborationActivity, 'id' | 'timestamp'>) => {
    try {
      const fullActivity: CollaborationActivity = {
        ...activity,
        id: crypto.randomUUID(),
        timestamp: new Date()
      };

      await supabase
        .channel(`activities:${projectId}`)
        .send({
          type: 'broadcast',
          event: 'activity',
          activity: fullActivity
        });
    } catch (error) {
      console.error('Failed to broadcast activity:', error);
    }
  };

  const inviteCollaborator = async (email: string, role: 'editor' | 'viewer' = 'viewer') => {
    try {
      // In a real implementation, this would send an invitation
      const activity: CollaborationActivity = {
        id: crypto.randomUUID(),
        type: 'share',
        user: { name: currentUser?.user_metadata?.full_name || 'You' },
        description: `Invited ${email} as ${role}`,
        timestamp: new Date()
      };

      setActivities(prev => [activity, ...prev].slice(0, 50));
      await broadcastActivity(activity);
    } catch (error) {
      console.error('Failed to invite collaborator:', error);
    }
  };

  const getStatusColor = (status: Collaborator['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (role: Collaborator['role']) => {
    switch (role) {
      case 'owner': return 'bg-purple-500';
      case 'editor': return 'bg-blue-500';
      case 'viewer': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <Card className="bg-slate-900 border-slate-700 shadow-xl">
        <CardHeader 
          className="pb-2 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm text-white flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Collaboration
              <Badge variant="outline" className="ml-2 text-xs">
                {collaborators.length}
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              {isExpanded ? '−' : '+'}
            </Button>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="pt-0">
            {/* Active Collaborators */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Active Users</h4>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center space-x-2">
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={collaborator.avatar} />
                        <AvatarFallback className="text-xs">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ${getStatusColor(collaborator.status)}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-white truncate">{collaborator.name}</span>
                        <Badge className={`text-xs ${getRoleColor(collaborator.role)} border-none`}>
                          {collaborator.role}
                        </Badge>
                      </div>
                      {collaborator.cursor && (
                        <div className="text-xs text-slate-400 truncate">
                          <Edit3 className="w-3 h-3 inline mr-1" />
                          {collaborator.cursor.file}:{collaborator.cursor.line}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-4">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={() => {/* Open invite modal */}}
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  Invite
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 h-7 text-xs"
                  onClick={() => {/* Open share modal */}}
                >
                  <Share className="w-3 h-3 mr-1" />
                  Share
                </Button>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 mb-2">Recent Activity</h4>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {activities.slice(0, 10).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-2">
                      <Avatar className="h-4 w-4 mt-0.5">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-xs">
                          {activity.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-300 leading-tight">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatTimeAgo(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
