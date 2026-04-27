import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  Briefcase,
  CheckCircle2,
  Crown,
  FileCheck,
  LayoutGrid,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
  LogOut,
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
} from '../api/client';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'verification', label: 'Verification', icon: ShieldCheck },
  { id: 'membership', label: 'Membership', icon: Crown },
  { id: 'wallet', label: 'AUREX Wallet', icon: Wallet },
  { id: 'referrals', label: 'AAL Referrals', icon: Users },
  { id: 'opportunities', label: 'Opportunities', icon: Briefcase },
  { id: 'documents', label: 'Documents', icon: FileCheck },
  { id: 'settings', label: 'Settings', icon: Settings },
];

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
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
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
  const [verificationData, setVerificationData] = useState([]);
  const [referralData, setReferralData] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [settingsForm, setSettingsForm] = useState({
    displayName: '',
    country: '',
    phone: '',
    businessName: '',
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

  const pageTitle = navItems.find((item) => item.id === activeNav)?.label || 'Dashboard';

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
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
      const [memberRes, walletRes, verificationRes, referralRes, opportunitiesRes, documentsRes] = await Promise.all([
        membersAPI.getById(profileId),
        walletsAPI.getWallet(profileId),
        verificationAPI.getAll(),
        referralsAPI.getAll(),
        opportunitiesAPI.getAll(),
        documentsAPI.getAll(),
      ]);

      const member = memberRes.data;
      setMemberData(member);
      setWalletData(walletRes.data);
      setVerificationData(verificationRes.data || []);
      setReferralData(referralRes.data || []);
      setOpportunities(opportunitiesRes.data || []);
      setDocuments(documentsRes.data || []);
      setSettingsForm({
        displayName: member.displayName || '',
        country: member.country || '',
        phone: member.phone || '',
        businessName: member.businessName || '',
      });
      setVerificationForm((current) => ({
        ...current,
        requestedLevel: current.requestedLevel || 'BASIC_VERIFIED',
      }));
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

  const currentVerificationIndex = verificationLevels.indexOf(memberData?.verificationLevel || 'UNVERIFIED');
  const verificationProgress = currentVerificationIndex >= 0 ? ((currentVerificationIndex + 1) / verificationLevels.length) * 100 : 0;
  const balanceValue = Number(walletData?.balance || 0);
  const nextVerificationLevels = verificationLevels.filter((level) => level !== memberData?.verificationLevel);
  const recentTransactions = walletData?.transactions || [];
  const referralCode = memberData?.referralCode || auth?.memberProfileId || 'UNAVAILABLE';

  const stats = [
    {
      label: 'AUREX Balance',
      value: `ARX ${balanceValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
      sub: `${recentTransactions.length} recorded wallet movements`,
      icon: Wallet,
    },
    {
      label: 'Tier Status',
      value: memberData?.tier?.name || 'Member',
      sub: `${formatEnum(memberData?.participantClass?.code || 'GENERAL_MEMBER')} class`,
      icon: Crown,
    },
    {
      label: 'Referrals',
      value: String(referralData.length || 0),
      sub: 'Tracked referral records',
      icon: Users,
    },
    {
      label: 'Verification',
      value: formatEnum(memberData?.verificationLevel || 'UNVERIFIED'),
      sub: `${verificationData.length} submitted verification cases`,
      icon: ShieldCheck,
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
      setDocumentForm({
        documentType: documentForm.documentType,
        verificationPurpose: documentForm.verificationPurpose,
        file: null,
      });
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[280px_1fr]">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
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
                <p className="text-xs text-slate-500">Global membership and rewards</p>
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
            {navItems.map((item) => {
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
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-slate-700" />
              <div>
                <p className="font-medium text-slate-900">Governance Status</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {memberData?.status || 'ACTIVE'} profile, {formatEnum(memberData?.verificationLevel || 'UNVERIFIED')} verification, referral code {referralCode}.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="mt-6 border-t border-slate-200 pt-4 space-y-2">
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
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">ODIECLOUD Membership And Rewards Infrastructure</p>
                  <h2 className="text-2xl font-semibold tracking-tight">{pageTitle}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="rounded-2xl border-slate-200 pl-9" placeholder="Search your documents, cases, and opportunities..." />
                </div>
                <Button variant="outline" className="rounded-2xl border-slate-200">
                  <Bell className="mr-2 h-4 w-4" /> Alerts
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:p-6">
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </section>

            {loading ? (
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-6 text-sm text-slate-500">Loading member workspace...</CardContent>
              </Card>
            ) : (
              renderSection({
                activeNav,
                auth,
                documents,
                documentForm,
                memberData,
                opportunities,
                referralCode,
                referralData,
                referralForm,
                saving,
                setDocumentForm,
                setReferralForm,
                setSettingsForm,
                setVerificationForm,
                settingsForm,
                verificationData,
                verificationForm,
                verificationProgress,
                walletData,
                handleDocumentUpload,
                handleReferralCreate,
                handleSettingsSave,
                handleVerificationRequest,
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function renderSection(props) {
  const {
    activeNav,
    documents,
    documentForm,
    memberData,
    opportunities,
    referralCode,
    referralData,
    referralForm,
    saving,
    setDocumentForm,
    setReferralForm,
    setSettingsForm,
    setVerificationForm,
    settingsForm,
    verificationData,
    verificationForm,
    verificationProgress,
    walletData,
    handleDocumentUpload,
    handleReferralCreate,
    handleSettingsSave,
    handleVerificationRequest,
  } = props;

  if (activeNav === 'verification') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Verification Center</CardTitle>
          <CardDescription>Submit verification upgrades and track governance review outcomes.</CardDescription>
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
                <div>
                  <h3 className="font-semibold">Request a new verification level</h3>
                  <p className="mt-1 text-sm text-slate-500">Current status: {formatEnum(memberData?.verificationLevel || 'UNVERIFIED')}</p>
                </div>
                <select
                  value={verificationForm.requestedLevel}
                  onChange={(event) => setVerificationForm((current) => ({ ...current, requestedLevel: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                >
                  {verificationLevels.map((level) => (
                    <option key={level} value={level}>
                      {formatEnum(level)}
                    </option>
                  ))}
                </select>
                <Textarea
                  className="min-h-[120px] rounded-2xl border-slate-200"
                  placeholder="Add supporting notes for the review team..."
                  value={verificationForm.notes}
                  onChange={(event) => setVerificationForm((current) => ({ ...current, notes: event.target.value }))}
                />
                <Button onClick={handleVerificationRequest} disabled={saving}>
                  Submit Verification Request
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
                        <TableHead>Level</TableHead>
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
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'membership') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Membership Tier And Identity</CardTitle>
          <CardDescription>Member class, tier standing, and progression indicators.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-2xl border-slate-200"><CardContent className="p-5"><p className="text-sm text-slate-500">Display Name</p><p className="mt-2 text-xl font-semibold">{memberData?.displayName || 'Not set'}</p></CardContent></Card>
            <Card className="rounded-2xl border-slate-200"><CardContent className="p-5"><p className="text-sm text-slate-500">Participant Class</p><p className="mt-2 text-xl font-semibold">{formatEnum(memberData?.participantClass?.code || 'GENERAL_MEMBER')}</p></CardContent></Card>
            <Card className="rounded-2xl border-slate-200"><CardContent className="p-5"><p className="text-sm text-slate-500">Membership Tier</p><p className="mt-2 text-xl font-semibold">{memberData?.tier?.name || 'Member'}</p></CardContent></Card>
            <Card className="rounded-2xl border-slate-200"><CardContent className="p-5"><p className="text-sm text-slate-500">Referral Code</p><p className="mt-2 text-xl font-semibold">{referralCode}</p></CardContent></Card>
          </div>

          <div className="rounded-2xl border border-slate-200 p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Membership Readiness</h3>
              <span className="text-sm text-slate-500">{Math.round(verificationProgress)}%</span>
            </div>
            <Progress value={verificationProgress} className="h-2" />
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                `Verification level: ${formatEnum(memberData?.verificationLevel || 'UNVERIFIED')}`,
                `Status: ${formatEnum(memberData?.status || 'ACTIVE')}`,
                `Country: ${memberData?.country || 'Not provided'}`,
                `Business: ${memberData?.businessName || 'Not provided'}`,
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700">{item}</div>
              ))}
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
          <CardDescription>Live wallet balance and transaction history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-2xl border-slate-200"><CardContent className="p-4"><p className="text-sm text-slate-500">Balance</p><p className="mt-2 text-2xl font-semibold">ARX {Number(walletData?.balance || 0).toLocaleString()}</p></CardContent></Card>
            <Card className="rounded-2xl border-slate-200"><CardContent className="p-4"><p className="text-sm text-slate-500">Currency</p><p className="mt-2 text-2xl font-semibold">{walletData?.currencyCode || 'ARX'}</p></CardContent></Card>
            <Card className="rounded-2xl border-slate-200"><CardContent className="p-4"><p className="text-sm text-slate-500">Transactions</p><p className="mt-2 text-2xl font-semibold">{walletData?.transactions?.length || 0}</p></CardContent></Card>
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
                    <TableCell colSpan={4} className="text-sm text-slate-500">No wallet transactions recorded yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'referrals') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>AAL Referral System</CardTitle>
          <CardDescription>Create referrals and monitor conversion records linked to your member profile.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-slate-200 p-5">
            <p className="text-sm text-slate-500">Your referral code</p>
            <p className="mt-2 text-2xl font-semibold">{referralCode}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_0.7fr]">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-5">
                <h3 className="font-semibold">Create Referral</h3>
                <div className="mt-4 grid gap-3">
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
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-5">
                <h3 className="font-semibold">Referral Metrics</h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Total referrals: {referralData.length}</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Pending referrals: {referralData.filter((item) => item.status === 'PENDING').length}</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Accepted referrals: {referralData.filter((item) => item.status === 'ACCEPTED').length}</div>
                </div>
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
                    <TableCell colSpan={4} className="text-sm text-slate-500">No referrals created yet.</TableCell>
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
          <CardDescription>Published opportunities visible to your current tier and verification state.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {opportunities.length ? (
            opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="rounded-2xl border-slate-200">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{opportunity.title}</p>
                    <StatusBadge value={opportunity.accessRule} />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{opportunity.description || 'No description provided.'}</p>
                  <div className="mt-4 grid gap-2 text-sm text-slate-600">
                    <div>Type: {formatEnum(opportunity.type)}</div>
                    <div>Country: {opportunity.country || 'Global'}</div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
              No opportunities are currently published for your access level.
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
          <CardTitle>Documents And Compliance</CardTitle>
          <CardDescription>Upload verification documents and monitor review state.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
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
              <CardContent className="p-5">
                <h3 className="font-semibold">Document Summary</h3>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Documents uploaded: {documents.length}</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Accepted documents: {documents.filter((item) => item.reviewStatus === 'ACCEPTED').length}</div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Pending review: {documents.filter((item) => item.reviewStatus === 'RECEIVED' || item.reviewStatus === 'UNDER_REVIEW').length}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Review</TableHead>
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
                    <TableCell colSpan={4} className="text-sm text-slate-500">No documents uploaded yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
          <CardDescription>Update your member profile and business identity details.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
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
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Dashboard Overview</CardTitle>
        <CardDescription>Live member data across identity, verification, referrals, wallet, and compliance.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="rounded-2xl border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-emerald-50 p-2"><CheckCircle2 className="h-4 w-4 text-emerald-600" /></div>
                <div>
                  <p className="text-sm font-medium">Membership Active</p>
                  <p className="text-xs text-slate-500">{formatEnum(memberData?.status || 'ACTIVE')} profile state</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-blue-50 p-2"><ShieldCheck className="h-4 w-4 text-blue-600" /></div>
                <div>
                  <p className="text-sm font-medium">Verification</p>
                  <p className="text-xs text-slate-500">{verificationData.length} total review cases</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-slate-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-amber-50 p-2"><FileCheck className="h-4 w-4 text-amber-600" /></div>
                <div>
                  <p className="text-sm font-medium">Documents</p>
                  <p className="text-xs text-slate-500">{documents.length} uploaded compliance files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="rounded-2xl border border-slate-200 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Verification Readiness</h3>
            <span className="text-sm text-slate-500">{Math.round(verificationProgress)}%</span>
          </div>
          <Progress value={verificationProgress} className="h-2" />
        </div>

        <div className="rounded-2xl border border-slate-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recent Case</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {verificationData.length ? (
                verificationData.slice(0, 5).map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>{formatEnum(record.requestedLevel)}</TableCell>
                    <TableCell><StatusBadge value={record.queueStatus || record.status} /></TableCell>
                    <TableCell>{record.notes || 'No notes recorded.'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-sm text-slate-500">No recent verification activity yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
