import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import OTPModal from '@/components/OTPModal';
import { Mail, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      login(response.data.token, response.data.user);
      navigate('/dashboard');
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter your full name');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    
    try {
      await apiService.register(email, name, password);
      toast.success('OTP sent to your email!');
      setShowOTPModal(true);
    } catch (error) {
      toast.error('Registration failed. User may already exist.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerifySuccess = () => {
    setShowOTPModal(false);
    setIsLogin(true);
    toast.success('Registration successful! Please login with your credentials.');
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      {/* Background accent (theme-aware, monochrome) */}
      <div className="pointer-events-none absolute inset-0 opacity-5 dark:opacity-10 bg-[radial-gradient(circle_at_30%_20%,_black_0,_transparent_40%)] dark:bg-[radial-gradient(circle_at_30%_20%,_white_0,_transparent_40%)]" />

      {/* Content */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <img src="/brand-logo-mono-light.svg" alt="ELEVATE" className="w-16 h-16 rounded-2xl block dark:hidden" />
              <img src="/brand-logo-mono-dark.svg" alt="ELEVATE" className="w-16 h-16 rounded-2xl hidden dark:block" />
            </div>
            <CardTitle className="text-2xl text-center">
              {isLogin ? 'Welcome Back' : 'Join ELEVATE'}
            </CardTitle>
            <CardDescription className="text-center">
              {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">ALU Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isLogin ? 'Enter your password' : 'Create a password (min 6 characters)'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isLogin ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  isLogin ? 'Login' : 'Register'
                )}
              </Button>
            </form>
            
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-foreground underline"
              >
                {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <footer className="relative border-t dark:border-white/10">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/brand-logo-mono-light.svg" alt="ELEVATE" className="w-8 h-8 rounded-lg block dark:hidden" />
            <img src="/brand-logo-mono-dark.svg" alt="ELEVATE" className="w-8 h-8 rounded-lg hidden dark:block" />
            <span className="font-semibold">ELEVATE</span>
          </div>
          <div className="text-sm opacity-70">© 2025 ELEVATE. All rights reserved.</div>
        </div>
      </footer>

      {/* OTP Modal */}
      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        email={email}
        name={name}
        password={password}
        onVerifySuccess={handleOTPVerifySuccess}
      />
    </div>
  );
}