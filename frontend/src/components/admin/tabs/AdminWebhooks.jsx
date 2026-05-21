import { useState } from 'react';
import { HiLightningBolt, HiCheckCircle, HiClock, HiExclamation } from 'react-icons/hi';

const webhooks = [
  {
    id: 1,
    endpoint: '/webhooks/odiexa/purchase',
    source: 'ODIEXA',
    purpose: 'Record purchase, credit rewards',
    priority: 'HIGH',
    status: 'ACTIVE',
    lastTriggered: '2024-01-15 14:32:00',
    successRate: '99.8%',
    totalCalls: 15234
  },
  {
    id: 2,
    endpoint: '/webhooks/aal/referral',
    source: 'AAL',
    purpose: 'Record referral signup',
    priority: 'HIGH',
    status: 'ACTIVE',
    lastTriggered: '2024-01-15 14:28:00',
    successRate: '99.9%',
    totalCalls: 8921
  },
  {
    id: 3,
    endpoint: '/webhooks/aurex/withdrawal',
    source: 'AUREX',
    purpose: 'Update wallet balance',
    priority: 'HIGH',
    status: 'ACTIVE',
    lastTriggered: '2024-01-15 14:15:00',
    successRate: '100%',
    totalCalls: 3456
  }
];

export default function AdminWebhooks() {
  const [selectedWebhook, setSelectedWebhook] = useState(null);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'LOW': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ACTIVE': return <HiCheckCircle className="text-emerald-600" />;
      case 'PENDING': return <HiClock className="text-amber-600" />;
      case 'ERROR': return <HiExclamation className="text-rose-600" />;
      default: return <HiClock className="text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Webhooks</h2>
          <p className="text-slate-600 mt-1">Connect to other systems</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors w-full sm:w-auto">
          Add New
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <HiLightningBolt className="text-xl text-slate-700" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">{webhooks.length}</div>
              <div className="text-sm text-slate-600">Active</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <HiCheckCircle className="text-xl text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">
                {webhooks.reduce((sum, w) => sum + w.totalCalls, 0).toLocaleString()}
              </div>
              <div className="text-sm text-slate-600">Times Called</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <HiCheckCircle className="text-xl text-emerald-700" />
            </div>
            <div className="min-w-0">
              <div className="text-2xl font-bold text-slate-900">99.9%</div>
              <div className="text-sm text-slate-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">All Webhooks</h3>
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Working</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">URL</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">From</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">What It Does</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Success</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Times Used</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">Last Used</th>
              </tr>
            </thead>
            <tbody>
              {webhooks.map((webhook) => (
                <tr 
                  key={webhook.id} 
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedWebhook(webhook)}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {webhook.status === 'ACTIVE' && <HiCheckCircle className="text-emerald-600" />}
                      {webhook.status === 'PENDING' && <HiClock className="text-amber-600" />}
                      {webhook.status === 'ERROR' && <HiExclamation className="text-rose-600" />}
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <code className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded">
                      {webhook.endpoint}
                    </code>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-slate-900">{webhook.source}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-slate-600">{webhook.purpose}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(webhook.priority)}`}>
                      {webhook.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-emerald-600">{webhook.successRate}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-sm text-slate-900">{webhook.totalCalls.toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{webhook.lastTriggered}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedWebhook && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-500">URL</p>
              <code className="text-sm font-mono text-slate-900 bg-slate-100 px-2 py-1 rounded mt-1 inline-block">
                {selectedWebhook.endpoint}
              </code>
            </div>
            <div>
              <p className="text-sm text-slate-500">From System</p>
              <p className="text-sm font-medium text-slate-900 mt-1">{selectedWebhook.source}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">What It Does</p>
              <p className="text-sm text-slate-900 mt-1">{selectedWebhook.purpose}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500">How Important</p>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedWebhook.priority)} mt-1 inline-block`}>
                {selectedWebhook.priority}
              </span>
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors text-sm">
              Test
            </button>
            <button className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-2xl transition-colors text-sm">
              View Logs
            </button>
            <button className="px-4 py-2 border border-red-300 hover:bg-red-50 text-red-700 rounded-2xl transition-colors text-sm">
              Turn Off
            </button>
          </div>
        </div>
      )}
    </div>
  );
}