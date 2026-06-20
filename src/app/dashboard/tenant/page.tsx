'use client';

import Link from 'next/link';
import { LayoutDashboard, Home, FileText, MessageSquare, Bell, Settings, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const quickLinks = [
  { href: '/dashboard/tenant/search', label: 'Search properties', Icon: Search },
  { href: '/dashboard/tenant/applications', label: 'Applications', Icon: FileText },
  { href: '/dashboard/tenant/agreements', label: 'Agreements', Icon: Home },
  { href: '/dashboard/tenant/payments', label: 'Payments', Icon: LayoutDashboard },
  { href: '/dashboard/tenant/saved', label: 'Saved listings', Icon: Settings },
];

export default function TenantDashboardLanding() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Tenant workspace</h1>
        <p className="text-muted-foreground mt-1">Track your search, tenancy, and payments.</p>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map(({ href, label, Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-sm"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon size={18} />
            </span>
            <span className="text-sm font-medium text-foreground">{label}</span>
          </Link>
        ))}
        <Link
          href="/dashboard/messages"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <MessageSquare size={18} />
          </span>
          <span className="text-sm font-medium text-foreground">Messages</span>
        </Link>
        <Link
          href="/dashboard/notifications"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bell size={18} />
          </span>
          <span className="text-sm font-medium text-foreground">Notifications</span>
        </Link>
        <Link
          href="/dashboard/settings/notifications"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Settings size={18} />
          </span>
          <span className="text-sm font-medium text-foreground">Settings</span>
        </Link>
      </section>
    </div>
  );
}
