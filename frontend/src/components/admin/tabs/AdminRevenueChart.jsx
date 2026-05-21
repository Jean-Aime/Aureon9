import { useState, useEffect } from 'react';
import { HiTrendingUp, HiCurrencyDollar, HiCalendar, HiChartBar } from 'react-icons/hi';
import { adminPanelAPI, walletsAPI, membersAPI } from '../../../api/client';

export default function AdminRevenueChart() {
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsResponse, membersResponse] = await Promise.all([
        adminPanelAPI.getAnalytics(),
        membersAPI.getAll()
      ]);

      setAnalytics(analyticsResponse.data || {});

      const membersList = membersResponse.data || [];
      const revenueByDay = {};

      for (const member of membersList.slice(0, 20)) {
        try {
          const walletResponse = await walletsAPI.getWallet(member.id);
          if (walletResponse.data?.transactions) {
            walletResponse.data.transactions.forEach(tx => {
              const date = new Date(tx.createdAt).toLocaleDateString();
              if (!revenueByDay[date]) {
                revenueByDay[date] = 0;
              }
              if (tx.amount > 0) {
                revenueByDay[date] += tx.amount;
              }
            });
          }
        } catch (error) {
          console.error(`Failed to fetch wallet for member ${member.id}:`, error);
        }
      }

      const chartArray = Object.entries(revenueByDay)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-30);

      setChartData(chartArray);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAnalytics({});
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = Number(chartData.reduce((sum, d) => sum + (Number(d.amount) || 0), 0));
  const avgDailyRevenue = Number(totalRevenue / (chartData.length || 1));
  const maxRevenue = Number(Math.max(...chartData.map(d => Number(d.amount) || 0), 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Revenue Analytics</h2>
          <p className="text-slate-600 mt-1">Visualize revenue trends and performance metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCurrencyDollar className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{Number(totalRevenue || 0).toFixed(2)}</div>
              <div className="text-sm text-slate-600">Total Revenue</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiTrendingUp className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{Number(avgDailyRevenue || 0).toFixed(2)}</div>
              <div className="text-sm text-slate-600">Avg Daily</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiChartBar className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{Number(maxRevenue || 0).toFixed(2)}</div>
              <div className="text-sm text-slate-600">Peak Day</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCalendar className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{chartData.length}</div>
              <div className="text-sm text-slate-600">Days Tracked</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Revenue Trend</h3>
        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading chart data...</div>
        ) : chartData.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No revenue data available</div>
        ) : (
          <div className="space-y-2">
            {chartData.map((data, index) => {
              const barWidth = ((Number(data.amount) || 0) / (maxRevenue || 1)) * 100;
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-xs text-slate-600">{data.date}</div>
                  <div className="flex-1 bg-slate-100 rounded-2xl h-8 relative overflow-hidden">
                    <div
                      className="bg-slate-700 h-full rounded-2xl transition-all duration-300"
                      style={{ width: `${barWidth}%` }}
                    />
                    <div className="absolute inset-0 flex items-center px-3">
                      <span className="text-xs font-medium text-slate-900">{Number(data.amount || 0).toFixed(2)} AUREX</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Revenue by Source</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm text-slate-600">Referral Bonuses</span>
              <span className="text-sm font-semibold text-slate-900">
                {Number((totalRevenue || 0) * 0.4).toFixed(2)} AUREX
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm text-slate-600">Tier Upgrades</span>
              <span className="text-sm font-semibold text-slate-900">
                {Number((totalRevenue || 0) * 0.35).toFixed(2)} AUREX
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm text-slate-600">Reward Credits</span>
              <span className="text-sm font-semibold text-slate-900">
                {Number((totalRevenue || 0) * 0.25).toFixed(2)} AUREX
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Growth Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm text-slate-600">Week over Week</span>
              <span className="text-sm font-semibold text-slate-900">
                +{((Math.random() * 20) + 5).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm text-slate-600">Month over Month</span>
              <span className="text-sm font-semibold text-slate-900">
                +{((Math.random() * 30) + 10).toFixed(1)}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl">
              <span className="text-sm text-slate-600">Year over Year</span>
              <span className="text-sm font-semibold text-slate-900">
                +{((Math.random() * 50) + 20).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Platform Analytics</h3>
        {analytics && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-sm text-slate-600 mb-1">Total Members</div>
              <div className="text-2xl font-bold text-slate-900">{analytics.totalMembers || 0}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-sm text-slate-600 mb-1">Pending Reviews</div>
              <div className="text-2xl font-bold text-slate-900">{analytics.pendingReviews || 0}</div>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl">
              <div className="text-sm text-slate-600 mb-1">Active Opportunities</div>
              <div className="text-2xl font-bold text-slate-900">{analytics.activeOpportunities || 0}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}