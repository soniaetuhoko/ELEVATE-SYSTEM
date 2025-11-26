import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import apiService from '@/services/api';
import { Loader2 } from 'lucide-react';

interface OTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
  name: string;
  password: string;
  onVerifySuccess: () => void;
}

export default function OTPModal({ isOpen, onClose, email, name, password, onVerifySuccess }: OTPModalProps) {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (isOpen) {
      setOtp('');
      setCanResend(false);
      setCountdown(60);
      
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
    }
  }, [isOpen]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    try {
      await apiService.verifyOTP(email, otp);
      onVerifySuccess();
      onClose();
    } catch (error) {
      toast.error('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await apiService.register(email, name, password);
      toast.success('New OTP sent to your email!');
      setCanResend(false);
      setCountdown(60);
      
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
    } catch (error) {
      toast.error('Failed to resend OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Verify OTP</DialogTitle>
          <DialogDescription className="text-center">
            Enter the 6-digit code sent to {email}
            {process.env.NODE_ENV !== 'production' && (
              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-sm">
                💡 Development mode: Use OTP <strong>123456</strong> or check the toast message
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
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
              autoFocus
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
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
      </DialogContent>
    </Dialog>
  );
}