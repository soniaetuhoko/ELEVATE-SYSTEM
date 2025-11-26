import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { 
  Loader2, 
  Send, 
  Users, 
  MessageSquare,
  Clock
} from 'lucide-react';
import apiService from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface CircleDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  circle: any;
}

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function CircleDetailModal({ isOpen, onClose, circle }: CircleDetailModalProps) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    if (isOpen && circle) {
      loadPosts();
    }
  }, [isOpen, circle]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getCirclePosts(circle.id);
      setPosts(response.data || []);
    } catch (error: any) {
      console.error('Load posts error:', error);
      if (error.message?.includes('403')) {
        toast.error('You must be a member to view posts');
      } else {
        toast.error('Failed to load posts');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPost.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const postContent = newPost.trim();
    const tempPost: Post = {
      id: `temp-${Date.now()}`,
      content: postContent,
      createdAt: new Date().toISOString(),
      author: {
        id: user?.id || 'current-user',
        name: user?.name || 'You',
        avatar: (user as any)?.avatar
      }
    };

    try {
      setIsPosting(true);
      
      // Optimistically add the post to UI
      setPosts(prev => [tempPost, ...prev]);
      setNewPost('');
      
      // Make API call
      const response = await apiService.createCirclePost(circle.id, postContent);
      
      // Replace temp post with real post data
      if (response.success && response.data) {
        setPosts(prev => prev.map(post => 
          post.id === tempPost.id ? {
            id: response.data.id,
            content: response.data.content,
            createdAt: response.data.createdAt,
            author: response.data.author
          } : post
        ));
      } else {
        // If no proper response, just reload posts
        loadPosts();
      }
      
      toast.success('Posted');
    } catch (error: any) {
      console.error('Create post error:', error);
      
      // Remove the optimistic post on error
      setPosts(prev => prev.filter(post => post.id !== tempPost.id));
      setNewPost(postContent); // Restore the content
      
      if (error.message?.includes('403')) {
        toast.error('You must be a member to post');
      } else {
        toast.error('Failed to create post');
      }
    } finally {
      setIsPosting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!circle) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {circle.name}
          </DialogTitle>
          <DialogDescription>
            {circle.description}
          </DialogDescription>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{circle.members} members</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{circle.posts} posts</span>
            </div>
            <Badge variant="outline">{circle.category}</Badge>
          </div>
        </DialogHeader>

        <Separator />

        {/* Posts Section */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading posts...</span>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No posts yet</p>
                <p className="text-sm">Be the first to start a conversation!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{post.author.name}</span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(post.createdAt)}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{post.content}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <Separator className="my-4" />

          {/* Post Creation Form */}
          {circle.isMember ? (
            <form onSubmit={handleCreatePost} className="flex gap-2">
              <Input
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share your thoughts..."
                disabled={isPosting}
                className="flex-1"
                maxLength={500}
              />
              <Button type="submit" disabled={isPosting || !newPost.trim()}>
                {isPosting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <p>You must be a member to post in this circle</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}