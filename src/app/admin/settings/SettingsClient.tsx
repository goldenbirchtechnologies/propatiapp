'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Cog, Bell, Shield, Save, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { StatCard } from '@/components/admin/stat-card';
import { Users, Activity, AlertTriangle } from 'lucide-react';

interface SettingsClientProps {
  initialError?: string;
}

export default function SettingsClient({ initialError }: SettingsClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [error, setError] = useState<string | null>(initialError || null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [general, setGeneral] = useState({
    siteName: 'Propati',
    maintenanceMode: false,
    defaultLanguage: 'en',
    supportEmail: 'support@propati.com',
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    smsAlerts: false,
    pushNotifications: true,
    digestFrequency: 'daily',
  });

  const [security, setSecurity] = useState({
    requireTwoFactor: true,
    sessionTimeout: 30,
    allowRegistrations: true,
    maxLoginAttempts: 5,
  });

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setGeneral({ siteName: 'Propati', maintenanceMode: false, defaultLanguage: 'en', supportEmail: 'support@propati.com' });
    setNotifications({ emailAlerts: true, smsAlerts: false, pushNotifications: true, digestFrequency: 'daily' });
    setSecurity({ requireTwoFactor: true, sessionTimeout: 30, allowRegistrations: true, maxLoginAttempts: 5 });
    setSaved(false);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure platform settings and preferences.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <p className="text-red-800 font-medium">Unable to load page</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={() => {
              setError(null);
              router.refresh();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => router.push('/admin')} className="hover:text-foreground">
              Admin
            </button>
            <span>/</span>
            <span className="text-foreground font-medium">Settings</span>
          </nav>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleReset} disabled={saving}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {saved ? 'Saved!' : 'Save Changes'}
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex gap-6">
        <div className="w-[200px] flex-shrink-0">
          <TabsList className="flex flex-col h-auto w-full">
            <TabsTrigger value="general" className="justify-start w-full">
              <Cog className="h-4 w-4 mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="notifications" className="justify-start w-full">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="justify-start w-full">
              <Shield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="flex-1 space-y-6 mt-0">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Platform Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={general.siteName}
                  onChange={(e) => setGeneral({ ...general, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={general.supportEmail}
                  onChange={(e) => setGeneral({ ...general, supportEmail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultLanguage">Default Language</Label>
                <select
                  id="defaultLanguage"
                  value={general.defaultLanguage}
                  onChange={(e) => setGeneral({ ...general, defaultLanguage: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="en">English</option>
                  <option value="fr">French</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Quick Stats</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Total Admins" value={3} icon={Users} trendPositive />
              <StatCard title="System Uptime" value="99.9%" icon={Activity} trendPositive />
              <StatCard title="Disputes (Open)" value={12} icon={AlertTriangle} trendPositive={false} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="flex-1 space-y-6 mt-0">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Notification Channels</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Email Alerts</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Send email alerts for critical events</p>
                </div>
                <Switch
                  checked={notifications.emailAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, emailAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>SMS Alerts</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Send SMS for high-urgency issues</p>
                </div>
                <Switch
                  checked={notifications.smsAlerts}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, smsAlerts: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Push Notifications</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Browser push notifications</p>
                </div>
                <Switch
                  checked={notifications.pushNotifications}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="digestFrequency">Digest Frequency</Label>
                <select
                  id="digestFrequency"
                  value={notifications.digestFrequency}
                  onChange={(e) => setNotifications({ ...notifications, digestFrequency: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="realtime">Real-time</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="security" className="flex-1 space-y-6 mt-0">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Security Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Require Two-Factor Authentication</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>All admins must enable 2FA</p>
                </div>
                <Switch
                  checked={security.requireTwoFactor}
                  onCheckedChange={(checked) => setSecurity({ ...security, requireTwoFactor: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Allow New Registrations</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Allow new user sign-ups</p>
                </div>
                <Switch
                  checked={security.allowRegistrations}
                  onCheckedChange={(checked) => setSecurity({ ...security, allowRegistrations: checked })}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={security.sessionTimeout}
                    onChange={(e) => setSecurity({ ...security, sessionTimeout: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={security.maxLoginAttempts}
                    onChange={(e) => setSecurity({ ...security, maxLoginAttempts: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
