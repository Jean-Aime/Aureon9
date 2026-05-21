import { useState, useEffect } from 'react';
import { HiCurrencyDollar, HiTrendingUp, HiClock, HiUser, HiFilter } from 'react-icons/hi';
import { walletsAPI, membersAPI } from '../../../api/client';

export default function AdminRevenue() {
  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const membersResponse = await membersAPI.getAll();
      const membersList = membersResponse.data || [];
      setMembers(membersList);

      const allTransactions = [];
      for (const member of membersList.slice(0, 20)) {
        try {
          const walletResponse = await walletsAPI.getWallet(member.id);
          if (walletResponse.data?.transactions) {
            allTransactions.push(...walletResponse.data.transactions.map(t => ({
              ...t,
              memberName: member.user?.name || member.displayName || 'Unknown',
              memberEmail: member.user?.email || 'N/A'
            })));
          }
        } catch (error) {
          console.error(`Failed to fetch wallet for member ${member.id}:`, error);
        }
      }
      setTransactions(allTransactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error('Failed to fetch revenue data:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = typeFilter === 'ALL' 
    ? transactions 
    : transactions.filter(t => t.type === typeFilter);

  const totalRevenue = Number(transactions
    .filter(t => ['REWARD_CREDIT', 'COMMISSION_CREDIT', 'REFERRAL_BONUS', 'TIER_UPGRADE_BONUS'].includes(t.type))
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0));

  const totalWithdrawals = Number(transactions
    .filter(t => t.type === 'WITHDRAWAL')
    .reduce((sum, t) => sum + Math.abs(Number(t.amount) || 0), 0));

  const getTypeColor = (type) => {
    switch (type) {
      case 'REWARD_CREDIT': return 'bg-slate-700 text-white';
      case 'COMMISSION_CREDIT': return 'bg-slate-600 text-white';
      case 'REFERRAL_BONUS': return 'bg-slate-600 text-white';
      case 'TIER_UPGRADE_BONUS': return 'bg-slate-800 text-white';
      case 'WITHDRAWAL': return 'bg-slate-500 text-white';
      case 'SETTLEMENT': return 'bg-slate-400 text-white';
      default: return 'bg-slate-300 text-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Revenue</h2>
          <p className="text-slate-600 mt-1">See money coming in and out</p>
        </div>
        <button 
          onClick={fetchData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto"
        >
          <HiFilter className="inline mr-2" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCurrencyDollar className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">${totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-slate-600">Money In</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiTrendingUp className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">${totalWithdrawals.toFixed(2)}</div>
              <div className="text-sm text-slate-600">Money Out</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{transactions.length}</div>
              <div className="text-sm text-slate-600">All Transactions</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiUser className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                ${((totalRevenue - totalWithdrawals) / (members.length || 1)).toFixed(2)}
              </div>
              <div className="text-sm text-slate-600">Per Person</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Recent Transactions</h3>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500 w-full sm:w-auto"
          >
            <option value="ALL">All Types</option>
            <option value="REWARD_CREDIT">Reward Credit</option>
            <option value="COMMISSION_CREDIT">Commission Credit</option>
            <option value="REFERRAL_BONUS">Referral Bonus</option>
            <option value="TIER_UPGRADE_BONUS">Tier Upgrade</option>
            <option value="WITHDRAWAL">Withdrawal</option>
            <option value="SETTLEMENT">Settlement</option>
          </select>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading...</div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No transactions</div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">When</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Person</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Amount</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Note</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.slice(0, 50).map((transaction) => (
                  <tr key={transaction.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <HiClock className="text-slate-400" />
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <HiUser className="text-slate-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{transaction.memberName}</div>
                          <div className="text-xs text-slate-600 truncate">{transaction.memberEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${Number(transaction.amount) >= 0 ? 'text-slate-900' : 'text-slate-600'}`}>
                        {Number(transaction.amount) >= 0 ? '+' : ''}{Number(transaction.amount || 0).toFixed(2)} AUREX
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-slate-600 line-clamp-1">
                        {transaction.description || transaction.reference || 'None'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}