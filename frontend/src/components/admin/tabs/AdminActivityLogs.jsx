import { useState, useEffect } from 'react';
import { HiClock, HiUser, HiShieldCheck, HiFilter, HiSearch } from 'react-icons/hi';
import { auditAPI } from '../../../api/client';

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await auditAPI.getAll();
      setLogs(response.data || []);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesAction = actionFilter === 'ALL' || log.action === actionFilter;
    const performedBy = log.actor?.name || log.actor?.email || log.performedBy || '';
    const entityType = log.entityType || '';
    const matchesSearch = performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entityType.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const getActionColor = (action) => {
    switch (action) {
      case 'CREATE':
      case 'CREATE_VERIFICATION_REQUEST':
      case 'CREATE_DOCUMENT': return 'bg-slate-700 text-white';
      case 'UPDATE':
      case 'UPDATE_MEMBER':
      case 'PATCH_VERIFICATION': return 'bg-slate-600 text-white';
      case 'DELETE':
      case 'DELETE_DOCUMENT': return 'bg-slate-800 text-white';
      case 'APPROVE':
      case 'APPROVE_VERIFICATION':
      case 'REVIEW_QUEUE_APPROVE': return 'bg-slate-500 text-white';
      case 'REJECT':
      case 'REJECT_VERIFICATION': return 'bg-slate-400 text-white';
      default: return 'bg-slate-300 text-slate-900';
    }
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Activity Logs</h2>
          <p className="text-slate-600 mt-1">Comprehensive audit trail of all system actions</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto">
          <HiFilter className="inline mr-2" />
          Export Logs
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{logs.length}</div>
              <div className="text-sm text-slate-600">Total Events</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiUser className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {new Set(logs.map(l => l.actor?.id || l.actorUserId || l.performedBy)).size}
              </div>
              <div className="text-sm text-slate-600">Unique Users</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiShieldCheck className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {logs.filter(l => l.action && l.action.includes('APPROVE')).length}
              </div>
              <div className="text-sm text-slate-600">Approvals</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {logs.filter(l => {
                  const hoursSince = (Date.now() - new Date(l.createdAt)) / (1000 * 60 * 60);
                  return hoursSince <= 24;
                }).length}
              </div>
              <div className="text-sm text-slate-600">Last 24h</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by user or entity type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 w-full sm:w-auto"
          >
            <option value="ALL">All Actions</option>
            {uniqueActions.slice(0, 10).map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading activity logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No activity logs found</div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Timestamp</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Entity</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.slice(0, 100).map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <HiClock className="text-slate-400" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HiUser className="text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-900">{log.actor?.name || log.actor?.email || log.performedBy || 'System'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{log.entityType}</div>
                      <div className="text-xs text-slate-600 font-mono">{log.entityId?.slice(0, 12)}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-600 max-w-md truncate">
                        {log.changes ? JSON.stringify(log.changes).slice(0, 100) : log.payloadJson ? JSON.stringify(log.payloadJson).slice(0, 100) : 'No details'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-sm text-slate-600 mb-1">Most Active User</div>
            <div className="text-lg font-semibold text-slate-900 truncate">
              {logs.length > 0 ? (logs[0].actor?.name || logs[0].actor?.email || logs[0].performedBy || 'N/A') : 'N/A'}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-sm text-slate-600 mb-1">Most Common Action</div>
            <div className="text-lg font-semibold text-slate-900 truncate">
              {uniqueActions.length > 0 ? uniqueActions[0] : 'N/A'}
            </div>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl">
            <div className="text-sm text-slate-600 mb-1">Last Activity</div>
            <div className="text-lg font-semibold text-slate-900">
              {logs.length > 0 ? new Date(logs[0].createdAt).toLocaleTimeString() : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
