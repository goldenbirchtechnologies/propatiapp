import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import UnifiedMessagesClient from '@/components/messaging/UnifiedMessagesClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck } from 'lucide-react';

export default async function TenantMessagesPage() {
  const user = await getCurrentUserWithProfile();
  if (!user) redirect('/sign-in');
  if (user.role !== 'tenant') redirect('/dashboard');

  const conversationsWithAgent = await prisma.conversation.findMany({
    where: {
      tenantId: user.id,
      agentId: { not: null },
    },
    include: {
      agent: { select: { id: true, fullName: true } },
    },
    distinct: ['agentId'],
    take: 10,
  });

  const assignedAgents = Array.from(
    new Map(
      conversationsWithAgent
        .filter((c) => c.agent)
        .map((c) => [c.agent!.id, c.agent!])
    ).values()
  );

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <ErrorBoundary>
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
          {assignedAgents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedAgents.map((agent) => (
                <Card key={agent.id} className="border-[#262626] bg-obsidian-800/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-label-md uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#00ff66]" />
                      Assigned Agent
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white font-medium">{agent.fullName}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <UnifiedMessagesClient userId={user.id} userName={user.fullName} userRole={user.role} />
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
