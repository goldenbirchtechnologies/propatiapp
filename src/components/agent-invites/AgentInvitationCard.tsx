'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiEndpoints } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { AgentInvite } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

type Props = {
  email: string;
};

export default function AgentInvitationCard({ email }: Props) {
  const [invites, setInvites] = useState<AgentInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiEndpoints.agentInvites.list({ page: 1, limit: 20 });
      const invitePayload = res as { data?: AgentInvite[] } | AgentInvite[];
      setInvites(Array.isArray(invitePayload) ? invitePayload : invitePayload.data ?? []);
    } catch (error) {
      console.error('Failed to load invites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const accept = async (id: string) => {
    setActionId(id);
    try {
      await apiEndpoints.agentInvites.accept(id);
      toast({ title: 'Invitation accepted', description: 'Redirecting to your listings...' });
      router.push('/dashboard/agent/listings');
    } catch (error) {
      console.error('Failed to accept invite:', error);
      toast({ title: 'Failed to accept invite', variant: 'destructive' });
    } finally {
      setActionId(null);
    }
  };

  const pending = invites.filter((invite) => invite.status === 'pending' && invite.email.toLowerCase() === email.toLowerCase());

  if (loading) {
    return <p className="text-sm text-zinc-400">Loading invitations...</p>;
  }

  if (pending.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-sm text-zinc-400">
          You don&apos;t have unknown pending invites. You can still use all agent features and be assigned directly by landlords.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((invite) => (
        <Card key={invite.id} className="p-6 border-primary/20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-semibold text-emerald-400">Invitation from {invite.sender?.fullName || 'a landlord'}</p>
              <p className="text-sm text-zinc-400 mt-1">
                {invite.sender?.fullName || 'A landlord'} invited you to manage their listings. Accepting this will add you as their agent.
              </p>
              <p className="text-xs text-zinc-400 mt-2">
                Sent {new Date(invite.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">pending</Badge>
              <Button
                onClick={() => accept(invite.id)}
                disabled={actionId === invite.id}
                className="px-4"
              >
                {actionId === invite.id ? 'Accepting...' : 'Accept'}
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
