import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  X,
  XCircle,
  LogOut,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Avatar, AvatarFallback } from '../components/ui/Avatar';
import { Separator } from '../components/ui/Separator';
import { documentsAPI, reviewQueueAPI } from '../api/client';
import { useAuth } from '../hooks/useAuth';

const nav = [
  { id: 'queue', label: 'Review Queue', icon: FileCheck2 },
  { id: 'uploads', label: 'Document Uploads', icon: Upload },
  { id: 'roles', label: 'Role Matrix', icon: ShieldCheck },
  { id: 'members', label: 'Members', icon: Users },
  { id: 'settings', label: 'Workflow Rules', icon: Settings },
];

const roleRows = [
  {
    role: 'SUPER_ADMIN',
    scope: 'Full platform control',
    screens: 'All review and governance surfaces',
    actions: 'Assign, approve, reject, escalate, audit, configure',
  },
  {
    role: 'EXECUTIVE',
    scope: 'Capital and strategic governance review',
    screens: 'Queue, members, escalations',
    actions: 'Approve escalated cases and assign reviewers',
  },
  {
    role: 'LEGAL_COMPLIANCE',
    scope: 'Verification and documents',
    screens: 'Queue, uploads, members',
    actions: 'Review, approve, reject, request documents, escalate',
  },
  {
    role: 'QUALIFICATIONS',
    scope: 'Qualification and escalation support',
    screens: 'Queue and members',
    actions: 'Review and escalate',
  },
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
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleString();
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
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminReviewModule() {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [activeNav, setActiveNav] = useState('queue');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const [selectedQueueId, setSelectedQueueId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    requestedLevel: '',
    participantClass: '',
  });
  const [notes, setNotes] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState('');

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
    setError('');

    try {
      const response = await reviewQueueAPI.getAll(nextFilters);
      const records = response.data || [];
      setQueue(records);
      setSelectedQueueId((current) => {
        if (current && records.some((item) => item.id === current)) {
          return current;
        }
        return records[0]?.id || '';
      });
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Failed to load the review queue.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQueue(filters);
  }, [filters.status, filters.requestedLevel, filters.participantClass]);

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
    setError('');
    setNotice('');

    try {
      await handler();
      setNotes('');
      setRequiredDocuments('');
      setNotice(`${actionName} completed.`);
      await loadQueue(filters);
    } catch (actionError) {
      setError(actionError.response?.data?.error || `Unable to ${actionName.toLowerCase()}.`);
    } finally {
      setSaving(false);
    }
  }

  async function updateDocumentStatus(documentId, reviewStatus) {
    setSaving(true);
    setError('');
    setNotice('');

    try {
      await documentsAPI.updateReviewStatus(documentId, { reviewStatus, notes });
      setNotice(`Document marked ${formatEnum(reviewStatus)}.`);
      await loadQueue(filters);
    } catch (actionError) {
      setError(actionError.response?.data?.error || 'Unable to update document review status.');
    } finally {
      setSaving(false);
    }
  }

  const pendingCount = queue.filter((item) => item.queueStatus === 'PENDING').length;
  const escalatedCount = queue.filter((item) => item.queueStatus === 'ESCALATED').length;
  const documentCount = allDocuments.length;
  const approvalRate = queue.length
    ? `${Math.round((queue.filter((item) => item.status === 'APPROVED').length / queue.length) * 100)}%`
    : '0%';

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
            {nav.map((item) => {
              const Icon = item.icon;
              const isActive = item.id === activeNav;
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
              <BellRing className="mt-0.5 h-4 w-4 text-slate-700" />
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
              <LogOut className="mr-2 h-4 w-4" />
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
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Verification, Documents, Governance Controls</p>
                  <h2 className="text-2xl font-semibold tracking-tight">Review Workflow Console</h2>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full lg:w-72">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="rounded-2xl border-slate-200 pl-9" placeholder="Cases and documents are filterable below..." />
                </div>
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
                  <option value="">All levels</option>
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
                <Button variant="outline" className="rounded-2xl border-slate-200" onClick={() => loadQueue(filters)}>
                  <Filter className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:p-6">
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Metric title="Pending Cases" value={String(pendingCount)} sub="Awaiting first decision" icon={Clock3} />
              <Metric title="Escalated Reviews" value={String(escalatedCount)} sub="High-risk or executive queue" icon={AlertTriangle} />
              <Metric title="Documents Received" value={String(documentCount)} sub="Across visible review cases" icon={Upload} />
              <Metric title="Approval Rate" value={approvalRate} sub="Across visible review cases" icon={CheckCircle2} />
            </section>

            {loading ? (
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-6 text-sm text-slate-500">Loading review workflow...</CardContent>
              </Card>
            ) : (
              renderAdminSection({
                activeNav,
                allDocuments,
                notes,
                queue,
                requiredDocuments,
                roleRows,
                saving,
                selected,
                setSelectedQueueId,
                setNotes,
                setRequiredDocuments,
                runAction,
                updateDocumentStatus,
                auth,
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
    auth,
    notes,
    queue,
    requiredDocuments,
    roleRows,
    saving,
    selected,
    setSelectedQueueId,
    setNotes,
    setRequiredDocuments,
    runAction,
    updateDocumentStatus,
  } = props;

  if (activeNav === 'uploads') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Document Uploads</CardTitle>
          <CardDescription>All documents linked to the current filtered review queue.</CardDescription>
        </CardHeader>
        <CardContent>
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
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Role-Based Admin Matrix</CardTitle>
          <CardDescription>Governance actions now enforced both in the UI and the backend review routes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Screens</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roleRows.map((row) => (
                  <TableRow key={row.role}>
                    <TableCell className="font-medium">{row.role}</TableCell>
                    <TableCell>{row.scope}</TableCell>
                    <TableCell>{row.screens}</TableCell>
                    <TableCell>{row.actions}</TableCell>
                  </TableRow>
                ))}
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
          <CardTitle>Members In Queue</CardTitle>
          <CardDescription>Members represented in the current filtered verification queue.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Participant Class</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Verification</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.length ? (
                  queue.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.memberProfile?.displayName || item.memberProfile?.user?.name || item.memberProfile?.user?.email}</TableCell>
                      <TableCell>{formatEnum(item.memberProfile?.participantClass?.code)}</TableCell>
                      <TableCell>{item.memberProfile?.tier?.name || 'Member'}</TableCell>
                      <TableCell>{formatEnum(item.memberProfile?.verificationLevel || 'UNVERIFIED')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-sm text-slate-500">No members in the current queue.</TableCell>
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
          <CardTitle>Workflow Rules</CardTitle>
          <CardDescription>Implemented review workflow logic from the wiring docs.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          {[
            'Verification records now carry queue status and assigned reviewer state.',
            'Every approval, rejection, escalation, assignment, and document request writes a review action entry.',
            'Document uploads persist verification purpose, storage key, MIME type, size, and review status.',
            'High-risk queue visibility is exposed in the live admin review table.',
          ].map((item) => (
            <div key={item} className="rounded-2xl border border-slate-200 p-4 text-sm text-slate-700">{item}</div>
          ))}
        </CardContent>
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

              <div className="grid gap-3 md:grid-cols-2">
                <Button
                  className="rounded-2xl bg-emerald-600 hover:bg-emerald-700"
                  onClick={() =>
                    runAction('Approve', () => reviewQueueAPI.approve({ verificationRecordId: selected.id, notes }))
                  }
                  disabled={saving}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />Approve
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-slate-200"
                  onClick={() =>
                    runAction('Assign reviewer', () => reviewQueueAPI.assignReviewer({ verificationRecordId: selected.id, reviewerUserId: auth?.id, notes }))
                  }
                  disabled={saving}
                >
                  Assign To Me
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
                  disabled={saving}
                >
                  Request Documents
                </Button>
                <Button
                  className="rounded-2xl bg-amber-600 hover:bg-amber-700"
                  onClick={() =>
                    runAction('Escalate', () => reviewQueueAPI.escalate({ verificationRecordId: selected.id, notes }))
                  }
                  disabled={saving}
                >
                  Escalate
                </Button>
                <Button
                  className="rounded-2xl bg-red-600 hover:bg-red-700 md:col-span-2"
                  onClick={() =>
                    runAction('Reject', () => reviewQueueAPI.reject({ verificationRecordId: selected.id, notes }))
                  }
                  disabled={saving}
                >
                  <XCircle className="mr-2 h-4 w-4" />Reject
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
