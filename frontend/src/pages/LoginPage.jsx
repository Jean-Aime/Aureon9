import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiMail, HiLockClosed, HiUser, HiPhone, HiGlobe, HiBriefcase, HiEye, HiEyeOff, HiChevronDown } from 'react-icons/hi';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const countries = [
  { name: 'Afghanistan', code: '+93' },
  { name: 'Albania', code: '+355' },
  { name: 'Algeria', code: '+213' },
  { name: 'Argentina', code: '+54' },
  { name: 'Australia', code: '+61' },
  { name: 'Austria', code: '+43' },
  { name: 'Bangladesh', code: '+880' },
  { name: 'Belgium', code: '+32' },
  { name: 'Botswana', code: '+267' },
  { name: 'Brazil', code: '+55' },
  { name: 'Burundi', code: '+257' },
  { name: 'Cameroon', code: '+237' },
  { name: 'Canada', code: '+1' },
  { name: 'China', code: '+86' },
  { name: 'Colombia', code: '+57' },
  { name: 'Congo', code: '+242' },
  { name: 'Denmark', code: '+45' },
  { name: 'Egypt', code: '+20' },
  { name: 'Ethiopia', code: '+251' },
  { name: 'Finland', code: '+358' },
  { name: 'France', code: '+33' },
  { name: 'Germany', code: '+49' },
  { name: 'Ghana', code: '+233' },
  { name: 'Greece', code: '+30' },
  { name: 'India', code: '+91' },
  { name: 'Indonesia', code: '+62' },
  { name: 'Iran', code: '+98' },
  { name: 'Iraq', code: '+964' },
  { name: 'Ireland', code: '+353' },
  { name: 'Israel', code: '+972' },
  { name: 'Italy', code: '+39' },
  { name: 'Ivory Coast', code: '+225' },
  { name: 'Japan', code: '+81' },
  { name: 'Kenya', code: '+254' },
  { name: 'Malaysia', code: '+60' },
  { name: 'Mexico', code: '+52' },
  { name: 'Morocco', code: '+212' },
  { name: 'Mozambique', code: '+258' },
  { name: 'Netherlands', code: '+31' },
  { name: 'New Zealand', code: '+64' },
  { name: 'Nigeria', code: '+234' },
  { name: 'Norway', code: '+47' },
  { name: 'Pakistan', code: '+92' },
  { name: 'Philippines', code: '+63' },
  { name: 'Poland', code: '+48' },
  { name: 'Portugal', code: '+351' },
  { name: 'Romania', code: '+40' },
  { name: 'Russia', code: '+7' },
  { name: 'Rwanda', code: '+250' },
  { name: 'Saudi Arabia', code: '+966' },
  { name: 'Senegal', code: '+221' },
  { name: 'Singapore', code: '+65' },
  { name: 'South Africa', code: '+27' },
  { name: 'South Korea', code: '+82' },
  { name: 'Spain', code: '+34' },
  { name: 'Sweden', code: '+46' },
  { name: 'Switzerland', code: '+41' },
  { name: 'Tanzania', code: '+255' },
  { name: 'Thailand', code: '+66' },
  { name: 'Tunisia', code: '+216' },
  { name: 'Turkey', code: '+90' },
  { name: 'Uganda', code: '+256' },
  { name: 'Ukraine', code: '+380' },
  { name: 'United Arab Emirates', code: '+971' },
  { name: 'United Kingdom', code: '+44' },
  { name: 'United States', code: '+1' },
  { name: 'Vietnam', code: '+84' },
  { name: 'Zambia', code: '+260' },
  { name: 'Zimbabwe', code: '+263' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    email: '',
    password: '',
    name: '',
    country: '',
    countryCode: '',
    phone: '',
    businessName: '',
    participantClassCode: 'GENERAL_MEMBER',
    referralCode: '',
  });

  async function handleLogin(e) {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(loginForm.email, loginForm.password);
      if (result.success) {
        toast.success('Login successful!');
        const adminRoles = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE', 'QUALIFICATIONS', 'CUSTOMER_SUCCESS', 'FINANCE_TREASURY'];
        if (adminRoles.includes(result.user.role)) {
          navigate('/dashboard/admin');
        } else {
          navigate('/dashboard/member');
        }
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    
    // Validate all required fields
    if (!registerForm.name || !registerForm.name.trim()) {
      toast.error('Please enter your full name');
      return;
    }
    if (!registerForm.email || !registerForm.email.trim()) {
      toast.error('Please enter your email address');
      return;
    }
    if (!registerForm.password || registerForm.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (!registerForm.country) {
      toast.error('Please select your country');
      return;
    }
    
    setLoading(true);
    try {
      const fullPhone = registerForm.phone ? `${registerForm.countryCode} ${registerForm.phone}` : '';
      const result = await register({
        ...registerForm,
        email: registerForm.email.toLowerCase().trim(),
        name: registerForm.name.trim(),
        phone: fullPhone,
      });
      
      if (result.success) {
        toast.success('Registration successful! Welcome to AUREON9.');
        navigate('/dashboard/member');
      } else {
        toast.error(result.error || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function handleCountryChange(countryName) {
    if (!countryName) {
      setRegisterForm({
        ...registerForm,
        country: '',
        countryCode: '',
      });
      return;
    }
    const country = countries.find(c => c.name === countryName);
    setRegisterForm({
      ...registerForm,
      country: countryName,
      countryCode: country?.code || '',
    });
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
      <div className="relative z-10 w-full max-w-7xl">
      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white space-y-6">
          <div className="flex items-center gap-4">
            <img src="/images/AUREON9_Logo.png" alt="AUREON9" className="h-20 w-20 object-contain" />
            <div>
              <h1 className="text-5xl font-bold tracking-tight">AUREON9</h1>
              <p className="text-lg text-white/90 mt-2 leading-relaxed">Membership, Identity & Rewards Infrastructure</p>
            </div>
          </div>
          <div className="mt-8">
            <p className="text-white/85 text-base leading-relaxed">
              A governed platform for participant classification, identity verification, tier progression, AUREX rewards, and controlled opportunity access — powered by ODIEBOARD.
            </p>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <Card className={`rounded-3xl border-0 shadow-2xl bg-white/95 backdrop-blur-md transition-all duration-300 ${mode === 'register' ? 'w-full lg:w-[700px]' : 'w-full lg:w-[500px]'}`}>
          <CardContent className="p-8 lg:p-12">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <img src="/images/AUREON9_Logo.png" alt="AUREON9" className="h-12 w-12 object-contain" />
              <h1 className="text-3xl font-bold text-slate-900">AUREON9</h1>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-8 bg-slate-100 p-1 rounded-2xl">
              <button
                onClick={() => setMode('login')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition ${
                  mode === 'login'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setMode('register')}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition ${
                  mode === 'register'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>

            {mode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                  <div className="relative">
                    <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      className="w-full pl-12 pr-12 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                    >
                      {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="rounded" />
                    <span className="text-slate-600">Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-[#0F4C81] hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#0A2540] to-[#0F4C81] hover:opacity-90 text-white font-medium"
                >
                  {loading ? 'Logging in...' : 'Login to Dashboard'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <HiUser className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email Address *</label>
                    <div className="relative">
                      <HiMail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                    <div className="relative">
                      <HiLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        className="w-full pl-12 pr-12 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10"
                      >
                        {showPassword ? <HiEyeOff className="h-5 w-5" /> : <HiEye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Country *</label>
                    <div className="relative">
                      <HiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                      <select
                        value={registerForm.country}
                        onChange={(e) => handleCountryChange(e.target.value)}
                        className="w-full pl-12 pr-10 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent cursor-pointer appearance-none"
                        required
                      >
                        <option value="">Select Country</option>
                        {countries.map((country) => (
                          <option key={country.name} value={country.name}>
                            {country.name}
                          </option>
                        ))}
                      </select>
                      <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Phone</label>
                    <div className="relative">
                      <HiPhone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                      <input
                        type="tel"
                        placeholder={registerForm.countryCode ? `${registerForm.countryCode} 123 456 789` : "Select country first"}
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        disabled={!registerForm.countryCode}
                        className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent disabled:bg-slate-50 disabled:text-slate-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Business Name</label>
                    <div className="relative">
                      <HiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10" />
                      <input
                        type="text"
                        placeholder="Your Company"
                        value={registerForm.businessName}
                        onChange={(e) => setRegisterForm({ ...registerForm, businessName: e.target.value })}
                        className="w-full pl-12 pr-4 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Participant Class</label>
                  <div className="relative">
                    <select
                      value={registerForm.participantClassCode}
                      onChange={(e) => setRegisterForm({ ...registerForm, participantClassCode: e.target.value })}
                      className="w-full pl-4 pr-10 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent cursor-pointer appearance-none"
                    >
                      <option value="GENERAL_MEMBER">General Member</option>
                      <option value="CUSTOMER">Customer</option>
                      <option value="CHANNEL_PARTNER">Channel Partner</option>
                      <option value="DEVELOPER">Developer</option>
                      <option value="STRATEGIC_PARTNER">Strategic Partner</option>
                    </select>
                    <HiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Referral Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter referral code"
                    value={registerForm.referralCode}
                    onChange={(e) => setRegisterForm({ ...registerForm, referralCode: e.target.value })}
                    className="w-full px-4 h-12 rounded-2xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                  />
                </div>
                
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#0A2540] to-[#0F4C81] hover:opacity-90 text-white font-medium"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
                <p className="text-xs text-slate-500 text-center">
                  By registering, you agree to AUREON9's Terms of Service and Privacy Policy
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}
