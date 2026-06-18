import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';

export default async function EstateManagerDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'ESTATE_MANAGER') {
    redirect('/dashboard');
  }

  // Check if user has organization
  const orgMembership = user.orgMemberships[0];
  const organization = orgMembership?.organization;

  // If no organization, show onboarding wizard
  if (!organization) {
    return (
      <DashboardShell
        navigation={[]}
        userRole={user.role}
        userName={user.fullName}
        userAvatar={user.avatarUrl || undefined}
      >
        <OnboardingWizard userId={user.id} />
      </DashboardShell>
    );
  }

  // Fetch org stats
  const [
    propertiesCount,
    unitsCount,
    totalRevenue,
    pendingTickets,
    upcomingPayments,
  ] = await Promise.all([
    prisma.listing.count({ where: { ownerId: organization.ownerId } }),
    prisma.listing.count({ where: { ownerId: organization.ownerId, status: 'ACTIVE' } }),
    prisma.transaction.aggregate({
      where: { payeeId: organization.ownerId, status: 'RELEASED' },
      _sum: { amount: true },
    }),
    prisma.maintenanceTicket.count({
      where: { orgId: organization.id, status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } },
    }),
    prisma.rentSchedule.count({
      where: {
        agreement: { landlordId: organization.ownerId },
        status: 'UPCOMING',
        dueDate: { gte: new Date().toISOString().split('T')[0] },
      },
    }),
  ]);

  return (
    <DashboardShell
      navigation={ESTATE_MANAGER_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="space-y-8">
        {/* Org Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
              {organization.name}
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              {organization.planTier} Plan • {organization.maxUnits} units • {organization.maxSeats} seats
            </p>
          </div>
          <span className="tag tag-green">{orgMembership.role}</span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Properties" value={propertiesCount} icon={<BuildingIcon />} />
          <StatCard label="Active Units" value={unitsCount} icon={<HomeIcon />} trendPositive />
          <StatCard label="Total Revenue" value={`₦${(Number(totalRevenue._sum.amount || 0) / 100).toLocaleString()}`} icon={<CurrencyIcon />} />
          <StatCard label="Open Tickets" value={pendingTickets} icon={<WrenchIcon />} trend={pendingTickets > 0 ? 'Needs attention' : 'All clear'} trendPositive={pendingTickets === 0} />
          <StatCard label="Upcoming Rent" value={upcomingPayments} icon={<CalendarIcon />} />
        </div>

        {/* Quick Actions */}
        <section>
          <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <ActionCard title="Add Property" description="New listing" icon={<PlusIcon />} href="/estate-manager/portfolio/new" />
            <ActionCard title="Collect Rent" description="View ledger" icon={<CurrencyIcon />} href="/estate-manager/ledger" />
            <ActionCard title="Maintenance" description={`${pendingTickets} tickets`} icon={<WrenchIcon />} href="/estate-manager/maintenance" />
            <ActionCard title="Team" description="Manage staff" icon={<UsersIcon />} href="/estate-manager/team" />
            <ActionCard title="Reports" description="Monthly PDF" icon={<DocumentIcon />} href="/estate-manager/reports" />
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>Recent Maintenance Tickets</h2>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Ticket</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Category</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Priority</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Assigned</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 'TKT-001', property: 'Sunrise Apartments', category: 'Plumbing', priority: 'HIGH', status: 'IN_PROGRESS', assigned: 'John M.' },
                  { id: 'TKT-002', property: 'Greenview Estate', category: 'Electrical', priority: 'MEDIUM', status: 'ASSIGNED', assigned: 'Sarah K.' },
                  { id: 'TKT-003', property: 'Lekki Heights', category: 'HVAC', priority: 'URGENT', status: 'OPEN', assigned: '—' },
                ].map((t, i) => (
                  <tr key={i} className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4 font-mono text-sm" style={{ color: 'var(--text)' }}>{t.id}</td>
                    <td className="p-4" style={{ color: 'var(--text)' }}>{t.property}</td>
                    <td className="p-4"><span className="tag tag-blue">{t.category}</span></td>
                    <td className="p-4">
                      <span className={`tag ${t.priority === 'URGENT' ? 'tag-red' : t.priority === 'HIGH' ? 'tag-amber' : 'tag-blue'}`}>{t.priority}</span>
                    </td>
                    <td className="p-4">
                      <span className={`tag ${t.status === 'OPEN' ? 'tag-amber' : t.status === 'IN_PROGRESS' ? 'tag-blue' : 'tag-green'}`}>{t.status}</span>
                    </td>
                    <td className="p-4" style={{ color: 'var(--muted)' }}>{t.assigned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}

function OnboardingWizard({ userId }: { userId: string }) {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center font-bold text-white text-2xl" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}>
            🏢
          </div>
          <h2 className="font-heading font-bold text-2xl mb-2" style={{ color: 'var(--text)' }}>Welcome to Estate Manager</h2>
          <p style={{ color: 'var(--muted)' }}>Set up your organization to start managing properties.</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="inp-label">Organization Name</label>
            <input type="text" className="inp-field" placeholder="e.g., Lekki Property Management" />
          </div>
          <div>
            <label className="inp-label">Billing Email</label>
            <input type="email" className="inp-field" placeholder="billing@yourcompany.com" />
          </div>
          <div>
            <label className="inp-label">Address</label>
            <textarea className="inp-field" rows={2} placeholder="Your office address" />
          </div>
          <div>
            <label className="inp-label">CAC Registration Number</label>
            <input type="text" className="inp-field" placeholder="RC-123456" />
          </div>

          <div className="pt-4">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Choose Your Plan</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Starter', price: '₦15,000/mo', units: 20, seats: 1, features: ['Up to 20 units', '1 team seat', 'Basic reports', 'Email support'] },
                { name: 'Growth', price: '₦45,000/mo', units: 100, seats: 5, features: ['Up to 100 units', '5 team seats', 'Advanced reports', 'Priority support', 'Bulk import'] },
                { name: 'Enterprise', price: '₦120,000/mo', units: '∞', seats: '∞', features: ['Unlimited units', 'Unlimited seats', 'Custom reports', '24/7 support', 'API access', 'White-label'] },
              ].map((plan) => (
                <div key={plan.name} className="card p-6 relative" style={{ border: '2px solid var(--border)' }}>
                  <h4 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>{plan.name}</h4>
                  <div className="text-3xl font-bold mb-2" style={{ color: 'var(--accent)' }}>{plan.price}</div>
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button className="btn w-full" style={plan.name === 'Growth' ? { background: 'linear-gradient(135deg, var(--accent), var(--accent2))', color: '#1a1a1a' } : {}}>
                    Select {plan.name}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary w-full text-lg py-4" style={{ fontSize: '1rem' }}>
            Complete Setup & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendPositive = true,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-1">
          <span className="text-xs font-medium" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
            {trendPositive ? '↑' : '↓'}
          </span>
          <span className="text-xs" style={{ color: trendPositive ? 'var(--green)' : 'var(--red)' }}>
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon: Icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <a href={href} className="card p-6 hover:border-[var(--accent)] transition-colors text-center">
      <div className="p-3 rounded-xl mb-4 mx-auto" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', width: 'fit-content' }}>
        {Icon}
      </div>
      <h3 className="font-heading font-bold mb-1" style={{ color: 'var(--text)' }}>{title}</h3>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>{description}</p>
    </a>
  );
}

// Icons
function BuildingIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="3" y1="9" x2="21" y2="9"/></svg>;
}

function HomeIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}

function CurrencyIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>;
}

function WrenchIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>;
}

function CalendarIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
}

function PlusIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
}

function UsersIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>;
}

function DocumentIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}