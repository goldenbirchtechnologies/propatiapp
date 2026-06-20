'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LayoutDashboard, FileText, MessageSquare, Bell, Settings } from 'lucide-react';

const quickLinks = [
  { href: '/dashboard/estate-manager/portfolio', label: 'Portfolio', Icon: LayoutDashboard },
  { href: '/dashboard/estate-manager/ledger', label: 'Ledger', Icon: FileText },
  { href: '/dashboard/estate-manager/maintenance', label: 'Maintenance', Icon: MessageSquare },
  { href: '/dashboard/estate-manager/team', label: 'Team', Icon: Settings },
  { href: '/dashboard/estate-manager/subscription', label: 'Subscription', Icon: Settings },
];

export default function EstateManagerLanding() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-foreground">Estate Manager</h1>
        <p className="text-muted-foreground mt-1">Maintain portfolio control and operations.</p>
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
