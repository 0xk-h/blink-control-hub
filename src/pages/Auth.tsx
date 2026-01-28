import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

import { Eye, Mail, Lock, User, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { z } from 'zod';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

const Auth = () => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'otp' | 'newPassword'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, loading, signIn, signUp, resetPassword, verifyOtp, updatePassword } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
    } catch {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return false;
    }

    try {
      passwordSchema.parse(password);
    } catch {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Handle forgot password - send OTP
    if (mode === 'forgot') {
      try {
        emailSchema.parse(email);
      } catch {
        toast({
          title: 'Invalid Email',
          description: 'Please enter a valid email address',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const { error } = await resetPassword(email);
        if (error) {
          toast({
            title: 'Reset Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Code Sent!',
            description: 'Check your email for the 6-digit verification code.',
          });
          setMode('otp');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Handle OTP verification
    if (mode === 'otp') {
      if (otpCode.length !== 6) {
        toast({
          title: 'Invalid Code',
          description: 'Please enter the complete 6-digit code',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const { error } = await verifyOtp(email, otpCode);
        if (error) {
          toast({
            title: 'Verification Failed',
            description: 'Invalid or expired code. Please try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Code Verified!',
            description: 'Now set your new password.',
          });
          setMode('newPassword');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Handle new password setting
    if (mode === 'newPassword') {
      try {
        passwordSchema.parse(newPassword);
      } catch {
        toast({
          title: 'Invalid Password',
          description: 'Password must be at least 6 characters',
          variant: 'destructive',
        });
        return;
      }

      setIsSubmitting(true);
      try {
        const { error } = await updatePassword(newPassword);
        if (error) {
          toast({
            title: 'Update Failed',
            description: error.message,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Password Updated!',
            description: 'You can now log in with your new password.',
          });
          setMode('login');
          setEmail('');
          setNewPassword('');
          setOtpCode('');
        }
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!validateInputs()) return;

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login Failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Login Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.',
          });
          navigate('/');
        }
      } else {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Signup Failed',
              description: 'This email is already registered. Please login instead.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Signup Failed',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Account Created!',
            description: 'Welcome to BlinkControl. You are now logged in.',
          });
          navigate('/');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Eye className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-gradient">
              BlinkControl
            </h1>
            <p className="text-xs text-muted-foreground">
              Eye-Based Appliance Control
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm">
          <h2 className="font-display text-xl font-bold text-center mb-6">
            {mode === 'login' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
            {mode === 'otp' && 'Enter Verification Code'}
            {mode === 'newPassword' && 'Set New Password'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            )}

            {mode === 'otp' && (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                    <KeyRound className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code sent to <span className="font-medium text-foreground">{email}</span>
                </p>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => setOtpCode(value)}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
            )}

            {mode === 'newPassword' && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 bg-secondary border-border"
                  required
                />
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setPassword('');
                  }}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              variant="glow"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {mode === 'login' && 'Signing In...'}
                  {mode === 'signup' && 'Creating Account...'}
                  {mode === 'forgot' && 'Sending Code...'}
                  {mode === 'otp' && 'Verifying...'}
                  {mode === 'newPassword' && 'Updating Password...'}
                </>
              ) : (
                <>
                  {mode === 'login' && 'Sign In'}
                  {mode === 'signup' && 'Create Account'}
                  {mode === 'forgot' && 'Send Verification Code'}
                  {mode === 'otp' && 'Verify Code'}
                  {mode === 'newPassword' && 'Set New Password'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            {(mode === 'forgot' || mode === 'otp' || mode === 'newPassword') ? (
              <button
                onClick={() => {
                  setMode('login');
                  setPassword('');
                  setOtpCode('');
                  setNewPassword('');
                }}
                className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </button>
            ) : (
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
