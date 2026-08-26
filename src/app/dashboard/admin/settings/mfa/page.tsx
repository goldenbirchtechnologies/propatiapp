'use client';

import { useUser } from '@clerk/nextjs';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui';

export default function securitymfasettingspropatiPage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >

      <ErrorBoundary>

      <div className="space-y-6">
        <section className="rounded-2xl border border-white/[0.08] bg-zinc-900 p-6 shadow-none">
          <h1 className="text-2xl font-bold text-white">Security Mfa Settings</h1>
          <p className="text-zinc-500 mt-1">Security & MFA Settings | EstateVerify EstateVerify Admin Console dashboard Overview domain Properties payments Transact...</p>
        </section>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="glass-card">
            <div className="px-6 py-5 border-b border-white/[0.08]"><h3 className="text-lg font-semibold text-white">Security &amp; Privacy</h3></div>
            <div className="p-6"><p className="text-sm text-zinc-500">Content from security_mfa_settings_propati.</p></div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="default">Enable</Button>
          <Button variant="default">Setup</Button>
          <Button variant="default">Setup</Button>
          <Button variant="default">Save New Password</Button>
          <Button variant="default">View Codes</Button>
        </div>
        <div className="glass-card">
          <div className="p-6 pt-6">
            <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-500">
              <li>Admin Console</li>
              <li>Manage your account security, multi-factor authentication, and active sessions.</li>
              <li>Protect your account with an additional layer of security beyond your password.</li>
              <li>Use Google Authenticator or Microsoft Authenticator to generate codes.</li>
              <li>Receive a code via text message to your registered phone number.</li>
              <li>Get backup codes sent to your primary email address.</li>
              <li>Generate a set of one-time codes to access your account if you lose your phone or MFA device.</li>
              <li>Account Health: Fair</li>
            </ul>
          </div>
        </div>
        <div className="glass-card">
          <div className="p-6 pt-6">
            <p className="text-sm text-zinc-500">This page was ported from the reference design: <strong>security_mfa_settings_propati.html</strong></p>
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
