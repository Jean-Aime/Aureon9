import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiSearch, HiFilter, HiClock, HiDocumentText, HiUser, HiCheckCircle } from 'react-icons/hi';
import { reviewQueueAPI } from '../../../api/client';

export default function AdminReviewQueue() {
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCases();
  }, [filter]);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const response = await reviewQueueAPI.getAll({ status: filter !== 'ALL' ? filter : undefined });
      setCases(response.data || []);
    } catch (error) {
      console.error('Failed to fetch review queue:', error);
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCases = cases.filter(c => {
    const memberName = c.memberProfile?.user?.name || c.memberProfile?.displayName || '';
    const requestedLevel = c.requestedLevel || '';
    return memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           requestedLevel.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-slate-100 text-slate-700';
      case 'IN_REVIEW':
      case 'UNDER_REVIEW': return 'bg-slate-200 text-slate-800';
      case 'APPROVED': return 'bg-slate-700 text-white';
      case 'REJECTED': return 'bg-slate-500 text-white';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-slate-800 text-white';
      case 'MEDIUM': return 'bg-slate-600 text-white';
      case 'LOW': return 'bg-slate-400 text-white';
      default: return 'bg-slate-500 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Review Queue</h2>
          <p className="text-slate-600 mt-1">Cases waiting for review</p>
        </div>
        <button 
          onClick={fetchCases}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto"
        >
          <HiFilter className="inline mr-2" />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or level..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 w-full sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="UNDER_REVIEW">In Review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading...</div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No cases</div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Case ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Person</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Wants</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Priority</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Days</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((caseItem) => {
                  const daysPending = Math.floor((Date.now() - new Date(caseItem.submittedAt)) / (1000 * 60 * 60 * 24));
                  const memberName = caseItem.memberProfile?.user?.name || caseItem.memberProfile?.displayName || 'Unknown Member';
                  const displayStatus = caseItem.queueStatus || caseItem.status || 'PENDING';
                  
                  return (
                    <tr key={caseItem.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-900 font-mono whitespace-nowrap">{caseItem.id.slice(0, 8)}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <HiUser className="text-slate-400 flex-shrink-0" />
                          <span className="text-sm text-slate-900">{memberName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900 whitespace-nowrap">{caseItem.requestedLevel}</td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(displayStatus)}`}>
                          {displayStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(caseItem.priority || caseItem.risk || 'MEDIUM')}`}>
                          {caseItem.priority || caseItem.risk || 'MEDIUM'}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-slate-600">
                          <HiClock className="text-slate-400" />
                          {daysPending}d
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button 
                          onClick={() => navigate(`/dashboard/admin/detailed-case/${caseItem.id}`)}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiDocumentText className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{cases.length}</div>
              <div className="text-sm text-slate-600">All Cases</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{cases.filter(c => c.status === 'PENDING' || c.queueStatus === 'PENDING').length}</div>
              <div className="text-sm text-slate-600">Waiting</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiUser className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{cases.filter(c => c.status === 'UNDER_REVIEW' || c.queueStatus === 'UNDER_REVIEW').length}</div>
              <div className="text-sm text-slate-600">In Review</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCheckCircle className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{cases.filter(c => c.status === 'APPROVED' || c.queueStatus === 'APPROVED').length}</div>
              <div className="text-sm text-slate-600">Approved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}