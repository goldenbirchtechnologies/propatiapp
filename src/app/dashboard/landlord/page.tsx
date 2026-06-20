'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Home, FileText, MessageSquare, Bell, Settings, Search } from 'lucide-react';
import { Building2 } from 'lucide-react';

const quickLinks = [
  { href: '/dashboard/landlord/properties/new', label: 'Add a property', Icon: Home },
  { href: '/dashboard/landlord/agreements', label: 'Agreements', Icon: FileText },
  { href: '/dashboard/landlord/applications', label: 'Applications', Icon: LayoutDashboard },
  { href: '/dashboard/landlord/messages', label: 'Messages', Icon: MessageSquare },
  { href: '/dashboard/landlord/rent', label: 'Rent payments', Icon: Settings },
];

export default function TenantDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Landlord workspace</h1>
            <p className="text-muted-foreground mt-1">Manage your portfolio at a glance.</p>
          </div>
          <Building2 className="text-muted-foreground" />
        </div>
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
          href="/dashboard/tenant/search"
          className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/60 hover:shadow-sm"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Search size={18} />
          </span>
          <span className="text-sm font-medium text-foreground">Browse listings</span>
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
