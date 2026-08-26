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
          className="p-2 rounded-xl hover:bg-zinc-900 text-zinc-500"
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
            <h1 className="font-headline-sm text-white font-bold text-white">
              {client.fullName}
            </h1>
            <p className="text-sm text-zinc-500">
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
        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <User className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Contact Details
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-zinc-500" />
              <span className="text-white">{client.email}</span>
            </div>
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span className="text-white">{client.phone}</span>
              </div>
            )}
            {client.profileBio && (
              <div className="pt-2 border-t border-white/[0.08]">
                <p className="text-xs font-medium mb-1 text-zinc-500">
                  Notes
                </p>
                <p className="text-sm text-white">{client.profileBio}</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass-card lg:col-span-2 bg-[rgba(23,23,23,0.4)] backdrop-blur border border-white/[0.08] rounded-xl">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Home className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              Related Deals
            </h3>
          </div>
          <div className="p-6">
            {client.deals.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-6">
                No deals yet
              </p>
            ) : (
              <div className="space-y-3">
                {client.deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08]"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {deal.property}
                      </p>
                      <p className="text-xs text-zinc-500 capitalize">
                        {deal.status.replace(/_/g, ' ')}
                      </p>
                    </div>
                    <p className="text-xs text-zinc-500">
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
          </div>
        </div>
      </div>
    </div>
  );
}
