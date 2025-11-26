import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { MessageSquare, Send, Loader2, Clock } from 'lucide-react';
import apiService from '@/services/api';

interface CommentsSectionProps {
  type: 'mission' | 'project' | 'reflection';
  itemId: string;
  itemTitle?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export default function CommentsSection({ type, itemId }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [type, itemId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const response = user?.role === 'student' 
        ? await apiService.getComments(type, itemId)
        : await apiService.getStaffComments(type, itemId);
      setComments(response.data || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    if (user?.role === 'student') {
      toast.error('Only staff can add comments');
      return;
    }

    try {
      setIsPosting(true);
      
      // Optimistically add comment to UI
      const tempComment: Comment = {
        id: `temp-${Date.now()}`,
        content: newComment.trim(),
        createdAt: new Date().toISOString(),
        author: {
          id: user?.id || '',
          name: user?.name || '',
          email: user?.email || '',
          role: user?.role || 'mentor'
        }
      };
      
      setComments(prev => [tempComment, ...prev]);
      setNewComment('');
      
      // Make API call
      const response = await apiService.addComment(type, itemId, newComment.trim());
      
      // Replace temp comment with real comment
      if (response.success && response.data) {
        setComments(prev => prev.map(comment => 
          comment.id === tempComment.id ? response.data : comment
        ));
      }
      
      toast.success('Comment added');
    } catch (error) {
      console.error('Add comment error:', error);
      toast.error('Failed to add comment');
      // Remove optimistic comment on error
      setComments(prev => prev.filter(comment => comment.id !== `temp-${Date.now()}`));
      setNewComment(newComment); // Restore content
    } finally {
      setIsPosting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">Staff Comments</h3>
        <Badge variant="outline">{comments.length}</Badge>
      </div>

      {/* Add Comment (Staff Only) */}
      {(user?.role === 'mentor' || user?.role === 'admin') && (
        <div className="space-y-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={`Add a comment on this ${type}...`}
            className="min-h-[80px]"
            maxLength={500}
            disabled={isPosting}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {newComment.length}/500 characters
            </p>
            <Button 
              onClick={handleAddComment}
              disabled={isPosting || !newComment.trim()}
              size="sm"
            >
              {isPosting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Adding...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Add Comment
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <Separator />

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading comments...</span>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No comments yet</p>
            {user?.role === 'student' && (
              <p className="text-sm">Staff will provide feedback here</p>
            )}
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-green-600 to-blue-600 text-white text-sm">
                    {comment.author.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm">{comment.author.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {comment.author.role === 'mentor' ? 'Staff' : comment.author.role}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(comment.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}