import { useState, useEffect } from 'react';
import { HiCurrencyDollar, HiTrendingUp, HiUsers, HiCog } from 'react-icons/hi';
import { adminPanelAPI } from '../../../api/client';

export default function AdminRewardsControl() {
  const [rewardRules, setRewardRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);

  useEffect(() => {
    fetchRewardRules();
  }, []);

  const fetchRewardRules = async () => {
    try {
      setLoading(true);
      const response = await adminPanelAPI.getConfig();
      const rules = response.data?.rewardRules;
      setRewardRules(Array.isArray(rules) ? rules : []);
    } catch (error) {
      console.error('Failed to fetch reward rules:', error);
      setRewardRules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRule = async (ruleId, updates) => {
    try {
      const updatedRules = rewardRules.map(rule =>
        rule.id === ruleId ? { ...rule, ...updates } : rule
      );
      await adminPanelAPI.updateRewardRules(updatedRules);
      setRewardRules(updatedRules);
      setEditingRule(null);
    } catch (error) {
      console.error('Failed to update reward rule:', error);
    }
  };

  const getEventTypeColor = (eventType) => {
    switch (eventType) {
      case 'REFERRAL_SIGNUP': return 'bg-slate-700 text-white';
      case 'TIER_UPGRADE': return 'bg-slate-800 text-white';
      case 'VERIFICATION_COMPLETE': return 'bg-slate-600 text-white';
      case 'OPPORTUNITY_COMPLETION': return 'bg-slate-500 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Rewards Control</h2>
          <p className="text-slate-600 mt-1">Configure reward rules and distribution parameters</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto">
          <HiCog className="inline mr-2" />
          Add New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCurrencyDollar className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{rewardRules.length}</div>
              <div className="text-sm text-slate-600">Active Rules</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiTrendingUp className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {Array.isArray(rewardRules) ? rewardRules.reduce((sum, r) => sum + (r.rewardAmount || 0), 0).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-slate-600">Total Pool</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiUsers className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {Array.isArray(rewardRules) ? rewardRules.filter(r => r.enabled).length : 0}
              </div>
              <div className="text-sm text-slate-600">Enabled</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCog className="text-2xl text-slate-600 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {Array.isArray(rewardRules) ? rewardRules.filter(r => !r.enabled).length : 0}
              </div>
              <div className="text-sm text-slate-600">Disabled</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Reward Rules Configuration</h3>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading reward rules...</div>
        ) : rewardRules.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No reward rules configured</div>
        ) : (
          <div className="space-y-4">
            {rewardRules.map((rule) => (
              <div key={rule.id} className="border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventTypeColor(rule.eventType)} flex-shrink-0`}>
                      {rule.eventType}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900">{rule.name || rule.eventType}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => handleUpdateRule(rule.id, { enabled: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      Enabled
                    </label>
                    <button
                      onClick={() => setEditingRule(editingRule === rule.id ? null : rule.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors"
                    >
                      {editingRule === rule.id ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                </div>

                {editingRule === rule.id ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Reward Amount (AUREX)</label>
                      <input
                        type="number"
                        value={rule.rewardAmount || 0}
                        onChange={(e) => handleUpdateRule(rule.id, { rewardAmount: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Min Tier Required</label>
                      <select
                        value={rule.minTierRequired || 'MEMBER'}
                        onChange={(e) => handleUpdateRule(rule.id, { minTierRequired: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="MEMBER">Member</option>
                        <option value="VERIFIED">Verified</option>
                        <option value="CERTIFIED">Certified</option>
                        <option value="SOVEREIGN">Sovereign</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Max Uses Per Member</label>
                      <input
                        type="number"
                        value={rule.maxUsesPerMember || 0}
                        onChange={(e) => handleUpdateRule(rule.id, { maxUsesPerMember: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-slate-600">Reward Amount</div>
                      <div className="font-semibold text-slate-900">{rule.rewardAmount || 0} AUREX</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Min Tier</div>
                      <div className="font-semibold text-slate-900">{rule.minTierRequired || 'MEMBER'}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Max Uses</div>
                      <div className="font-semibold text-slate-900">{rule.maxUsesPerMember || 'Unlimited'}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Status</div>
                      <div className={`font-semibold ${rule.enabled ? 'text-slate-900' : 'text-slate-500'}`}>
                        {rule.enabled ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                )}

                {rule.description && (
                  <p className="text-sm text-slate-600 mt-3">{rule.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Global Settings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Default Reward Currency</label>
            <input
              type="text"
              value="AUREX"
              disabled
              className="w-full px-4 py-2 border border-slate-300 rounded-2xl bg-slate-50 text-slate-600"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Distribution Frequency</label>
            <select className="w-full px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500">
              <option>Immediate</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}