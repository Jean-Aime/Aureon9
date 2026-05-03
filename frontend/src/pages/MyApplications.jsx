import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Briefcase, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { opportunityApplicationsAPI } from '../api/client';

export function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  function getStatusIcon(status) {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'UNDER_REVIEW':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'SUBMITTED':
        return <AlertCircle className="w-4 h-4 text-blue-600" />;
      default:
        return <Briefcase className="w-4 h-4 text-gray-600" />;
    }
  }

  function getStatusBadge(status) {
    const statusConfig = {
      SUBMITTED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      UNDER_REVIEW: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Under Review' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status] || statusConfig.SUBMITTED;
    return <Badge className={`${config.bg} ${config.text}`}>{config.label}</Badge>;
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading your applications...</div>
      </div>
    );
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

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64">
            <Briefcase className="w-12 h-12 text-gray-300 mb-4" />
            <div className="text-center">
              <div className="text-gray-700 font-semibold mb-2">No Applications Yet</div>
              <div className="text-gray-500">Start exploring opportunities to apply!</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Applications</h2>
        <p className="text-gray-600 mt-2">Track all your opportunity applications here</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application Summary</CardTitle>
          <CardDescription>
            You have {applications.length} application{applications.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opportunity</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-semibold">{app.opportunity?.title || 'N/A'}</TableCell>
                    <TableCell>{app.opportunity?.organization?.name || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{app.opportunity?.type || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(app.submittedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(app.status)}
                        {getStatusBadge(app.status)}
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(app.reviewedAt || app.submittedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {applications.some((a) => a.status === 'UNDER_REVIEW') && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900">Under Review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800">
              {applications.filter((a) => a.status === 'UNDER_REVIEW').length} application
              {applications.filter((a) => a.status === 'UNDER_REVIEW').length !== 1 ? 's are' : ' is'} currently being
              reviewed. We'll notify you when there's an update.
            </p>
          </CardContent>
        </Card>
      )}

      {applications.some((a) => a.status === 'APPROVED') && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900">Approved Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {applications
                .filter((a) => a.status === 'APPROVED')
                .map((app) => (
                  <div key={app.id} className="flex items-center justify-between">
                    <span className="text-green-800 font-semibold">{app.opportunity?.title}</span>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default MyApplications;
