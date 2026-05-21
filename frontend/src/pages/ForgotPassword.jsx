import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiMail, HiArrowLeft } from 'react-icons/hi';
import { authAPI } from '../api/client';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent } from '../components/ui/Card';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    try {
      await authAPI.requestPasswordReset({ email });
      setSent(true);
      toast.success('Password reset link sent to your email');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/dorian-labbe-y2vAEkdaAdA-unsplash.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      </div>
      
      {/* Content */}
      <Card className="relative z-10 w-full max-w-md rounded-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-md">
        <CardContent className="p-8 lg:p-12">
          <div className="flex items-center justify-center mb-8">
            <img src="/images/AUREON9_Logo.png" alt="AUREON9" className="h-16 w-16 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">Forgot Password?</h1>
          <p className="text-center text-slate-600 mb-8">
            {sent
              ? 'Check your email for a password reset link'
              : 'Enter your email and we\'ll send you a reset link'}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                <div className="relative">
                  <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-12 rounded-2xl border-slate-200"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#0A2540] to-[#0F4C81] hover:opacity-90 text-white font-medium"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 text-sm">
                We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.
              </div>
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#0A2540] to-[#0F4C81] hover:opacity-90 text-white font-medium"
              >
                Back to Login
              </Button>
            </div>
          )}

          {!sent && (
            <button
              onClick={() => navigate('/login')}
              className="mt-6 flex items-center justify-center gap-2 w-full text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              <HiArrowLeft className="h-4 w-4" />
              Back to Login
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
