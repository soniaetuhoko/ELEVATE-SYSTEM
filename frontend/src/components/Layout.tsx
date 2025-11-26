import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ThemeToggle from '@/components/ThemeToggle';
import { StudentOnly } from '@/components/RoleBasedAccess';
import { getRoleDisplayName } from '@/utils/roleUtils';
import apiService from '@/services/api';
import { toast } from 'sonner';
import { 
  LogOut,
  Bell,
  Search,
  LayoutDashboard,
  Target,
  FolderKanban,
  BookOpen,
  Users,
  Settings,
  Menu,
  X,
  HelpCircle
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import HelpModal from '@/components/HelpModal';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
    }
  }, [isAuthenticated, user]);

  const loadNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      setNotifications(response.data || []);
      setUnreadCount(response.data?.filter((n: any) => !n.read).length || 0);
    } catch (error) {
      // Silently fail for notifications
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    try {
      const response = await apiService.search(searchQuery);
      toast.success(`Found ${response.data?.total || 0} results`);
      // Could navigate to search results page or show modal
    } catch (error) {
      toast.error('Search failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // If not authenticated, show a simplified header
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <img src="/brand-logo-mono-light.svg" alt="ELEVATE" className="w-10 h-10 rounded-xl block dark:hidden" />
                <img src="/brand-logo-mono-dark.svg" alt="ELEVATE" className="w-10 h-10 rounded-xl hidden dark:block" />
                <h1 className="text-xl font-bold">ELEVATE</h1>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/login')}>
                Get Started
              </Button>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  const getNavItems = () => {
    const baseItems = [
      // SRS 2.2: Mission dashboard for all users
      { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['student', 'mentor', 'admin'] },
      
      // Student-specific features (Primary users)
      { path: '/missions', label: 'My Missions', icon: Target, roles: ['student'] },        // FR 2: Mission Creation
      { path: '/projects', label: 'My Projects', icon: FolderKanban, roles: ['student'] },  // FR 2.1: Project Workspace
      { path: '/reflections', label: 'Reflections', icon: BookOpen, roles: ['student'] },   // FR 3: Reflective Journaling
      
      // Collaboration features
      { path: '/collaboration', label: 'Collaboration', icon: Users, roles: ['student', 'mentor'] }, // FR 3.2: Peer Collaboration & Mentorship
      
      // Faculty/Mentor and Admin features
      { path: '/students', label: 'Student Progress', icon: Users, roles: ['mentor', 'admin'] },
      { path: '/system', label: 'System Management', icon: Settings, roles: ['admin'] },
      
      // Profile for all users
      { path: '/profile', label: 'Profile', icon: Settings, roles: ['student', 'mentor', 'admin'] },
    ];
    
    return baseItems.filter(item => user && item.roles.includes(user.role));
  };
  
  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-lg font-bold text-white">E</span>
              </div>
              <h1 className="text-xl font-bold hidden sm:block">ELEVATE</h1>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
          
          <div className="flex-1 max-w-md mx-4 md:mx-8 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search missions, projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" onClick={() => setShowHelp(true)}>
              <HelpCircle className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <StudentOnly>
              <Button variant="ghost" size="icon" className="hidden sm:flex relative" onClick={loadNotifications}>
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </StudentOnly>
            <Separator orientation="vertical" className="h-8 hidden sm:block" />
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm md:text-base">
                  {user?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user ? getRoleDisplayName(user.role) : ''}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden sm:flex">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Desktop */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 hidden md:block">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                    isActive
                      ? 'border-black text-black dark:border-white dark:text-white font-medium'
                      : 'border-transparent text-gray-700 hover:text-black hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 md:hidden">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-medium'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Separator className="my-2" />
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 md:py-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        {children}
      </main>
      
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}