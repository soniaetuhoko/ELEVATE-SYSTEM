import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Users, Target, FileText, BookOpen, Star, TrendingUp, Search, RefreshCw, Eye, Check, X, MessageSquare } from 'lucide-react';
import Layout from '@/components/Layout';
import { MentorOrAdmin } from '@/components/RoleBasedAccess';
import { toast } from 'sonner';
import apiService from '@/services/api';

export default function StaffDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMissions: 0,
    totalProjects: 0,
    totalReflections: 0,
    mentorshipRequests: 0,
    myRating: 0,
    participationScore: 0
  });
  const [students, setStudents] = useState<any[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<any[]>([]);

  const [allMissions, setAllMissions] = useState<any[]>([]);
  const [allProjects, setAllProjects] = useState<any[]>([]);
  const [allReflections, setAllReflections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');


  useEffect(() => {
    loadStaffData();
  }, []);

  const loadStaffData = async () => {
    try {
      setIsLoading(true);
      
      // Load students only (no staff or admins)
      const studentsData = await apiService.getStudents();
      setStudents(studentsData.data || []);

      // Load mentorship requests
      const requestsData = await apiService.getMentorshipRequests();
      setMentorshipRequests(requestsData.data || []);

      // Load staff stats
      const statsData = await apiService.getStaffStats();
      setStats(statsData.data || stats);

      // Load content for viewing
      const [missionsData, projectsData, reflectionsData] = await Promise.all([
        apiService.getStaffMissions(),
        apiService.getStaffProjects(),
        apiService.getStaffReflections()
      ]);

      setAllMissions(missionsData.data || []);
      setAllProjects(projectsData.data || []);
      setAllReflections(reflectionsData.data || []);

    } catch (error) {
      console.error('Failed to load staff data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMentorshipResponse = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      if (action === 'accept') {
        await apiService.acceptMentorshipRequest(requestId);
      } else {
        await apiService.declineMentorshipRequest(requestId);
      }
      toast.success(`Mentorship request ${action}ed`);
      setMentorshipRequests(prev => prev.filter(req => req.id !== requestId));
    } catch (error) {
      toast.error(`Failed to ${action} mentorship request`);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getParticipationColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <MentorOrAdmin>
        <Layout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </MentorOrAdmin>
    );
  }

  return (
    <MentorOrAdmin>
      <Layout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Staff Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                Monitor students and manage mentorship
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadStaffData}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.mentorshipRequests}</p>
                    <p className="text-sm text-muted-foreground">Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{stats.myRating.toFixed(1)}</p>
                    <p className="text-sm text-muted-foreground">My Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`h-5 w-5 ${getParticipationColor(stats.participationScore)}`} />
                  <div>
                    <p className={`text-2xl font-bold ${getParticipationColor(stats.participationScore)}`}>
                      {stats.participationScore}%
                    </p>
                    <p className="text-sm text-muted-foreground">Participation</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Participation Graph */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                My Participation Score
              </CardTitle>
              <CardDescription>
                Your engagement level based on mentorship activities and platform participation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mentorship Activities</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all" 
                        style={{width: `${Math.min(stats.mentorshipRequests * 10, 100)}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Math.min(stats.mentorshipRequests * 10, 100)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Student Engagement</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all" 
                        style={{width: `${Math.min(stats.myRating * 20, 100)}%`}}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{Math.min(stats.myRating * 20, 100)}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Overall Score</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all ${
                          stats.participationScore >= 80 ? 'bg-green-600' : 
                          stats.participationScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                        }`}
                        style={{width: `${stats.participationScore}%`}}
                      ></div>
                    </div>
                    <span className={`text-sm font-bold ${getParticipationColor(stats.participationScore)}`}>
                      {stats.participationScore}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Content Tabs */}
          <Tabs defaultValue="students" className="space-y-4">
            <TabsList>
              <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
              <TabsTrigger value="mentorship">Mentorship Requests ({mentorshipRequests.length})</TabsTrigger>
              <TabsTrigger value="content">Student Content</TabsTrigger>
            </TabsList>

            <TabsContent value="students" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Student Management</CardTitle>
                  <CardDescription>View and monitor student progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 mb-6">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {filteredStudents.map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                              {student.name.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">{student.email}</p>
                          </div>
                          <Badge variant="outline">Student</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right text-sm">
                            <p className="font-medium">{student.missions || 0} missions</p>
                            <p className="text-muted-foreground">{student.projects || 0} projects</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toast.info('Student details view coming soon')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mentorship" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Mentorship Requests</CardTitle>
                  <CardDescription>Manage incoming mentorship requests from students</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mentorshipRequests.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No pending mentorship requests</p>
                      </div>
                    ) : (
                      mentorshipRequests.map((request: any) => (
                        <div key={request.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-gradient-to-br from-green-600 to-blue-600 text-white">
                                  {request.studentName.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{request.studentName}</p>
                                <p className="text-sm text-muted-foreground">{request.studentEmail}</p>
                              </div>
                            </div>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                          <div className="mb-4">
                            <p className="text-sm font-medium mb-2">Message:</p>
                            <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded">
                              {request.message}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleMentorshipResponse(request.id, 'accept')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleMentorshipResponse(request.id, 'decline')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Student Missions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {allMissions.map((mission: any) => (
                        <div key={mission.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <p className="font-medium text-sm">{mission.title}</p>
                          <p className="text-xs text-muted-foreground">
                            by {mission.user?.name} • {mission.status}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline">{mission.progress}%</Badge>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-6"
                              onClick={() => toast.info('Click to view and comment on mission')}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Comment
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Student Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {allProjects.map((project: any) => (
                        <div key={project.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <p className="font-medium text-sm">{project.title}</p>
                          <p className="text-xs text-muted-foreground">
                            by {project.user?.name} • {project.status}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline">{project.progress}%</Badge>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-6"
                              onClick={() => toast.info('Click to view and comment on project')}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Comment
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Student Reflections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {allReflections.map((reflection: any) => (
                        <div key={reflection.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <p className="font-medium text-sm">{reflection.title}</p>
                          <p className="text-xs text-muted-foreground">
                            by {reflection.user?.name} • Week {reflection.weekNumber}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="outline">
                              {new Date(reflection.createdAt).toLocaleDateString()}
                            </Badge>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-xs h-6"
                              onClick={() => toast.info('Click to view and comment on reflection')}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Comment
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </MentorOrAdmin>
  );
}