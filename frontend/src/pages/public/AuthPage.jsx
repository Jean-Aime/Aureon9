import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  HiOutlineOfficeBuilding, HiArrowLeft, HiOutlineSparkles, HiOutlineUserGroup, HiOutlineShoppingCart,
  HiOutlineLink, HiOutlineFire, HiOutlineCode, HiOutlineAcademicCap, HiOutlineCreditCard,
  HiOutlineBriefcase, HiOutlineGlobeAlt, HiOutlineCheckCircle, HiOutlineCash, HiOutlineShieldCheck,
  HiOutlineLibrary, HiOutlineCog, HiEye, HiEyeOff
} from 'react-icons/hi';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { participantClassOptions } from '../../data/publicSiteContent';
import { useAuth } from '../../hooks/useAuth';

const COUNTRIES = [
  { name: 'Afghanistan', code: '+93' },
  { name: 'Albania', code: '+355' },
  { name: 'Algeria', code: '+213' },
  { name: 'Angola', code: '+244' },
  { name: 'Argentina', code: '+54' },
  { name: 'Australia', code: '+61' },
  { name: 'Austria', code: '+43' },
  { name: 'Bangladesh', code: '+880' },
  { name: 'Belgium', code: '+32' },
  { name: 'Bolivia', code: '+591' },
  { name: 'Brazil', code: '+55' },
  { name: 'Cameroon', code: '+237' },
  { name: 'Canada', code: '+1' },
  { name: 'Chile', code: '+56' },
  { name: 'China', code: '+86' },
  { name: 'Colombia', code: '+57' },
  { name: 'Congo', code: '+242' },
  { name: 'Côte d\'Ivoire', code: '+225' },
  { name: 'Denmark', code: '+45' },
  { name: 'Ecuador', code: '+593' },
  { name: 'Egypt', code: '+20' },
  { name: 'Ethiopia', code: '+251' },
  { name: 'Finland', code: '+358' },
  { name: 'France', code: '+33' },
  { name: 'Germany', code: '+49' },
  { name: 'Ghana', code: '+233' },
  { name: 'Greece', code: '+30' },
  { name: 'Guatemala', code: '+502' },
  { name: 'Guinea', code: '+224' },
  { name: 'Haiti', code: '+509' },
  { name: 'Honduras', code: '+504' },
  { name: 'Hungary', code: '+36' },
  { name: 'India', code: '+91' },
  { name: 'Indonesia', code: '+62' },
  { name: 'Iran', code: '+98' },
  { name: 'Iraq', code: '+964' },
  { name: 'Ireland', code: '+353' },
  { name: 'Israel', code: '+972' },
  { name: 'Italy', code: '+39' },
  { name: 'Jamaica', code: '+1876' },
  { name: 'Japan', code: '+81' },
  { name: 'Jordan', code: '+962' },
  { name: 'Kazakhstan', code: '+7' },
  { name: 'Kenya', code: '+254' },
  { name: 'Madagascar', code: '+261' },
  { name: 'Malawi', code: '+265' },
  { name: 'Malaysia', code: '+60' },
  { name: 'Mali', code: '+223' },
  { name: 'Mexico', code: '+52' },
  { name: 'Morocco', code: '+212' },
  { name: 'Mozambique', code: '+258' },
  { name: 'Myanmar', code: '+95' },
  { name: 'Netherlands', code: '+31' },
  { name: 'New Zealand', code: '+64' },
  { name: 'Nicaragua', code: '+505' },
  { name: 'Niger', code: '+227' },
  { name: 'Nigeria', code: '+234' },
  { name: 'Norway', code: '+47' },
  { name: 'Pakistan', code: '+92' },
  { name: 'Panama', code: '+507' },
  { name: 'Paraguay', code: '+595' },
  { name: 'Peru', code: '+51' },
  { name: 'Philippines', code: '+63' },
  { name: 'Poland', code: '+48' },
  { name: 'Portugal', code: '+351' },
  { name: 'Romania', code: '+40' },
  { name: 'Russia', code: '+7' },
  { name: 'Rwanda', code: '+250' },
  { name: 'Saudi Arabia', code: '+966' },
  { name: 'Senegal', code: '+221' },
  { name: 'Sierra Leone', code: '+232' },
  { name: 'Singapore', code: '+65' },
  { name: 'Somalia', code: '+252' },
  { name: 'South Africa', code: '+27' },
  { name: 'South Korea', code: '+82' },
  { name: 'Spain', code: '+34' },
  { name: 'Sri Lanka', code: '+94' },
  { name: 'Sudan', code: '+249' },
  { name: 'Sweden', code: '+46' },
  { name: 'Switzerland', code: '+41' },
  { name: 'Syria', code: '+963' },
  { name: 'Tanzania', code: '+255' },
  { name: 'Thailand', code: '+66' },
  { name: 'Tunisia', code: '+216' },
  { name: 'Turkey', code: '+90' },
  { name: 'Uganda', code: '+256' },
  { name: 'Ukraine', code: '+380' },
  { name: 'United Arab Emirates', code: '+971' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'United States', code: '+1' },
  { name: 'Uruguay', code: '+598' },
  { name: 'Venezuela', code: '+58' },
  { name: 'Vietnam', code: '+84' },
  { name: 'Yemen', code: '+967' },
  { name: 'Zambia', code: '+260' },
  { name: 'Zimbabwe', code: '+263' },
];

// Icon mapping for each membership type - cleaned up
const MEMBERSHIP_TYPE_ICONS = {
  GENERAL_MEMBER: HiOutlineUserGroup,
  CUSTOMER: HiOutlineShoppingCart,
  CHANNEL_PARTNER: HiOutlineLink,
  DEVELOPER: HiOutlineCode,
  STRATEGIC_PARTNER: HiOutlineGlobeAlt,
  OEM_PARTNER: HiOutlineCog,
  TRADE_OPERATOR: HiOutlineCheckCircle,
  CAPITAL_PARTICIPANT: HiOutlineCash,
  SETTLEMENT_PARTICIPANT: HiOutlineLibrary,
  INSTITUTIONAL_PARTICIPANT: HiOutlineOfficeBuilding,
};

// All membership types - cleaned up to remove unsupported types
const ALL_MEMBERSHIP_TYPES = [
  {
    value: 'GENERAL_MEMBER',
    label: 'Member',
    description: 'Standard membership for ecosystem participation.',
    requiresBusinessName: false,
  },
  {
    value: 'CUSTOMER',
    label: 'Customer / Buyer / User',
    description: 'Buyer and user participation in the ecosystem.',
    requiresBusinessName: false,
  },
  {
    value: 'CHANNEL_PARTNER',
    label: 'Channel Partner & Affiliate',
    description: 'Partnership programs, referrals, promotions, and channel growth.',
    requiresBusinessName: true,
  },
  {
    value: 'DEVELOPER',
    label: 'Developer',
    description: 'Technology and platform development access.',
    requiresBusinessName: false,
  },
  {
    value: 'STRATEGIC_PARTNER',
    label: 'Strategic Partner',
    description: 'Strategic partnerships and ecosystem alignment.',
    requiresBusinessName: true,
  },
  {
    value: 'OEM_PARTNER',
    label: 'OEM / White-label Partner',
    description: 'White-label and OEM partnership programs.',
    requiresBusinessName: true,
  },
  {
    value: 'TRADE_OPERATOR',
    label: 'Trade Operator',
    description: 'Trade operations and marketplace participation.',
    requiresBusinessName: true,
  },
  {
    value: 'CAPITAL_PARTICIPANT',
    label: 'Capital Participant',
    description: 'Capital flows and investment opportunities.',
    requiresBusinessName: true,
  },
  {
    value: 'SETTLEMENT_PARTICIPANT',
    label: 'Settlement Participant',
    description: 'AUREX settlement and wallet participation.',
    requiresBusinessName: true,
  },
  {
    value: 'INSTITUTIONAL_PARTICIPANT',
    label: 'Institutional Participant',
    description: 'Institutional-level participation and access.',
    requiresBusinessName: true,
  },
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
    countryCode: '',
    phone: '',
    businessName: '',
    referralCode: '',
  });
  const [status, setStatus] = useState({ loading: false, error: '', success: '' });
  const [registrationStep, setRegistrationStep] = useState('type-selection'); // 'type-selection' or 'form'
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route, registrationStep]);

  useEffect(() => {
    const referralFromQuery = new URLSearchParams(location.search).get('ref');
    if (route === '/register' && referralFromQuery) {
      setRegisterForm((current) => ({
        ...current,
        referralCode: current.referralCode || referralFromQuery,
      }));
    }
  }, [route, location.search]);

  const updateLogin = (key, value) => setLoginForm((f) => ({ ...f, [key]: value }));
  const updateRegister = (key, value) => {
    if (key === 'country') {
      const selectedCountry = COUNTRIES.find(c => c.name === value);
      setRegisterForm((f) => ({ 
        ...f, 
        country: value,
        countryCode: selectedCountry?.code || '',
        phone: selectedCountry?.code || ''
      }));
    } else {
      setRegisterForm((f) => ({ ...f, [key]: value }));
    }
  };

  async function handleLogin() {
    if (!loginForm.email || !loginForm.password) {
      toast.error('Email and password are required.');
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (!result.success) throw new Error(result.error);
      const adminRoles = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE', 'QUALIFICATIONS', 'CUSTOMER_SUCCESS', 'FINANCE_TREASURY'];
      const isAdmin = adminRoles.includes(result.user?.role);
      toast.success('Login successful. Redirecting...');
      setTimeout(() => navigate(isAdmin ? '/dashboard/admin/overview' : '/dashboard/member'), 600);
    } catch (err) {
      toast.error(err.message || 'Login failed. Check your credentials.');
    } finally {
      setStatus({ loading: false, error: '', success: '' });
    }
  }

  async function handleRegister() {
    const { name, email, password, confirmPassword, participantClassCode, country } = registerForm;
    if (!name || !email || !password || !participantClassCode || !country) {
      toast.error('Full name, email, password, participant class, and country are required.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setStatus({ loading: true, error: '', success: '' });
    try {
      const fullPhone = registerForm.phone && registerForm.phone !== registerForm.countryCode 
        ? registerForm.phone 
        : undefined;
      
      const result = await register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
        participantClassCode: registerForm.participantClassCode,
        country: registerForm.country,
        phone: fullPhone,
        businessName: registerForm.businessName || undefined,
        referralCode: registerForm.referralCode || undefined,
      });
      if (!result.success) throw new Error(result.error);
      toast.success('Account created successfully. Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard/member'), 800);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setStatus({ loading: false, error: '', success: '' });
    }
  }

  function handleMembershipTypeSelect(membershipType) {
    // Reset registration form when selecting a new membership type
    setRegisterForm({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      participantClassCode: membershipType,
      country: '',
      countryCode: '',
      phone: '',
      businessName: '',
      referralCode: registerForm.referralCode, // Preserve referral code if already set
    });
    setRegistrationStep('form');
  }

  if (route === '/forgot-password') {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8 px-4">
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
            <Button className="w-full rounded-full bg-[var(--aureon-ink)] hover:bg-[#14385f]"
              onClick={() => toast.info('Password reset is not yet connected to the backend.')}>
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
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8 px-4">
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

  // REGISTER - Type Selection Step
  if (route === '/register' && registrationStep === 'type-selection') {
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
        <div className="w-full max-w-4xl">
          <div className="text-center mb-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--aureon-ink)] text-white shadow-lg mb-4">
              <HiOutlineOfficeBuilding className="h-7 w-7" />
            </div>
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-[var(--aureon-ink)] sm:text-4xl">Join AUREON9</h1>
            <p className="mt-3 text-base leading-8 text-slate-600">Select your membership type to get started</p>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
            {ALL_MEMBERSHIP_TYPES.map((type) => {
              const IconComponent = MEMBERSHIP_TYPE_ICONS[type.value];
              return (
                <button
                  key={type.value}
                  onClick={() => handleMembershipTypeSelect(type.value)}
                  className="group rounded-[2rem] border border-white/60 bg-white/85 p-4 sm:p-6 shadow-lg shadow-[rgba(10,37,64,0.08)] transition-all duration-300 hover:border-[var(--aureon-ink)] hover:shadow-xl hover:shadow-[rgba(10,37,64,0.14)] hover:-translate-y-1 text-left"
                >
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-slate-100 transition-colors duration-300 group-hover:bg-[var(--aureon-ink)] mb-3 sm:mb-4">
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-slate-900 transition-colors duration-300 group-hover:text-white" />
                  </div>
                  <h3 className="font-heading text-base sm:text-lg font-semibold tracking-tight text-[var(--aureon-ink)] mb-1 sm:mb-2 break-words">{type.label}</h3>
                  <p className="text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">{type.description}</p>
                </button>
              );
            })}
          </div>

          <div className="text-center">
            <p className="text-sm text-slate-500 mb-4">
              Or view{' '}
              <button onClick={() => navigate('/membership')} className="font-semibold text-[var(--aureon-ink)] hover:underline">
                all membership types
              </button>
            </p>
            <p className="text-center text-sm text-slate-500">
              Already have an account?{' '}
              <button onClick={() => navigate('/login')} className="font-semibold text-[var(--aureon-ink)] hover:underline">
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // REGISTER - Form Step
  if (route === '/register' && registrationStep === 'form') {
    const selectedType = ALL_MEMBERSHIP_TYPES.find(t => t.value === registerForm.participantClassCode);
    
    return (
      <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-12 px-4">
        <Card className="w-full max-w-2xl rounded-[2rem] border-white/60 bg-white/90 shadow-2xl backdrop-blur">
          <CardContent className="space-y-6 p-6 sm:p-8">
            <button
              onClick={() => {
                // Reset form data except referral code when going back
                setRegisterForm((current) => ({
                  ...current,
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  phone: '',
                  businessName: '',
                  country: '',
                  countryCode: '',
                  participantClassCode: 'GENERAL_MEMBER',
                }));
                setRegistrationStep('type-selection');
              }}
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[var(--aureon-ink)] transition"
            >
              <HiArrowLeft className="h-4 w-4" />
              Back to membership types
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--aureon-ink)] text-white shadow-lg mb-4">
                <HiOutlineOfficeBuilding className="h-7 w-7" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Create Your Account</p>
              <h1 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-[var(--aureon-ink)]">
                {selectedType?.label || 'Registration'}
              </h1>
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
                    autoComplete="name"
                  />
                  <Input
                    type="email"
                    placeholder="Email address *"
                    value={registerForm.email}
                    onChange={(e) => updateRegister('email', e.target.value)}
                    autoComplete="email"
                  />
                  <div className="relative flex items-center">
                    <Input
                      type={showRegisterPassword ? "text" : "password"}
                      placeholder="Password (min 8 characters) *"
                      value={registerForm.password}
                      onChange={(e) => updateRegister('password', e.target.value)}
                      autoComplete="new-password"
                      className="pr-11 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                    >
                      {showRegisterPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm password *"
                      value={registerForm.confirmPassword}
                      onChange={(e) => updateRegister('confirmPassword', e.target.value)}
                      autoComplete="new-password"
                      className="pr-11 w-full"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                    </button>
                  </div>
                  <select
                    value={registerForm.country}
                    onChange={(e) => updateRegister('country', e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                  >
                    <option value="">Select country *</option>
                    {COUNTRIES.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <Input
                    type="tel"
                    placeholder={registerForm.countryCode ? `Phone number (${registerForm.countryCode})` : "Phone number"}
                    value={registerForm.phone}
                    onChange={(e) => updateRegister('phone', e.target.value)}
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Business Info - Conditional */}
              {selectedType?.requiresBusinessName && (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Business Information</p>
                  <div className="grid gap-3">
                    <Input
                      placeholder="Business / organisation name *"
                      value={registerForm.businessName}
                      onChange={(e) => updateRegister('businessName', e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
              )}

              {/* Referral */}
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Referral (Optional)</p>
                <Input
                  placeholder="Referral code (if you were referred)"
                  value={registerForm.referralCode}
                  onChange={(e) => updateRegister('referralCode', e.target.value)}
                  autoComplete="off"
                />
              </div>
            </div>

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
    <div className="flex min-h-[calc(100vh-14rem)] items-center justify-center py-8 px-4">
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
              autoComplete="off"
            />
            <div className="relative flex items-center">
              <Input
                type={showLoginPassword ? "text" : "password"}
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => updateLogin('password', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                autoComplete="off"
                className="pr-11 w-full"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showLoginPassword ? "Hide password" : "Show password"}
              >
                {showLoginPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
              </button>
            </div>
            <div className="text-right">
              <button onClick={() => navigate('/forgot-password')} className="text-xs text-slate-500 hover:text-[var(--aureon-ink)]">
                Forgot password?
              </button>
            </div>
          </div>

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
        </CardContent>
      </Card>
    </div>
  );
}
