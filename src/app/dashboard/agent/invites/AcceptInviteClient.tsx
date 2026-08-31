'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Loader2 } from 'lucide-react';
import type { AgentInvite } from '@/lib/api';
import { apiEndpoints } from '@/lib/api';

type Props = {
  invites: AgentInvite[];
  email: string;
};

export default function AcceptInviteClient({ invites, email }: Props) {
  const router = useRouter();
  const [pending, setPending] = useState<AgentInvite[]>([]);
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    setPending(
      invites.filter((invite) => invite.status === 'pending' && invite.email.toLowerCase() === email.toLowerCase())
    );
  }, [invites, email]);

  const accept = async (id: string) => {
    setActionId(id);
    try {
      const res = await apiEndpoints.agentInvites.accept(id);
      const data = res as { success?: boolean; assignedListings?: unknown[] };
      if (data?.success) {
        toast({ title: 'Invitation accepted', description: 'Redirecting to your properties...' });
        router.push('/dashboard/agent/properties');
      } else {
        toast({ title: 'Failed to accept invite', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Failed to accept invite:', error);
      toast({ title: 'Failed to accept invite', variant: 'destructive' });
    } finally {
      setActionId(null);
    }
  };

  if (pending.length === 0) {
    return (
      <Card className="p-6 border border-white/[0.08]">
        <p className="text-sm text-zinc-400">
          You don&apos;t have any pending invites. You can still use all agent features and be assigned directly by landlords.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((invite) => (
        <Card key={invite.id} className="p-6 border border-white/[0.08]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                <p className="font-semibold text-emerald-400 truncate" title={invite.sender?.fullName || 'a landlord'}>
                  Invitation from {invite.sender?.fullName || 'a landlord'}
                </p>
              </div>
              <p className="text-sm text-zinc-400">
                {invite.sender?.fullName || 'A landlord'} invited you to manage their listings. Accepting will add you as their agent.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-white/10 text-zinc-300">
                  {(invite as any).scope === 'all' ? 'All properties' : 'Specific properties'}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={() => accept(invite.id)}
                disabled={actionId === invite.id}
              >
                {actionId === invite.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Accept'
                )}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
