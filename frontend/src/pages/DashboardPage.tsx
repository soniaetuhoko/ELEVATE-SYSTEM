import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Users,
  Target,
  FolderKanban,
  BookOpen,
  TrendingUp,
  Award,
  Calendar,
  Activity
} from 'lucide-react';
import Layout from '@/components/Layout';
import { apiService } from '@/services/api';
import type { UserStats } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [platformStats, setPlatformStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [userStatsResponse, platformStatsResponse] = await Promise.all([
        apiService.getUserStats(),
        apiService.getPlatformStats()
      ]);
      setUserStats(userStatsResponse.data);
      setPlatformStats(platformStatsResponse.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const userStatsCards = userStats ? [
    { label: 'Missions Completed', value: userStats.missionsCompleted, icon: Target, color: 'text-blue-600' },
    { label: 'Projects Done', value: userStats.projectsDone, icon: FolderKanban, color: 'text-purple-600' },
    { label: 'Reflections Written', value: userStats.reflectionsWritten, icon: BookOpen, color: 'text-green-600' },
    { label: 'Learning Streak', value: `${userStats.learningStreak} days`, icon: TrendingUp, color: 'text-orange-600' },
  ] : [];

  const platformStatsCards = platformStats ? [
    { label: 'Active Students', value: platformStats.activeStudents, icon: Users, color: 'text-blue-600' },
    { label: 'Missions Completed', value: platformStats.missionsCompleted, icon: Target, color: 'text-green-600' },
    { label: 'Projects Created', value: platformStats.projectsCreated, icon: FolderKanban, color: 'text-purple-600' },
    { label: 'Success Rate', value: `${platformStats.successRate}%`, icon: Award, color: 'text-yellow-600' },
  ] : [];

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {getGreeting()}, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome to your ELEVATE dashboard
            </p>
          </div>
          <Badge className="capitalize">{user?.role}</Badge>
        </div>

        {/* User Stats */}
        {user?.role === 'student' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Your Progress
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {userStatsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card 
                    key={stat.label}
                    className="hover:shadow-lg transition-all hover:-translate-y-1"
                    style={{
                      animation: `fadeIn 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        </div>
                        <Icon className={`h-8 w-8 ${stat.color}`} />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Platform Stats */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Platform Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {platformStatsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={stat.label}
                  className="hover:shadow-lg transition-all hover:-translate-y-1"
                  style={{
                    animation: `fadeIn 0.6s ease-out ${(index + 4) * 0.1}s both`
                  }}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <Icon className={`h-8 w-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Get started with your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {user?.role === 'student' && (
                <>
                  <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-blue-600" />
                      <div>
                        <h3 className="font-semibold">Create Mission</h3>
                        <p className="text-sm text-muted-foreground">Start a new learning mission</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <FolderKanban className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold">New Project</h3>
                        <p className="text-sm text-muted-foreground">Build something amazing</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-8 w-8 text-green-600" />
                      <div>
                        <h3 className="font-semibold">Write Reflection</h3>
                        <p className="text-sm text-muted-foreground">Document your learning</p>
                      </div>
                    </div>
                  </Card>
                </>
              )}
              {(user?.role === 'mentor' || user?.role === 'admin') && (
                <Card className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div>
                      <h3 className="font-semibold">View Students</h3>
                      <p className="text-sm text-muted-foreground">Monitor student progress</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}