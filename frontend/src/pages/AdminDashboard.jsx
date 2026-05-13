import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { HiMenu, HiX, HiViewGrid, HiUsers, HiCash, HiChartBar, HiDocumentText, HiShieldCheck, HiUpload, HiExclamation, HiLightningBolt, HiBell, HiKey, HiClock, HiCog, HiLogout, HiClipboardList, HiTrendingUp, HiCurrencyDollar, HiUserGroup, HiGift, HiClipboardCheck } from 'react-icons/hi';
import { Button } from '../components/ui/Button';
import { Separator } from '../components/ui/Separator';

// Import all admin tab components
import AdminOverview from '../components/admin/tabs/AdminOverview';
import AdminReviewQueue from '../components/admin/tabs/AdminReviewQueue';
import AdminDetailedCase from '../components/admin/tabs/AdminDetailedCase';
import AdminDocumentsUpload from '../components/admin/tabs/AdminDocumentsUpload';
import AdminMembers from '../components/admin/tabs/AdminMembers';
import AdminRevenue from '../components/admin/tabs/AdminRevenue';
import AdminDistributions from '../components/admin/tabs/AdminDistributions';
import AdminRewardsControl from '../components/admin/tabs/AdminRewardsControl';
import AdminActivityLogs from '../components/admin/tabs/AdminActivityLogs';
import AdminRevenueChart from '../components/admin/tabs/AdminRevenueChart';
import AdminNotificationCenter from '../components/admin/tabs/AdminNotificationCenter';
import AdminRoleMatrix from '../components/admin/tabs/AdminRoleMatrix';
import AdminGovernanceSettings from '../components/admin/tabs/AdminGovernanceSettings';
import AdminRiskMonitoring from '../components/admin/tabs/AdminRiskMonitoring';

// Navigation configuration - matching AdminReviewModule exactly
const sidebarSections = [
  {
    title: 'HOME',
    items: [
      { id: 'overview', label: 'Overview', icon: HiViewGrid, description: 'System health & pending actions' }
    ]
  },
  {
    title: 'VERIFICATION',
    items: [
      { id: 'review-queue', label: 'Review Queue', icon: HiClipboardList, description: 'Cases waiting for review' },
      { id: 'detailed-case', label: 'Detailed Case', icon: HiClipboardCheck, description: 'Single case detail' },
      { id: 'documents-upload', label: 'Documents Upload', icon: HiUpload, description: 'Upload for members' }
    ]
  },
  {
    title: 'MEMBERS',
    items: [
      { id: 'members', label: 'Members', icon: HiUserGroup, description: 'Member database' }
    ]
  },
  {
    title: 'FINANCE & REVENUE',
    items: [
      { id: 'revenue', label: 'Revenue', icon: HiCurrencyDollar, description: 'Money coming in' },
      { id: 'distributions', label: 'Distributions', icon: HiCash, description: 'Monthly payouts' },
      { id: 'rewards', label: 'Rewards Control', icon: HiGift, description: 'Reward rules & credits' },
      { id: 'revenue-chart', label: 'Revenue Dashboard', icon: HiTrendingUp, description: 'Financial charts' }
    ]
  },
  {
    title: 'GOVERNANCE & COMPLIANCE',
    items: [
      { id: 'risk-monitor', label: 'Risk Monitoring', icon: HiShieldCheck, description: 'High-risk cases' },
      { id: 'activity-logs', label: 'Activity Logs', icon: HiClock, description: 'Audit trail' },
      { id: 'role-matrix', label: 'Role Matrix', icon: HiKey, description: 'Permissions' },
      { id: 'governance', label: 'Governance Settings', icon: HiCog, description: 'System rules' }
    ]
  },
  {
    title: 'COMMUNICATIONS',
    items: [
      { id: 'notifications', label: 'Notification Center', icon: HiBell, description: 'Email & channels' }
    ]
  }
];

const roleAccess = {
  SUPER_ADMIN: ['overview', 'review-queue', 'detailed-case', 'documents-upload', 'members', 'revenue', 'distributions', 'rewards', 'revenue-chart', 'risk-monitor', 'activity-logs', 'role-matrix', 'governance', 'notifications'],
  EXECUTIVE: ['overview', 'review-queue', 'detailed-case', 'members', 'revenue', 'distributions', 'rewards', 'revenue-chart', 'risk-monitor', 'activity-logs', 'role-matrix', 'governance', 'notifications'],
  LEGAL_COMPLIANCE: ['overview', 'review-queue', 'detailed-case', 'documents-upload', 'members', 'risk-monitor', 'activity-logs', 'role-matrix'],
  QUALIFICATIONS: ['overview', 'review-queue', 'detailed-case', 'members', 'role-matrix'],
  CUSTOMER_SUCCESS: ['overview', 'documents-upload', 'members', 'notifications'],
  FINANCE_TREASURY: ['overview', 'members', 'revenue', 'distributions', 'rewards', 'revenue-chart', 'notifications']
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { tab } = useParams();
  const { auth, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(tab || 'overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync activeTab with URL param
  useEffect(() => {
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [tab]);

  // Check if user has access to this view
  if (!auth?.role || !roleAccess[auth.role]) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900">Access Denied</h1>
          <p className="mt-2 text-slate-600">You don't have permission to access the admin dashboard.</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  const allowedTabs = roleAccess[auth.role];
  const hasAccessToTab = (tabId) => allowedTabs.includes(tabId);

  if (!hasAccessToTab(activeTab)) {
    setActiveTab('overview');
  }

  // Get all accessible items
  const accessibleItems = sidebarSections
    .map(section => ({
      ...section,
      items: section.items.filter(item => hasAccessToTab(item.id))
    }))
    .filter(section => section.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview />;
      case 'review-queue':
        return <AdminReviewQueue />;
      case 'detailed-case':
        return <AdminDetailedCase />;
      case 'documents-upload':
        return <AdminDocumentsUpload />;
      case 'members':
        return <AdminMembers />;
      case 'revenue':
        return <AdminRevenue />;
      case 'distributions':
        return <AdminDistributions />;
      case 'rewards':
        return <AdminRewardsControl />;
      case 'activity-logs':
        return <AdminActivityLogs />;
      case 'revenue-chart':
        return <AdminRevenueChart />;
      case 'notifications':
        return <AdminNotificationCenter />;
      case 'role-matrix':
        return <AdminRoleMatrix />;
      case 'governance':
        return <AdminGovernanceSettings />;
      case 'risk-monitor':
        return <AdminRiskMonitoring />;
      default:
        return <AdminOverview />;
    }
  };

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
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-3 px-2">
            <div className="flex items-center gap-3">
              <img src="/images/AUREON9_Logo.png" alt="AUREON9 logo" className="h-11 w-11 object-contain" />
              <div>
                <h1 className="text-lg font-semibold">AUREON9</h1>
                <p className="text-xs text-slate-500">Global membership and rewards</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
              aria-label="Close sidebar"
            >
              <HiX className="h-5 w-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="mb-5 px-2">
            <div className="rounded-2xl bg-gradient-to-br from-[#0A2540] to-[#0F4C81] p-4 text-white shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white">
                  {auth?.name?.substring(0, 2).toUpperCase() || auth?.email?.substring(0, 2).toUpperCase() || 'AD'}
                </div>
                <div>
                  <p className="font-medium">{auth?.name || auth?.email || 'Admin'}</p>
                  <p className="text-xs text-white/75">{auth?.role?.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/85">
                Unified admin dashboard with role-based access control and comprehensive governance tools.
              </div>
            </div>
          </div>

          {/* Navigation Sections */}
          <nav className="space-y-6 pr-2">
            {accessibleItems.map((section) => (
              <div key={section.title}>
                <p className="px-3 text-xs font-semibold uppercase text-slate-500 mb-3">{section.title}</p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigate(`/dashboard/admin/${item.id}`);
                          setSidebarOpen(false);
                        }}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm transition ${
                          activeTab === item.id
                            ? 'bg-[var(--aureon-ink)] text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                        title={item.description}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <Separator className="my-5" />

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <div className="flex items-start gap-3">
              <HiBell className="mt-0.5 h-4 w-4 text-slate-700" />
              <div>
                <p className="font-medium text-slate-900">System Status</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  All systems operational. Role-based access active.
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
          {/* Top Bar */}
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700"
                  aria-label="Open sidebar"
                >
                  <HiMenu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Admin Dashboard</p>
                  <h2 className="text-2xl font-semibold tracking-tight">
                    {sidebarSections
                      .flatMap(s => s.items)
                      .find(i => i.id === activeTab)?.label || 'Dashboard'}
                  </h2>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-slate-600">{auth?.email}</span>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="space-y-6 p-5 lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:p-6">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
}
