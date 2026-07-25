'use client';

import { useState } from 'react';
import ProfileShell from '@/components/profiles/ProfileShell';
import ProfileHeader from '@/components/profiles/ProfileHeader';
import ProfileForm from '@/components/profiles/ProfileForm';
import ProfileSecurity from '@/components/profiles/ProfileSecurity';
import ProfileNotifications from '@/components/profiles/ProfileNotifications';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Shield } from 'lucide-react';
import { useKycStatus } from '@/lib/dojah-client';
import KycVerificationCard from '@/components/verification/KycVerificationCard';

export default function EstateManagerProfilePage() {
  const [form, setForm] = useState({ fullName: 'Estate Manager', email: 'estate@propati.ng', phone: '0803 456 7890', company: 'EstatePro Mgmt' });
  const { data: kyc, reload } = useKycStatus();
  const [notifications, setNotifications] = useState({
    maintenanceTicket: { enabled: true, label: 'Maintenance tickets', description: 'Get notified when new maintenance tickets are created' },
    serviceChargeReminder: { enabled: true, label: 'Service charge reminders', description: 'Get reminded before service charge due dates' },
    utilityReports: { enabled: false, label: 'Utility reports', description: 'Get weekly utility consumption summaries' },
    onboardingAlert: { enabled: true, label: 'Tenant onboarding', description: 'Get notified when a new tenant requests onboarding' },
  });

  const toggleNotification = (id: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [id]: { ...prev[id as keyof typeof prev], enabled: value } }));
  };

  const profileFields = [
    { name: 'fullName', label: 'Full Name', value: form.fullName, onChange: (v: string) => setForm({ ...form, fullName: v }) },
    { name: 'email', label: 'Email', type: 'email', value: form.email, onChange: (v: string) => setForm({ ...form, email: v }) },
    { name: 'phone', label: 'Phone', type: 'tel', value: form.phone, onChange: (v: string) => setForm({ ...form, phone: v }) },
    { name: 'company', label: 'Management Company', value: form.company, onChange: (v: string) => setForm({ ...form, company: v }) },
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <ProfileShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName={form.fullName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">My Profile</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage estate management account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileForm
              title="Company Information"
              description="Update your company and contact details."
              fields={profileFields}
              submitLabel="Save Changes"
              onSubmit={handleProfileSubmit}
            />
            <ProfileSecurity
              title="Verification"
              description="Your estate management firm verification status."
              tier="tier_2"
              status="pending"
              nextAction="Submit CAC documents to complete verification."
            />
            <ProfileNotifications
              title="Notifications"
              description="Manage alerts for your portfolio operations."
              items={[
                { id: 'maintenanceTicket', ...notifications.maintenanceTicket, onToggle: toggleNotification },
                { id: 'serviceChargeReminder', ...notifications.serviceChargeReminder, onToggle: toggleNotification },
                { id: 'utilityReports', ...notifications.utilityReports, onToggle: toggleNotification },
                { id: 'onboardingAlert', ...notifications.onboardingAlert, onToggle: toggleNotification },
              ]}
            />

            <KycVerificationCard
              status={kyc?.status || 'not_started'}
              onVerified={(result) => {
                if (result.success) reload();
              }}
            />
          </div>
          <div>
            <ProfileHeader
              fullName={form.fullName}
              role="estate_manager"
              joinDate="2026"
              verifyBadge={{ label: 'Firm Pending', icon: <Shield className="h-3 w-3" /> }}
            />
          </div>
        </div>
      </div>
    </ProfileShell>
  );
}
