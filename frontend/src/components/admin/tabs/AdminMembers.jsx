import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { HiSearch, HiUser, HiMail, HiShieldCheck, HiClock, HiX } from 'react-icons/hi';
import { membersAPI, referenceAPI } from '../../../api/client';

export default function AdminMembers() {
  const [members, setMembers] = useState([]);
  const [tiers, setTiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [viewingMember, setViewingMember] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersResponse, tiersResponse] = await Promise.all([
        membersAPI.getAll(),
        referenceAPI.getTiers()
      ]);
      setMembers(membersResponse.data || []);
      setTiers(tiersResponse.data || []);
    } catch (error) {
      toast.error('Failed to fetch members data');
      setMembers([]);
      setTiers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!window.confirm('Are you sure you want to delete this member?')) return;
    
    try {
      setDeleting(true);
      await membersAPI.delete(memberId);
      setViewingMember(null);
      fetchData();
      toast.success('Member deleted successfully');
    } catch (error) {
      toast.error('Failed to delete member');
    } finally {
      setDeleting(false);
    }
  };

  const filteredMembers = members.filter(m => {
    const memberName = m.user?.name || m.displayName || '';
    const memberEmail = m.user?.email || '';
    const matchesSearch = memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         memberEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const memberTierCode = m.tier?.code || 'MEMBER';
    const matchesTier = tierFilter === 'ALL' || memberTierCode === tierFilter;
    return matchesSearch && matchesTier;
  });

  const getTierColor = (tier) => {
    const tierData = tiers.find(t => t.code === tier?.code);
    const tierLevel = tierData?.rank || 0;
    if (tierLevel >= 6) return 'bg-slate-800 text-white';
    if (tierLevel >= 4) return 'bg-slate-600 text-white';
    if (tierLevel >= 2) return 'bg-slate-500 text-white';
    return 'bg-slate-400 text-white';
  };

  const getVerificationColor = (level) => {
    switch (level) {
      case 'UNVERIFIED': return 'bg-slate-100 text-slate-700';
      case 'BASIC_VERIFIED':
      case 'EMAIL_VERIFIED': return 'bg-slate-200 text-slate-800';
      case 'IDENTITY_VERIFIED': return 'bg-slate-400 text-white';
      case 'COMMERCIAL_VERIFIED': return 'bg-slate-600 text-white';
      case 'INSTITUTIONAL_VERIFIED':
      case 'CERTIFIED': return 'bg-slate-700 text-white';
      case 'CAPITAL_VERIFIED':
      case 'CERTIFIED_PLUS': return 'bg-slate-800 text-white';
      case 'GOVERNANCE_APPROVED':
      case 'SOVEREIGN': return 'bg-slate-900 text-white';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* View Member Modal */}
      {viewingMember && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setViewingMember(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Member Details</h3>
                <button
                  onClick={() => setViewingMember(null)}
                  className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  <HiX className="text-slate-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Name</div>
                  <div className="text-slate-900 font-medium">{viewingMember.user?.name || viewingMember.displayName || 'Unknown'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Email</div>
                  <div className="text-slate-900">{viewingMember.user?.email || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Level</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(viewingMember.tier)}`}>
                    {viewingMember.tier?.name || viewingMember.tier?.code || 'MEMBER'}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Verification Status</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVerificationColor(viewingMember.verificationLevel)}`}>
                    {viewingMember.verificationLevel || 'UNVERIFIED'}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Joined On</div>
                  <div className="text-slate-900">{new Date(viewingMember.createdAt).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Member ID</div>
                  <div className="text-slate-900 font-mono text-xs">{viewingMember.id}</div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => setViewingMember(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => handleDeleteMember(viewingMember.id)}
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-2xl transition-colors"
                  >
                    {deleting ? 'Deleting...' : 'Delete Member'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Members</h2>
          <p className="text-slate-600 mt-1">See and manage all members</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 w-full sm:w-auto"
          >
            <option value="ALL">All Tiers</option>
            {tiers.map(tier => (
              <option key={tier.id} value={tier.code}>{tier.name}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading...</div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No members</div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Level</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Verified</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Joined</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HiUser className="text-slate-400 flex-shrink-0" />
                        <span className="text-sm font-medium text-slate-900">{member.user?.name || member.displayName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HiMail className="text-slate-400 flex-shrink-0" />
                        <span className="text-sm text-slate-600">{member.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(member.tier)}`}>
                        {member.tier?.name || member.tier?.code || 'MEMBER'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getVerificationColor(member.verificationLevel)}`}>
                        {member.verificationLevel || 'UNVERIFIED'}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <HiClock className="text-slate-400" />
                        {new Date(member.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button 
                        onClick={() => setViewingMember(member)}
                        className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiUser className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{members.length}</div>
              <div className="text-sm text-slate-600">All Members</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiShieldCheck className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {members.filter(m => m.verificationLevel && m.verificationLevel !== 'UNVERIFIED').length}
              </div>
              <div className="text-sm text-slate-600">Verified</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {members.filter(m => {
                  const daysSince = (Date.now() - new Date(m.createdAt)) / (1000 * 60 * 60 * 24);
                  return daysSince <= 30;
                }).length}
              </div>
              <div className="text-sm text-slate-600">New (30 days)</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiUser className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {members.filter(m => m.user?.role === 'MEMBER' && m.user?.isActive).length}
              </div>
              <div className="text-sm text-slate-600">Active</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
