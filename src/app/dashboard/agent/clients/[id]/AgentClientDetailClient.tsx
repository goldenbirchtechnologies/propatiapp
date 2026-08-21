'use client';

import { ArrowLeft, Mail, Phone, User, Home } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Deal = {
  id: string;
  property: string;
  status: string;
  createdAt: string;
};

type Client = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  profileBio: string | null;
  createdAt: string;
  deals: Deal[];
};

export default function AgentClientDetailClient({ client }: { client: Client }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/agent/clients"
          className="p-2 rounded-xl hover:bg-surface-container text-neutral-400"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            }}
          >
            {client.fullName.charAt(0)}
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm font-bold text-white">
              {client.fullName}
            </h1>
            <p className="text-sm text-neutral-400">
              {client.role === 'landlord' ? 'Seller' : 'Buyer'} · Client since{' '}
              {new Date(client.createdAt).toLocaleDateString('en-NG', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Contact Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span className="text-white">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-neutral-400" />
                <span className="text-white">{client.phone}</span>
              </div>
            )}
            {client.profileBio && (
              <div className="pt-2 border-t border-[#262626]">
                <p className="text-xs font-medium mb-1 text-neutral-400">
                  Notes
                </p>
                <p className="text-sm text-white">{client.profileBio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-[rgba(23,23,23,0.4)] backdrop-blur border border-[#262626] rounded-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Related Deals
            </CardTitle>
          </CardHeader>
          <CardContent>
            {client.deals.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-6">
                No deals yet
              </p>
            ) : (
              <div className="space-y-3">
                {client.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[#262626]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {deal.property}
                      </p>
                      <p className="text-xs text-neutral-400 capitalize">
                        {deal.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <p className="text-xs text-neutral-400">
                      {new Date(deal.createdAt).toLocaleDateString('en-NG', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
