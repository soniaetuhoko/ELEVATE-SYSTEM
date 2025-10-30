import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import ImageCarousel from '@/components/ImageCarousel';
import AnimatedCounter from '@/components/AnimatedCounter';
import ThemeToggle from '@/components/ThemeToggle';
import { useInView } from 'react-intersection-observer';
import { 
  Target, 
  FolderKanban, 
  BookOpen, 
  Users, 
  TrendingUp,
  Sparkles,
  Award,
  Zap,
  ArrowRight,
  Star
} from 'lucide-react';

export default function LandingPage() {
  const { ref: featuresRef, inView: featuresInView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  const carouselImages = [
    '/alu1.jpg',
    '/alu2.jpg',
    '/alu3.jpg',
  ];
  const features = [
    {
      icon: Target,
      title: 'Mission-Based Learning',
      description: 'Set clear goals and track your progress with structured learning missions',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FolderKanban,
      title: 'Project Management',
      description: 'Organize and manage your learning projects with intuitive tools',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: BookOpen,
      title: 'Reflective Journaling',
      description: 'Document your learning journey and track your growth over time',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Users,
      title: 'Peer Collaboration',
      description: 'Connect with peers and mentors in collaborative learning circles',
      color: 'from-orange-500 to-orange-600',
    },
    {
      icon: TrendingUp,
      title: 'Progress Analytics',
      description: 'Visualize your learning progress with detailed analytics and insights',
      color: 'from-pink-500 to-pink-600',
    },
    {
      icon: Award,
      title: 'Achievements',
      description: 'Earn badges and celebrate milestones as you progress',
      color: 'from-indigo-500 to-indigo-600',
    },
  ];

  const stats = [
    { value: '500+', label: 'Active Students' },
    { value: '1,200+', label: 'Missions Completed' },
    { value: '3,500+', label: 'Projects Created' },
    { value: '95%', label: 'Success Rate' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Computer Science Student',
      content: 'ELEVATE transformed how I approach learning. The mission-based structure keeps me focused and motivated!',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Data Science Student',
      content: 'The reflection feature helped me understand my learning patterns. I\'ve grown so much in just 3 months!',
      rating: 5,
    },
    {
      name: 'Emma Williams',
      role: 'Business Student',
      content: 'Collaborating with peers and mentors on ELEVATE has been invaluable for my personal development.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/brand-logo-mono-light.svg" alt="ELEVATE" className="w-10 h-10 rounded-xl block dark:hidden" />
            <img src="/brand-logo-mono-dark.svg" alt="ELEVATE" className="w-10 h-10 rounded-xl hidden dark:block" />
            <span className="text-xl font-bold">ELEVATE</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/login">
              <Button className="bg-black text-white hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-200">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge className="bg-black text-white border-0 dark:bg-white dark:text-black">
              <Sparkles className="h-3 w-3 mr-1" />
              Transform Your Learning Journey
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Elevate Your
              <span className="text-black dark:text-white"> Learning </span>
              Experience
            </h1>
            <p className="text-xl text-muted-foreground">
              A comprehensive platform designed for ALU students to track missions, manage projects, 
              reflect on growth, and collaborate with peers and mentors.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/login">
                <Button size="lg" className="bg-black text-white hover:bg-neutral-900 dark:bg-white dark:text-black dark:hover:bg-neutral-200 text-lg px-8 gap-2">
                  Start Your Journey
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 border-black text-black hover:bg-black hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-black">
                  Learn More
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-8 pt-4">
              {stats.slice(0, 2).map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold">
                    <AnimatedCounter 
                      end={parseInt(stat.value)} 
                      suffix={stat.value.includes('+') ? '+' : ''}
                    />
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 rounded-3xl opacity-10 dark:opacity-20 bg-black dark:bg-white"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border dark:border-gray-700">
              <ImageCarousel images={carouselImages} autoplay interval={4000} />
              <div className="p-8 space-y-4">
                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-white/5 rounded-xl">
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                    <Target className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Web Development Mastery</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div className="bg-black dark:bg-white h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                      <span className="text-sm font-medium">75%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-white/5 rounded-xl">
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Weekly Reflection</p>
                    <p className="text-sm text-muted-foreground">12 entries this month</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-neutral-50 dark:bg-white/5 rounded-xl">
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center">
                    <Users className="h-6 w-6 text-white dark:text-black" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">Collaboration Circles</p>
                    <p className="text-sm text-muted-foreground">3 active groups</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white dark:bg-gray-900 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-bold">
                  <AnimatedCounter 
                    end={parseInt(stat.value.replace(/[^0-9]/g, ''))} 
                    suffix={stat.value.includes('+') ? '+' : stat.value.includes('%') ? '%' : ''}
                  />
                </p>
                <p className="text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 mb-4">
            <Zap className="h-3 w-3 mr-1" />
            Features
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Succeed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed to enhance your learning experience and help you achieve your goals
          </p>
        </div>
        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="border-2 dark:border-gray-700 dark:bg-gray-800 hover:shadow-xl transition-all hover:-translate-y-1"
                style={{
                  animation: featuresInView ? `fadeIn 0.6s ease-out ${index * 0.1}s both` : 'none'
                }}
              >
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-black text-white dark:bg-white dark:text-black">
                    <Icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-black text-white dark:bg-white dark:text-black py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="bg-white text-black border-0 mb-4 dark:bg-black dark:text-white">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Testimonials
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by Students
            </h2>
            <p className="text-xl opacity-80 max-w-2xl mx-auto">
              See what our community has to say about their experience
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={testimonial.name} 
                className="backdrop-blur-md border-white/20 dark:border-black/20 bg-white/10 text-white dark:bg-black/10 dark:text-black"
                style={{
                  animation: `fadeIn 0.6s ease-out ${index * 0.2}s both`
                }}
              >
                <CardHeader>
                  <div className="flex gap-1 mb-4 text-current opacity-90">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <CardDescription className="text-current/80 text-base">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm opacity-70">{testimonial.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-black dark:bg-white border-0 text-white dark:text-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTI0IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10"></div>
          <CardContent className="p-12 text-center">
            <Link to="/login" className="block">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 hover:opacity-90 transition-opacity cursor-pointer">
                Ready to Transform Your Learning?
              </h2>
              <p className="text-xl opacity-80 max-w-2xl mx-auto hover:opacity-100 transition-opacity cursor-pointer">
                Join hundreds of ALU students who are already elevating their learning experience
              </p>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-background text-foreground border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img src="/brand-logo-mono-light.svg" alt="ELEVATE" className="w-8 h-8 rounded-lg block dark:hidden" />
                <img src="/brand-logo-mono-dark.svg" alt="ELEVATE" className="w-8 h-8 rounded-lg hidden dark:block" />
                <span className="text-lg font-bold">ELEVATE</span>
              </div>
              <p className="text-sm opacity-80 max-w-md">
                A learning platform designed for African Leadership University (ALU) students to track missions, 
                manage projects, reflect on growth, and collaborate with peers and mentors.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Academic Resources</h3>
              <ul className="space-y-2 text-sm opacity-80">
                <li><Link to="/login" className="hover:opacity-100">Student Portal</Link></li>
                <li><a href="https://elevate-system.onrender.com/docs/" target="_blank" rel="noopener noreferrer" className="hover:opacity-100">API Documentation</a></li>
                <li><Link to="/login" className="hover:opacity-100">Learning Dashboard</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm opacity-70">
            <p>© 2025 ELEVATE - African Leadership University Student Learning Platform. Made with ❤️ for ALU students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}