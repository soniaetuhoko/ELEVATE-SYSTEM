import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import { toast } from 'sonner';
import { 
  Plus, 
  Users,
  MessageSquare,
  UserPlus,
  Star,
  TrendingUp
} from 'lucide-react';
import Layout from '@/components/Layout';
import { apiService } from '@/services/api';
import type { Circle, Mentor } from '@/types';

export default function CollaborationPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [circlesResponse, mentorsResponse] = await Promise.all([
        apiService.getCircles(),
        apiService.getMentors()
      ]);
      setCircles(circlesResponse.data || []);
      setMentors(mentorsResponse.data || []);
    } catch (error) {
      toast.error('Failed to load collaboration data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCircle = async (circleId: string) => {
    try {
      await apiService.joinCircle(circleId);
      toast.success('Joined circle successfully!');
      loadData(); // Reload to update UI
    } catch (error) {
      toast.error('Failed to join circle');
    }
  };

  const handleLeaveCircle = async (circleId: string) => {
    try {
      await apiService.leaveCircle(circleId);
      toast.success('Left circle successfully!');
      loadData(); // Reload to update UI
    } catch (error) {
      toast.error('Failed to leave circle');
    }
  };



  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Collaboration</h1>
            <p className="text-muted-foreground mt-1">
              Connect with peers and mentors
            </p>
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Circle
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Collaboration Circles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Collaboration Circles
                </CardTitle>
                <CardDescription>
                  Join circles to collaborate with peers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {circles.map((circle) => (
                  <div key={circle.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{circle.name}</h3>
                          <Badge variant="outline">{circle.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{circle.description}</p>
                      </div>
                      <Button size="sm" variant="outline" className="gap-2" onClick={() => circle.isJoined ? handleLeaveCircle(circle.id) : handleJoinCircle(circle.id)}>
                        <UserPlus className="h-4 w-4" />
                        {circle.isJoined ? 'Leave' : 'Join'}
                      </Button>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{circle.members} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{circle.posts} posts</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Mentors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Available Mentors
                </CardTitle>
                <CardDescription>
                  Connect with experienced mentors
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {mentors.map((mentor) => (
                  <div key={mentor.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                          {mentor.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <h3 className="font-semibold">{mentor.name}</h3>
                            <p className="text-sm text-muted-foreground">{mentor.role}</p>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-600">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-medium">{mentor.rating}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {mentor.expertise.map((skill) => (
                            <Badge key={skill} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {mentor.students} students
                          </span>
                          <Button size="sm">Request Mentorship</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  No recent activity
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Circles Available</span>
                  <span className="font-bold">{circles.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Mentors Available</span>
                  <span className="font-bold">{mentors.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Members</span>
                  <span className="font-bold">{circles.reduce((acc, c) => acc + c.members, 0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Posts</span>
                  <span className="font-bold">{circles.reduce((acc, c) => acc + c.posts, 0)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}