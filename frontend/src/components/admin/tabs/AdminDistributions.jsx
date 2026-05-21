import { useState, useEffect } from 'react';
import { HiCurrencyDollar, HiUsers, HiCheckCircle, HiClock, HiCalendar, HiX } from 'react-icons/hi';
import { walletsAPI, membersAPI } from '../../../api/client';

export default function AdminDistributions() {
  const [distributions, setDistributions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingDist, setViewingDist] = useState(null);

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
      {/* View Distribution Modal */}
      {viewingDist && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setViewingDist(null)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">Distribution Details</h3>
                <button
                  onClick={() => setViewingDist(null)}
                  className="p-2 hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  <HiX className="text-slate-600" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Member Name</div>
                  <div className="text-slate-900 font-medium">{viewingDist.memberName}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Email</div>
                  <div className="text-slate-900">{viewingDist.memberEmail}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Level</div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTierColor(viewingDist.tier)}`}>
                    {viewingDist.tier}
                  </span>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Total Earned</div>
                  <div className="text-slate-900 font-semibold">{viewingDist.totalEarned.toFixed(2)} AUREX</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Current Balance</div>
                  <div className="text-slate-900 font-semibold">{viewingDist.balance.toFixed(2)} AUREX</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Last Payout</div>
                  <div className="text-slate-900">{new Date(viewingDist.lastDistribution).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Member ID</div>
                  <div className="text-slate-900 font-mono text-xs">{viewingDist.id}</div>
                </div>
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => setViewingDist(null)}
                    className="flex-1 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Distributions</h2>
          <p className="text-slate-600 mt-1">Monthly payouts to members</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCurrencyDollar className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{totalDistributed.toFixed(2)}</div>
              <div className="text-sm text-slate-600">Total Paid Out</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{totalPending.toFixed(2)}</div>
              <div className="text-sm text-slate-600">Waiting to Pay</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiUsers className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{distributions.length}</div>
              <div className="text-sm text-slate-600">People</div>
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
              <div className="text-sm text-slate-600">Per Person</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Member Payouts</h3>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading...</div>
        ) : distributions.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No data</div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Person</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Level</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Total Earned</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Balance Now</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Last Payout</th>
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
                      <button 
                        onClick={() => setViewingDist(dist)}
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

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Payout Schedule</h3>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <HiCalendar className="text-2xl text-slate-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900">Next Payout</div>
                <div className="text-xs text-slate-600">End of this month</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-200 text-slate-800 rounded-full text-xs font-medium w-fit">Pending</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <HiCheckCircle className="text-2xl text-slate-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-slate-900">Last Payout</div>
                <div className="text-xs text-slate-600">Done on {new Date().toLocaleDateString()}</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-slate-700 text-white rounded-full text-xs font-medium w-fit">Done</span>
          </div>
        </div>
      </div>
    </div>
  );
}
