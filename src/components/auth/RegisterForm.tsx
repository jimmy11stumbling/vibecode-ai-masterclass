
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Check, X } from 'lucide-react';

export const RegisterForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const { toast } = useToast();

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const passwordValidation = {
    minLength: password.length >= 6,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: "Weak Password",
        description: "Please ensure your password meets all requirements",
        variant: "destructive"
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp(email, password);
      
      if (error) {
        let errorMessage = 'Failed to create account';
        if (error.message.includes('already registered')) {
          errorMessage = 'An account with this email already exists. Try signing in instead.';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'Please enter a valid email address.';
        }
        
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Successful!",
          description: "Please check your email to confirm your account before signing in.",
        });
        // Clear form
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setFullName('');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center text-xs ${met ? 'text-green-600' : 'text-gray-400'}`}>
      {met ? <Check className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
      {text}
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Sign up to get started with SovereignIDE
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name (Optional)</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="pl-10"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="pl-10"
                required
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            {password && (
              <div className="space-y-1 p-2 bg-gray-50 rounded">
                <PasswordRequirement met={passwordValidation.minLength} text="At least 6 characters" />
                <PasswordRequirement met={passwordValidation.hasUpper} text="One uppercase letter" />
                <PasswordRequirement met={passwordValidation.hasLower} text="One lowercase letter" />
                <PasswordRequirement met={passwordValidation.hasNumber} text="One number" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="pl-10"
                required
                disabled={loading}
              />
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading || !email || !isPasswordValid || password !== confirmPassword}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-600">
            Already have an account?{' '}
            <span className="text-blue-600 hover:underline cursor-pointer">
              Sign in above
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
