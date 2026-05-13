import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiLightningBolt,
  HiChartBar,
  HiBell,
  HiCheckCircle,
  HiClock,
  HiFilter,
  HiSparkles,
  HiLogout,
  HiMenu,
  HiSave,
  HiSearch,
  HiCog,
  HiShieldCheck,
  HiX,
  HiXCircle,
} from 'react-icons/hi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Switch } from '../components/ui/Switch';
import { Progress } from '../components/ui/Progress';
import { Separator } from '../components/ui/Separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { useAuth } from '../hooks/useAuth';
import { adminPanelAPI } from '../api/client';

const sideNav = [
  { id: 'overview', label: 'Overview', icon: HiCog },
  { id: 'channels', label: 'Channel Rules', icon: HiBell },
  { id: 'templates', label: 'Templates', icon: HiShieldCheck },
  { id: 'timers', label: 'SLA & Timers', icon: HiClock },
  { id: 'analytics', label: 'Delivery Analytics', icon: HiChartBar },
  { id: 'audit', label: 'Audit Summary', icon: HiLightningBolt },
];

function formatEnum(value) {
  return String(value || '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusPill({ label }) {
  const styles = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-slate-100 text-slate-700 border-slate-200',
    Healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Watch: 'bg-amber-50 text-amber-700 border-amber-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${styles[label] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
      {label}
    </span>
  );
}

function MetricCard({ label, value, sub, icon: Icon }) {
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
            <Icon className="h-5 w-5 text-[var(--aureon-ink)]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminSettingsDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeNav, setActiveNav] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [config, setConfig] = useState({ channels: [], templates: [], timers: {}, retryPolicy: {} });
  const [analytics, setAnalytics] = useState({
    revenueMetrics: {},
    queue: [],
    roleMatrix: [],
    auditLogs: [],
    notificationAnalytics: { queueHealth: {} },
  });
  const currentTitle = useMemo(() => sideNav.find((item) => item.id === activeNav)?.label || 'Overview', [activeNav]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (_error) {
      navigate('/login');
    }
  }

  async function loadData() {
    setLoading(true);
    setError('');
    try {
      const [configRes, analyticsRes] = await Promise.all([
        adminPanelAPI.getConfig(),
        adminPanelAPI.getAnalytics(),
      ]);
      setConfig(configRes.data || { channels: [], templates: [], timers: {}, retryPolicy: {} });
      setAnalytics(analyticsRes.data || {});
    } catch (loadError) {
      setError(loadError.response?.data?.error || 'Failed to load governance settings.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const totalEvents = analytics?.notificationAnalytics?.totalEvents || 0;
  const deliveryRate = analytics?.notificationAnalytics?.deliveredApproximationRate || 0;
  const failedRate = analytics?.notificationAnalytics?.failedApproximationRate || 0;
  const escalatedCases = analytics?.notificationAnalytics?.queueHealth?.escalated || 0;
  const pendingCases = analytics?.notificationAnalytics?.queueHealth?.pending || 0;
  const topMetrics = [
    { label: 'Total Events', value: totalEvents.toLocaleString(), sub: 'Recent audit/notification events', icon: HiBell },
    { label: 'Delivery Rate', value: `${deliveryRate}%`, sub: 'Estimated governed delivery', icon: HiCheckCircle },
    { label: 'Failed Rate', value: `${failedRate}%`, sub: 'Estimated failed delivery', icon: HiXCircle },
    { label: 'Escalated Cases', value: String(escalatedCases), sub: `${pendingCases} currently pending`, icon: HiSparkles },
  ];

  function updateChannel(index, key, value) {
    setConfig((current) => {
      const next = [...(current.channels || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...current, channels: next };
    });
  }

  function updateTemplate(index, key, value) {
    setConfig((current) => {
      const next = [...(current.templates || [])];
      next[index] = { ...next[index], [key]: value };
      return { ...current, templates: next };
    });
  }

  function updateTimers(key, value) {
    setConfig((current) => ({
      ...current,
      timers: {
        ...(current.timers || {}),
        [key]: Number(value) || 0,
      },
    }));
  }

  function updateRetry(key, value) {
    setConfig((current) => ({
      ...current,
      retryPolicy: {
        ...(current.retryPolicy || {}),
        [key]: key === 'maxRetries' ? Number(value) || 0 : value,
      },
    }));
  }

  async function saveChannels() {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await adminPanelAPI.updateChannels(config.channels || []);
      setConfig((current) => ({ ...current, channels: response.data.channels || [] }));
      setNotice('Channel rules saved.');
      await loadData();
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Unable to save channel rules.');
    } finally {
      setSaving(false);
    }
  }

  async function saveTemplates() {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await adminPanelAPI.updateTemplates(config.templates || []);
      setConfig((current) => ({ ...current, templates: response.data.templates || [] }));
      setNotice('Template rules saved.');
      await loadData();
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Unable to save template rules.');
    } finally {
      setSaving(false);
    }
  }

  async function saveTimers() {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const response = await adminPanelAPI.updateTimers(config.timers || {}, config.retryPolicy || {});
      setConfig((current) => ({
        ...current,
        timers: response.data.timers || {},
        retryPolicy: response.data.retryPolicy || {},
      }));
      setNotice('SLA timers saved.');
      await loadData();
    } catch (saveError) {
      setError(saveError.response?.data?.error || 'Unable to save timers.');
    } finally {
      setSaving(false);
    }
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
                <p className="text-xs text-slate-500">Admin governance</p>
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
              <p className="text-sm font-medium">Notification Governance Control</p>
              <p className="mt-2 text-xs leading-5 text-white/80">
                Persistent control over channels, templates, timers, retry rules, and governance telemetry.
              </p>
            </div>
          </div>

          <nav className="space-y-1 pr-2">
            {sideNav.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveNav(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${active ? 'bg-[var(--aureon-ink)] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
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
              <HiSparkles className="mt-0.5 h-4 w-4 text-slate-700" />
              <div>
                <p className="font-medium text-slate-900">Queue Health</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {analytics?.notificationAnalytics?.queueHealth?.pending || 0} pending, {analytics?.notificationAnalytics?.queueHealth?.escalated || 0} escalated, {analytics?.notificationAnalytics?.queueHealth?.approved || 0} approved.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-4">
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
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin Notification & Governance Console</p>
                  <h2 className="text-2xl font-semibold tracking-tight">{currentTitle}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full lg:w-80">
                  <HiSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="rounded-2xl border-slate-200 pl-9" placeholder="Search events and rules..." />
                </div>
                <Button variant="outline" className="rounded-2xl border-slate-200">
                  <HiFilter className="mr-2 h-4 w-4" /> Filters
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:p-6">
            {error && <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
            {notice && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>}
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {topMetrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </section>
            {loading ? (
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardContent className="p-6 text-sm text-slate-500">Loading admin governance data...</CardContent>
              </Card>
            ) : (
              <RenderSection
                activeNav={activeNav}
                config={config}
                analytics={analytics}
                updateChannel={updateChannel}
                updateTemplate={updateTemplate}
                updateTimers={updateTimers}
                updateRetry={updateRetry}
                saveChannels={saveChannels}
                saveTemplates={saveTemplates}
                saveTimers={saveTimers}
                saving={saving}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function RenderSection({
  activeNav,
  config,
  analytics,
  updateChannel,
  updateTemplate,
  updateTimers,
  updateRetry,
  saveChannels,
  saveTemplates,
  saveTimers,
  saving,
}) {
  if (activeNav === 'channels') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Channel Rules</CardTitle>
          <CardDescription>Enable/disable channels and update provider routing with persisted settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(config.channels || []).map((row, index) => (
            <div key={row.channel} className="rounded-2xl border border-slate-200 p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-semibold">{formatEnum(row.channel)}</p>
                  <p className="mt-1 text-sm text-slate-500">Mode: {formatEnum(row.mode)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Enable</span>
                  <Switch checked={Boolean(row.enabled)} onCheckedChange={(value) => updateChannel(index, 'enabled', value)} />
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <Input value={row.provider || ''} onChange={(event) => updateChannel(index, 'provider', event.target.value)} />
                <Input
                  type="number"
                  value={row.retryWindowMinutes ?? 0}
                  onChange={(event) => updateChannel(index, 'retryWindowMinutes', Number(event.target.value))}
                />
                <select
                  value={row.mode || 'DISABLED'}
                  onChange={(event) => updateChannel(index, 'mode', event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                >
                  <option value="PRIMARY">Primary</option>
                  <option value="FALLBACK">Fallback</option>
                  <option value="DISABLED">Disabled</option>
                </select>
              </div>
            </div>
          ))}
          <Button className="rounded-2xl bg-[#0A2540] hover:bg-[#14385f]" onClick={saveChannels} disabled={saving}>
            <HiSave className="mr-2 h-4 w-4" /> Save Channel Rules
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'templates') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>Template Rules</CardTitle>
          <CardDescription>Notification template ownership, channel mapping, and activation status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead>Owner</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(config.templates || []).map((row, index) => (
                  <TableRow key={row.code}>
                    <TableCell>{row.code}</TableCell>
                    <TableCell>
                      <select
                        value={row.channel}
                        onChange={(event) => updateTemplate(index, 'channel', event.target.value)}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900"
                      >
                        <option value="EMAIL">Email</option>
                        <option value="IN_APP">In-App</option>
                        <option value="WHATSAPP">WhatsApp</option>
                        <option value="SMS">SMS</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <Switch checked={Boolean(row.active)} onCheckedChange={(value) => updateTemplate(index, 'active', value)} />
                    </TableCell>
                    <TableCell>
                      <Input value={row.owner || ''} onChange={(event) => updateTemplate(index, 'owner', event.target.value.toUpperCase())} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <Button className="rounded-2xl bg-[#0A2540] hover:bg-[#14385f]" onClick={saveTemplates} disabled={saving}>
            <HiSave className="mr-2 h-4 w-4" /> Save Template Rules
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'timers') {
    return (
      <Card className="rounded-2xl border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle>SLA & Escalation Timers</CardTitle>
          <CardDescription>Persisted workflow timing and retry policy controls.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <TimerInput
              title="Reviewer Reminder (hours)"
              value={config?.timers?.reviewerReminderHours || 0}
              onChange={(value) => updateTimers('reviewerReminderHours', value)}
            />
            <TimerInput
              title="Member Follow-Up (hours)"
              value={config?.timers?.memberFollowUpHours || 0}
              onChange={(value) => updateTimers('memberFollowUpHours', value)}
            />
            <TimerInput
              title="Escalation Aging (hours)"
              value={config?.timers?.escalationAgingHours || 0}
              onChange={(value) => updateTimers('escalationAgingHours', value)}
            />
            <TimerInput
              title="Retry Window (minutes)"
              value={config?.timers?.failedRetryWindowMinutes || 0}
              onChange={(value) => updateTimers('failedRetryWindowMinutes', value)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-2xl border-slate-200">
              <CardContent className="p-4 space-y-3">
                <p className="font-semibold">Retry Policy</p>
                <Input
                  type="number"
                  value={config?.retryPolicy?.maxRetries || 0}
                  onChange={(event) => updateRetry('maxRetries', event.target.value)}
                />
                <Input
                  value={config?.retryPolicy?.strategy || ''}
                  onChange={(event) => updateRetry('strategy', event.target.value.toUpperCase())}
                />
              </CardContent>
            </Card>
          </div>
          <Button className="rounded-2xl bg-[#0A2540] hover:bg-[#14385f]" onClick={saveTimers} disabled={saving}>
            <HiSave className="mr-2 h-4 w-4" /> Save Timer Rules
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (activeNav === 'analytics') {
    const rewardRows = Object.entries(analytics?.revenueMetrics?.rewardDistribution || {});
    return (
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Dashboard</CardTitle>
            <CardDescription>Real-time system metrics aggregated from wallet, referrals, tiers, and opportunities.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <MetricLine label="Total Members" value={analytics?.revenueMetrics?.totalMembers || 0} />
              <MetricLine label="Total Wallets" value={analytics?.revenueMetrics?.totalWallets || 0} />
              <MetricLine label="Published Opportunities" value={analytics?.revenueMetrics?.publishedOpportunities || 0} />
              <MetricLine label="Referral Count" value={analytics?.revenueMetrics?.referralCount || 0} />
              <MetricLine label="Partner Referrals" value={analytics?.revenueMetrics?.partnerReferralCount || 0} />
              <MetricLine label="Capital Cases" value={analytics?.revenueMetrics?.capitalCaseCount || 0} />
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold">Transaction Volume</p>
              <p className="mt-2 text-2xl font-semibold">
                ARX {Number(analytics?.revenueMetrics?.totalTransactionVolume || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Reward Distribution</CardTitle>
            <CardDescription>Aggregated values by reward transaction type.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-2xl border border-slate-200">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rewardRows.length ? rewardRows.map(([type, amount]) => (
                    <TableRow key={type}>
                      <TableCell>{formatEnum(type)}</TableCell>
                      <TableCell>ARX {Number(amount || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-sm text-slate-500">No reward transactions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (activeNav === 'audit') {
    const logs = analytics?.auditLogs || [];
    const queueHealth = analytics?.notificationAnalytics?.queueHealth || {};
    const totalQueue = Object.values(queueHealth).reduce((sum, value) => sum + Number(value || 0), 0);
    return (
      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Audit & Control Log Summary</CardTitle>
            <CardDescription>Recent controlled actions captured from the platform audit log.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {logs.length ? logs.slice(0, 20).map((log) => (
              <div key={log.id} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{log.action}</p>
                  <span className="text-xs text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <p className="mt-1 text-slate-600">{log.entityType} / {log.entityId}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500">No audit logs found.</div>
            )}
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Queue SLA Health</CardTitle>
            <CardDescription>Distribution of queue statuses from live verification records.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(queueHealth).map(([status, count]) => {
              const percentage = totalQueue ? Math.round((Number(count || 0) / totalQueue) * 100) : 0;
              const label = percentage > 50 ? 'Watch' : percentage > 75 ? 'Critical' : 'Healthy';
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span>{formatEnum(status)}</span>
                    <span>{count} ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <div className="mt-2"><StatusPill label={label} /></div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle>Governance Overview</CardTitle>
        <CardDescription>Current live configuration and control status across all notification surfaces.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Active Channels</p>
          <p className="mt-2 text-2xl font-semibold">{(config.channels || []).filter((item) => item.enabled).length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Active Templates</p>
          <p className="mt-2 text-2xl font-semibold">{(config.templates || []).filter((item) => item.active).length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Escalation SLA</p>
          <p className="mt-2 text-2xl font-semibold">{config?.timers?.escalationAgingHours || 0}h</p>
        </div>
      </CardContent>
    </Card>
  );
}

function TimerInput({ title, value, onChange }) {
  return (
    <Card className="rounded-2xl border-slate-200">
      <CardContent className="p-4">
        <p className="text-sm text-slate-500">{title}</p>
        <Input type="number" className="mt-3 rounded-2xl border-slate-200" value={value} onChange={(event) => onChange(event.target.value)} />
      </CardContent>
    </Card>
  );
}

function MetricLine({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}
