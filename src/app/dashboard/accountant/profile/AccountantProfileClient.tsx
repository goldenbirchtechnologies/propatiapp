'use client';

import { useEffect, useState } from 'react';
import ProfileShell from '@/components/profiles/ProfileShell';
import ProfileHeader from '@/components/profiles/ProfileHeader';
import ProfileForm from '@/components/profiles/ProfileForm';
import ProfileSecurity from '@/components/profiles/ProfileSecurity';
import ProfileNotifications from '@/components/profiles/ProfileNotifications';
import { ACCOUNTANT_NAVIGATION } from '@/lib/navigation';
import { Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useUsers';

export default function AccountantProfilePage() {
  const { data: user } = useCurrentUser();
  const updateProfile = useUpdateProfile();

  // Seeded empty rather than with sample values: the form used to open showing
  // "accountant@propati.ng / 0803 456 7890", which is nobody's account.
  const [form, setForm] = useState({ fullName: '', email: '', phone: '' });
  const [notifications, setNotifications] = useState({
    paymentPosted: { enabled: true, label: 'Payment posted', description: 'Notified when a payment is posted' },
    invoiceIssued: { enabled: true, label: 'Invoice issued', description: 'Notified when a new invoice is generated' },
    receiptGenerated: { enabled: false, label: 'Receipt generated', description: 'Notified when a receipt is generated' },
    reportReady: { enabled: true, label: 'Report ready', description: 'Notified when scheduled reports are ready' },
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      fullName: user.fullName ?? '',
      email: user.email ?? '',
      phone: user.phone ?? '',
    });
  }, [user]);

  const toggleNotification = (id: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [id]: { ...prev[id as keyof typeof prev], enabled: value } }));
  };

  const profileFields = [
    { name: 'fullName', label: 'Full Name', value: form.fullName, onChange: (v: string) => setForm({ ...form, fullName: v }) },
    // Email is owned by Clerk; edits here would be silently discarded, so the
    // field is shown but not offered as an input.
    { name: 'email', label: 'Email (managed by your sign-in)', type: 'email', value: form.email, onChange: () => {} },
    { name: 'phone', label: 'Phone', type: 'tel', value: form.phone, onChange: (v: string) => setForm({ ...form, phone: v }) },
  ];

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync({
        fullName: form.fullName,
        phone: form.phone || undefined,
      });
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save your profile');
    }
  };

  return (
    <ProfileShell navigation={ACCOUNTANT_NAVIGATION} userRole="accountant" userName={form.fullName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text-zinc-900 dark:text-white)]">My Profile</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage your accountant account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileForm
              title="Account Information"
              description="Update your contact and firm details."
              fields={profileFields}
              submitLabel="Save Changes"
              onSubmit={handleProfileSubmit}
            />
            <ProfileSecurity
              title="Verification"
              description="Accountant verification and compliance status."
              tier="tier_2"
              status="pending"
              nextAction="Submit professional certification documents to complete verification."
            />
            <ProfileNotifications
              title="Notifications"
              description="Manage alerts for payments, invoices, and reports."
              items={[
                { id: 'paymentPosted', ...notifications.paymentPosted, onToggle: toggleNotification },
                { id: 'invoiceIssued', ...notifications.invoiceIssued, onToggle: toggleNotification },
                { id: 'receiptGenerated', ...notifications.receiptGenerated, onToggle: toggleNotification },
                { id: 'reportReady', ...notifications.reportReady, onToggle: toggleNotification },
              ]}
            />
          </div>
          <div>
            <ProfileHeader
              fullName={form.fullName}
              role="accountant"
              joinDate="2026"
              verifyBadge={{ label: 'Pending', icon: <Calculator className="h-3 w-3" /> }}
            />
          </div>
        </div>
      </div>
    </ProfileShell>
  );
}