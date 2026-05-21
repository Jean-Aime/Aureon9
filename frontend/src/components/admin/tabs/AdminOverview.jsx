import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiTrendingUp, HiUsers, HiClock, HiExclamation, HiCurrencyDollar, HiCheckCircle, HiDocumentText, HiShieldCheck, HiXCircle } from 'react-icons/hi';
import { adminPanelAPI, reviewQueueAPI, membersAPI } from '../../../api/client';

export default function AdminOverview() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [queueData, setQueueData] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, queueResponse, membersResponse] = await Promise.all([
        adminPanelAPI.getAnalytics(),
        reviewQueueAPI.getAll(),
        membersAPI.getAll()
      ]);

      setAnalytics(analyticsResponse.data || {});
      setQueueData(queueResponse.data || []);
      setMembers(membersResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch overview data:', error);
      setAnalytics({});
      setQueueData([]);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading overview...</div>;
  }

  const pendingReviews = queueData.filter(q => q.status === 'PENDING' || q.queueStatus === 'PENDING');
  const escalatedCases = queueData.filter(q => q.queueStatus === 'ESCALATED');
  const approvedToday = queueData.filter(q => {
    const today = new Date().toDateString();
    return (q.status === 'APPROVED' || q.queueStatus === 'APPROVED') && q.reviewedAt && new Date(q.reviewedAt).toDateString() === today;
  });

  const newMembersThisMonth = members.filter(m => {
    const memberDate = new Date(m.createdAt);
    const now = new Date();
    return memberDate.getMonth() === now.getMonth() && memberDate.getFullYear() === now.getFullYear();
  });

  const verifiedMembers = members.filter(m => m.verificationLevel && m.verificationLevel !== 'UNVERIFIED');

  const urgentCases = queueData
    .filter(q => q.status === 'PENDING' || q.queueStatus === 'PENDING')
    .map(q => {
      const daysPending = Math.floor((Date.now() - new Date(q.submittedAt)) / (1000 * 60 * 60 * 24));
      return { ...q, daysPending };
    })
    .sort((a, b) => b.daysPending - a.daysPending)
    .slice(0, 5);

  const recentActivity = queueData
    .filter(q => q.reviewedAt)
    .sort((a, b) => new Date(b.reviewedAt) - new Date(a.reviewedAt))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Overview</h2>
          <p className="text-slate-600 mt-1">Quick look at what's happening</p>
        </div>
        <button
          onClick={fetchOverviewData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <HiClock className="text-slate-600" />
              <div className="text-sm text-slate-600">Waiting</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{pendingReviews.length}</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <HiDocumentText className="text-slate-600" />
              <div className="text-sm text-slate-600">Reviewing</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {queueData.filter(q => q.status === 'UNDER_REVIEW' || q.queueStatus === 'UNDER_REVIEW').length}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <HiCheckCircle className="text-slate-600" />
              <div className="text-sm text-slate-600">Approved</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {queueData.filter(q => q.status === 'APPROVED' || q.queueStatus === 'APPROVED').length}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <HiXCircle className="text-slate-600" />
              <div className="text-sm text-slate-600">Rejected</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {queueData.filter(q => q.status === 'REJECTED' || q.queueStatus === 'REJECTED').length}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <HiExclamation className="text-slate-600" />
              <div className="text-sm text-slate-600">Urgent</div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{escalatedCases.length}</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Health</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <HiCheckCircle className="text-slate-700 flex-shrink-0" />
              <div className="text-sm font-medium text-slate-900">All Systems Working</div>
            </div>
            <div className="text-xs text-slate-600">Everything is running smoothly</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <HiUsers className="text-slate-700 flex-shrink-0" />
              <div className="text-sm font-medium text-slate-900">Total Members</div>
            </div>
            <div className="text-xs text-slate-600">{members.length} people signed up</div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <HiShieldCheck className="text-slate-700 flex-shrink-0" />
              <div className="text-sm font-medium text-slate-900">Verified Rate</div>
            </div>
            <div className="text-xs text-slate-600">
              {((verifiedMembers.length / (members.length || 1)) * 100).toFixed(1)}% are verified
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Urgent Cases</h3>
          <p className="text-sm text-slate-600 mb-4">Cases waiting the longest</p>
          {urgentCases.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No urgent cases</div>
          ) : (
            <div className="space-y-3">
              {urgentCases.map((caseItem) => (
                <div key={caseItem.id} className="border border-slate-200 rounded-2xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-900 font-mono truncate">
                      {caseItem.id.slice(0, 8)}
                    </span>
                    <span className="px-2 py-1 bg-slate-800 text-white rounded-full text-xs font-medium flex-shrink-0 ml-2">
                      {caseItem.daysPending}d
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 truncate">
                    {caseItem.memberProfile?.user?.name || caseItem.memberProfile?.displayName || 'Unknown Member'}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {caseItem.requestedLevel || 'Verification Request'}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            onClick={() => navigate('/dashboard/admin/review-queue')}
            className="mt-4 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors text-sm"
          >
            View All Cases
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h3>
          <p className="text-sm text-slate-600 mb-4">What happened recently</p>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-slate-600">No recent activity</div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="border-l-2 border-slate-300 pl-3 py-2">
                  <div className="flex items-center gap-2 mb-1">
                    {(activity.status === 'APPROVED' || activity.queueStatus === 'APPROVED') ? (
                      <HiCheckCircle className="text-slate-700 flex-shrink-0" />
                    ) : (
                      <HiExclamation className="text-slate-500 flex-shrink-0" />
                    )}
                    <span className="text-sm font-medium text-slate-900 truncate">{activity.status || activity.queueStatus}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    {new Date(activity.reviewedAt).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">
                    {activity.memberProfile?.user?.name || activity.memberProfile?.displayName || 'Unknown'}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button 
            onClick={() => navigate('/dashboard/admin/activity-logs')}
            className="mt-4 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors text-sm"
          >
            View All Activity
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Alerts</h3>
          <p className="text-sm text-slate-600 mb-4">Things that need attention</p>
          <div className="space-y-3">
            {urgentCases.filter(c => c.daysPending > 7).length > 0 && (
              <div className="bg-slate-100 rounded-2xl p-3">
                <div className="flex items-start gap-2">
                  <HiExclamation className="text-slate-700 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">Old Cases</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {urgentCases.filter(c => c.daysPending > 7).length} cases waiting over 7 days
                    </div>
                  </div>
                </div>
              </div>
            )}
            {escalatedCases.length > 0 && (
              <div className="bg-slate-100 rounded-2xl p-3">
                <div className="flex items-start gap-2">
                  <HiExclamation className="text-slate-700 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">Urgent Cases</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {escalatedCases.length} cases need boss approval
                    </div>
                  </div>
                </div>
              </div>
            )}
            {newMembersThisMonth.length > 50 && (
              <div className="bg-slate-100 rounded-2xl p-3">
                <div className="flex items-start gap-2">
                  <HiTrendingUp className="text-slate-700 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900">Lots of New People</div>
                    <div className="text-xs text-slate-600 mt-1">
                      {newMembersThisMonth.length} joined this month
                    </div>
                  </div>
                </div>
              </div>
            )}
            {urgentCases.filter(c => c.daysPending > 7).length === 0 && 
             escalatedCases.length === 0 && 
             newMembersThisMonth.length <= 50 && (
              <div className="text-center py-8 text-slate-600">Everything looks good!</div>
            )}
          </div>
          <button 
            onClick={() => navigate('/dashboard/admin/review-queue')}
            className="mt-4 w-full px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors text-sm"
          >
            View All
          </button>
        </div>
      </div>


    </div>
  );
}