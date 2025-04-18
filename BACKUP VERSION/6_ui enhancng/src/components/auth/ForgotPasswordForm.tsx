
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBackToSignIn: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBackToSignIn }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setEmailSent(true);
    } catch (error) {
      console.error('Password reset error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">Reset Password</CardTitle>
        <CardDescription className="text-center">
          {emailSent 
            ? "Check your email for a reset link" 
            : "Enter your email and we'll send you a reset link"}
        </CardDescription>
      </CardHeader>
      {!emailSent ? (
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </Button>
            <Button variant="link" className="w-full" onClick={onBackToSignIn}>
              Back to Sign In
            </Button>
          </CardFooter>
        </form>
      ) : (
        <CardContent className="space-y-4">
          <p className="text-center">
            We've sent a password reset link to <span className="font-medium">{email}</span>
          </p>
          <p className="text-center text-sm text-muted-foreground">
            If you don't see it in your inbox, check your spam folder.
          </p>
          <Button className="w-full mt-4" onClick={onBackToSignIn}>
            Back to Sign In
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default ForgotPasswordForm;
