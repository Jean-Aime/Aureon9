import { useState, useEffect } from 'react';
import { HiCog, HiClock, HiBell, HiShieldCheck, HiCheckCircle } from 'react-icons/hi';
import { adminPanelAPI } from '../../../api/client';

export default function AdminGovernanceSettings() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const response = await adminPanelAPI.getConfig();
      setConfig(response.data || {});
    } catch (error) {
      console.error('Failed to fetch governance config:', error);
      setConfig({});
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTimers = async (timers, retryPolicy) => {
    try {
      setSaving(true);
      await adminPanelAPI.updateTimers(timers, retryPolicy);
      setConfig({ ...config, timers, retryPolicy });
    } catch (error) {
      console.error('Failed to update timers:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateGovernanceRules = async (deliveryRules, escalationRules) => {
    try {
      setSaving(true);
      await adminPanelAPI.updateGovernanceRules(deliveryRules, escalationRules);
      setConfig({ ...config, deliveryRules, escalationRules });
    } catch (error) {
      console.error('Failed to update governance rules:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-600">Loading governance settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Governance Settings</h2>
          <p className="text-slate-600 mt-1">Configure platform governance rules and policies</p>
        </div>
        <button
          onClick={() => fetchConfig()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors"
        >
          <HiCog className="inline mr-2" />
          Refresh Settings
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCog className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {config.timers ? Object.keys(config.timers).length : 0}
              </div>
              <div className="text-sm text-slate-600">Active Timers</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiBell className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {config.deliveryRules ? Object.keys(config.deliveryRules).length : 0}
              </div>
              <div className="text-sm text-slate-600">Delivery Rules</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiShieldCheck className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {config.escalationRules ? Object.keys(config.escalationRules).length : 0}
              </div>
              <div className="text-sm text-slate-600">Escalation Rules</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCheckCircle className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {config.retryPolicy?.maxRetries || 0}
              </div>
              <div className="text-sm text-slate-600">Max Retries</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <HiClock className="text-slate-600" />
          SLA Timers Configuration
        </h3>
        <div className="space-y-4">
          {config.timers && Object.entries(config.timers).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <div className="text-sm font-medium text-slate-900">{key.replace(/_/g, ' ')}</div>
                <div className="text-xs text-slate-600">Current value: {value} hours</div>
              </div>
              <input
                type="number"
                value={value}
                onChange={(e) => {
                  const newTimers = { ...config.timers, [key]: parseInt(e.target.value) };
                  handleUpdateTimers(newTimers, config.retryPolicy);
                }}
                className="w-24 px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
            </div>
          ))}
          {(!config.timers || Object.keys(config.timers).length === 0) && (
            <div className="text-center py-8 text-slate-600">No timers configured</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <HiBell className="text-slate-600" />
          Delivery Rules
        </h3>
        <div className="space-y-4">
          {config.deliveryRules && Object.entries(config.deliveryRules).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{key.replace(/_/g, ' ')}</div>
                <div className="text-xs text-slate-600">Rule configuration</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{typeof value === 'boolean' ? (value ? 'Enabled' : 'Disabled') : value}</span>
                <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
          {(!config.deliveryRules || Object.keys(config.deliveryRules).length === 0) && (
            <div className="text-center py-8 text-slate-600">No delivery rules configured</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <HiShieldCheck className="text-slate-600" />
          Escalation Rules
        </h3>
        <div className="space-y-4">
          {config.escalationRules && Object.entries(config.escalationRules).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{key.replace(/_/g, ' ')}</div>
                <div className="text-xs text-slate-600">Escalation threshold and actions</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors">
                  Edit
                </button>
              </div>
            </div>
          ))}
          {(!config.escalationRules || Object.keys(config.escalationRules).length === 0) && (
            <div className="text-center py-8 text-slate-600">No escalation rules configured</div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Retry Policy</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Max Retries</label>
            <input
              type="number"
              value={config.retryPolicy?.maxRetries || 3}
              onChange={(e) => {
                const newRetryPolicy = { ...config.retryPolicy, maxRetries: parseInt(e.target.value) };
                handleUpdateTimers(config.timers, newRetryPolicy);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Retry Delay (seconds)</label>
            <input
              type="number"
              value={config.retryPolicy?.retryDelay || 60}
              onChange={(e) => {
                const newRetryPolicy = { ...config.retryPolicy, retryDelay: parseInt(e.target.value) };
                handleUpdateTimers(config.timers, newRetryPolicy);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>
      </div>

      {saving && (
        <div className="bg-slate-100 rounded-2xl border border-slate-200 p-4 text-center">
          <div className="text-sm font-medium text-slate-900">Saving changes...</div>
        </div>
      )}
    </div>
  );
}