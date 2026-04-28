import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Briefcase,
  CheckCircle2,
  Crown,
  FileCheck,
  LayoutGrid,
  LineChart,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Store,
  TrendingUp,
  UserCircle2,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Progress } from '../components/ui/Progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Textarea } from '../components/ui/Textarea';
import { Separator } from '../components/ui/Separator';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { useAuth } from '../hooks/useAuth';
import {
  documentsAPI,
  membersAPI,
  opportunitiesAPI,
  referralsAPI,
  verificationAPI,
  walletsAPI,
  referenceAPI,
} from '../api/client';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'profile', label: 'Profile & Identity', icon: UserCircle2 },
  { id: 'verification', label: 'Verification Center', icon: ShieldCheck },
  { id: 'membership', label: 'Membership Tier', icon: Crown },
  { id: 'wallet', label: 'AUREX Wallet', icon: Wallet },
  { id: 'earnings', label: 'Earnings', icon: TrendingUp },
  { id: 'marketplace', label: 'Marketplace', icon: Store },
  { id: 'referrals', label: 'Referral System', icon: Users },
  { id: 'opportunities', label: 'Opportunities Feed', icon: Briefcase },
  { id: 'documents', label: 'Documents & Compliance', icon: FileCheck },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'metrics', label: 'Performance Metrics', icon: BarChart3 },
  { id: 'upgrade', label: 'Upgrade Path', icon: LineChart },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const defaultCapabilities = {
  screens: navItems.reduce((acc, item) => ({ ...acc, [item.id]: true }), {}),
  actions: {
    canEditIdentity: true,
    canChangePassword: true,
    canRequestUpgrade: true,
    canWithdraw: true,
    canTransfer: true,
    canBuyInvest: true,
    canApplyOpportunity: true,
    canViewTeamTree: true,
    canViewCommissionBreakdown: true,
    canOperateTradeFlows: false,
    canAccessCapitalFeeds: false,
    canAccessDeveloperTools: false,
    canAccessSettlementControls: false,
    canSellMarketplace: false,
  },
  profile: {},
};

const verificationLevels = [
  'UNVERIFIED',
  'BASIC_VERIFIED',
  'IDENTITY_VERIFIED',
  'COMMERCIAL_VERIFIED',
  'INSTITUTIONAL_VERIFIED',
  'CAPITAL_VERIFIED',
  'GOVERNANCE_APPROVED',
];

function formatEnum(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value) {
  if (!value) {
    return 'N/A';
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString();
}

function StatusBadge({ value }) {
  const normalized = String(value || '').toUpperCase();
  const styles = {
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    ESCALATED: 'bg-rose-50 text-rose-700 border-rose-200',
    REQUESTED_MORE_DOCUMENTS: 'bg-orange-50 text-orange-700 border-orange-200',
    RECEIVED: 'bg-slate-100 text-slate-700 border-slate-200',
    ACCEPTED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REPLACEMENT_REQUIRED: 'bg-amber-50 text-amber-700 border-amber-200',
    RECORDED: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[normalized] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {formatEnum(value)}
    </span>
  );
}

function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{sub}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MemberDashboard() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [memberData, setMemberData] = useState(null);
  const [walletData, setWalletData] = useState(null);
  const [earningsData, setEarningsData] = useState({ total: 0, bySource: [], latestTransactions: [] });
  const [verificationData, setVerificationData] = useState([]);
  const [referralData, setReferralData] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [performance, setPerformance] = useState(null);
  const [upgradePath, setUpgradePath] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [capabilities, setCapabilities] = useState(defaultCapabilities);
  const [settingsForm, setSettingsForm] = useState({
    displayName: '',
    country: '',
    phone: '',
    businessName: '',
  });
  const [preferenceState, setPreferenceState] = useState({
    emailNotifications: true,
    twoFactorEnabled: false,
    linkedGoogle: false,
    linkedLinkedIn: false,
  });
  const [verificationForm, setVerificationForm] = useState({
    requestedLevel: 'BASIC_VERIFIED',
    notes: '',
  });
  const [referralForm, setReferralForm] = useState({
    receiverEmail: '',
    campaignCode: '',
  });
  const [documentForm, setDocumentForm] = useState({
    documentType: 'Government ID',
    verificationPurpose: 'Identity Verification',
    file: null,
  });

  const visibleNavItems = useMemo(() => {
    return navItems.filter((item) => capabilities?.screens?.[item.id] !== false);
  }, [capabilities]);
  const pageTitle = visibleNavItems.find((item) => item.id === activeNav)?.label || 'Dashboard';

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (_error) {
      navigate('/login');
    }
  }

  async function loadDashboard(profileId) {
    if (!profileId) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const [
        memberRes,
        walletRes,
        verificationRes,
        referralRes,
        opportunitiesRes,
        documentsRes,
        earningsRes,
        notificationsRes,
        performanceRes,
        upgradeRes,
        tiersRes,
        capabilitiesRes,
        preferencesRes,
      ] = await Promise.all([
        membersAPI.getById(profileId),
        walletsAPI.getWallet(profileId),
        verificationAPI.getAll(),
        referralsAPI.getAll(),
        opportunitiesAPI.getAll(),
        documentsAPI.getAll(),
        walletsAPI.getEarnings(profileId),
        membersAPI.getNotifications(profileId),
        membersAPI.getPerformance(profileId),
        membersAPI.getUpgradePath(profileId),
        referenceAPI.getTiers(),
        membersAPI.getCapabilities(profileId),
        membersAPI.getPreferences(profileId),
      ]);

      const member = memberRes.data;
      setMemberData(member);
      setWalletData(walletRes.data);
      setVerificationData(verificationRes.data || []);
      setReferralData(referralRes.data || []);
      setOpportunities(opportunitiesRes.data || []);
      setDocuments(documentsRes.data || []);
      setEarningsData(earningsRes.data || { total: 0, bySource: [], latestTransactions: [] });
      setNotifications(notificationsRes.data || []);
      setPerformance(performanceRes.data || null);
      setUpgradePath(upgradeRes.data || null);
      setTiers(tiersRes.data || []);
      setCapabilities(capabilitiesRes.data || defaultCapabilities);
      setPreferenceState(preferencesRes.data || {
        emailNotifications: true,
        twoFactorEnabled: false,
        linkedGoogle: false,
        linkedLinkedIn: false,
      });
      setSettingsForm({
        displayName: member.displayName || '',
        country: member.country || '',
        phone: member.phone || '',
        businessName: member.businessName || '',
      });
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Failed to load the member workspace.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (auth?.memberProfileId) {
      loadDashboard(auth.memberProfileId);
    }
  }, [auth?.memberProfileId]);

  useEffect(() => {
    if (!visibleNavItems.length) {
      return;
    }
    if (!visibleNavItems.some((item) => item.id === activeNav)) {
      setActiveNav(visibleNavItems[0].id);
    }
  }, [activeNav, visibleNavItems]);

  const currentVerificationIndex = verificationLevels.indexOf(memberData?.verificationLevel || 'UNVERIFIED');
  const verificationProgress = currentVerificationIndex >= 0 ? ((currentVerificationIndex + 1) / verificationLevels.length) * 100 : 0;
  const balanceValue = Number(walletData?.balance || 0);
  const referralCode = memberData?.referralCode || auth?.memberProfileId || 'UNAVAILABLE';
  const nextTierName = useMemo(() => {
    const nextCode = upgradePath?.nextTier;
    if (!nextCode || !tiers.length) {
      return 'Top tier reached';
    }
    const found = tiers.find((tier) => tier.code === nextCode);
    return found?.name || formatEnum(nextCode);
  }, [upgradePath?.nextTier, tiers]);
  const marketplaceItems = opportunities.filter((item) => item.type === 'MARKETPLACE');
  const pendingActions = (upgradePath?.checklist || []).filter((item) => !item.met);

  const stats = [
    {
      label: 'AUREX Balance',
      value: `ARX ${balanceValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      sub: `${walletData?.transactions?.length || 0} wallet movements`,
      icon: Wallet,
    },
    {
      label: 'Current Tier',
      value: memberData?.tier?.name || 'Member',
      sub: `${formatEnum(memberData?.participantClass?.code || 'GENERAL_MEMBER')} class`,
      icon: Crown,
    },
    {
      label: 'Total Earnings',
      value: `ARX ${Number(earningsData?.total || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      sub: `${earningsData?.bySource?.length || 0} earning sources`,
      icon: TrendingUp,
    },
    {
      label: 'Notifications',
      value: String(notifications.length || 0),
      sub: 'Latest system alerts and updates',
      icon: Bell,
    },
  ];

  async function handleVerificationRequest() {
    if (!auth?.memberProfileId) {
      return;
    }
    setSaving(true);
    setNotice('');
    setError('');
    try {
      await verificationAPI.create({
        memberProfileId: auth.memberProfileId,
        requestedLevel: verificationForm.requestedLevel,
        notes: verificationForm.notes,
      });
      setNotice('Verification request submitted.');
      setVerificationForm((current) => ({ ...current, notes: '' }));
      await loadDashboard(auth.memberProfileId);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to submit verification request.');
    } finally {
      setSaving(false);
    }
  }

  async function handleReferralCreate() {
    if (!auth?.memberProfileId) {
      return;
    }
    setSaving(true);
    setNotice('');
    setError('');
    try {
      await referralsAPI.create({
        senderProfileId: auth.memberProfileId,
        receiverEmail: referralForm.receiverEmail,
        campaignCode: referralForm.campaignCode || undefined,
      });
      setNotice('Referral created.');
      setReferralForm({ receiverEmail: '', campaignCode: '' });
      await loadDashboard(auth.memberProfileId);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Unable to create referral.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDocumentUpload() {
    if (!auth?.memberProfileId || !documentForm.file) {
      setError('Choose a file before uploading.');
      return;
    }

    setSaving(true);
    setNotice('');
    setError('');
    try {
      const uploadUrlResponse = await documentsAPI.getUploadUrl({
        memberProfileId: auth.memberProfileId,
        fileName: documentForm.file.name,
        contentType: documentForm.file.type || 'application/octet-stream',
      });
      await documentsAPI.uploadBinary(
        uploadUrlResponse.data.uploadUrl,
        documentForm.file,
        documentForm.file.type || 'application/octet-stream'
      );
      await documentsAPI.finalizeUpload({
        memberProfileId: auth.memberProfileId,
        documentType: documentForm.documentType,
        verificationPurpose: documentForm.verificationPurpose,
        fileUrl: uploadUrlResponse.data.fileUrl,
        storageKey: uploadUrlResponse.data.storageKey,
        fileName: documentForm.file.name,
        mimeType: documentForm.file.type || 'application/octet-stream',
        sizeBytes: documentForm.file.size,
      });
      setNotice('Document uploaded successfully.');
      setDocumentForm((current) => ({ ...current, file: null }));
      await loadDashboard(auth.memberProfileId);
    } catch (uploadError) {
      setError(uploadError.response?.data?.error || 'Unable to upload document.');
    } finally {
      setSaving(false);
    }
  }

  async function handleSettingsSave() {
    if (!auth?.memberProfileId) {
      return;
    }
    setSaving(true);
    setNotice('');
    setError('');
    try {
      await membersAPI.update(auth.memberProfileId, settingsForm);
      setNotice('Profile updated.');
      await loadDashboard(auth.memberProfileId);
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePreferenceSave() {
    if (!auth?.memberProfileId) {
      return;
    }
    setSaving(true);
    setNotice('');
    setError('');
    try {
      const response = await membersAPI.updatePreferences(auth.memberProfileId, preferenceState);
      setPreferenceState(response.data || preferenceState);
      setNotice('Preference settings saved.');
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Unable to save preference settings.');
    } finally {
      setSaving(false);
    }
  }

  function copyReferralLink() {
    const link = `${window.location.origin}/register?ref=${encodeURIComponent(referralCode)}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(link);
      setNotice('Referral link copied.');
      return;
    }
    setNotice(link);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[280px_1fr]">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        )}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-slate-200 bg-white px-4 py-5 overflow-y-auto transition-transform lg:static lg:z-auto lg:h-screen lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="mb-6 flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3">
              <img src="/images/AUREON9.png" alt="AUREON9 logo" className="h-11 w-11 object-contain" />
              <div>
                <h1 className="text-lg font-semibold">AUREON9</h1>
                <p className="text-xs text-slate-500">Member control center</p>
              </div>
            </div>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-5 px-2">
            <div className="rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0F4C81] p-4 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-white/20">
                  <AvatarFallback className="bg-white/10 text-white">
                    {auth?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{memberData?.displayName || auth?.name || 'Member'}</p>
                  <p className="text-xs text-white/75">{memberData?.tier?.name || 'Member'} Tier</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/80">
                  <span>Verification progress</span>
                  <span>{Math.round(verificationProgress)}%</span>
                </div>
                <Progress value={verificationProgress} className="h-2 bg-white/15" />
              </div>
            </div>
          </div>

          <nav className="space-y-1 pr-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <Separator className="my-5" />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <p className="font-medium text-slate-900">Pending Actions</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {pendingActions.length
                ? `${pendingActions.length} upgrade/compliance actions need attention.`
                : 'No pending actions. Your profile is current.'}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Class: {formatEnum(capabilities?.profile?.participantClassCode || memberData?.participantClass?.code || 'GENERAL_MEMBER')}
            </p>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50 justify-start"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex min-w-0 min-h-0 flex-col lg:overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ODIECLOUD Membership Operations</p>
                  <h2 className="text-2xl font-semibold tracking-tight">{pageTitle}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="rounded-2xl border-slate-200 pl-9" placeholder="Search panel data..." />
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:p-6">
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
            {loading ? (
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-6 text-sm text-slate-500">Loading member workspace...</CardContent>
              </Card>
            ) : (
              <PanelSection
                activeNav={activeNav}
                memberData={memberData}
                walletData={walletData}
                verificationData={verificationData}
                referralData={referralData}
                opportunities={opportunities}
                marketplaceItems={marketplaceItems}
                documents={documents}
                notifications={notifications}
                performance={performance}
                upgradePath={upgradePath}
                capabilities={capabilities}
                stats={stats}
                earningsData={earningsData}
                verificationForm={verificationForm}
                setVerificationForm={setVerificationForm}
                referralForm={referralForm}
                setReferralForm={setReferralForm}
                documentForm={documentForm}
                setDocumentForm={setDocumentForm}
                settingsForm={settingsForm}
                setSettingsForm={setSettingsForm}
                preferenceState={preferenceState}
                setPreferenceState={setPreferenceState}
                saving={saving}
                handleVerificationRequest={handleVerificationRequest}
                handleReferralCreate={handleReferralCreate}
                handleDocumentUpload={handleDocumentUpload}
                handleSettingsSave={handleSettingsSave}
                handlePreferenceSave={handlePreferenceSave}
                copyReferralLink={copyReferralLink}
                referralCode={referralCode}
                verificationProgress={verificationProgress}
                nextTierName={nextTierName}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function PanelSection({
  activeNav,
  memberData,
  walletData,
  verificationData,
  referralData,
  opportunities,
  marketplaceItems,
  documents,
  notifications,
  performance,
  upgradePath,
  capabilities,
  stats,
  earningsData,
  verificationForm,
  setVerificationForm,
  referralForm,
  setReferralForm,
  documentForm,
  setDocumentForm,
  settingsForm,
  setSettingsForm,
  preferenceState,
  setPreferenceState,
  saving,
  handleVerificationRequest,
  handleReferralCreate,
  handleDocumentUpload,
  handleSettingsSave,
  handlePreferenceSave,
  copyReferralLink,
  referralCode,
  verificationProgress,
  nextTierName,
}) {
  if (capabilities?.screens?.[activeNav] === false) {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Screen Not Available</CardTitle>
          <CardDescription>This screen is not enabled for your current member class, tier, and verification level.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (activeNav === 'profile') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Profile & Identity</CardTitle>
          <CardDescription>Primary identity, contact, and organizational profile records.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Info title="Display Name" value={memberData?.displayName || 'Not set'} />
          <Info title="Email" value={memberData?.user?.email || 'N/A'} />
          <Info title="Phone" value={memberData?.phone || 'Not set'} />
          <Info title="Country" value={memberData?.country || 'Not set'} />
          <Info title="Business Name" value={memberData?.businessName || 'Not set'} />
          <Info title="Participant Class" value={formatEnum(memberData?.participantClass?.code || 'GENERAL_MEMBER')} />
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'verification') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Verification Center</CardTitle>
          <CardDescription>Level progression, case submissions, and review outcomes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="space-y-3">
            {verificationLevels.map((level, index) => {
              const isReached = index <= verificationLevels.indexOf(memberData?.verificationLevel || 'UNVERIFIED');
              return (
                <div key={level} className="rounded-2xl border border-slate-200 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium">{formatEnum(level)}</p>
                    <StatusBadge value={isReached ? 'APPROVED' : 'PENDING'} />
                  </div>
                  <Progress value={isReached ? 100 : 0} className="h-2" />
                </div>
              );
            })}
          </div>
          <div className="space-y-4">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="grid gap-4 p-5">
                <h3 className="font-semibold">Submit Verification Upgrade</h3>
                <select
                  value={verificationForm.requestedLevel}
                  onChange={(event) => setVerificationForm((current) => ({ ...current, requestedLevel: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                >
                  {verificationLevels.map((level) => (
                    <option key={level} value={level}>{formatEnum(level)}</option>
                  ))}
                </select>
                <Textarea
                  className="min-h-[120px] rounded-2xl border-slate-200"
                  placeholder="Supporting notes for reviewers..."
                  value={verificationForm.notes}
                  onChange={(event) => setVerificationForm((current) => ({ ...current, notes: event.target.value }))}
                />
                <Button onClick={handleVerificationRequest} disabled={saving || !capabilities?.actions?.canRequestUpgrade}>
                  {capabilities?.actions?.canRequestUpgrade ? 'Submit Request' : 'Verification Upgrade Locked'}
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-5">
                <h3 className="font-semibold">Submitted Cases</h3>
                <div className="mt-4 rounded-2xl border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requested Level</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Queue</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {verificationData.length ? (
                        verificationData.map((record) => (
                          <TableRow key={record.id}>
                            <TableCell>{formatEnum(record.requestedLevel)}</TableCell>
                            <TableCell><StatusBadge value={record.status} /></TableCell>
                            <TableCell><StatusBadge value={record.queueStatus || record.status} /></TableCell>
                            <TableCell>{formatDate(record.submittedAt)}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-sm text-slate-500">No verification cases submitted yet.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-5">
                <h3 className="font-semibold">Reviewer Messages</h3>
                <div className="mt-3 space-y-3">
                  {verificationData.filter((item) => item.notes).slice(0, 6).map((record) => (
                    <div key={record.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium">{formatEnum(record.queueStatus || record.status)}</span>
                        <span className="text-xs text-slate-500">{formatDate(record.submittedAt)}</span>
                      </div>
                      <p className="mt-2 text-slate-600">{record.notes}</p>
                    </div>
                  ))}
                  {!verificationData.some((item) => item.notes) && (
                    <p className="text-sm text-slate-500">No reviewer messages yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'membership') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Membership Tier Screen</CardTitle>
          <CardDescription>Tier badge, progression, and upgrade readiness checklist.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Info title="Current Tier" value={memberData?.tier?.name || 'Member'} />
            <Info title="Next Tier" value={nextTierName} />
            <Info title="Verification Level" value={formatEnum(memberData?.verificationLevel || 'UNVERIFIED')} />
            <Info title="Member Status" value={formatEnum(memberData?.status || 'ACTIVE')} />
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Upgrade Progress</h3>
              <span className="text-sm text-slate-500">{upgradePath?.progress || 0}%</span>
            </div>
            <Progress value={upgradePath?.progress || 0} className="h-2" />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {(upgradePath?.checklist || []).map((item) => (
                <div key={item.key} className={`rounded-2xl px-4 py-3 text-sm ${item.met ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                  {item.label}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleVerificationRequest} disabled={saving || !capabilities?.actions?.canRequestUpgrade}>
                Request Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'wallet') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>AUREX Wallet</CardTitle>
          <CardDescription>Wallet balance and transaction settlement history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Info title="Balance" value={`ARX ${Number(walletData?.balance || 0).toLocaleString()}`} />
            <Info title="Currency" value={walletData?.currencyCode || 'ARX'} />
            <Info title="Transactions" value={String(walletData?.transactions?.length || 0)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Button variant="outline" className="rounded-2xl border-slate-200" disabled={!capabilities?.actions?.canWithdraw}>
              Withdraw to External Wallet
            </Button>
            <Button variant="outline" className="rounded-2xl border-slate-200" disabled={!capabilities?.actions?.canTransfer}>
              Transfer to Member
            </Button>
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold">Rewards Breakdown</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {(earningsData?.bySource || []).map((item) => (
                <div key={item.source} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                  {formatEnum(item.source)}: ARX {Number(item.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletData?.transactions?.length ? (
                  walletData.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>{formatEnum(transaction.type)}</TableCell>
                      <TableCell>{transaction.reference || 'N/A'}</TableCell>
                      <TableCell>{Number(transaction.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-slate-500">No wallet transactions recorded.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'earnings') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Earnings Dashboard</CardTitle>
          <CardDescription>Earnings totals by source including referrals, commissions, rewards, and settlements.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Info title="Total Earned" value={`ARX ${Number(earningsData?.total || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
            <Info title="Reward Credits" value={`ARX ${sumSource(earningsData, 'REWARD_CREDIT')}`} />
            <Info title="Commissions" value={`ARX ${sumSource(earningsData, 'COMMISSION_CREDIT')}`} />
            <Info title="Referral Bonus" value={`ARX ${sumSource(earningsData, 'REFERRAL_BONUS')}`} />
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(earningsData?.bySource || []).map((item) => (
                  <TableRow key={item.source}>
                    <TableCell>{formatEnum(item.source)}</TableCell>
                    <TableCell>ARX {Number(item.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'marketplace') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Marketplace (ODIEXA)</CardTitle>
          <CardDescription>Verified marketplace listings available at your current access level.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(marketplaceItems.length ? marketplaceItems : opportunities).length ? (
            (marketplaceItems.length ? marketplaceItems : opportunities).map((item) => (
              <Card key={item.id} className="rounded-2xl border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{item.title}</p>
                    <StatusBadge value={item.accessRule} />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{item.description || 'No description provided.'}</p>
                  <div className="mt-4 text-sm text-slate-600">
                    <div>Type: {formatEnum(item.type)}</div>
                    <div>Country: {item.country || 'Global'}</div>
                  </div>
                  <Button className="mt-4 w-full rounded-2xl" disabled={!capabilities?.actions?.canBuyInvest}>
                    Buy / Invest
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              No marketplace listings currently available.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'referrals') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Referral System (AAL)</CardTitle>
          <CardDescription>Create referrals, copy your referral link, and track conversion records.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Referral code</p>
            <p className="mt-2 text-2xl font-semibold">{referralCode}</p>
            <Button variant="outline" className="mt-3 rounded-2xl border-slate-200" onClick={copyReferralLink}>Copy Referral Link</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_0.8fr]">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-5 grid gap-3">
                <h3 className="font-semibold">Create Referral</h3>
                <Input
                  placeholder="Receiver email"
                  value={referralForm.receiverEmail}
                  onChange={(event) => setReferralForm((current) => ({ ...current, receiverEmail: event.target.value }))}
                />
                <Input
                  placeholder="Campaign code (optional)"
                  value={referralForm.campaignCode}
                  onChange={(event) => setReferralForm((current) => ({ ...current, campaignCode: event.target.value }))}
                />
                <Button onClick={handleReferralCreate} disabled={saving}>Create Referral</Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold">Referral Metrics</h3>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Total: {referralData.length}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Pending: {referralData.filter((item) => item.status === 'PENDING').length}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Accepted: {referralData.filter((item) => item.status === 'ACCEPTED').length}</div>
              </CardContent>
            </Card>
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referralData.length ? (
                  referralData.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>{referral.receiverEmail || referral.receiver?.user?.email || 'N/A'}</TableCell>
                      <TableCell>{referral.campaignCode || 'N/A'}</TableCell>
                      <TableCell><StatusBadge value={referral.status} /></TableCell>
                      <TableCell>{formatDate(referral.createdAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-slate-500">No referral records found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'opportunities') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Opportunities Feed</CardTitle>
          <CardDescription>Investment, trade, partnership, and related opportunities currently published.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {opportunities.length ? (
            opportunities.map((item) => (
              <Card key={item.id} className="rounded-2xl border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{item.title}</p>
                    <StatusBadge value={item.accessRule} />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{item.description || 'No description.'}</p>
                  <div className="mt-4 text-sm text-slate-600">
                    <div>Type: {formatEnum(item.type)}</div>
                    <div>Country: {item.country || 'Global'}</div>
                  </div>
                  <Button className="mt-4 w-full rounded-2xl" disabled={!capabilities?.actions?.canApplyOpportunity}>
                    Apply
                  </Button>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              No opportunities are published for your access level.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'documents') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Documents & Compliance</CardTitle>
          <CardDescription>Upload compliance records and monitor document review status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="grid gap-3 p-5">
                <h3 className="font-semibold">Upload New Document</h3>
                <Input
                  placeholder="Document type"
                  value={documentForm.documentType}
                  onChange={(event) => setDocumentForm((current) => ({ ...current, documentType: event.target.value }))}
                />
                <Input
                  placeholder="Verification purpose"
                  value={documentForm.verificationPurpose}
                  onChange={(event) => setDocumentForm((current) => ({ ...current, verificationPurpose: event.target.value }))}
                />
                <input
                  type="file"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  onChange={(event) => setDocumentForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
                />
                <Button onClick={handleDocumentUpload} disabled={saving}>Upload Document</Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold">Compliance Summary</h3>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Documents uploaded: {documents.length}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Accepted: {documents.filter((item) => item.reviewStatus === 'ACCEPTED').length}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Pending review: {documents.filter((item) => ['RECEIVED', 'UNDER_REVIEW'].includes(item.reviewStatus)).length}</div>
              </CardContent>
            </Card>
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.length ? (
                  documents.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>{document.documentType}</TableCell>
                      <TableCell>{document.verificationPurpose || 'N/A'}</TableCell>
                      <TableCell><StatusBadge value={document.reviewStatus || 'RECEIVED'} /></TableCell>
                      <TableCell>{formatDate(document.uploadedAt)}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-slate-500">No documents uploaded.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'notifications') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Notifications & Alerts</CardTitle>
          <CardDescription>Recent verification, document, wallet, and referral events.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notifications.length ? (
            notifications.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-slate-500">{item.message}</p>
                  </div>
                  <StatusBadge value={item.status} />
                </div>
                <p className="mt-2 text-xs text-slate-500">{formatDate(item.createdAt)}</p>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              No notifications yet.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'metrics') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Engagement, activity, and compliance scoring based on your real account data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricBar title="Engagement Score" value={performance?.engagementScore || 0} />
            <MetricBar title="Activity Score" value={performance?.activityScore || 0} />
            <MetricBar title="Compliance Score" value={performance?.complianceScore || 0} />
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <h3 className="font-semibold">Data Points</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Verification cases: {performance?.caseCount || 0}</div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Documents: {performance?.documentCount || 0}</div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Referrals: {performance?.referralCount || 0}</div>
              <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Transactions: {performance?.transactionCount || 0}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'upgrade') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Upgrade Path Tracker</CardTitle>
          <CardDescription>Checklist, current progress, and estimated timeline to next tier.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Info title="Current Tier" value={formatEnum(upgradePath?.currentTier || memberData?.tier?.code || 'MEMBER')} />
            <Info title="Next Tier" value={formatEnum(upgradePath?.nextTier || 'SOVEREIGN')} />
            <Info title="Estimated Timeline" value={`${upgradePath?.estimatedTimelineDays || 0} days`} />
          </div>
          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Upgrade Progress</h3>
              <span className="text-sm text-slate-500">{upgradePath?.progress || 0}%</span>
            </div>
            <Progress value={upgradePath?.progress || 0} className="h-2" />
            <div className="mt-4 space-y-3">
              {(upgradePath?.checklist || []).map((item) => (
                <div key={item.key} className={`flex items-start gap-3 rounded-2xl px-4 py-3 text-sm ${item.met ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>
                  {item.met ? <CheckCircle2 className="mt-0.5 h-4 w-4" /> : <AlertTriangle className="mt-0.5 h-4 w-4" />}
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'settings') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Profile, notification, security, connected accounts, and account lifecycle controls.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-3">
            <Input
              placeholder="Display name"
              value={settingsForm.displayName}
              onChange={(event) => setSettingsForm((current) => ({ ...current, displayName: event.target.value }))}
            />
            <Input
              placeholder="Country"
              value={settingsForm.country}
              onChange={(event) => setSettingsForm((current) => ({ ...current, country: event.target.value }))}
            />
            <Input
              placeholder="Phone"
              value={settingsForm.phone}
              onChange={(event) => setSettingsForm((current) => ({ ...current, phone: event.target.value }))}
            />
            <Input
              placeholder="Business name"
              value={settingsForm.businessName}
              onChange={(event) => setSettingsForm((current) => ({ ...current, businessName: event.target.value }))}
            />
            <Button onClick={handleSettingsSave} disabled={saving}>Save Profile</Button>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold">Notification Preferences</p>
              <label className="mt-3 flex items-center justify-between text-sm">
                <span>Email notifications</span>
                <input
                  type="checkbox"
                  checked={preferenceState.emailNotifications}
                  onChange={(event) => setPreferenceState((current) => ({ ...current, emailNotifications: event.target.checked }))}
                />
              </label>
              <Button variant="outline" className="mt-3 rounded-2xl border-slate-200" onClick={handlePreferenceSave} disabled={saving}>
                Save Preferences
              </Button>
            </div>

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold">Security</p>
              <label className="mt-3 flex items-center justify-between text-sm">
                <span>Two-factor authentication</span>
                <input
                  type="checkbox"
                  checked={preferenceState.twoFactorEnabled}
                  onChange={(event) => setPreferenceState((current) => ({ ...current, twoFactorEnabled: event.target.checked }))}
                />
              </label>
              <Button variant="outline" className="mt-3 rounded-2xl border-slate-200" disabled={!capabilities?.actions?.canChangePassword}>
                Change Password
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            {[
              `Tier: ${memberData?.tier?.name || 'Member'}`,
              `Verification: ${formatEnum(memberData?.verificationLevel || 'UNVERIFIED')}`,
              `Documents on file: ${documents.length}`,
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4" />
                <span>{item}</span>
              </div>
            ))}

            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold">Connected Accounts</p>
              <label className="mt-3 flex items-center justify-between text-sm">
                <span>Google</span>
                <input
                  type="checkbox"
                  checked={preferenceState.linkedGoogle}
                  onChange={(event) => setPreferenceState((current) => ({ ...current, linkedGoogle: event.target.checked }))}
                />
              </label>
              <label className="mt-3 flex items-center justify-between text-sm">
                <span>LinkedIn</span>
                <input
                  type="checkbox"
                  checked={preferenceState.linkedLinkedIn}
                  onChange={(event) => setPreferenceState((current) => ({ ...current, linkedLinkedIn: event.target.checked }))}
                />
              </label>
            </div>

            <Button variant="outline" className="w-full rounded-2xl border-red-200 text-red-600 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Dashboard Overview</CardTitle>
        <CardDescription>Main dashboard with balance, tier status, referrals, earnings, pending actions, transactions, and opportunities.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {(stats || []).map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Info title="Current Tier" value={memberData?.tier?.name || 'Member'} />
          <Info title="Verification Level" value={formatEnum(memberData?.verificationLevel || 'UNVERIFIED')} />
          <Info title="Referral Count" value={String(referralData.length || 0)} />
          <Info title="Total Earnings" value={`ARX ${Number(earningsData?.total || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
        </div>
        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Verification Readiness</h3>
            <span className="text-sm text-slate-500">{Math.round(verificationProgress)}%</span>
          </div>
          <Progress value={verificationProgress} className="h-2" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Pending Actions</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pending Item</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upgradePath?.checklist?.length ? (
                  upgradePath.checklist.map((item) => (
                    <TableRow key={item.key}>
                      <TableCell>{item.label}</TableCell>
                      <TableCell><StatusBadge value={item.met ? 'APPROVED' : 'PENDING'} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-slate-500">No upgrade checklist available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-2xl border border-slate-200">
            <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold">Latest Transactions</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {walletData?.transactions?.length ? (
                  walletData.transactions.slice(0, 6).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDate(transaction.createdAt)}</TableCell>
                      <TableCell>{formatEnum(transaction.type)}</TableCell>
                      <TableCell>ARX {Number(transaction.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-sm text-slate-500">No transactions yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <h3 className="font-semibold">Opportunities Feed</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {opportunities.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-2xl bg-slate-50 p-3">
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-xs text-slate-500">{formatEnum(item.type)} • {item.country || 'Global'}</p>
                <p className="mt-2 text-xs text-slate-600">{item.description || 'No summary available.'}</p>
              </div>
            ))}
            {!opportunities.length && (
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500">No opportunities available.</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ title, value }) {
  return (
    <Card className="rounded-2xl border-slate-200">
      <CardContent className="p-5">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-2 text-xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function MetricBar({ title, value }) {
  return (
    <Card className="rounded-2xl border-slate-200">
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between text-sm">
          <span>{title}</span>
          <span>{value}%</span>
        </div>
        <Progress value={value} className="h-2" />
      </CardContent>
    </Card>
  );
}

function sumSource(earningsData, source) {
  const item = (earningsData?.bySource || []).find((entry) => entry.source === source);
  return Number(item?.amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
}
