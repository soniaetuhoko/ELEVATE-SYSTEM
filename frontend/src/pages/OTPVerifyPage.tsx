import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { getUserRoleFromEmail, getRoleDisplayName } from '@/utils/roleUtils';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function OTPVerifyPage() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const email = location.state?.email;
  const userName = location.state?.name;

  useEffect(() => {
    if (!email || !userName) {
      navigate('/login');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Determine user role based on SRS user classes
      const userRole = getUserRoleFromEmail(email);
      
      const mockUser = {
        id: '1',
        email: email,
        name: userName,
        role: userRole,
      };
      const mockToken = 'mock-jwt-token-' + Date.now();
      
      login(mockToken, mockUser);
      toast.success(`Welcome back, ${getRoleDisplayName(mockUser.role)}!`);
      // All user classes redirect to dashboard (SRS 2.2: Mission dashboard)
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('New OTP sent to your email!');
      setCanResend(false);
      setCountdown(60);
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-background text-foreground">
      {/* Background accent (theme-aware, monochrome) */}
      <div className="pointer-events-none absolute inset-0 opacity-5 dark:opacity-10 bg-[radial-gradient(circle_at_70%_20%,_black_0,_transparent_40%)] dark:bg-[radial-gradient(circle_at_70%_20%,_white_0,_transparent_40%)]" />

      <div className="relative flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mb-2"
              onClick={() => navigate('/login')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div className="flex items-center justify-center mb-2">
              <img src="/brand-logo-mono-light.svg" alt="ELEVATE" className="w-14 h-14 rounded-xl block dark:hidden" />
              <img src="/brand-logo-mono-dark.svg" alt="ELEVATE" className="w-14 h-14 rounded-xl hidden dark:block" />
            </div>
            <CardTitle className="text-2xl text-center">Verify OTP</CardTitle>
            <CardDescription className="text-center">
              Enter the 6-digit code sent to {email}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground">
                {canResend ? (
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleResendOTP}
                    disabled={isLoading}
                    className="p-0 h-auto"
                  >
                    Resend OTP
                  </Button>
                ) : (
                  <span>Resend OTP in {countdown}s</span>
                )}
              </div>
            </form>
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
    </div>
  );
}