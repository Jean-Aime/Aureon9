import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';
import { opportunityApplicationsAPI } from '../api/client';

export function AdminOpportunityApplications() {
  const [applications, setApplications] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionNotes, setActionNotes] = useState('');
  const [actionStatus, setActionStatus] = useState('APPROVED');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    try {
      setLoading(true);
      const res = await opportunityApplicationsAPI.getAll();
      setApplications(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleApplicationAction(applicationId) {
    try {
      setActionLoading(true);
      await opportunityApplicationsAPI.update(applicationId, {
        status: actionStatus,
        notes: actionNotes,
      });

      // Reload applications
      await loadApplications();
      setSelectedApp(null);
      setActionNotes('');
      setActionStatus('APPROVED');
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    } finally {
      setActionLoading(false);
    }
  }

  const filteredApplications =
    filterStatus === 'all' ? applications : applications.filter((app) => app.status === filterStatus);

  function getStatusBadge(status) {
    const statusConfig = {
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted', icon: Clock },
      UNDER_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Under Review', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved', icon: CheckCircle2 },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;
    return <Badge className={`${config.bg} ${config.text}`}>{config.label}</Badge>;
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (loading) {
    return <div className="text-center py-8">Loading applications...</div>;
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="text-red-700">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
      <Card>
        <CardHeader>
          <CardTitle>Applications Queue</CardTitle>
          <CardDescription>Total: {filteredApplications.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Applications</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </Select>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {filteredApplications.length ? (
              filteredApplications.map((app) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className={`w-full text-left rounded-lg border p-3 transition ${
                    selectedApp?.id === app.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{app.opportunity?.title}</p>
                      <p className="text-xs text-gray-600 truncate">
                        {app.memberProfile?.user?.name || 'Unknown Member'}
                      </p>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(app.submittedAt)}</p>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">No applications to review</div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedApp && (
        <Card>
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
            <CardDescription>Review and take action on this application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Opportunity</label>
                <div className="mt-1 p-3 rounded-lg bg-gray-50 text-sm">{selectedApp.opportunity?.title}</div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Organization</label>
                <div className="mt-1 p-3 rounded-lg bg-gray-50 text-sm">
                  {selectedApp.opportunity?.organization?.name || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Member</label>
                <div className="mt-1 p-3 rounded-lg bg-gray-50 text-sm">
                  <p className="font-semibold">{selectedApp.memberProfile?.user?.name}</p>
                  <p className="text-xs text-gray-600">{selectedApp.memberProfile?.user?.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Current Status</label>
                <div className="mt-1 flex items-center gap-2">
                  {getStatusBadge(selectedApp.status)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">Submitted On</label>
                <div className="mt-1 p-3 rounded-lg bg-gray-50 text-sm">{formatDate(selectedApp.submittedAt)}</div>
              </div>

              {selectedApp.notes && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Applicant Notes</label>
                  <div className="mt-1 p-3 rounded-lg bg-blue-50 text-sm italic text-blue-900">
                    {selectedApp.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t pt-6 space-y-4">
              <h3 className="font-semibold text-gray-900">Take Action</h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Decision</label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="APPROVED">Approve</option>
                  <option value="REJECTED">Reject</option>
                  <option value="UNDER_REVIEW">Mark as Under Review</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes for Applicant</label>
                <Textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Optional: Provide feedback to the applicant..."
                  className="min-h-[100px]"
                />
              </div>

              <Button
                onClick={() => handleApplicationAction(selectedApp.id)}
                disabled={actionLoading}
                className="w-full"
              >
                {actionLoading ? 'Processing...' : 'Submit Decision'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AdminOpportunityApplications;
