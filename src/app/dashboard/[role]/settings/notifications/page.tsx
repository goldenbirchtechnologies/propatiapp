'use client';

import { useState, useEffect } from 'react';
import { Loader2, Save, Bell, Mail, MessageSquare, Phone } from 'lucide-react';

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  inapp: boolean;
  types: {
    verification: boolean;
    agreement: boolean;
    payment: boolean;
    message: boolean;
    rent_due: boolean;
    maintenance: boolean;
    screening: boolean;
    system: boolean;
  };
}

export default function NotificationSettingsPage() {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users/notification-preferences');
      if (!response.ok) throw new Error('Failed to fetch preferences');

      const data = await response.json();
      setPreferences(data.data);
    } catch (error) {
      console.error('Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!preferences) return;

    try {
      setSaving(true);
      setSaveSuccess(false);

      const response = await fetch('/api/users/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) throw new Error('Failed to save preferences');

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleChannel = (channel: keyof Omit<NotificationPreferences, 'types'>) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [channel]: !preferences[channel],
    });
  };

  const toggleType = (type: keyof NotificationPreferences['types']) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      types: {
        ...preferences.types,
        [type]: !preferences.types[type],
      },
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-red-500">Failed to load notification preferences</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Notification Settings</h1>
        <p className="text-neutral-400">Manage how you receive notifications</p>
      </div>

      <div className="space-y-6">
        {/* Notification Channels */}
        <div className="bg-obsidian-800/30 rounded-lg border border-[#262626] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Notification Channels</h2>
          <p className="text-sm text-neutral-400 mb-6">
            Choose how you want to receive notifications
          </p>

          <div className="space-y-4">
            {/* In-App Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#262626] rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">In-App Notifications</p>
                  <p className="text-sm text-neutral-400">Receive notifications in the app</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.inapp}
                  onChange={() => toggleChannel('inapp')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-obsidian-800/30 after:border-[#262626] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Email Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#00ff66]" />
                </div>
                <div>
                  <p className="font-medium text-white">Email Notifications</p>
                  <p className="text-sm text-neutral-400">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.email}
                  onChange={() => toggleChannel('email')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-obsidian-800/30 after:border-[#262626] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* SMS Notifications */}
            <div className="flex items-center justify-between py-3 border-b border-[#262626]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#262626] rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">SMS Notifications</p>
                  <p className="text-sm text-neutral-400">Receive notifications via text message</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.sms}
                  onChange={() => toggleChannel('sms')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-obsidian-800/30 after:border-[#262626] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* WhatsApp Notifications */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#00ff66]" />
                </div>
                <div>
                  <p className="font-medium text-white">WhatsApp Notifications</p>
                  <p className="text-sm text-neutral-400">Receive notifications via WhatsApp</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences.whatsapp}
                  onChange={() => toggleChannel('whatsapp')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-obsidian-800/30 after:border-[#262626] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-obsidian-800/30 rounded-lg border border-[#262626] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Notification Types</h2>
          <p className="text-sm text-neutral-400 mb-6">
            Choose which types of notifications you want to receive
          </p>

          <div className="space-y-3">
            {Object.entries({
              verification: 'Verification Updates',
              agreement: 'Agreement Notifications',
              payment: 'Payment Notifications',
              message: 'New Messages',
              rent_due: 'Rent Due Reminders',
              maintenance: 'Maintenance Tickets',
              screening: 'Screening Updates',
              system: 'System Announcements',
            }).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between py-2">
                <span className="text-sm font-medium text-neutral-400">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.types[key as keyof NotificationPreferences['types']]}
                    onChange={() => toggleType(key as keyof NotificationPreferences['types'])}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-surface-container peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-obsidian-800/30 after:border-[#262626] after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between">
          {saveSuccess && (
            <p className="text-sm text-[#00ff66] font-medium">Settings saved successfully!</p>
          )}
          <div className="flex-1" />
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-primary hover:bg-primary text-on-primary font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
