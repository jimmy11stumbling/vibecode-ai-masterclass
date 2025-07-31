import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  MessageSquare, 
  Share2, 
  Eye, 
  Edit3, 
  MousePointer,
  Video,
  Mic,
  MicOff,
  VideoOff
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CollaboratorPresence {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  cursor_position?: { x: number; y: number };
  current_section?: string;
  last_active: string;
  status: 'online' | 'away' | 'editing';
}

interface LiveComment {
  id: string;
  user_id: string;
  user_name: string;
  content: string;
  position: { x: number; y: number };
  resolved: boolean;
  created_at: string;
}

export const RealTimeCollaboration: React.FC = () => {
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [comments, setComments] = useState<LiveComment[]>([]);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentPosition, setCommentPosition] = useState<{x: number; y: number} | null>(null);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize real-time presence
    const channel = supabase.channel('collaboration')
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.values(presenceState).flat() as any[];
        setCollaborators(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('New user joined:', newPresences);
        toast({
          title: "User joined",
          description: `${newPresences[0]?.name || 'Someone'} joined the session`
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
        toast({
          title: "User left",
          description: `${leftPresences[0]?.name || 'Someone'} left the session`
        });
      })
      .on('broadcast', { event: 'comment' }, ({ payload }) => {
        setComments(prev => [...prev, payload as LiveComment]);
      })
      .on('broadcast', { event: 'cursor' }, ({ payload }) => {
        setCollaborators(prev => prev.map(user => 
          user.id === payload.user_id 
            ? { ...user, cursor_position: payload.position }
            : user
        ));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track current user presence
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await channel.track({
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email?.split('@')[0],
              status: 'online',
              last_active: new Date().toISOString()
            });
          }
        }
      });

    // Track mouse movement for cursor sharing
    const handleMouseMove = (e: MouseEvent) => {
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: {
          user_id: collaborators.find(c => c.status === 'online')?.id,
          position: { x: e.clientX, y: e.clientY }
        }
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddComment = async (e: React.MouseEvent) => {
    if (!isCommentMode) return;

    const position = { x: e.clientX, y: e.clientY };
    setCommentPosition(position);
  };

  const submitComment = async () => {
    if (!newComment.trim() || !commentPosition) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const comment: LiveComment = {
      id: crypto.randomUUID(),
      user_id: user.id,
      user_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Anonymous',
      content: newComment,
      position: commentPosition,
      resolved: false,
      created_at: new Date().toISOString()
    };

    // Broadcast comment to all collaborators
    const channel = supabase.channel('collaboration');
    await channel.send({
      type: 'broadcast',
      event: 'comment',
      payload: comment
    });

    setComments(prev => [...prev, comment]);
    setNewComment('');
    setCommentPosition(null);
    setIsCommentMode(false);
  };

  const resolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment => 
      comment.id === commentId ? { ...comment, resolved: true } : comment
    ));
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    toast({
      title: isAudioEnabled ? "Audio disabled" : "Audio enabled",
      description: isAudioEnabled ? "Your microphone is now muted" : "Your microphone is now active"
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    toast({
      title: isVideoEnabled ? "Video disabled" : "Video enabled",
      description: isVideoEnabled ? "Your camera is now off" : "Your camera is now on"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'editing': return 'bg-blue-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Live Collaboration
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={isAudioEnabled ? "default" : "outline"}
                onClick={toggleAudio}
              >
                {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant={isVideoEnabled ? "default" : "outline"}
                onClick={toggleVideo}
              >
                {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Active Collaborators */}
            <div>
              <h3 className="text-sm font-medium mb-3">Active Collaborators ({collaborators.length})</h3>
              <div className="space-y-2">
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={collaborator.avatar} />
                          <AvatarFallback>
                            {collaborator.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background ${getStatusColor(collaborator.status)}`} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{collaborator.name}</p>
                        <p className="text-xs text-muted-foreground">{collaborator.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {collaborator.status}
                      </Badge>
                      {collaborator.current_section && (
                        <Badge variant="secondary" className="text-xs">
                          <Edit3 className="w-3 h-3 mr-1" />
                          {collaborator.current_section}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaboration Tools */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Button
                size="sm"
                variant={isCommentMode ? "default" : "outline"}
                onClick={() => setIsCommentMode(!isCommentMode)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {isCommentMode ? 'Exit Comment Mode' : 'Add Comment'}
              </Button>
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share Session
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Follow User
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Comments */}
      {comments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Live Comments ({comments.filter(c => !c.resolved).length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {comments.filter(c => !c.resolved).map((comment) => (
                <div key={comment.id} className="p-3 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {comment.user_name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{comment.user_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resolveComment(comment.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comment Modal */}
      {commentPosition && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Add Comment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter your comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCommentPosition(null);
                      setNewComment('');
                      setIsCommentMode(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={submitComment}>
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cursor indicators for other users */}
      {collaborators
        .filter(c => c.cursor_position && c.id !== 'current-user')
        .map((collaborator) => (
          <div
            key={collaborator.id}
            className="fixed pointer-events-none z-40"
            style={{
              left: collaborator.cursor_position!.x,
              top: collaborator.cursor_position!.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex items-center gap-1">
              <MousePointer className="w-4 h-4 text-purple-500" />
              <div className="bg-purple-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {collaborator.name}
              </div>
            </div>
          </div>
        ))}

      {/* Click handler for comment mode */}
      {isCommentMode && (
        <div 
          className="fixed inset-0 z-30 cursor-crosshair"
          onClick={handleAddComment}
        />
      )}
    </div>
  );
};