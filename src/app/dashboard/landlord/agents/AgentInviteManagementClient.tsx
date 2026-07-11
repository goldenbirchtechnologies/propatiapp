'use client';

import { useEffect, useState } from 'react';
import { apiEndpoints } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { AgentInvite } from '@/lib/api';

export default function AgentInviteManagementClient() {
  const [invites, setInvites] = useState<AgentInvite[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await apiEndpoints.agentInvites.list({ page: 1, limit: 50 });
      setInvites(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load invites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    try {
      await apiEndpoints.agentInvites.create({ email });
      setEmail('');
      await load();
    } catch (error) {
      console.error('Failed to send invite:', error);
    } finally {
      setSending(false);
    }
  };

  const revoke = async (id: string) => {
    setActionId(id);
    try {
      await apiEndpoints.agentInvites.revoke(id);
      await load();
    } catch (error) {
      console.error('Failed to revoke invite:', error);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h4 className="font-heading text-primary mb-4">Invite New Agent</h4>
        <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="agent@example.com"
            required
            className="flex-1"
          />
          <Button type="submit" disabled={sending} className="px-6">
            {sending ? 'Sending...' : 'Send Invite'}
          </Button>
        </form>
        <p className="text-sm text-on-surface-variant mt-3">
          Agents can still register directly without an invite. Invites help track who you brought onto the platform.
        </p>
      </Card>

      <Card className="p-6">
        <h4 className="font-heading text-primary mb-4">Sent Invites</h4>
        {loading ? (
          <p className="text-sm text-on-surface-variant">Loading invites...</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No invites yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Email</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Status</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Sent</th>
                  <th className="px-4 py-3 font-label-sm text-on-surface-variant uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {invites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-surface-container-low/60">
                    <td className="px-4 py-3 text-sm">{invite.email}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={invite.status === 'accepted' ? 'default' : invite.status === 'revoked' ? 'destructive' : 'secondary'}>
                        {invite.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant">
                      {new Date(invite.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {invite.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revoke(invite.id)}
                          disabled={actionId === invite.id}
                        >
                          {actionId === invite.id ? 'Revoking...' : 'Revoke'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
