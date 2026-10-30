'use client';

import { useEffect, useState } from 'react';
import { Bell, Shield, Lock, User, Settings, Save, Loader2, Eye, EyeOff, Smartphone, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

type NotificationPrefs = {
  email: boolean;
  sms: boolean;
  whatsapp: boolean;
  inapp: boolean;
  types: Record<string, boolean>;
};

export default function TenantSettingsClient({ initialUser }: { initialUser: { fullName: string; email: string; phone: string | null } }) {
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs | null>(null);
  const [notifSaving, setNotifSaving] = useState(false);
  const [privacy, setPrivacy] = useState({ profileVisible: true, shareData: false, analytics: true });
  const [form, setForm] = useState({ fullName: initialUser.fullName, phone: initialUser.phone || '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/users/notification-preferences')
      .then((r) => r.json())
      .then((j) => { if (j.success && j.data) setNotifPrefs(j.data as NotificationPrefs); })
      .catch(() => {});
  }, []);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/users/me/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: form.fullName.trim() || undefined, phone: form.phone.trim() || null }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to save');
      toast.success('Account settings saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleNotifSave = async () => {
    if (!notifPrefs) return;
    setNotifSaving(true);
    try {
      const res = await fetch('/api/users/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notifPrefs),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Failed to save preferences');
      toast.success('Notification preferences saved');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setNotifSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold tracking-widest text-zinc-500">
        <span>DASHBOARD</span><span className="text-zinc-300 dark:text-zinc-700">/</span>
        <span>ACCOUNT &amp; SETTINGS</span><span className="text-zinc-300 dark:text-zinc-700">/</span>
        <span className="text-primary dark:text-[#4edea3]">SETTINGS</span>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Settings &amp; Tenancy Governance</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Manage account, notification dispatch, privacy, and security sessions.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Account Settings */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><User className="h-5 w-5 text-primary" /> Account Settings &amp; Personal Profile</h3>
          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Phone</Label>
              <Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={initialUser.email} disabled />
            </div>
            <Button onClick={handleProfileSave} disabled={saving} className="bg-primary hover:bg-primary text-white">
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saving ? 'Saving…' : 'Save Account Settings'}
            </Button>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Bell className="h-5 w-5 text-primary" /> Notifications &amp; Alerts Dispatch</h3>
          {!notifPrefs ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading preferences…</p>
          ) : (
            <>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {(['email', 'sms', 'whatsapp', 'inapp'] as const).map((k) => (
                  <label key={k} className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-4 py-3">
                    <span className="text-sm font-medium capitalize text-zinc-900 dark:text-white">{k === 'inapp' ? 'In-app' : k}</span>
                    <Switch checked={!!notifPrefs[k]} onCheckedChange={(v) => setNotifPrefs((prev) => (prev ? { ...prev, [k]: v } : prev))} />
                  </label>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold tracking-widest text-zinc-500">TYPES</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {Object.keys(notifPrefs.types).map((t) => (
                    <label key={t} className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-4 py-2.5 text-sm">
                      <span className="capitalize text-zinc-700 dark:text-zinc-300">{t.replace(/_/g, ' ')}</span>
                      <Switch checked={!!notifPrefs.types[t]} onCheckedChange={(v) => setNotifPrefs((prev) => (prev ? { ...prev, types: { ...prev.types, [t]: v } } : prev))} />
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleNotifSave} disabled={notifSaving} className="mt-4 bg-primary hover:bg-primary text-white">
                {notifSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {notifSaving ? 'Saving…' : 'Save Preferences'}
              </Button>
            </>
          )}
        </div>

        {/* Privacy */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Eye className="h-5 w-5 text-primary" /> Privacy &amp; Data Governance</h3>
          <div className="mt-4 space-y-3">
            {[
              { key: 'profileVisible', label: 'Profile visible to landlords' },
              { key: 'shareData', label: 'Share anonymized usage data' },
              { key: 'analytics', label: 'Enable analytics tracking' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-4 py-3">
                <span className="text-sm font-medium text-zinc-900 dark:text-white">{label}</span>
                <Switch checked={privacy[key as keyof typeof privacy]} onCheckedChange={(v) => setPrivacy((p) => ({ ...p, [key]: v }))} />
              </label>
            ))}
          </div>
        </div>

        {/* Security quick view */}
        <div className="rounded-xl border border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900/50 p-6">
          <h3 className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white"><Lock className="h-5 w-5 text-primary" /> Security &amp; Sessions Quick View</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /><span className="text-sm font-medium text-zinc-900 dark:text-white">Two-Factor Authentication</span></div>
              <span className="text-xs text-zinc-500">Manage in Security tab</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-zinc-50 dark:bg-white/[0.04] px-4 py-3">
              <div className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /><span className="text-sm font-medium text-zinc-900 dark:text-white">Active Sessions</span></div>
              <span className="text-xs text-zinc-500">Current browser</span>
            </div>
            <Button asChild variant="outline" size="sm" className="mt-2"><a href="/dashboard/tenant/profile">Open Full Profile</a></Button>
          </div>
        </div>
      </div>
    </div>
  );
}