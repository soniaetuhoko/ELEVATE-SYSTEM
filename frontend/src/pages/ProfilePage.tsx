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
import { useTheme } from '@/contexts/ThemeContext';
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
  FolderKanban,
  Loader2
} from 'lucide-react';
import Layout from '@/components/Layout';
import apiService from '@/services/api';
import type { UserStats } from '@/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState('');

  const [timezone, setTimezone] = useState('UTC');
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Notification settings
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    mentorFeedback: true,
    deadlineReminders: true,
    collaborationUpdates: false
  });

  useEffect(() => {
    loadUserStats();
    loadPreferences();
    loadAchievements();
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const response = await apiService.getPreferences();
      if (response.success && response.data) {
        const prefs = response.data;

        setTimezone(prefs.timezone || 'UTC');
        setNotifications({
          emailNotifications: prefs.emailNotifications ?? true,
          mentorFeedback: prefs.mentorFeedback ?? true,
          deadlineReminders: prefs.deadlineReminders ?? true,
          collaborationUpdates: prefs.collaborationUpdates ?? false
        });
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const [achievements, setAchievements] = useState<any[]>([]);

  const loadUserStats = async () => {
    try {
      const response = await apiService.getUserStats();
      setUserStats(response.data);
    } catch (error) {
      console.error('Failed to load user stats:', error);
      setUserStats({
        missionsCompleted: 0,
        projectsDone: 0,
        reflectionsWritten: 0,
        learningStreak: 0,
        avgProgress: 0,
        totalMissions: 0,
        inProgressMissions: 0
      });
    }
  };

  const loadAchievements = async () => {
    try {
      const response = await apiService.getAchievements();
      setAchievements(response.data || []);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    }
  };
  
  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      await apiService.updateProfile({ name });
      toast.success('Updated');
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      await apiService.updatePassword(currentPassword, newPassword);
      toast.success('Updated');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Password update error:', error);
      toast.error('Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNotificationUpdate = async () => {
    setIsLoading(true);
    try {
      await apiService.updateNotificationSettings(notifications);
      toast.success('Updated');
    } catch (error) {
      console.error('Notification update error:', error);
      toast.error('Failed to update notification settings');
    } finally {
      setIsLoading(false);
    }
  };
  


  const handleTimezoneChange = async (newTimezone: string) => {
    setTimezone(newTimezone);
    try {
      await apiService.updatePreferences({ timezone: newTimezone });
      toast.success('Updated');
    } catch (error) {
      console.error('Failed to save timezone preference:', error);
      toast.error('Failed to save timezone preference');
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Target': return Target;
      case 'BookOpen': return BookOpen;
      case 'FolderKanban': return FolderKanban;
      case 'TrendingUp': return TrendingUp;
      default: return Award;
    }
  };

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
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full min-h-[100px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    <Button onClick={handleProfileUpdate} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
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
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
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
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
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
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Button onClick={handlePasswordUpdate} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Password'
                      )}
                    </Button>
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
                        <p id="email-notifications-desc" className="text-sm text-muted-foreground">
                          Receive email updates about your missions
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="email-notifications"
                        checked={notifications.emailNotifications}
                        onChange={(e) => setNotifications(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                        className="h-4 w-4" 
                        aria-labelledby="email-notifications-label"
                        aria-describedby="email-notifications-desc"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label id="mentor-feedback-label" htmlFor="mentor-feedback">Mentor Feedback</Label>
                        <p id="mentor-feedback-desc" className="text-sm text-muted-foreground">
                          Get notified when mentors provide feedback
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="mentor-feedback"
                        checked={notifications.mentorFeedback}
                        onChange={(e) => setNotifications(prev => ({ ...prev, mentorFeedback: e.target.checked }))}
                        className="h-4 w-4"
                        aria-labelledby="mentor-feedback-label"
                        aria-describedby="mentor-feedback-desc"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label id="deadline-reminders-label" htmlFor="deadline-reminders">Deadline Reminders</Label>
                        <p id="deadline-reminders-desc" className="text-sm text-muted-foreground">
                          Receive reminders for upcoming deadlines
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="deadline-reminders"
                        checked={notifications.deadlineReminders}
                        onChange={(e) => setNotifications(prev => ({ ...prev, deadlineReminders: e.target.checked }))}
                        className="h-4 w-4"
                        aria-labelledby="deadline-reminders-label"
                        aria-describedby="deadline-reminders-desc"
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label id="collaboration-updates-label" htmlFor="collaboration-updates">Collaboration Updates</Label>
                        <p id="collaboration-updates-desc" className="text-sm text-muted-foreground">
                          Updates from your collaboration circles
                        </p>
                      </div>
                      <input 
                        type="checkbox" 
                        id="collaboration-updates"
                        checked={notifications.collaborationUpdates}
                        onChange={(e) => setNotifications(prev => ({ ...prev, collaborationUpdates: e.target.checked }))}
                        className="h-4 w-4"
                        aria-labelledby="collaboration-updates-label"
                        aria-describedby="collaboration-updates-desc"
                      />
                    </div>
                    <Button onClick={handleNotificationUpdate} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Notification Settings'
                      )}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="preferences" className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        <Label id="theme-label">Theme</Label>
                      </div>
                      <fieldset className="flex gap-2" aria-labelledby="theme-label">
                        <Button 
                          variant={theme === 'light' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setTheme('light')}
                          aria-label="Select light theme"
                          type="button"
                        >
                          Light
                        </Button>
                        <Button 
                          variant={theme === 'dark' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setTheme('dark')}
                          aria-label="Select dark theme"
                          type="button"
                        >
                          Dark
                        </Button>
                        <Button 
                          variant={theme === 'system' ? 'default' : 'outline'}
                          className="flex-1"
                          onClick={() => setTheme('system')}
                          aria-label="Select system theme"
                          type="button"
                        >
                          System
                        </Button>
                      </fieldset>
                    </div>

                    <Separator />
                    <div className="space-y-2">
                      <Label htmlFor="timezone-select">Timezone</Label>
                      <select 
                        id="timezone-select"
                        value={timezone}
                        onChange={(e) => handleTimezoneChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Select timezone"
                      >
                        <option value="UTC">UTC (GMT+0)</option>
                        <option value="EST">EST (GMT-5)</option>
                        <option value="PST">PST (GMT-8)</option>
                        <option value="EAT">EAT (GMT+3)</option>
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
                const Icon = getIconComponent(achievement.icon);
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