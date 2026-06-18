import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import Link from 'next/link';

export default async function TenantDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'tenant') {
    redirect('/dashboard');
  }

  return (
    <DashboardShell
      navigation={TENANT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="space-y-8">
        {/* Welcome Header */}
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Welcome back, {user.fullName.split(' ')[0]}! 🏠
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Find your perfect home or manage your rental.
          </p>
        </div>

        {/* Purpose Switcher */}
        <div className="card p-6">
          <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>What are you looking for?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { key: 'rent', label: '🏠 Rent', desc: 'Long-term rentals' },
              { key: 'buy', label: '🏘️ Buy', desc: 'Properties for sale' },
              { key: 'short-let', label: '🏖️ Short-let', desc: 'Short stays' },
              { key: 'share', label: '🤝 Shared', desc: 'Flatmates wanted' },
            ].map((purpose) => (
              <Link
                key={purpose.key}
                href={`/dashboard/tenant/search?purpose=${purpose.key}`}
                className="card p-4 text-center hover:border-[var(--accent)] transition-colors h-full"
              >
                <div className="text-2xl mb-2">{purpose.label.split(' ')[0]}</div>
                <div className="font-medium" style={{ color: 'var(--text)' }}>{purpose.label.split(' ')[1]}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{purpose.desc}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Saved Properties" value="12" icon={<HeartIcon />} />
          <StatCard label="Active Applications" value="3" icon={<FileIcon />} />
          <StatCard label="Upcoming Viewings" value="2" icon={<CalendarIcon />} />
          <StatCard label="Messages" value="5" icon={<ChatIcon />} />
        </div>

        {/* Recommended Listings */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Recommended for You</h2>
            <Link href="/dashboard/tenant/search" className="text-sm font-medium" style={{ color: 'var(--accent)' }}>
              View All →
            </Link>
          </div>
          <div className="grid-listing">
            {[1, 2, 3].map((i) => (
              <PropertyCard key={i} />
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <div className="p-2 rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {Icon}
        </div>
      </div>
    </div>
  );
}

function PropertyCard() {
  return (
    <Link href="/dashboard/tenant/search" className="card overflow-hidden hover:border-[var(--accent)] transition-colors">
      <div className="aspect-video bg-gray-200 dark:bg-gray-800 relative">
        <div className="absolute top-2 right-2">
          <span className="tag tag-gold">Verified</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="tag tag-teal">3 Bed</span>
          <span className="font-heading font-bold" style={{ color: 'var(--text)' }}>₦2,500,000/yr</span>
        </div>
        <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>Modern Apartment in Lekki Phase 1</h3>
        <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>Lekki, Lagos • 3 bed • 2 bath • 150 sqm</p>
        <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted)' }}>
          <span>🏢 Apartment</span>
          <span>•</span>
          <span>✅ Verified</span>
          <span>•</span>
          <span>👁️ 245 views</span>
        </div>
      </div>
    </Link>
  );
}

// Icons
function HeartIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>;
}

function FileIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}

function CalendarIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

function ChatIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}