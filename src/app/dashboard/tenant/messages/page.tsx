import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import Home from '@/components/ui/chat-template';
import { SidebarProvider } from '@/components/blocks/sidebar';
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
        <div className="space-y-6">
          {assignedAgents.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedAgents.map((agent) => (
                <div key={agent.id} className="glass-card border-white/[0.08] bg-zinc-950/50">
                  <div className="px-6 py-5 border-b border-white/[0.08] pb-2">
                    <h3 className="text-lg font-semibold text-white text-sm font-label-sm uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#00ff66]" />
                      Assigned Agent
                    </h3>
                  </div>
                  <div className="p-6">
                    <p className="text-white font-medium">{agent.fullName}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <SidebarProvider>
            <Home userId={user.id} userName={user.fullName} userRole={user.role} />
          </SidebarProvider>
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
