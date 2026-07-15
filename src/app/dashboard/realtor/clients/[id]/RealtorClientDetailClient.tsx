'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
import MaterialIcon from '@/components/icons/material-icon';

  ArrowLeft,
  Users,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Home,
  MessageSquare,
  UserPlus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

type Client = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: string;
  profileBio: string | null;
  createdAt: string;
  deals: {
    id: string;
    property: string;
    value: number;
    status: string;
    createdAt: string;
  }[];
};

const statusConfig: Record<string, { class: string; label: string }> = {
  draft: { class: 'tag-amber', label: 'Draft' },
  pending_landlord: { class: 'tag-blue', label: 'Pending Landlord' },
  pending_tenant: { class: 'tag-blue', label: 'Pending Tenant' },
  tenant_signed: { class: 'tag-teal', label: 'Tenant Signed' },
  landlord_signed: { class: 'tag-teal', label: 'Landlord Signed' },
  fully_signed: { class: 'tag-green', label: 'Fully Signed' },
  terminated: { class: 'tag-red', label: 'Terminated' },
  expired: { class: 'tag-gray', label: 'Expired' },
};

export default function RealtorClientDetailClient({ client }: { client: Client }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleMessage = () => {
    startTransition(async () => {
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: client.id, type: 'direct' }),
        });
        if (!res.ok) throw new Error();
        toast.success('Conversation started');
        router.push('/dashboard/[role]/messages');
      } catch {
        toast.error('Could not start conversation');
      }
    });
  };

  const activeDeals = client.deals.length;
  const totalValue = client.deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
        <Link href="/dashboard/agent" className="hover:underline">Dashboard</Link>
        <MaterialIcon name="/" className="material-symbols-outlined" />
        <Link href="/dashboard/agent/clients" className="hover:underline">Clients</Link>
        <MaterialIcon name="/" className="material-symbols-outlined" />
        <span style={{ color: 'var(--text)' }} className="font-medium">{client.fullName}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agent/clients"
            className="p-2 rounded-lg hover:bg-surface-container"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
            >
              {client.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
                {client.fullName}
              </h1>
              <p className="text-sm" style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
                Client since {new Date(client.createdAt).toLocaleDateString('en-NG', { month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={handleMessage} disabled={isPending}>
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
          Message
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Total Deals</p>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{activeDeals}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Total Value</p>
            <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>
              ₦{(totalValue / 1000000).toFixed(1)}M
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Role</p>
            <p className="text-lg font-heading font-bold capitalize" style={{ color: 'var(--text)' }}>{client.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs" style={{ color: 'var(--muted)' }}>Joined</p>
            <p className="text-lg font-heading font-bold" style={{ color: 'var(--text)' }}>
              {new Date(client.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Details */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading font-bold text-lg" style={{ color: 'var(--text)' }}>
              <Users className="inline w-5 h-5 mr-2" style={{ color: 'var(--accent)' }} />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4" style={{ color: 'var(--muted)' }} />
              <span style={{ color: 'var(--text)' }}>{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                <span style={{ color: 'var(--text)' }}>{client.phone}</span>
              </div>
            )}
            {client.profileBio && (
              <div className="pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Notes</p>
                <p className="text-sm" style={{ color: 'var(--text)' }}>{client.profileBio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deals History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-heading font-bold text-lg" style={{ color: 'var(--text)' }}>
              <DollarSign className="inline w-5 h-5 mr-2" style={{ color: 'var(--accent)' }} />
              Deals History
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.deals.length === 0 ? (
              <div className="text-center py-10">
                <Home className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--muted)', opacity: 0.5 }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>No deals yet</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>Deals associated with this client will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {client.deals.map((deal) => {
                  const cfg = statusConfig[deal.status] || { class: 'tag-gray', label: deal.status };
                  return (
                    <Link
                      key={deal.id}
                      href={`/dashboard/agent/deals/${deal.id}`}
                      className="flex items-center justify-between p-3 rounded-lg transition-colors"
                      style={{ background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                          <Home className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{deal.property}</p>
                          <p className="text-xs" style={{ color: 'var(--muted)' }}>
                            {new Date(deal.createdAt).toLocaleDateString('en-NG', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>₦{deal.value.toLocaleString()}</p>
                        <span className={`tag ${cfg.class} text-xs`}>{cfg.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
