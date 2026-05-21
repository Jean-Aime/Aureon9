import { useState, useEffect } from 'react';
import { HiBell, HiMail, HiCog, HiCheckCircle, HiClock } from 'react-icons/hi';
import { adminPanelAPI } from '../../../api/client';

export default function AdminNotificationCenter() {
  const [emailSettings, setEmailSettings] = useState({
    verificationReview: true,
    approved: true,
    documentUpload: true,
    referral: true,
    withdrawal: true
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await adminPanelAPI.getConfig();
      if (response.data?.emailSettings) {
        setEmailSettings(response.data.emailSettings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleToggle = (key) => {
    setEmailSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await adminPanelAPI.updateEmailSettings(emailSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const notificationOptions = [
    { key: 'verificationReview', label: 'When someone needs verification review', enabled: emailSettings.verificationReview },
    { key: 'approved', label: 'When someone gets approved', enabled: emailSettings.approved },
    { key: 'documentUpload', label: 'When someone uploads a document', enabled: emailSettings.documentUpload },
    { key: 'referral', label: 'When someone refers a friend', enabled: emailSettings.referral },
    { key: 'withdrawal', label: 'When someone withdraws money', enabled: emailSettings.withdrawal }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notification Center</h2>
          <p className="text-slate-600 mt-1">Turn email notifications on or off</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Email Notifications</h3>
        
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div key={option.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{option.label}</div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(option.key)}
                  className={`px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                    option.enabled
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {option.enabled ? (
                    <span className="flex items-center gap-2">
                      <HiCheckCircle /> ON
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <HiClock /> OFF
                    </span>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-2xl transition-colors font-medium"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
          {saved && (
            <div className="flex items-center gap-2 text-slate-700">
              <HiCheckCircle className="text-xl" />
              <span className="text-sm font-medium">Settings saved!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
