'use client';
import { useState } from 'react';
import ProfileShell from '@/components/profiles/ProfileShell';
import ProfileHeader from '@/components/profiles/ProfileHeader';
import ProfileForm from '@/components/profiles/ProfileForm';
import ProfileSecurity from '@/components/profiles/ProfileSecurity';
import ProfileNotifications from '@/components/profiles/ProfileNotifications';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { Shield } from 'lucide-react';

export default function AdminProfilePage() {
  const [form, setForm] = useState({ fullName: 'Admin User', email: 'admin@propati.ng', phone: '0803 456 7890', role: 'Administrator' });
  const [notifications, setNotifications] = useState({
    disputeAssignment: { enabled: true, label: 'Dispute assignments', description: 'Get notified when a dispute is assigned to you' },
    agreementReview: { enabled: true, label: 'Agreement reviews', description: 'Get notified when a new agreement is ready for review' },
    systemAlerts: { enabled: true, label: 'System alerts', description: 'Get notified about system-level issues' },
    revenueMilestones: { enabled: false, label: 'Revenue milestones', description: 'Get notified when revenue hits monthly target' },
  });

  const toggleNotification = (id: string, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [id]: { ...prev[id as keyof typeof prev], enabled: value } }));
  };

  const profileFields = [
    { name: 'fullName', label: 'Full Name', value: form.fullName, onChange: (v: string) => setForm({ ...form, fullName: v }) },
    { name: 'email', label: 'Email', type: 'email', value: form.email, onChange: (v: string) => setForm({ ...form, email: v }) },
    { name: 'phone', label: 'Phone', type: 'tel', value: form.phone, onChange: (v: string) => setForm({ ...form, phone: v }) },
    { name: 'role', label: 'Role', value: form.role, onChange: (v: string) => setForm({ ...form, role: v }) },
  ];

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <ProfileShell navigation={ADMIN_NAVIGATION} userRole="admin" userName={form.fullName}>
      <div className="space-y-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-[var(--text-primary)]">My Profile</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">Manage administrative account settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ProfileForm
              title="Personal Information"
              description="Update your account details and contact info."
              fields={profileFields}
              submitLabel="Save Changes"
              onSubmit={handleProfileSubmit}
            />
            <ProfileSecurity
              title="Security"
              description="Account verification and access controls."
              tier="tier_3"
              status="verified"
              nextAction="Complete 2FA setup for enhanced security."
            />
            <ProfileNotifications
              title="Notifications"
              description="Manage how you receive alerts and updates."
              items={[
                { id: 'disputeAssignment', ...notifications.disputeAssignment, onToggle: toggleNotification },
                { id: 'agreementReview', ...notifications.agreementReview, onToggle: toggleNotification },
                { id: 'systemAlerts', ...notifications.systemAlerts, onToggle: toggleNotification },
                { id: 'revenueMilestones', ...notifications.revenueMilestones, onToggle: toggleNotification },
              ]}
            />
          </div>
          <div>
            <ProfileHeader
              fullName={form.fullName}
              role={form.role}
              joinDate="2025"
              verifyBadge={{ label: 'Verified Admin', icon: <Shield className="h-3 w-3" /> }}
            />
          </div>
        </div>
      </div>
    </ProfileShell>
  );
}
