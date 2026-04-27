import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiOutlineOfficeBuilding } from 'react-icons/hi';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { participantClassOptions } from '../../data/publicSiteContent';
import { useAuth } from '../../hooks/useAuth';

const COUNTRIES = [
  'Afghanistan','Albania','Algeria','Angola','Argentina','Australia','Austria','Bangladesh',
  'Belgium','Bolivia','Brazil','Cameroon','Canada','Chile','China','Colombia','Congo',
  'Côte d\'Ivoire','Denmark','Ecuador','Egypt','Ethiopia','Finland','France','Germany',
  'Ghana','Greece','Guatemala','Guinea','Haiti','Honduras','Hungary','India','Indonesia',
  'Iran','Iraq','Ireland','Israel','Italy','Jamaica','Japan','Jordan','Kazakhstan','Kenya',
  'Madagascar','Malawi','Malaysia','Mali','Mexico','Morocco','Mozambique','Myanmar',
  'Netherlands','New Zealand','Nicaragua','Niger','Nigeria','Norway','Pakistan','Panama',
  'Paraguay','Peru','Philippines','Poland','Portugal','Romania','Russia','Rwanda',
  'Saudi Arabia','Senegal','Sierra Leone','Singapore','Somalia','South Africa','South Korea',
  'Spain','Sri Lanka','Sudan','Sweden','Switzerland','Syria','Tanzania','Thailand','Tunisia',
  'Turkey','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States',
  'Uruguay','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
];

export default function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const route = location.pathname;

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    participantClassCode: 'GENERAL_MEMBER',
    country: '',
    phone: '',
    businessName: '',
    referralCode: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });

  const updateLogin = (key, value) => setLoginForm((f) => ({ ...f, [key]: value }));
  const updateRegister = (key, value) => setRegisterForm((f) => ({ ...f, [key]: value }));

  async function handleLogin() {
    if (!loginForm.email || !loginForm.password) {
      setStatus({ loading: false, error: 'Email and password are required.', success: '' });
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (!result.success) throw new Error(result.error);
      const adminRoles = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE', 'QUALIFICATIONS', 'CUSTOMER_SUCCESS', 'FINANCE_TREASURY'];
      const isAdmin = adminRoles.includes(result.user?.role);
      setStatus({ loading: false, error: '', success: 'Login successful. Redirecting...' });
      setTimeout(() => navigate(isAdmin ? '/dashboard/admin-review' : '/dashboard/member'), 600);
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Login failed. Check your credentials.', success: '' });
    }
  }

  async function handleRegister() {
    const { name, email, password, confirmPassword, participantClassCode, country } = registerForm;
    if (!name || !email || !password || !participantClassCode || !country) {
      setStatus({ loading: false, error: 'Full name, email, password, participant class, and country are required.', success: '' });
      return;
    }
    if (password !== confirmPassword) {
      setStatus({ loading: false, error: 'Passwords do not match.', success: '' });
      return;
    }
    if (password.length < 8) {
      setStatus({ loading: false, error: 'Password must be at least 8 characters.', success: '' });
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    try {
      const result = await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        participantClassCode: registerForm.participantClassCode,
        country: registerForm.country,
        phone: registerForm.phone || undefined,
        businessName: registerForm.businessName || undefined,
        referralCode: registerForm.referralCode || undefined,
      });
      if (!result.success) throw new Error(result.error);
      setStatus({ loading: false, error: '', success: 'Account created successfully. Redirecting to your dashboard...' });
      setTimeout(() => navigate('/dashboard/member'), 800);
    } catch (err) {
      setStatus({ loading: false, error: err.message || 'Registration failed. Please try again.', success: '' });
    }
  }

  if (route === '/forgot-password') {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8">
        <Card className="w-full max-w-md rounded-[2rem] border-white/60 bg-white/90 shadow-2xl backdrop-blur">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--aureon-ink)] text-white shadow-lg">
                <HiOutlineOfficeBuilding className="h-7 w-7" />
              </div>
              <h1 className="mt-4 font-heading text-2xl font-semibold text-[var(--aureon-ink)]">Forgot Password</h1>
              <p className="mt-2 text-sm text-slate-600">Enter your email to receive a reset link.</p>
            </div>
            <Input type="email" placeholder="Email address" />
            {status.error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{status.error}</div>}
            {status.success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.success}</div>}
            <Button className="w-full rounded-full bg-[var(--aureon-ink)] hover:bg-[#14385f]"
              onClick={() => setStatus({ loading: false, error: '', success: 'Password reset is not yet connected to the backend.' })}>
              Send Reset Link
            </Button>
            <div className="text-center text-sm text-slate-500">
              <button onClick={() => navigate('/login')} className="hover:text-[var(--aureon-ink)]">Back to Login</button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (route === '/verification-pending') {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8">
        <Card className="w-full max-w-md rounded-[2rem] border-white/60 bg-white/90 shadow-2xl backdrop-blur">
          <CardContent className="space-y-6 p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700 shadow-lg">
              <HiOutlineOfficeBuilding className="h-7 w-7" />
            </div>
            <h1 className="font-heading text-2xl font-semibold text-[var(--aureon-ink)]">Verification Pending</h1>
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
              Your account access is limited until your submitted documents are reviewed and your verification state advances.
            </div>
            <Button className="w-full rounded-full bg-[var(--aureon-ink)] hover:bg-[#14385f]" onClick={() => navigate('/login')}>
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // REGISTER
  if (route === '/register') {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
        <Card className="w-full max-w-2xl rounded-[2rem] border-white/60 bg-white/90 shadow-2xl backdrop-blur">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--aureon-ink)] text-white shadow-lg">
                <HiOutlineOfficeBuilding className="h-7 w-7" />
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Create Your Account</p>
              <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[var(--aureon-ink)]">Become a Member</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">Join AUREON9 — the governed membership, identity, and rewards platform.</p>
            </div>

            <div className="space-y-4">
              {/* Personal Info */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Personal Information</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Full legal name *"
                    value={registerForm.name}
                    onChange={(e) => updateRegister('name', e.target.value)}
                  />
                  <Input
                    type="email"
                    placeholder="Email address *"
                    value={registerForm.email}
                    onChange={(e) => updateRegister('email', e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Password (min 8 characters) *"
                    value={registerForm.password}
                    onChange={(e) => updateRegister('password', e.target.value)}
                  />
                  <Input
                    type="password"
                    placeholder="Confirm password *"
                    value={registerForm.confirmPassword}
                    onChange={(e) => updateRegister('confirmPassword', e.target.value)}
                  />
                  <Input
                    type="tel"
                    placeholder="Phone number"
                    value={registerForm.phone}
                    onChange={(e) => updateRegister('phone', e.target.value)}
                  />
                  <select
                    value={registerForm.country}
                    onChange={(e) => updateRegister('country', e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                  >
                    <option value="">Select country *</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Membership Classification */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Membership Classification</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={registerForm.participantClassCode}
                    onChange={(e) => updateRegister('participantClassCode', e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                  >
                    {participantClassOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <Input
                    placeholder="Business / organisation name"
                    value={registerForm.businessName}
                    onChange={(e) => updateRegister('businessName', e.target.value)}
                  />
                </div>
              </div>

              {/* Referral */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Referral (Optional)</p>
                <Input
                  placeholder="Referral code (if you were referred)"
                  value={registerForm.referralCode}
                  onChange={(e) => updateRegister('referralCode', e.target.value)}
                />
              </div>
            </div>

            {status.error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{status.error}</div>}
            {status.success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.success}</div>}

            <Button
              className="w-full rounded-full bg-[var(--aureon-ink)] py-3 text-sm hover:bg-[#14385f]"
              onClick={handleRegister}
              disabled={status.loading}
            >
              {status.loading ? 'Creating account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="font-semibold text-[var(--aureon-ink)] hover:underline">
                Login
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // LOGIN (default)
  return (
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8">
      <Card className="w-full max-w-md rounded-[2rem] border-white/60 bg-white/90 shadow-2xl backdrop-blur">
        <CardContent className="space-y-6 p-6 sm:p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--aureon-ink)] text-white shadow-lg">
              <HiOutlineOfficeBuilding className="h-7 w-7" />
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Member Access</p>
            <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[var(--aureon-ink)]">Login</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">Sign in to access your AUREON9 dashboard.</p>
          </div>

          <div className="grid gap-3">
            <Input
              type="email"
              placeholder="Email address"
              value={loginForm.email}
              onChange={(e) => updateLogin('email', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => updateLogin('password', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
            <div className="text-right">
              <button onClick={() => navigate('/forgot-password')} className="text-xs text-slate-500 hover:text-[var(--aureon-ink)]">
                Forgot password?
              </button>
            </div>
          </div>

          {status.error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{status.error}</div>}
          {status.success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{status.success}</div>}

          <Button
            className="w-full rounded-full bg-[var(--aureon-ink)] py-3 text-sm hover:bg-[#14385f]"
            onClick={handleLogin}
            disabled={status.loading}
          >
            {status.loading ? 'Signing in...' : 'Login'}
          </Button>

          <p className="text-center text-sm text-slate-500">
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')} className="font-semibold text-[var(--aureon-ink)] hover:underline">
              Become a Member
            </button>
          </p>

          {/* Admin credentials hint for dev */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            <p className="font-semibold text-slate-700">Admin credentials</p>
            <p className="mt-1">Email: admin@aureon9.com</p>
            <p>Password: Admin@Aureon9!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
