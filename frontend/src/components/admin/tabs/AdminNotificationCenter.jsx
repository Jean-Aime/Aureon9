import { useState, useEffect } from 'react';
import { HiBell, HiMail, HiCog, HiCheckCircle, HiClock } from 'react-icons/hi';
import { adminPanelAPI } from '../../../api/client';

export default function AdminNotificationCenter() {
  const [channels, setChannels] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingChannel, setEditingChannel] = useState(null);

  useEffect(() => {
    fetchNotificationConfig();
  }, []);

  const fetchNotificationConfig = async () => {
    try {
      setLoading(true);
      const response = await adminPanelAPI.getConfig();
      setChannels(response.data?.channels || []);
      setTemplates(response.data?.templates || []);
    } catch (error) {
      console.error('Failed to fetch notification config:', error);
      setChannels([]);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateChannel = async (channelId, updates) => {
    try {
      const updatedChannels = channels.map(ch =>
        ch.id === channelId ? { ...ch, ...updates } : ch
      );
      await adminPanelAPI.updateChannels(updatedChannels);
      setChannels(updatedChannels);
      setEditingChannel(null);
    } catch (error) {
      console.error('Failed to update channel:', error);
    }
  };

  const getChannelColor = (type) => {
    switch (type) {
      case 'EMAIL': return 'bg-slate-700 text-white';
      case 'IN_APP': return 'bg-slate-600 text-white';
      case 'SMS': return 'bg-slate-500 text-white';
      case 'PUSH': return 'bg-slate-800 text-white';
      default: return 'bg-slate-400 text-white';
    }
  };

  const getEventColor = (event) => {
    switch (event) {
      case 'VERIFICATION_APPROVED': return 'bg-slate-700 text-white';
      case 'VERIFICATION_REJECTED': return 'bg-slate-600 text-white';
      case 'DOCUMENT_REQUIRED': return 'bg-slate-500 text-white';
      case 'TIER_UPGRADED': return 'bg-slate-800 text-white';
      case 'REWARD_CREDITED': return 'bg-slate-400 text-white';
      default: return 'bg-slate-300 text-slate-900';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notification Center</h2>
          <p className="text-slate-600 mt-1">Configure notification channels and templates</p>
        </div>
        <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl transition-colors">
          <HiCog className="inline mr-2" />
          Add Channel
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiBell className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{channels.length}</div>
              <div className="text-sm text-slate-600">Active Channels</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiMail className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">{templates.length}</div>
              <div className="text-sm text-slate-600">Templates</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiCheckCircle className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {channels.filter(ch => ch.enabled).length}
              </div>
              <div className="text-sm text-slate-600">Enabled</div>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <HiClock className="text-2xl text-slate-600" />
            <div>
              <div className="text-2xl font-bold text-slate-900">
                {channels.filter(ch => !ch.enabled).length}
              </div>
              <div className="text-sm text-slate-600">Disabled</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Notification Channels</h3>

        {loading ? (
          <div className="text-center py-12 text-slate-600">Loading channels...</div>
        ) : channels.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No channels configured</div>
        ) : (
          <div className="space-y-4">
            {channels.map((channel) => (
              <div key={channel.id} className="border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getChannelColor(channel.type)}`}>
                      {channel.type}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-900">{channel.name || channel.type}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      <input
                        type="checkbox"
                        checked={channel.enabled}
                        onChange={(e) => handleUpdateChannel(channel.id, { enabled: e.target.checked })}
                        className="rounded border-slate-300"
                      />
                      Enabled
                    </label>
                    <button
                      onClick={() => setEditingChannel(editingChannel === channel.id ? null : channel.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors"
                    >
                      {editingChannel === channel.id ? 'Cancel' : 'Edit'}
                    </button>
                  </div>
                </div>

                {editingChannel === channel.id ? (
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Provider</label>
                      <input
                        type="text"
                        value={channel.provider || ''}
                        onChange={(e) => handleUpdateChannel(channel.id, { provider: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600 mb-1 block">Priority</label>
                      <select
                        value={channel.priority || 'MEDIUM'}
                        onChange={(e) => handleUpdateChannel(channel.id, { priority: e.target.value })}
                        className="w-full px-3 py-2 border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-500"
                      >
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-slate-600">Provider</div>
                      <div className="font-semibold text-slate-900">{channel.provider || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Priority</div>
                      <div className="font-semibold text-slate-900">{channel.priority || 'MEDIUM'}</div>
                    </div>
                    <div>
                      <div className="text-slate-600">Status</div>
                      <div className={`font-semibold ${channel.enabled ? 'text-slate-900' : 'text-slate-500'}`}>
                        {channel.enabled ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Notification Templates</h3>

        {templates.length === 0 ? (
          <div className="text-center py-12 text-slate-600">No templates configured</div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div key={template.id} className="border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventColor(template.eventType)}`}>
                      {template.eventType}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{template.name || template.eventType}</h4>
                      <p className="text-xs text-slate-600">{template.subject || 'No subject'}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-2xl transition-colors">
                    Edit Template
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
