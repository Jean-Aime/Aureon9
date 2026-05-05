import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert, AlertDescription } from '../components/ui/Alert';
import { authAPI } from '../api/client';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = searchParams.get('token');
  const userId = searchParams.get('userId');

  useEffect(() => {
    if (!token || !userId) {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }

    const verifyEmail = async () => {
      try {
        await authAPI.verifyEmail({ token, userId });
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      } catch (err) {
        setError(
          err.response?.data?.error || 'Email verification failed. The link may have expired.'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [token, userId, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Verifying Email</CardTitle>
            <CardDescription>Please wait while we verify your email address...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[var(--aureon-ink)]" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">Email Verified!</CardTitle>
            <CardDescription>Your email has been successfully verified. Redirecting to login...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-cyan-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Email Verification Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <p className="text-sm text-slate-600">
            Please try registering again or request a new verification email.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/register')} className="flex-1">
              Back to Register
            </Button>
            <Button onClick={() => navigate('/login')} className="flex-1">
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
