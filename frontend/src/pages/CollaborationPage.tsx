import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import { toast } from 'sonner';
import { 
  Plus, 
  Users,
  MessageSquare,
  UserPlus,
  Star,
  TrendingUp,
  Trash2,
  Loader2,
  RefreshCw,
  UserMinus,
  Eye
} from 'lucide-react';
import Layout from '@/components/Layout';
import CircleModal from '@/components/CircleModal';
import CircleDetailModal from '@/components/CircleDetailModal';
import apiService from '@/services/api';
import type { Circle, Mentor } from '@/types';

export default function CollaborationPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCircleModal, setShowCircleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState<any>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [retryCount, setRetryCount] = useState(0);
  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [mentorshipMessage, setMentorshipMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (showToast = true) => {
    try {
      setIsLoading(true);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const dataPromise = Promise.all([
        apiService.getCircles(),
        apiService.getMentors()
      ]);
      
      const [circlesResponse, mentorsResponse] = await Promise.race([
        dataPromise,
        timeoutPromise
      ]) as any;
      
      setCircles(circlesResponse.data || []);
      setMentors(mentorsResponse.data || []);
      setRetryCount(0);
      
      if (showToast && retryCount > 0) {
        toast.success('Data loaded successfully!');
      }
    } catch (error: any) {
      console.error('Load collaboration data error:', error);
      
      if (retryCount < 2) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadData(false);
        }, 2000 * (retryCount + 1));
        
        if (showToast) {
          toast.error(`Loading failed, retrying... (${retryCount + 1}/3)`);
        }
      } else {
        if (showToast) {
          toast.error('Failed to load collaboration data. Please check your connection and try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinCircle = async (circleId: string) => {
    try {
      setLoadingStates(prev => ({ ...prev, [circleId]: true }));
      await apiService.joinCircle(circleId);
      toast.success('Joined');
      loadData(false);
    } catch (error: any) {
      console.error('Join circle error:', error);
      toast.error(error.message || 'Failed to join circle');
    } finally {
      setLoadingStates(prev => ({ ...prev, [circleId]: false }));
    }
  };

  const handleLeaveCircle = async (circleId: string) => {
    if (confirm('Are you sure you want to leave this circle?')) {
      try {
        setLoadingStates(prev => ({ ...prev, [`leave-${circleId}`]: true }));
        await apiService.leaveCircle(circleId);
        toast.success('Left');
        loadData(false);
      } catch (error: any) {
        console.error('Leave circle error:', error);
        toast.error(error.message || 'Failed to leave circle');
      } finally {
        setLoadingStates(prev => ({ ...prev, [`leave-${circleId}`]: false }));
      }
    }
  };

  // const handleLeaveCircle = async (circleId: string) => {
  //   try {
  //     await apiService.leaveCircle(circleId);
  //     toast.success('Left circle successfully!');
  //     loadData(); // Reload to update UI
  //   } catch (error) {
  //     toast.error('Failed to leave circle');
  //   }
  // };
  
  const handleCreateCircle = async (circleData: { name: string; description: string; category?: string }) => {
    try {
      await apiService.createCircle(circleData);
      loadData(); // Reload to show new circle
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const handleViewCircle = (circle: any) => {
    setSelectedCircle(circle);
    setShowDetailModal(true);
  };

  const handleDeleteCircle = async (circleId: string) => {
    if (confirm('Are you sure you want to delete this circle?')) {
      try {
        // Optimistically update UI first
        setCircles(prev => prev.filter(circle => circle.id !== circleId));
        
        // Then make API call
        await apiService.deleteCircle(circleId);
        toast.success('Deleted');
      } catch (error) {
        console.error('Delete circle error:', error);
        toast.error('Failed to delete circle');
        // Reload data to restore state if API call failed
        loadData(false);
      }
    }
  };

  const handleRequestMentorship = (mentor: Mentor) => {
    setSelectedMentor(mentor);
    setMentorshipMessage('');
    setShowMentorshipModal(true);
  };

  const handleSendMentorshipRequest = async () => {
    if (!selectedMentor || !mentorshipMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }

    try {
      setLoadingStates(prev => ({ ...prev, [`mentor-${selectedMentor.id}`]: true }));
      
      await apiService.requestMentorship(selectedMentor.id, mentorshipMessage.trim());
      
      toast.success('Mentorship request sent!');
      setShowMentorshipModal(false);
      setMentorshipMessage('');
      setSelectedMentor(null);
    } catch (error) {
      console.error('Mentorship request error:', error);
      toast.error('Failed to send mentorship request');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`mentor-${selectedMentor.id}`]: false }));
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
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => loadData()} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            <Button className="gap-2" onClick={() => setShowCircleModal(true)}>
              <Plus className="h-4 w-4" />
              Create Circle
            </Button>
          </div>
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading circles...</span>
                  </div>
                ) : circles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No collaboration circles available</p>
                    <Button className="mt-4" onClick={() => setShowCircleModal(true)}>
                      Create the first circle
                    </Button>
                  </div>
                ) : (
                  circles.map((circle: any) => (
                    <div key={circle.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">{circle.name}</h3>
                            <Badge variant="outline">{circle.category}</Badge>
                            {circle.isMember && (
                              <Badge className="bg-green-100 text-green-700">Member</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{circle.description}</p>
                        </div>
                        <div className="flex gap-2">
                          {circle.isMember ? (
                            <>
                              <Button size="sm" variant="outline" className="gap-2" onClick={() => handleViewCircle(circle)}>
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="gap-2 text-orange-600 hover:text-orange-700"
                                onClick={() => handleLeaveCircle(circle.id)}
                                disabled={loadingStates[`leave-${circle.id}`]}
                              >
                                {loadingStates[`leave-${circle.id}`] ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserMinus className="h-4 w-4" />
                                )}
                                Leave
                              </Button>
                            </>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="gap-2" 
                              onClick={() => handleJoinCircle(circle.id)}
                              disabled={loadingStates[circle.id]}
                            >
                              {loadingStates[circle.id] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <UserPlus className="h-4 w-4" />
                              )}
                              Join
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="gap-2 text-red-600 hover:text-red-700" onClick={() => handleDeleteCircle(circle.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                  ))
                )}
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
                          <Button 
                            size="sm" 
                            onClick={() => handleRequestMentorship(mentor)}
                            disabled={loadingStates[`mentor-${mentor.id}`]}
                          >
                            {loadingStates[`mentor-${mentor.id}`] ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : null}
                            Request Mentorship
                          </Button>
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
      
      <CircleModal
        isOpen={showCircleModal}
        onClose={() => setShowCircleModal(false)}
        onSave={handleCreateCircle}
      />
      
      <CircleDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        circle={selectedCircle}
      />
      
      {/* Mentorship Request Modal */}
      <Dialog open={showMentorshipModal} onOpenChange={setShowMentorshipModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Mentorship</DialogTitle>
            <DialogDescription>
              Send a message to {selectedMentor?.name} requesting mentorship
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mentor-message">Your Message</Label>
              <Textarea
                id="mentor-message"
                value={mentorshipMessage}
                onChange={(e) => setMentorshipMessage(e.target.value)}
                placeholder="Hi! I'm interested in your mentorship. I'm working on... and would love your guidance on..."
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {mentorshipMessage.length}/500 characters
              </p>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowMentorshipModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendMentorshipRequest}
                disabled={!mentorshipMessage.trim() || loadingStates[`mentor-${selectedMentor?.id}`]}
                className="flex-1"
              >
                {loadingStates[`mentor-${selectedMentor?.id}`] ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Send Request'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}