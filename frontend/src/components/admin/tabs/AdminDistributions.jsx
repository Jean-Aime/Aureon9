import { useState, useEffect } from 'react';
import { HiCurrencyDollar, HiUsers, HiCheckCircle, HiClock, HiCalendar } from 'react-icons/hi';
import { walletsAPI, membersAPI } from '../../../api/client';

export default function AdminDistributions() {
  const [distributions, setDistributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const membersResponse = await membersAPI.getAll();
      const membersList = membersResponse.data || [];
      setMembers(membersList);

      const distributionData = [];
      for (const member of membersList.slice(0, 15)) {
        try {
          const walletResponse = await walletsAPI.getWallet(member.id);
          if (walletResponse.data) {
            distributionData.push({
              id: member.id,
              memberName: member.user?.name || member.displayName || 'Unknown',
              memberEmail: member.user?.email || 'N/A',
              tier: member.tier?.code || member.tier?.name || 'MEMBER',
              balance: Number(walletResponse.data.balance) || 0,
              totalEarned: Number(walletResponse.data.totalEarned) || 0,
              lastDistribution: walletResponse.data.updatedAt
            });
          }
        } catch (error) {
          console.error(`Failed to fetch wallet for member ${member.id}:`, error);
        }
      }
      setDistributions(distributionData.sort((a, b) => b.totalEarned - a.totalEarned));
    } catch (error) {
      console.error('Failed to fetch distribution data:', error);
      setDistributions([]);
    } finally {
      setLoading(false);
    }
  };

  const totalDistributed = distributions.reduce((sum, d) => sum + d.totalEarned, 0);
  const totalPending = distributions.reduce((sum, d) => sum + d.balance, 0);

  const getTierColor = (tier) => {
    switch (tier) {
      case 'SOVEREIGN': return 'bg-slate-900 text-white';
      case 'FOUNDING': return 'bg-slate-800 text-white';
      case 'STRATEGIC': return 'bg-slate-700 text-white';
      case 'EXECUTIVE': return 'bg-slate-600 text-white';
      case 'CERTIFIED': return 'bg-slate-500 text-white';
      case 'ASSOCIATE': return 'bg-slate-400 text-white';
      default: return 'bg-slate-300 text-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Distribution Management</h2>
          <p className="text-slate-600 mt-1">Track AUREX distributions and member balances</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto">
          Process Distributions
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCurrencyDollar className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{totalDistributed.toFixed(2)}</div>
              <div className="text-sm text-slate-600">Total Distributed</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{totalPending.toFixed(2)}</div>
              <div className="text-sm text-slate-600">Pending Balance</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiUsers className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{distributions.length}</div>
              <div className="text-sm text-slate-600">Active Members</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCheckCircle className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {(totalDistributed / (distributions.length || 1)).toFixed(2)}
              </div>
              <div className="text-sm text-slate-600">Avg Per Member</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Member Distribution Summary</h3>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading distributions...</div>
        ) : distributions.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No distribution data available</div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Member</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Tier</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Total Earned</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Current Balance</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Last Distribution</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {distributions.map((dist) => (
                  <tr key={dist.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HiUsers className="text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{dist.memberName}</div>
                          <div className="text-xs text-slate-600 truncate">{dist.memberEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(dist.tier)}`}>
                        {dist.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <HiCurrencyDollar className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-900">{dist.totalEarned.toFixed(2)} AUREX</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <HiCurrencyDollar className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-900">{dist.balance.toFixed(2)} AUREX</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <HiCalendar className="text-slate-400" />
                        {new Date(dist.lastDistribution).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Distribution Schedule</h3>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <HiCalendar className="text-2xl text-slate-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900">Next Distribution</div>
                <div className="text-xs text-slate-600">Scheduled for end of month</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-medium w-fit">Pending</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <HiCheckCircle className="text-2xl text-slate-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900">Last Distribution</div>
                <div className="text-xs text-slate-600">Completed {new Date().toLocaleDateString()}</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-700 text-white rounded-full text-xs font-medium w-fit">Completed</span>
          </div>
        </div>
      </div>
    </div>
  );
}
