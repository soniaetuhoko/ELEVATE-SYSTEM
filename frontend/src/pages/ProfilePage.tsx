import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  User,
  Mail,
  Lock,
  Bell,
  Palette,
  Award,
  TrendingUp,
  Target,
  BookOpen,
  FolderKanban
} from 'lucide-react';
import Layout from '@/components/Layout';
import { apiService } from '@/services/api';
import type { UserStats } from '@/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  useEffect(() => {
    loadUserStats();
  }, []);

  const loadUserStats = async () => {
    try {
      const response = await apiService.getUserStats();
      setUserStats(response.data);
    } catch (error) {
      toast.error('Failed to load user stats');
    }
  };

  const achievements = [
    { id: 1, title: 'First Mission', description: 'Completed your first mission', icon: Target, earned: (userStats?.missionsCompleted || 0) > 0 },
    { id: 2, title: 'Consistent Learner', description: '7-day reflection streak', icon: BookOpen, earned: (userStats?.learningStreak || 0) >= 7 },
    { id: 3, title: 'Project Master', description: 'Completed 5 projects', icon: FolderKanban, earned: (userStats?.projectsDone || 0) >= 5 },
    { id: 4, title: 'Rising Star', description: 'Reached 50% progress on all missions', icon: TrendingUp, earned: (userStats?.avgProgress || 0) >= 50 },
  ];

  const stats = userStats ? [
    { label: 'Missions Completed', value: userStats.missionsCompleted.toString(), icon: Target, color: 'text-blue-600' },
    { label: 'Projects Done', value: userStats.projectsDone.toString(), icon: FolderKanban, color: 'text-purple-600' },
    { label: 'Reflections Written', value: userStats.reflectionsWritten.toString(), icon: BookOpen, color: 'text-green-600' },
    { label: 'Learning Streak', value: `${userStats.learningStreak} days`, icon: TrendingUp, color: 'text-orange-600' },
  ] : [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile & Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-2xl">
                    {user?.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{user?.name}</CardTitle>
                <CardDescription>{user?.email}</CardDescription>
                <Badge className="mt-2 capitalize">{user?.role}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${stat.color}`} />
                        <span className="text-sm text-muted-foreground">{stat.label}</span>
                      </div>
                      <span className="font-bold">{stat.value}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Settings Tabs */}
          <Card className="lg:col-span-2">
            <Tabs defaultValue="profile" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="preferences">Preferences</TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                <TabsContent value="profile" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          disabled
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        className="w-full min-h-[100px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <Button>Save Changes</Button>
                  </div>
                </TabsContent>

                <TabsContent value="security" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="current-password"
                          type="password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="new-password"
                          type="password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="confirm-password"
                          type="password"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button>Update Password</Button>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <Bell className="h-4 w-4" />
                          <Label id="email-notifications-label" htmlFor="email-notifications">Email Notifications</Label>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Receive email updates about your missions
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="email-notifications"
                        defaultChecked 
                        className="h-4 w-4" 
                        aria-labelledby="email-notifications-label"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label id="mentor-feedback-label" htmlFor="mentor-feedback">Mentor Feedback</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when mentors provide feedback
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="mentor-feedback"
                        defaultChecked 
                        className="h-4 w-4"
                        aria-labelledby="mentor-feedback-label"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label id="deadline-reminders-label" htmlFor="deadline-reminders">Deadline Reminders</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive reminders for upcoming deadlines
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="deadline-reminders"
                        defaultChecked 
                        className="h-4 w-4"
                        aria-labelledby="deadline-reminders-label"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label id="collaboration-updates-label" htmlFor="collaboration-updates">Collaboration Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Updates from your collaboration circles
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="collaboration-updates"
                        className="h-4 w-4"
                        aria-labelledby="collaboration-updates-label"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <Label id="theme-label">Theme</Label>
                      </div>
                      <div className="flex gap-2" role="group" aria-labelledby="theme-label">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          aria-label="Select light theme"
                          type="button"
                        >
                          Light
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          aria-label="Select dark theme"
                          type="button"
                        >
                          Dark
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          aria-label="Select system theme"
                          type="button"
                        >
                          System
                        </Button>
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="language-select">Language</Label>
                      <select 
                        id="language-select"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Select language"
                      >
                        <option>English</option>
                        <option>French</option>
                        <option>Spanish</option>
                      </select>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="timezone-select">Timezone</Label>
                      <select 
                        id="timezone-select"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Select timezone"
                      >
                        <option>UTC (GMT+0)</option>
                        <option>EST (GMT-5)</option>
                        <option>PST (GMT-8)</option>
                        <option>EAT (GMT+3)</option>
                      </select>
                    </div>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>
              Your learning milestones and badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => {
                const Icon = achievement.icon;
                return (
                  <div
                    key={achievement.id}
                    className={`p-4 border rounded-lg text-center ${
                      achievement.earned ? 'bg-gradient-to-br from-blue-50 to-purple-50' : 'opacity-50'
                    }`}
                  >
                    <div className={`inline-flex p-3 rounded-full mb-3 ${
                      achievement.earned ? 'bg-gradient-to-br from-blue-600 to-purple-600' : 'bg-gray-300'
                    }`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold mb-1">{achievement.title}</h3>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    {achievement.earned && (
                      <Badge className="mt-2 bg-green-100 text-green-700">Earned</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}