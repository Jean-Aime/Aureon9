import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  HiLightningBolt,
  HiExclamation,
  HiChartBar,
  HiCheckCircle,
  HiCash,
  HiClock,
  HiDocumentText,
  HiFilter,
  HiMenu,
  HiSearch,
  HiCog,
  HiShieldCheck,
  HiUpload,
  HiUsers,
  HiX,
  HiXCircle,
  HiLogout,
  HiBell,
  HiKey,
} from 'react-icons/hi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { Separator } from '../components/ui/Separator';
import { adminPanelAPI, documentsAPI, membersAPI, reviewQueueAPI, walletsAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const nav = [
  { id: 'overview', label: 'Overview', icon: HiCheckCircle },
  { id: 'aureon9-members', label: 'AUREON9 Members', icon: HiUsers },
  { id: 'aureon9-distributions', label: 'AUREON9 Distributions', icon: HiCash },
  { id: 'aureon9-revenue', label: 'AUREON9 Revenue', icon: HiChartBar },
  { id: 'review-queue', label: 'Review Queue', icon: HiDocumentText },
  { id: 'detailed-case', label: 'Detailed Case', icon: HiShieldCheck },
  { id: 'documents-upload', label: 'Documents Upload', icon: HiUpload },
  { id: 'members', label: 'Member Management', icon: HiUsers },
  { id: 'risk-monitor', label: 'Risk Monitoring', icon: HiExclamation },
  { id: 'rewards', label: 'Rewards Control', icon: HiCash },
  { id: 'audit-logs', label: 'Activity Logs', icon: HiLightningBolt },
  { id: 'revenue', label: 'Revenue Dashboard', icon: HiChartBar },
  { id: 'notifications', label: 'Notification Center', icon: HiBell },
  { id: 'roles', label: 'Role Matrix', icon: HiKey },
  { id: 'queue-aging', label: 'Queue Aging', icon: HiClock },
  { id: 'delivery', label: 'Delivery Analytics', icon: HiBell },
  { id: 'governance', label: 'Governance Settings', icon: HiCog },
];

const roleAccess = {
  SUPER_ADMIN: nav.map((item) => item.id),
  EXECUTIVE: ['overview', 'aureon9-members', 'aureon9-distributions', 'aureon9-revenue', 'review-queue', 'detailed-case', 'members', 'risk-monitor', 'rewards', 'audit-logs', 'revenue', 'notifications', 'roles', 'queue-aging', 'delivery', 'governance'],
  LEGAL_COMPLIANCE: ['overview', 'aureon9-members', 'review-queue', 'detailed-case', 'documents-upload', 'members', 'risk-monitor', 'audit-logs', 'roles', 'queue-aging', 'delivery'],
  QUALIFICATIONS: ['overview', 'aureon9-members', 'review-queue', 'detailed-case', 'members', 'roles', 'queue-aging'],
  CUSTOMER_SUCCESS: ['overview', 'aureon9-members', 'documents-upload', 'members', 'notifications'],
  FINANCE_TREASURY: ['overview', 'aureon9-members', 'aureon9-distributions', 'aureon9-revenue', 'members', 'rewards', 'revenue', 'notifications', 'delivery'],
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

function applyRoleCaseFilter(records, role) {
  if (!Array.isArray(records)) {
    return [];
  }
  if (role === 'SUPER_ADMIN' || role === 'LEGAL_COMPLIANCE') {
    return records;
  }
  if (role === 'EXECUTIVE') {
    return records.filter((item) => item.queueStatus === 'ESCALATED' || item.risk === 'HIGH');
  }
  if (role === 'QUALIFICATIONS') {
    return records.filter((item) => ['CERTIFIED', 'EXECUTIVE', 'STRATEGIC', 'FOUNDING', 'SOVEREIGN'].includes(item.memberProfile?.tier?.code));
  }
  if (role === 'CUSTOMER_SUCCESS') {
    return records.filter((item) => ['PENDING', 'REQUESTED_MORE_DOCUMENTS'].includes(item.queueStatus));
  }
  if (role === 'FINANCE_TREASURY') {
    return records.filter((item) => ['CAPITAL_VERIFIED', 'GOVERNANCE_APPROVED'].includes(item.requestedLevel));
  }
  return records;
}

function StatusPill({ value }) {
  const normalized = String(value || '').toUpperCase();
  const styles = {
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    UNDER_REVIEW: 'bg-blue-50 text-blue-700 border-blue-200',
    REQUESTED_MORE_DOCUMENTS: 'bg-orange-50 text-orange-700 border-orange-200',
    ESCALATED: 'bg-rose-50 text-rose-700 border-rose-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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

function Metric({ title, value, sub, icon: Icon }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{sub}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-[var(--aureon-ink)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminReviewModule() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    requestedLevel: '',
    participantClass: '',
    risk: '',
  });
  const [notes, setNotes] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [assignedReviewerId, setAssignedReviewerId] = useState('');
  const [members, setMembers] = useState([]);
  const [memberFilters, setMemberFilters] = useState({
    search: '',
    participantClass: '',
    tier: '',
    verificationLevel: '',
    status: '',
  });
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [memberEditForm, setMemberEditForm] = useState(null);
  const [uploadForm, setUploadForm] = useState({
    memberSearch: '',
    memberProfileId: '',
    documentType: 'Government ID',
    verificationPurpose: 'Identity Verification',
    file: null,
  });
  const [rewardForm, setRewardForm] = useState({
    memberProfileId: '',
    amount: '',
    reason: 'Bonus',
    notes: '',
  });
  const [panelConfig, setPanelConfig] = useState(null);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
    }
  }

  async function loadQueue(nextFilters = filters) {
    setLoading(true);

    try {
      const { risk, ...apiFilters } = nextFilters || {};
      const response = await reviewQueueAPI.getAll(apiFilters);
      const baseRecords = response.data || [];
      const roleFiltered = applyRoleCaseFilter(baseRecords, auth?.role);
      const records = risk ? roleFiltered.filter((item) => item.risk === risk) : roleFiltered;
      setQueue(records);
      setSelectedQueueId((current) => {
        if (current && records.some((item) => item.id === current)) {
          return current;
        }
        return records[0]?.id || '';
      });
    } catch (loadError) {
      toast.error(loadError.response?.data?.error || 'Failed to load the review queue.');
    } finally {
      setLoading(false);
    }
  }

  async function loadAdminAnalytics() {
    try {
      const [analyticsRes, usersRes, membersRes, configRes] = await Promise.all([
        adminPanelAPI.getAnalytics(),
        adminPanelAPI.getUsers(),
        membersAPI.getAll(),
        adminPanelAPI.getConfig(),
      ]);
      setAnalytics(analyticsRes.data || null);
      setUsers(usersRes.data || []);
      setMembers(membersRes.data || []);
      setPanelConfig(configRes.data || null);
      setAssignedReviewerId((current) => current || usersRes.data?.find((user) => user.id === auth?.id)?.id || '');
      setRewardForm((current) => ({ ...current, memberProfileId: current.memberProfileId || membersRes.data?.[0]?.id || '' }));
    } catch (_error) {
      // Keep review queue usable even if analytics endpoints fail
    }
  }

  useEffect(() => {
    loadQueue(filters);
  }, [filters.status, filters.requestedLevel, filters.participantClass, filters.risk]);

  useEffect(() => {
    loadAdminAnalytics();
  }, []);

  const selected = queue.find((item) => item.id === selectedQueueId) || queue[0] || null;
  const participantClassOptions = Array.from(new Set(queue.map((item) => item.memberProfile?.participantClass?.code).filter(Boolean)));
  const allDocuments = queue.flatMap((item) =>
    (item.memberProfile?.documents || []).map((document) => ({
      ...document,
      ownerName: item.memberProfile?.displayName || item.memberProfile?.user?.name || item.memberProfile?.user?.email || 'Member',
      caseId: item.id,
    }))
  );

  async function runAction(actionName, handler) {
    if (!selected) {
      return;
    }

    setSaving(true);

    try {
      await handler();
      setNotes('');
      setRequiredDocuments('');
      toast.success(`${actionName} completed.`);
      await loadQueue(filters);
      await loadAdminAnalytics();
    } catch (actionError) {
      toast.error(actionError.response?.data?.error || `Unable to ${actionName.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  }

  async function updateDocumentStatus(documentId, reviewStatus) {
    setSaving(true);

    try {
      await documentsAPI.updateReviewStatus(documentId, { reviewStatus, notes });
      toast.success(`Document marked ${formatEnum(reviewStatus)}.`);
      await loadQueue(filters);
      await loadAdminAnalytics();
    } catch (actionError) {
      toast.error(actionError.response?.data?.error || 'Unable to update document review status.');
    } finally {
      setSaving(false);
    }
  }

  function startMemberEdit(member) {
    if (!member) return;
    setSelectedMemberId(member.id);
    setMemberEditForm({
      id: member.id,
      name: member.user?.name || '',
      displayName: member.displayName || '',
      country: member.country || '',
      phone: member.phone || '',
      businessName: member.businessName || '',
      participantClassCode: member.participantClass?.code || '',
      tierCode: member.tier?.code || '',
      verificationLevel: member.verificationLevel || 'UNVERIFIED',
      status: member.status || 'ACTIVE',
    });
    setActiveNav('member-edit');
  }

  async function saveMemberEdit() {
    if (!memberEditForm?.id) return;
    setSaving(true);
    try {
      await membersAPI.update(memberEditForm.id, memberEditForm);
      toast.success('Member profile updated.');
      await loadAdminAnalytics();
    } catch (actionError) {
      toast.error(actionError.response?.data?.error || 'Unable to save member changes.');
    } finally {
      setSaving(false);
    }
  }

  async function toggleMemberSuspension(member, nextStatus) {
    if (!member?.id) return;
    setSaving(true);
    try {
      await membersAPI.update(member.id, { status: nextStatus });
      toast.success(`Member status updated to ${nextStatus}.`);
      await loadAdminAnalytics();
    } catch (actionError) {
      toast.error(actionError.response?.data?.error || 'Unable to change member status.');
    } finally {
      setSaving(false);
    }
  }

  async function submitAdminDocumentUpload() {
    if (!uploadForm.memberProfileId || !uploadForm.file) {
      toast.error('Select a member and choose a file first.');
      return;
    }
    if (auth?.role === 'CUSTOMER_SUCCESS') {
      toast.info('Customer Success can upload files but cannot submit to review queue.');
      return;
    }

    setSaving(true);
    try {
      const signed = await documentsAPI.getUploadUrl({
        memberProfileId: uploadForm.memberProfileId,
        fileName: uploadForm.file.name,
        contentType: uploadForm.file.type || 'application/octet-stream',
      });
      await documentsAPI.uploadBinary(
        signed.data.uploadUrl,
        uploadForm.file,
        uploadForm.file.type || 'application/octet-stream'
      );
      await documentsAPI.finalizeUpload({
        memberProfileId: uploadForm.memberProfileId,
        documentType: uploadForm.documentType,
        verificationPurpose: uploadForm.verificationPurpose,
        fileUrl: signed.data.fileUrl,
        storageKey: signed.data.storageKey,
        fileName: uploadForm.file.name,
        mimeType: uploadForm.file.type || 'application/octet-stream',
        sizeBytes: uploadForm.file.size,
      });
      toast.success('Document uploaded and submitted to review queue.');
      setUploadForm((current) => ({ ...current, file: null }));
      await loadQueue(filters);
      await loadAdminAnalytics();
    } catch (actionError) {
      toast.error(actionError.response?.data?.error || 'Unable to upload document.');
    } finally {
      setSaving(false);
    }
  }

  async function creditMemberReward() {
    if (!rewardForm.memberProfileId || !rewardForm.amount) {
      toast.error('Select a member and enter amount.');
      return;
    }
    const targetMember = members.find((item) => item.id === rewardForm.memberProfileId);
    if (!targetMember?.wallet?.id) {
      toast.error('Selected member has no wallet.');
      return;
    }
    setSaving(true);
    try {
      await walletsAPI.createTransaction({
        walletId: targetMember.wallet.id,
        type: 'ADJUSTMENT',
        amount: Number(rewardForm.amount),
        reference: `ADMIN-${rewardForm.reason.toUpperCase()}`,
        notes: rewardForm.notes || rewardForm.reason,
      });
      toast.success('Manual reward credited.');
      setRewardForm((current) => ({ ...current, amount: '', notes: '' }));
      await loadAdminAnalytics();
    } catch (actionError) {
      toast.error(actionError.response?.data?.error || 'Unable to credit reward.');
    } finally {
      setSaving(false);
    }
  }

  async function saveRewardRules() {
    if (!panelConfig?.rewardRules) return;
    setSaving(true);
    try {
      await adminPanelAPI.updateRewardRules(panelConfig.rewardRules);
      toast.success('Reward rules updated.');
      await loadAdminAnalytics();
    } catch (actionError) {
      toast.error(actionError.response?.data?.error || 'Unable to update reward rules.');
    } finally {
      setSaving(false);
    }
  }

  async function saveGovernanceRules() {
    if (!panelConfig) return;
    setSaving(true);
    try {
      await adminPanelAPI.updateGovernanceRules(panelConfig.deliveryRules, panelConfig.escalationRules);
      toast.success('Governance settings updated.');
      await loadAdminAnalytics();
    } catch (actionError) {
      toast.error(actionError.response?.data?.error || 'Unable to update governance settings.');
    } finally {
      setSaving(false);
    }
  }

  function exportCsv(filename, rows) {
    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    link.click();
  }

  const pendingCount = queue.filter((item) => item.queueStatus === 'PENDING').length;
  const escalatedCount = queue.filter((item) => item.queueStatus === 'ESCALATED').length;
  const documentCount = allDocuments.length;
  const approvalRate = queue.length
    ? `${Math.round((queue.filter((item) => item.status === 'APPROVED').length / queue.length) * 100)}%`
    : '0%';
  const rewardDistribution = analytics?.revenueMetrics?.rewardDistribution || {};
  const totalRewardValue = Object.values(rewardDistribution).reduce((sum, value) => sum + Number(value || 0), 0);
  const allowedTabs = roleAccess[auth?.role] || [];
  const visibleNav = nav.filter((item) => allowedTabs.includes(item.id));
  const filteredMembers = members.filter((member) => {
    const memberName = member.displayName || member.user?.name || '';
    const memberEmail = member.user?.email || '';
    const search = memberFilters.search.toLowerCase();
    const searchOk = !search || memberName.toLowerCase().includes(search) || memberEmail.toLowerCase().includes(search);
    const classOk = !memberFilters.participantClass || member.participantClass?.code === memberFilters.participantClass;
    const tierOk = !memberFilters.tier || member.tier?.code === memberFilters.tier;
    const verificationOk = !memberFilters.verificationLevel || member.verificationLevel === memberFilters.verificationLevel;
    const statusOk = !memberFilters.status || member.status === memberFilters.status;
    return searchOk && classOk && tierOk && verificationOk && statusOk;
  });
  const selectedMember = members.find((member) => member.id === selectedMemberId) || null;

  const uploadMemberMatches = members.filter((member) => {
    const text = uploadForm.memberSearch.toLowerCase();
    if (!text) return false;
    return (
      (member.displayName || member.user?.name || '').toLowerCase().includes(text) ||
      (member.user?.email || '').toLowerCase().includes(text) ||
      member.id.toLowerCase().includes(text)
    );
  }).slice(0, 10);
  const currentTitle = nav.find((item) => item.id === activeNav)?.label || 'Overview';

  useEffect(() => {
    if (!visibleNav.length) {
      return;
    }
    if (activeNav === 'member-edit') {
      return;
    }
    if (!visibleNav.some((item) => item.id === activeNav)) {
      setActiveNav(visibleNav[0].id);
    }
  }, [activeNav, visibleNav]);

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
              <img src="/images/AUREON9_Logo.png" alt="AUREON9 logo" className="h-11 w-11 object-contain" />
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
              <HiX className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-5 px-2">
            <div className="rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0F4C81] p-4 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border border-white/20">
                  <AvatarFallback className="bg-white/10 text-white">
                    {auth?.name?.substring(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{auth?.name || 'Governance Reviewer'}</p>
                  <p className="text-xs text-white/75">{formatEnum(auth?.role || 'LEGAL_COMPLIANCE')}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/85">
                Live verification queue with audit-aware actions, reviewer assignment, escalation, and document review status.
              </div>
            </div>
          </div>

          <nav className="space-y-1 pr-2">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeNav;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${isActive ? 'bg-[var(--aureon-ink)] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
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
              <HiBell className="mt-0.5 h-4 w-4 text-slate-700" />
              <div>
                <p className="font-medium text-slate-900">Queue Priority</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {pendingCount} pending, {escalatedCount} escalated, {documentCount} linked documents under review.
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
              <HiLogout className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex min-h-0 flex-col lg:overflow-hidden">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <HiMenu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Verification, Documents, Governance Controls</p>
                  <h2 className="text-2xl font-semibold tracking-tight">{currentTitle}</h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full lg:w-72">
                  <HiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="rounded-2xl border-slate-200 pl-9" placeholder="Search queue, applicants, and documents..." />
                </div>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:p-6">
            {activeNav === 'overview' && (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric title="Pending Cases" value={String(pendingCount)} sub="Awaiting first decision" icon={HiClock} />
                <Metric title="Escalated Reviews" value={String(escalatedCount)} sub="High-risk or executive queue" icon={HiExclamation} />
                <Metric title="Documents Received" value={String(documentCount)} sub="Across visible review cases" icon={HiUpload} />
                <Metric title="Approval Rate" value={approvalRate} sub="Across visible review cases" icon={HiCheckCircle} />
              </section>
            )}

            {(activeNav === 'review-queue' || activeNav === 'detailed-case') && (
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <select
                      value={filters.status}
                      onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                    >
                      <option value="">All statuses</option>
                      <option value="PENDING">Pending</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="REQUESTED_MORE_DOCUMENTS">Requested More Documents</option>
                      <option value="ESCALATED">Escalated</option>
                      <option value="APPROVED">Approved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                    <select
                      value={filters.requestedLevel}
                      onChange={(event) => setFilters((current) => ({ ...current, requestedLevel: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                    >
                      <option value="">All requested levels</option>
                      {verificationLevels.map((level) => (
                        <option key={level} value={level}>{formatEnum(level)}</option>
                      ))}
                    </select>
                    <select
                      value={filters.participantClass}
                      onChange={(event) => setFilters((current) => ({ ...current, participantClass: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                    >
                      <option value="">All participant classes</option>
                      {participantClassOptions.map((code) => (
                        <option key={code} value={code}>{formatEnum(code)}</option>
                      ))}
                    </select>
                    <select
                      value={filters.risk}
                      onChange={(event) => setFilters((current) => ({ ...current, risk: event.target.value }))}
                      className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                    >
                      <option value="">All risks</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                    <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => loadQueue(filters)}>
                      <HiFilter className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {loading ? (
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-6 text-sm text-slate-500">Loading review workflow...</CardContent>
              </Card>
            ) : (
              renderAdminSection({
                activeNav,
                allDocuments,
                analytics,
                notes,
                queue,
                requiredDocuments,
                saving,
                selected,
                users,
                assignedReviewerId,
                members,
                filteredMembers,
                memberFilters,
                setMemberFilters,
                selectedMember,
                memberEditForm,
                setMemberEditForm,
                uploadForm,
                setUploadForm,
                uploadMemberMatches,
                rewardForm,
                setRewardForm,
                panelConfig,
                setPanelConfig,
                setSelectedQueueId,
                setAssignedReviewerId,
                setNotes,
                setRequiredDocuments,
                runAction,
                updateDocumentStatus,
                auth,
                totalRewardValue,
                startMemberEdit,
                saveMemberEdit,
                toggleMemberSuspension,
                submitAdminDocumentUpload,
                creditMemberReward,
                saveRewardRules,
                saveGovernanceRules,
                exportCsv,
              })
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function renderAdminSection(props) {
  const {
    activeNav,
    allDocuments,
    analytics,
    auth,
    members,
    filteredMembers,
    memberFilters,
    setMemberFilters,
    selectedMember,
    memberEditForm,
    setMemberEditForm,
    uploadForm,
    setUploadForm,
    uploadMemberMatches,
    rewardForm,
    setRewardForm,
    panelConfig,
    setPanelConfig,
    notes,
    queue,
    requiredDocuments,
    saving,
    selected,
    users,
    assignedReviewerId,
    setSelectedQueueId,
    setAssignedReviewerId,
    setNotes,
    setRequiredDocuments,
    runAction,
    updateDocumentStatus,
    totalRewardValue,
    startMemberEdit,
    saveMemberEdit,
    toggleMemberSuspension,
    submitAdminDocumentUpload,
    creditMemberReward,
    saveRewardRules,
    saveGovernanceRules,
    exportCsv,
  } = props;
  const canFinalApprove = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE'].includes(auth?.role);
  const canRejectCase = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE'].includes(auth?.role);
  const canRequestDocs = ['SUPER_ADMIN', 'LEGAL_COMPLIANCE', 'QUALIFICATIONS'].includes(auth?.role);
  const canEscalateCase = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE', 'QUALIFICATIONS'].includes(auth?.role);
  const canAssign = ['SUPER_ADMIN', 'EXECUTIVE', 'LEGAL_COMPLIANCE'].includes(auth?.role);

  if (activeNav === 'overview') {
    const approvals = queue.filter((item) => ['PENDING', 'UNDER_REVIEW', 'ESCALATED'].includes(item.queueStatus));
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Member Approval Queue</CardTitle>
          <CardDescription>Operational queue for pending and escalated approvals.</CardDescription>
        </CardHeader>
        <CardContent>
          {auth?.role === 'SUPER_ADMIN' && (
            <div className="mb-4 flex justify-end">
              <Button variant="outline" className="rounded-2xl border-slate-200">Edit Role Permissions</Button>
            </div>
          )}
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Participant Class</TableHead>
                  <TableHead>Requested Level</TableHead>
                  <TableHead>Queue Status</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.length ? approvals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.memberProfile?.displayName || item.memberProfile?.user?.email}</TableCell>
                    <TableCell>{formatEnum(item.memberProfile?.participantClass?.code)}</TableCell>
                    <TableCell>{formatEnum(item.requestedLevel)}</TableCell>
                    <TableCell><StatusPill value={item.queueStatus} /></TableCell>
                    <TableCell><StatusPill value={item.risk} /></TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-slate-500">No items in approval queue.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'risk-monitor') {
    const highRisk = queue.filter((item) => item.risk === 'HIGH');
    const mediumRisk = queue.filter((item) => item.risk === 'MEDIUM');
    const lowRisk = queue.filter((item) => item.risk === 'LOW');
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Risk Monitoring</CardTitle>
          <CardDescription>Real-time distribution of review-case risk classifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Metric title="High Risk Cases" value={String(highRisk.length)} sub="Capital, governance, or missing docs" icon={HiExclamation} />
            <Metric title="Medium Risk Cases" value={String(mediumRisk.length)} sub="Commercial and partial docs" icon={HiClock} />
            <Metric title="Low Risk Cases" value={String(lowRisk.length)} sub="Standard queue flow" icon={HiCheckCircle} />
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highRisk.length ? highRisk.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.memberProfile?.displayName || item.memberProfile?.user?.email}</TableCell>
                    <TableCell><StatusPill value={item.risk} /></TableCell>
                    <TableCell><StatusPill value={item.queueStatus} /></TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-slate-500">No high-risk cases currently detected.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'rewards') {
    const distributionRows = Object.entries(analytics?.revenueMetrics?.rewardDistribution || {});
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Reward Distribution Control</CardTitle>
          <CardDescription>Manual member credits, reward history, and configurable reward formulas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Metric title="Total Reward Value" value={`ARX ${Number(totalRewardValue || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} sub="Across all transaction reward classes" icon={HiCash} />
            <Metric title="Reward Types" value={String(distributionRows.length)} sub="Distinct wallet transaction categories" icon={HiChartBar} />
          </div>
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="grid gap-3 p-5">
                <h3 className="font-semibold">Manual Distribution</h3>
                <select value={rewardForm.memberProfileId} onChange={(event) => setRewardForm((current) => ({ ...current, memberProfileId: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
                  <option value="">Select member...</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {(member.displayName || member.user?.name || 'Member')} - {member.user?.email}
                    </option>
                  ))}
                </select>
                <Input type="number" value={rewardForm.amount} onChange={(event) => setRewardForm((current) => ({ ...current, amount: event.target.value }))} placeholder="Amount (ARX)" />
                <select value={rewardForm.reason} onChange={(event) => setRewardForm((current) => ({ ...current, reason: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
                  <option>Bonus</option>
                  <option>Compensation</option>
                  <option>Adjustment</option>
                  <option>Gift</option>
                </select>
                <Textarea value={rewardForm.notes} onChange={(event) => setRewardForm((current) => ({ ...current, notes: event.target.value }))} className="rounded-2xl border-slate-200" placeholder="Internal notes..." />
                <Button onClick={creditMemberReward} disabled={saving}>Credit Member</Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="grid gap-3 p-5">
                <h3 className="font-semibold">Reward Rules</h3>
                <Input type="number" value={panelConfig?.rewardRules?.purchaseRewardPercent ?? 5} onChange={(event) => setPanelConfig((current) => ({ ...current, rewardRules: { ...(current?.rewardRules || {}), purchaseRewardPercent: Number(event.target.value) } }))} placeholder="Purchase Reward %" />
                <Input type="number" value={panelConfig?.rewardRules?.sellerCommissionPercent ?? 2} onChange={(event) => setPanelConfig((current) => ({ ...current, rewardRules: { ...(current?.rewardRules || {}), sellerCommissionPercent: Number(event.target.value) } }))} placeholder="Seller Commission %" />
                <Input type="number" value={panelConfig?.rewardRules?.referrerCommissionPercent ?? 1} onChange={(event) => setPanelConfig((current) => ({ ...current, rewardRules: { ...(current?.rewardRules || {}), referrerCommissionPercent: Number(event.target.value) } }))} placeholder="Referrer Commission %" />
                <Input type="number" value={panelConfig?.rewardRules?.referralSignupBonus ?? 10} onChange={(event) => setPanelConfig((current) => ({ ...current, rewardRules: { ...(current?.rewardRules || {}), referralSignupBonus: Number(event.target.value) } }))} placeholder="Referral Signup Bonus" />
                <Button variant="outline" className="rounded-2xl border-slate-200" onClick={saveRewardRules} disabled={saving}>Save Reward Rules</Button>
              </CardContent>
            </Card>
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {distributionRows.length ? distributionRows.map(([type, amount]) => (
                  <TableRow key={type}>
                    <TableCell>{formatEnum(type)}</TableCell>
                    <TableCell>ARX {Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-slate-500">No reward distribution data available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'revenue') {
    const metrics = analytics?.revenueMetrics || {};
    const revenueRows = [
      ['Metric', 'Value'],
      ['Total Members', metrics.totalMembers || 0],
      ['Published Opportunities', metrics.publishedOpportunities || 0],
      ['Referral Count', metrics.referralCount || 0],
      ['Partner Referrals', metrics.partnerReferralCount || 0],
      ['Capital Cases', metrics.capitalCaseCount || 0],
      ['Transaction Volume (ARX)', Number(metrics.totalTransactionVolume || 0).toFixed(2)],
    ];
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Revenue Dashboard</CardTitle>
          <CardDescription>Membership, referrals, wallet throughput, and capital participation metrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => exportCsv('revenue-dashboard.csv', revenueRows)}>
              Export CSV
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Metric title="Total Members" value={String(metrics.totalMembers || 0)} sub="Active member profiles" icon={HiUsers} />
          <Metric title="Published Opportunities" value={String(metrics.publishedOpportunities || 0)} sub="Live marketplace/deal entries" icon={HiDocumentText} />
          <Metric title="Referral Count" value={String(metrics.referralCount || 0)} sub="Tracked referral records" icon={HiBell} />
          <Metric title="Partner Referrals" value={String(metrics.partnerReferralCount || 0)} sub="Referrals tagged with campaign codes" icon={HiUsers} />
          <Metric title="Capital Cases" value={String(metrics.capitalCaseCount || 0)} sub="Capital + institutional queue entries" icon={HiExclamation} />
          <Metric title="Transaction Volume" value={`ARX ${Number(metrics.totalTransactionVolume || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`} sub="Total wallet transaction amount" icon={HiChartBar} />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'audit-logs') {
    const logs = analytics?.auditLogs || [];
    const auditRows = [
      ['Timestamp', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Source', 'Details'],
      ...logs.map((log) => [
        formatDate(log.createdAt),
        log.actor?.email || log.actorUserId || 'System',
        log.action,
        log.entityType,
        log.entityId,
        log.payloadJson?.sourceWebsite || 'AUREON9',
        JSON.stringify(log.payloadJson || {}),
      ]),
    ];
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
          <CardDescription>Recent controlled actions captured in the platform audit stream.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => exportCsv('audit-logs.csv', auditRows)}>
              Export CSV
            </Button>
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Source Website</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length ? logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatDate(log.createdAt)}</TableCell>
                    <TableCell>{log.actor?.email || log.actorUserId || 'System'}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell>{log.payloadJson?.sourceWebsite || 'AUREON9'}</TableCell>
                    <TableCell className="max-w-[260px] truncate">{JSON.stringify(log.payloadJson || {})}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-sm text-slate-500">No activity logs available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'documents-upload') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Document Upload Workflow (Admin)</CardTitle>
          <CardDescription>Upload documents for members and submit to review queue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="grid gap-3 p-5">
                <h3 className="font-semibold">Upload Area</h3>
                <Input
                  placeholder="Member ID or email"
                  value={uploadForm.memberSearch}
                  onChange={(event) => setUploadForm((current) => ({ ...current, memberSearch: event.target.value }))}
                />
                <select
                  value={uploadForm.memberProfileId}
                  onChange={(event) => setUploadForm((current) => ({ ...current, memberProfileId: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                >
                  <option value="">Select member...</option>
                  {uploadMemberMatches.map((member) => (
                    <option key={member.id} value={member.id}>
                      {(member.displayName || member.user?.name || 'Member')} - {member.user?.email}
                    </option>
                  ))}
                </select>
                <select
                  value={uploadForm.documentType}
                  onChange={(event) => setUploadForm((current) => ({ ...current, documentType: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                >
                  <option>Government ID</option>
                  <option>Business Registration</option>
                  <option>Compliance Certificate</option>
                  <option>Capital Source Letter</option>
                </select>
                <select
                  value={uploadForm.verificationPurpose}
                  onChange={(event) => setUploadForm((current) => ({ ...current, verificationPurpose: event.target.value }))}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                >
                  <option>Identity Verification</option>
                  <option>Commercial Verification</option>
                  <option>Institutional Verification</option>
                  <option>Capital Review</option>
                </select>
                <input
                  type="file"
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                  onChange={(event) => setUploadForm((current) => ({ ...current, file: event.target.files?.[0] || null }))}
                />
                <Button onClick={submitAdminDocumentUpload} disabled={saving}>
                  Submit to Review Queue
                </Button>
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold">Recent Documents</h3>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Total in current queue context: {allDocuments.length}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Received: {allDocuments.filter((d) => d.reviewStatus === 'RECEIVED').length}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Under Review: {allDocuments.filter((d) => d.reviewStatus === 'UNDER_REVIEW').length}</div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">Accepted: {allDocuments.filter((d) => d.reviewStatus === 'ACCEPTED').length}</div>
              </CardContent>
            </Card>
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDocuments.length ? (
                  allDocuments.map((document) => (
                    <TableRow key={document.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{document.documentType}</p>
                          <p className="text-xs text-slate-500">{document.verificationPurpose || document.fileName}</p>
                        </div>
                      </TableCell>
                      <TableCell>{document.ownerName}</TableCell>
                      <TableCell>{document.caseId}</TableCell>
                      <TableCell><StatusPill value={document.reviewStatus || 'RECEIVED'} /></TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => updateDocumentStatus(document.id, 'ACCEPTED')} disabled={saving}>Accept</Button>
                        <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => updateDocumentStatus(document.id, 'REPLACEMENT_REQUIRED')} disabled={saving}>Request Replacement</Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-slate-500">No documents found for the current filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'roles') {
    const matrixRows = analytics?.roleMatrix || [];
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Role-Based Admin Matrix</CardTitle>
          <CardDescription>Live role permission matrix sourced from backend analytics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Permissions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matrixRows.length ? (
                  matrixRows.map((row) => (
                    <TableRow key={row.role}>
                      <TableCell className="font-medium">{row.role}</TableCell>
                      <TableCell>{(row.permissions || []).map((item) => formatEnum(item)).join(', ') || 'No permissions'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-sm text-slate-500">No role matrix data available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'members') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Member Management</CardTitle>
          <CardDescription>Search, filter, edit, suspend, and inspect all member profiles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <Input
              placeholder="Search name/email..."
              value={memberFilters.search}
              onChange={(event) => setMemberFilters((current) => ({ ...current, search: event.target.value }))}
            />
            <select
              value={memberFilters.participantClass}
              onChange={(event) => setMemberFilters((current) => ({ ...current, participantClass: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
            >
              <option value="">All classes</option>
              {Array.from(new Set(members.map((m) => m.participantClass?.code).filter(Boolean))).map((code) => (
                <option key={code} value={code}>{formatEnum(code)}</option>
              ))}
            </select>
            <select
              value={memberFilters.tier}
              onChange={(event) => setMemberFilters((current) => ({ ...current, tier: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
            >
              <option value="">All tiers</option>
              {Array.from(new Set(members.map((m) => m.tier?.code).filter(Boolean))).map((code) => (
                <option key={code} value={code}>{formatEnum(code)}</option>
              ))}
            </select>
            <select
              value={memberFilters.verificationLevel}
              onChange={(event) => setMemberFilters((current) => ({ ...current, verificationLevel: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
            >
              <option value="">All verification levels</option>
              {verificationLevels.map((level) => (
                <option key={level} value={level}>{formatEnum(level)}</option>
              ))}
            </select>
            <select
              value={memberFilters.status}
              onChange={(event) => setMemberFilters((current) => ({ ...current, status: event.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Participant Class</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMembers.length ? (
                  filteredMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.displayName || member.user?.name || 'Member'}</p>
                          <p className="text-xs text-slate-500">{member.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatEnum(member.participantClass?.code)}</TableCell>
                      <TableCell>{member.tier?.name || 'Member'}</TableCell>
                      <TableCell>{formatEnum(member.verificationLevel || 'UNVERIFIED')}</TableCell>
                      <TableCell><StatusPill value={member.status || 'ACTIVE'} /></TableCell>
                      <TableCell>{formatDate(member.createdAt)}</TableCell>
                      <TableCell className="flex gap-2">
                        <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => startMemberEdit(member)} disabled={saving}>
                          Edit
                        </Button>
                        {member.status === 'SUSPENDED' ? (
                          <Button variant="outline" className="rounded-2xl border-emerald-200 text-emerald-700" onClick={() => toggleMemberSuspension(member, 'ACTIVE')} disabled={saving}>
                            Reactivate
                          </Button>
                        ) : (
                          <Button variant="outline" className="rounded-2xl border-red-200 text-red-700" onClick={() => toggleMemberSuspension(member, 'SUSPENDED')} disabled={saving}>
                            Suspend
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-sm text-slate-500">No members match the filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'member-edit') {
    if (!selectedMember || !memberEditForm) {
      return (
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Member Detail Edit</CardTitle>
            <CardDescription>Select a member from Member Management first.</CardDescription>
          </CardHeader>
        </Card>
      );
    }
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Member Detail Edit</CardTitle>
          <CardDescription>Edit profile, class, tier, verification, and status for selected member.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-3">
            <Input value={memberEditForm.name} onChange={(event) => setMemberEditForm((current) => ({ ...current, name: event.target.value }))} placeholder="Full name" />
            <Input value={memberEditForm.displayName} onChange={(event) => setMemberEditForm((current) => ({ ...current, displayName: event.target.value }))} placeholder="Display name" />
            <Input value={memberEditForm.phone} onChange={(event) => setMemberEditForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Phone" />
            <Input value={memberEditForm.country} onChange={(event) => setMemberEditForm((current) => ({ ...current, country: event.target.value }))} placeholder="Country" />
            <Input value={memberEditForm.businessName} onChange={(event) => setMemberEditForm((current) => ({ ...current, businessName: event.target.value }))} placeholder="Business name" />
            <select value={memberEditForm.participantClassCode} onChange={(event) => setMemberEditForm((current) => ({ ...current, participantClassCode: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
              {Array.from(new Set(members.map((m) => m.participantClass?.code).filter(Boolean))).map((code) => (
                <option key={code} value={code}>{formatEnum(code)}</option>
              ))}
            </select>
            <select value={memberEditForm.tierCode} onChange={(event) => setMemberEditForm((current) => ({ ...current, tierCode: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
              {Array.from(new Set(members.map((m) => m.tier?.code).filter(Boolean))).map((code) => (
                <option key={code} value={code}>{formatEnum(code)}</option>
              ))}
            </select>
            <select value={memberEditForm.verificationLevel} onChange={(event) => setMemberEditForm((current) => ({ ...current, verificationLevel: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
              {verificationLevels.map((level) => (
                <option key={level} value={level}>{formatEnum(level)}</option>
              ))}
            </select>
            <select value={memberEditForm.status} onChange={(event) => setMemberEditForm((current) => ({ ...current, status: event.target.value }))} className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="PENDING">Pending</option>
            </select>
            <Button onClick={saveMemberEdit} disabled={saving}>Save Changes</Button>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 p-4 text-sm">
              <p className="font-semibold">Wallet</p>
              <p className="mt-2">ARX Balance: {Number(selectedMember.wallet?.balance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-sm">
              <p className="font-semibold">Referrals</p>
              <p className="mt-2">Referral code: {selectedMember.referralCode || 'N/A'}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4 text-sm">
              <p className="font-semibold">Documents</p>
              <p className="mt-2">Use the Documents Upload tab to inspect and submit documents for this member.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'notifications') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Notification Control Center</CardTitle>
          <CardDescription>Channel toggles, templates, timer settings, and delivery rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Enabled</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Retry Window</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(panelConfig?.channels || []).map((row) => (
                  <TableRow key={row.channel}>
                    <TableCell>{formatEnum(row.channel)}</TableCell>
                    <TableCell>{row.enabled ? 'ON' : 'OFF'}</TableCell>
                    <TableCell>{row.provider}</TableCell>
                    <TableCell>{row.retryWindowMinutes} mins</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Code</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(panelConfig?.templates || []).map((row) => (
                  <TableRow key={`${row.code}-${row.channel}`}>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>{formatEnum(row.channel)}</TableCell>
                    <TableCell>{row.active ? 'Active' : 'Inactive'}</TableCell>
                    <TableCell>{row.owner}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'queue-aging') {
    const aging = analytics?.notificationAnalytics?.queueAging || {};
    const ageRows = [
      { key: '0_24', label: '0-24 Hours', status: 'Healthy' },
      { key: '24_48', label: '24-48 Hours', status: 'Watch' },
      { key: '48_72', label: '48-72 Hours', status: 'Escalate' },
      { key: '72_plus', label: '>72 Hours', status: 'Critical' },
    ];
    const total = Object.values(aging).reduce((sum, value) => sum + Number(value || 0), 0);
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Queue Aging Monitor</CardTitle>
          <CardDescription>Age-band distribution and critical case visibility.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {ageRows.map((row) => {
            const count = Number(aging[row.key] || 0);
            const percent = total ? Math.round((count / total) * 100) : 0;
            return (
              <div key={row.key} className="rounded-2xl border border-slate-200 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-medium">{row.label}</span>
                  <span>{count} cases ({percent}%)</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-700" style={{ width: `${percent}%` }} />
                </div>
                <div className="mt-2 text-xs text-slate-500">{row.status}</div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'delivery') {
    const events = analytics?.notificationAnalytics?.deliveryEvents || [];
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Delivery Analytics</CardTitle>
          <CardDescription>Notification event delivery performance and failure rates.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => exportCsv('delivery-analytics.csv', [['Event', 'Sent', 'Delivered', 'Failed', 'Rate'], ...events.map((item) => [item.event, item.sent, item.delivered, item.failed, `${item.rate}%`])])}>
              Export CSV
            </Button>
          </div>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((item) => (
                  <TableRow key={item.event}>
                    <TableCell>{item.event}</TableCell>
                    <TableCell>{item.sent}</TableCell>
                    <TableCell>{item.delivered}</TableCell>
                    <TableCell>{item.failed}</TableCell>
                    <TableCell>{item.rate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'governance') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Governance Settings</CardTitle>
          <CardDescription>Auto-escalation and notification delivery governance controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(panelConfig?.escalationRules || {}).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                <span>{formatEnum(key)}</span>
                <input
                  type={typeof value === 'boolean' ? 'checkbox' : 'number'}
                  checked={typeof value === 'boolean' ? value : undefined}
                  value={typeof value === 'number' ? value : undefined}
                  onChange={(event) => {
                    const nextValue = typeof value === 'boolean' ? event.target.checked : Number(event.target.value);
                    setPanelConfig((current) => ({
                      ...current,
                      escalationRules: { ...(current?.escalationRules || {}), [key]: nextValue },
                    }));
                  }}
                />
              </label>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(panelConfig?.deliveryRules || {}).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                <span>{formatEnum(key)}</span>
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(event) => {
                    setPanelConfig((current) => ({
                      ...current,
                      deliveryRules: { ...(current?.deliveryRules || {}), [key]: event.target.checked },
                    }));
                  }}
                />
              </label>
            ))}
          </div>
          <Button onClick={saveGovernanceRules} disabled={saving}>Save Governance Settings</Button>
        </CardContent>
      </Card>
    );
  }

  // ── AUREON9 SECTIONS ──────────────────────────────────────────────────
  if (activeNav === 'aureon9-members') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>AUREON9 Members</CardTitle>
          <CardDescription>Member profiles with tier levels, verification status, and compliance state. Powered by AureonMember entity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Active Members</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">---</p>
              <p className="mt-1 text-xs text-slate-500">Awaiting backend integration</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Pending Verification</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">---</p>
              <p className="mt-1 text-xs text-slate-500">Status = PENDING</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Tier 7+ Members</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">---</p>
              <p className="mt-1 text-xs text-slate-500">Highest privilege tier</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Member</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Base Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Backend schema migration in progress. AUREON9 member data will display once /aureon/member endpoints are integrated.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">Data Model Reference</p>
            <p className="mt-2 text-xs text-amber-800">
              Fields: id, fullName, email, phone, country, tierId, status (ACTIVE|INACTIVE|SUSPENDED|PENDING), verificationLevel (BASIC|COMMERCIAL_VERIFIED|KYC_AML_VERIFIED), baseUnits, certificationLevel, complianceStatus
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'aureon9-distributions') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>AUREON9 Distributions</CardTitle>
          <CardDescription>Pool allocations, member payouts, and distribution history. Powered by Distribution & PoolAllocation entities.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Founders Pool</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">15%</p>
              <p className="mt-1 text-xs text-slate-500">of NDV</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Performance Pool</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">15%</p>
              <p className="mt-1 text-xs text-slate-500">of NDV</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Operations Reserve</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">30%</p>
              <p className="mt-1 text-xs text-slate-500">of NDV</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Treasury Growth</p>
              <p className="mt-2 text-2xl font-bold text-slate-900">30%</p>
              <p className="mt-1 text-xs text-slate-500">of NDV</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Period</TableHead>
                  <TableHead>Pool</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    Backend schema migration in progress. Distribution records will display once RevenueEvent and PoolAllocation tables are created.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">Payout Formula</p>
            <p className="mt-2 text-xs text-amber-800">
              Payout = (Effective Units / Total Effective Units) × Pool Amount where Effective Units = baseUnits × tier.multiplier
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'aureon9-revenue') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>AUREON9 Revenue</CardTitle>
          <CardDescription>Revenue events, NDV calculations, and treasury verification. Powered by RevenueEvent entity.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Total Revenue (YTD)</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">---</p>
              <p className="mt-1 text-xs text-slate-500">Awaiting backend integration</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Net Distributable Value</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">---</p>
              <p className="mt-1 text-xs text-slate-500">Revenue - Costs</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Verified Events</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">---</p>
              <p className="mt-1 text-xs text-slate-500">Treasury verified</p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Gross Value</TableHead>
                  <TableHead>Costs</TableHead>
                  <TableHead>NDV</TableHead>
                  <TableHead>Verified</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Backend schema migration in progress. Revenue events will display once /api/revenue-event endpoints are available.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-900">Sources</p>
            <p className="mt-2 text-xs text-blue-800">
              AAL (Activity Access Layer), ODIEXA, ODIEBOARD, OPI_INTELLIGENCE, SUBSCRIPTION
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'review-queue') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Verification Review Queue</CardTitle>
          <CardDescription>Table view of all review cases by current filters and role scope.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Participant Class</TableHead>
                  <TableHead>Requested Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.length ? (
                  queue.map((item) => (
                    <TableRow key={item.id} className="cursor-pointer" onClick={() => { setSelectedQueueId(item.id); }}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.id}</p>
                          <p className="text-xs text-slate-500">{item.memberProfile?.displayName || item.memberProfile?.user?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{formatEnum(item.memberProfile?.participantClass?.code)}</TableCell>
                      <TableCell>{formatEnum(item.requestedLevel)}</TableCell>
                      <TableCell><StatusPill value={item.queueStatus || item.status} /></TableCell>
                      <TableCell><StatusPill value={item.risk} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-slate-500">No cases match the current filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeNav !== 'detailed-case') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Admin Panel</CardTitle>
          <CardDescription>Select an available tab to continue.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Verification Review Queue</CardTitle>
          <CardDescription>Live queue filtered from the backend review workflow.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Participant Class</TableHead>
                  <TableHead>Requested Level</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.length ? (
                  queue.map((item) => (
                    <TableRow
                      key={item.id}
                      className={`${selected?.id === item.id ? 'bg-slate-50' : ''} cursor-pointer`}
                      onClick={() => setSelectedQueueId(item.id)}
                    >
                      <TableCell>
                        <div className="text-left">
                          <div>
                            <p className="font-medium">{item.id}</p>
                            <p className="text-xs text-slate-500">{item.memberProfile?.displayName || item.memberProfile?.user?.name || item.memberProfile?.user?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatEnum(item.memberProfile?.participantClass?.code)}</TableCell>
                      <TableCell>{formatEnum(item.requestedLevel)}</TableCell>
                      <TableCell><StatusPill value={item.queueStatus || item.status} /></TableCell>
                      <TableCell><StatusPill value={item.risk} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-sm text-slate-500">No review cases match the current filters.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Selected Review Case</CardTitle>
          <CardDescription>Review actions, linked documents, and action history.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selected ? (
            <>
              <div className="rounded-2xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Applicant</p>
                    <p className="font-semibold">{selected.memberProfile?.displayName || selected.memberProfile?.user?.name || selected.memberProfile?.user?.email}</p>
                    <p className="mt-1 text-xs text-slate-500">{selected.memberProfile?.user?.email}</p>
                  </div>
                  <div className="text-right">
                    <div className="mb-2"><StatusPill value={selected.queueStatus || selected.status} /></div>
                    <p className="text-xs text-slate-500">{formatDate(selected.submittedAt)}</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Participant Class</span><p className="mt-1 font-medium">{formatEnum(selected.memberProfile?.participantClass?.code)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Current Tier</span><p className="mt-1 font-medium">{selected.memberProfile?.tier?.name || 'Member'}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Requested Level</span><p className="mt-1 font-medium">{formatEnum(selected.requestedLevel)}</p></div>
                  <div className="rounded-2xl bg-slate-50 p-3"><span className="text-slate-500">Assigned Reviewer</span><p className="mt-1 font-medium">{selected.assignedReviewerId || 'Unassigned'}</p></div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Reviewer Notes</label>
                <Textarea
                  className="min-h-[110px] rounded-2xl border-slate-200"
                  placeholder="Add legal, compliance, qualification, or governance notes..."
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>

              <Input
                placeholder="Required documents, comma separated"
                value={requiredDocuments}
                onChange={(event) => setRequiredDocuments(event.target.value)}
              />

              <select
                value={assignedReviewerId}
                onChange={(event) => setAssignedReviewerId(event.target.value)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
              >
                <option value="">Select reviewer...</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email} ({formatEnum(user.role)})
                  </option>
                ))}
              </select>

              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                  onClick={() =>
                    runAction('Approve', () => reviewQueueAPI.approve({ verificationRecordId: selected.id, notes }))
                  }
                  disabled={saving || !canFinalApprove}
                >
                  <HiCheckCircle className="mr-2 h-4 w-4" />Approve
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-slate-200"
                  onClick={() =>
                    runAction('Assign reviewer', () => reviewQueueAPI.assignReviewer({ verificationRecordId: selected.id, reviewerUserId: assignedReviewerId || auth?.id, notes }))
                  }
                  disabled={saving || !canAssign}
                >
                  Assign Reviewer
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-slate-200"
                  onClick={() =>
                    runAction('Request more documents', () =>
                      reviewQueueAPI.requestMoreDocs({
                        verificationRecordId: selected.id,
                        notes,
                        requiredDocuments: requiredDocuments
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                        })
                    )
                  }
                  disabled={saving || !canRequestDocs}
                >
                  Request Documents
                </Button>
                <Button
                  className="rounded-2xl bg-amber-600 hover:bg-amber-700"
                  onClick={() =>
                    runAction('Escalate', () => reviewQueueAPI.escalate({ verificationRecordId: selected.id, notes }))
                  }
                  disabled={saving || !canEscalateCase}
                >
                  Escalate
                </Button>
                <Button
                  className="rounded-2xl bg-red-600 hover:bg-red-700 md:col-span-2"
                  onClick={() =>
                    runAction('Reject', () => reviewQueueAPI.reject({ verificationRecordId: selected.id, notes }))
                  }
                  disabled={saving || !canRejectCase}
                >
                  <HiXCircle className="mr-2 h-4 w-4" />Reject
                </Button>
              </div>

              <div className="rounded-2xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selected.memberProfile?.documents?.length ? (
                      selected.memberProfile.documents.map((document) => (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{document.documentType}</p>
                              <p className="text-xs text-slate-500">{document.verificationPurpose || document.fileName}</p>
                            </div>
                          </TableCell>
                          <TableCell><StatusPill value={document.reviewStatus || 'RECEIVED'} /></TableCell>
                          <TableCell className="flex gap-2">
                            <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => updateDocumentStatus(document.id, 'ACCEPTED')} disabled={saving}>Accept</Button>
                            <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => updateDocumentStatus(document.id, 'REPLACEMENT_REQUIRED')} disabled={saving}>Replacement</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-sm text-slate-500">No documents uploaded for this case.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4">
                <h3 className="font-semibold">Action History</h3>
                <div className="mt-4 space-y-3">
                  {selected.actions?.length ? (
                    selected.actions.map((action) => (
                      <div key={action.id} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium">{formatEnum(action.actionType)}</span>
                          <span className="text-xs text-slate-500">{formatDate(action.createdAt)}</span>
                        </div>
                        <p className="mt-2 text-slate-600">{action.notes || 'No notes recorded.'}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No action history recorded yet.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a queue item to review its details.</p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
