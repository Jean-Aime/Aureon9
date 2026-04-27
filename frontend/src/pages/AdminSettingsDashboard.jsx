import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings, BellRing, ShieldCheck, Mail, MessageSquare, Clock3, BarChart3,
  Activity, AlertTriangle, CheckCircle2, XCircle, Search, Filter, Save,
  SlidersHorizontal, Gauge, Users, Workflow, ChevronRight, LayoutGrid,
  LogOut, Menu, X
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { Switch } from '../components/ui/Switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Textarea } from '../components/ui/Textarea';
import { Progress } from '../components/ui/Progress';
import { Separator } from '../components/ui/Separator';
import { useAuth } from '../hooks/useAuth';

const sideNav = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'channels', label: 'Channel Rules', icon: BellRing },
  { id: 'templates', label: 'Templates', icon: Mail },
  { id: 'sla', label: 'SLA & Escalation', icon: Clock3 },
  { id: 'analytics', label: 'Delivery Analytics', icon: BarChart3 },
  { id: 'audit', label: 'Audit & Controls', icon: ShieldCheck },
];

const topMetrics = [
  { label: 'Total Notifications', value: '48,294', sub: 'Last 30 days', icon: BellRing },
  { label: 'Delivery Rate', value: '97.8%', sub: 'Email + in-app combined', icon: CheckCircle2 },
  { label: 'Failed Deliveries', value: '326', sub: '0.7% requiring retry', icon: XCircle },
  { label: 'Escalated Cases', value: '42', sub: 'Queue governance alerts', icon: AlertTriangle },
];

const channelRows = [
  { channel: 'Email', enabled: true, provider: 'Resend / SES', deliveryRate: '98.6%', retryWindow: '30 mins' },
  { channel: 'In-App', enabled: true, provider: 'Native feed', deliveryRate: '99.9%', retryWindow: 'Instant' },
  { channel: 'WhatsApp', enabled: false, provider: 'Reserved', deliveryRate: '—', retryWindow: 'Disabled' },
  { channel: 'SMS', enabled: false, provider: 'Reserved', deliveryRate: '—', retryWindow: 'Disabled' },
];

const templateRows = [
  { code: 'DOCUMENT_UPLOAD_RECEIVED', channel: 'EMAIL', active: true, lastUpdated: '2026-04-20', owner: 'Legal Compliance' },
  { code: 'DOCUMENT_REQUESTED_MORE', channel: 'EMAIL', active: true, lastUpdated: '2026-04-20', owner: 'Legal Compliance' },
  { code: 'REVIEW_APPROVED', channel: 'IN_APP', active: true, lastUpdated: '2026-04-21', owner: 'Customer Success' },
  { code: 'REVIEW_ESCALATED', channel: 'EMAIL', active: true, lastUpdated: '2026-04-21', owner: 'Executive Governance' },
  { code: 'REVIEWER_REMINDER_DUE', channel: 'IN_APP', active: true, lastUpdated: '2026-04-21', owner: 'Operations Control' },
];

const eventAnalytics = [
  { event: 'DOCUMENT_UPLOAD_RECEIVED', sent: 12840, delivered: 12711, failed: 129, rate: 99 },
  { event: 'DOCUMENT_REQUESTED_MORE', sent: 2318, delivered: 2256, failed: 62, rate: 97 },
  { event: 'REVIEW_APPROVED', sent: 7926, delivered: 7881, failed: 45, rate: 99 },
  { event: 'REVIEW_REJECTED', sent: 466, delivered: 454, failed: 12, rate: 97 },
  { event: 'REVIEWER_REMINDER_DUE', sent: 1774, delivered: 1731, failed: 43, rate: 98 },
];

const queueAgingRows = [
  { band: '0-24 Hours', count: 186, status: 'Healthy' },
  { band: '24-48 Hours', count: 41, status: 'Watch' },
  { band: '48-72 Hours', count: 12, status: 'Escalate' },
  { band: '>72 Hours', count: 4, status: 'Critical' },
];

function StatusPill({ label }) {
  const styles = {
    Healthy: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Watch: 'bg-amber-50 text-amber-700 border-amber-200',
    Escalate: 'bg-orange-50 text-orange-700 border-orange-200',
    Critical: 'bg-rose-50 text-rose-700 border-rose-200',
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-slate-100 text-slate-700 border-slate-200',
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
            <Icon className="h-5 w-5 text-slate-700" />
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
  const currentTitle = useMemo(() => sideNav.find((i) => i.id === activeNav)?.label || 'Overview', [activeNav]);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      navigate('/login');
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
              <p className="text-sm font-medium">AUREON9 Governance Messaging</p>
              <p className="mt-2 text-xs leading-5 text-white/80">
                Central control for templates, channels, delivery rules, escalation timers, and analytics across review workflows.
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
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${active ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'}`}
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
              <Gauge className="mt-0.5 h-4 w-4 text-slate-700" />
              <div>
                <p className="font-medium text-slate-900">Control Status</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  2 active channels, 11 live templates, hourly scheduler enabled, high-risk queue escalation enforced.
                </p>
              </div>
            </div>
          </div>

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
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">AUREON9 Notification Governance + Delivery Intelligence</p>
                  <h2 className="text-2xl font-semibold tracking-tight">{currentTitle}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative w-full lg:w-80">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input className="rounded-2xl border-slate-200 pl-9" placeholder="Search events, templates, channels..." />
                </div>
                <Button variant="outline" className="rounded-2xl border-slate-200">
                  <Filter className="mr-2 h-4 w-4" /> Filters
                </Button>
                <Button className="rounded-2xl bg-[#0A2540] hover:bg-[#14385f]">
                  <Save className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </div>
            </div>
          </header>

          <div className="space-y-6 p-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:p-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {topMetrics.map((metric) => (
                <MetricCard key={metric.label} {...metric} />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Admin Settings Console</CardTitle>
                  <CardDescription>
                    Govern channels, provider rules, escalations, reminder timing, retries, and notification scope from one controlled surface.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="channels" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 rounded-2xl bg-slate-100">
                      <TabsTrigger value="channels">Channels</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                      <TabsTrigger value="timers">Timers</TabsTrigger>
                      <TabsTrigger value="delivery">Delivery Rules</TabsTrigger>
                    </TabsList>

                    <TabsContent value="channels" className="mt-5 space-y-4">
                      {channelRows.map((row) => (
                        <div key={row.channel} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="font-semibold">{row.channel}</p>
                              <p className="mt-1 text-sm text-slate-500">Provider: {row.provider} · Delivery rate: {row.deliveryRate}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-slate-500">Enable</span>
                              <Switch checked={row.enabled} />
                            </div>
                          </div>
                          <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <Input className="rounded-2xl border-slate-200" defaultValue={row.provider} />
                            <Input className="rounded-2xl border-slate-200" defaultValue={row.retryWindow} />
                            <select className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
                              <option>Primary</option>
                              <option>Fallback</option>
                              <option>Disabled</option>
                            </select>
                          </div>
                        </div>
                      ))}
                    </TabsContent>

                    <TabsContent value="templates" className="mt-5">
                      <div className="rounded-2xl border border-slate-200">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Event Code</TableHead>
                              <TableHead>Channel</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Owner</TableHead>
                              <TableHead>Last Updated</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {templateRows.map((row) => (
                              <TableRow key={`${row.code}-${row.channel}`}>
                                <TableCell className="font-medium">{row.code}</TableCell>
                                <TableCell>{row.channel}</TableCell>
                                <TableCell>{row.active ? <StatusPill label="Active" /> : <StatusPill label="Inactive" />}</TableCell>
                                <TableCell>{row.owner}</TableCell>
                                <TableCell>{row.lastUpdated}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>

                    <TabsContent value="timers" className="mt-5 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        {[
                          ['Reviewer Reminder', '24 hours'],
                          ['Member Follow-Up', '48 hours'],
                          ['Escalation Aging', '2 business days'],
                          ['Failed Retry Window', '30 minutes'],
                        ].map(([title, value]) => (
                          <Card key={title} className="rounded-2xl border-slate-200">
                            <CardContent className="p-4">
                              <p className="text-sm text-slate-500">{title}</p>
                              <Input className="mt-3 rounded-2xl border-slate-200" defaultValue={value} />
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="delivery" className="mt-5">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card className="rounded-2xl border-slate-200">
                          <CardContent className="p-4">
                            <p className="font-semibold">Retry Policy</p>
                            <div className="mt-4 grid gap-3">
                              <Input className="rounded-2xl border-slate-200" defaultValue="3 max retries" />
                              <Input className="rounded-2xl border-slate-200" defaultValue="Exponential backoff" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Queue SLA & Delivery Health</CardTitle>
                  <CardDescription>Operational watchtower for aging cases, retry pressure, and governance-sensitive delays.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-semibold">Queue Aging Distribution</p>
                      <StatusPill label="Healthy" />
                    </div>
                    <div className="space-y-4">
                      {queueAgingRows.map((row) => (
                        <div key={row.band}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span>{row.band}</span>
                            <span>{row.count} cases</span>
                          </div>
                          <Progress value={Math.min(row.count * 2, 100)} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="rounded-2xl border-slate-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Unread In-App Alerts</p>
                        <p className="mt-2 text-2xl font-semibold">128</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-slate-200">
                      <CardContent className="p-4">
                        <p className="text-sm text-slate-500">Failed Retry Backlog</p>
                        <p className="mt-2 text-2xl font-semibold">41</p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section>
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Delivery Analytics Dashboard</CardTitle>
                  <CardDescription>Event-level delivery performance across email and in-app channels.</CardDescription>
                </CardHeader>
                <CardContent>
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
                        {eventAnalytics.map((row) => (
                          <TableRow key={row.event}>
                            <TableCell className="font-medium">{row.event}</TableCell>
                            <TableCell>{row.sent.toLocaleString()}</TableCell>
                            <TableCell>{row.delivered.toLocaleString()}</TableCell>
                            <TableCell>{row.failed.toLocaleString()}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-28">
                                  <Progress value={row.rate} className="h-2" />
                                </div>
                                <span className="text-sm">{row.rate}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Governance Delivery Insights</CardTitle>
                  <CardDescription>Summary intelligence for executive and compliance review.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: 'Email remains the primary governed outbound channel',
                      text: 'Approval, rejection, and document request events rely on email because the workflow needs formal, auditable delivery.',
                    },
                    {
                      title: 'In-app alerts are strongest for reviewer execution speed',
                      text: 'Reviewer reminders and queue-state changes are better surfaced through persistent in-app notifications and dashboard counters.',
                    },
                    {
                      title: 'Escalation aging is the most sensitive KPI',
                      text: 'Cases older than 48 hours should trigger visible executive oversight for capital, strategic, and institutional participant classes.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 p-4">
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{item.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-slate-200 shadow-sm">
                <CardHeader>
                  <CardTitle>Audit & Control Log Summary</CardTitle>
                  <CardDescription>Recent controlled actions affecting templates, channels, timers, and notification governance.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {[
                      'Executive Governance updated auto-escalation rules for Capital Participants.',
                      'Legal Compliance activated revised DOCUMENT_REQUESTED_MORE email template.',
                      'Operations Control adjusted reviewer reminder timer from 12h to 24h.',
                      'Customer Success enabled in-app approval alerts for all member classes.',
                    ].map((line) => (
                      <div key={line} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Activity className="h-4 w-4 text-slate-500" />
                          <span className="text-sm text-slate-700">{line}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
