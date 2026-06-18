import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import AuditLogsClient from './AuditLogsClient';

export default async function AuditLogsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'admin') {
    redirect('/dashboard');
  }

  // Mock audit logs data - In production, this would come from a database
  const mockAuditLogs = [
    {
      id: '1',
      admin: 'Admin User',
      action: 'Verified Listing',
      target: 'Listing #12345',
      details: 'Approved Layer 5 verification',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
      id: '2',
      admin: 'Admin User',
      action: 'Suspended User',
      target: 'User #67890',
      details: 'Reason: Fraudulent activity',
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
    },
    {
      id: '3',
      admin: 'Admin User',
      action: 'Dismissed Flags',
      target: 'Listing #54321',
      details: 'All flags were invalid',
      timestamp: new Date(Date.now() - 1000 * 60 * 120),
    },
    {
      id: '4',
      admin: 'Admin User',
      action: 'Changed Role',
      target: 'User #11111',
      details: 'Changed from tenant to agent',
      timestamp: new Date(Date.now() - 1000 * 60 * 180),
    },
    {
      id: '5',
      admin: 'Admin User',
      action: 'Rejected Verification',
      target: 'Listing #99999',
      details: 'Invalid documentation provided',
      timestamp: new Date(Date.now() - 1000 * 60 * 240),
    },
  ];

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <AuditLogsClient auditLogs={mockAuditLogs} />
    </DashboardShell>
  );
}
