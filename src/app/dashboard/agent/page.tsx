import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';

export default async function AgentDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'AGENT') {
    redirect('/dashboard');
  }

  return (
    <DashboardShell
      navigation={AGENT_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="space-y-8">
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Welcome back, {user.fullName.split(' ')[0]}! 🤝
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Manage your pipeline and close more deals.
          </p>
        </div>

        {/* Pipeline Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Enquiries" value="24" icon={<MailIcon />} />
          <StatCard label="Viewings" value="8" icon={<EyeIcon />} />
          <StatCard label="Offers" value="3" icon={<HandshakeIcon />} />
          <StatCard label="Agreements" value="2" icon={<FileIcon />} />
          <StatCard label="Closed" value="1" icon={<CheckIcon />} trendPositive />
        </div>

        {/* Pipeline Kanban */}
        <section>
          <h2 className="font-heading font-bold mb-6" style={{ color: 'var(--text)' }}>Deal Pipeline</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { title: 'Enquiries', count: 24, color: 'var(--blue)', items: ['John - 3 Bed Lekki', 'Mary - 2 Bed Ikeja'] },
              { title: 'Viewings', count: 8, color: 'var(--amber)', items: ['Peter - 4 Bed VI'] },
              { title: 'Offers', count: 3, color: 'var(--green)', items: ['Sarah - Duplex Ajah'] },
              { title: 'Agreements', count: 2, colorVar: 'var(--accent)', items: ['Mike - House Surulere'] },
              { title: 'Closed', count: 1, color: 'var(--green)', items: ['Done - Apartment Yaba'] },
            ].map((stage) => (
              <PipelineColumn key={stage.title} {...stage} />
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
  trendPositive = false,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trendPositive?: boolean;
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

function PipelineColumn({
  title,
  count,
  color,
  items,
}: {
  title: string;
  count: number;
  color: string;
  items: string[];
}) {
  return (
    <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="card-head" style={{ background: `linear-gradient(135deg, ${color}22, ${color}11)` }}>
        <h3 className="font-heading font-bold" style={{ color }}>{title}</h3>
        <span className="text-xl font-bold" style={{ color }}>{count}</span>
      </div>
      <div className="card-body p-4 space-y-3">
        {items.map((item, i) => (
          <div key={i} className="p-3 rounded-lg cursor-grab hover:shadow-md transition-shadow" style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)' }}>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item}</p>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-center text-sm" style={{ color: 'var(--muted)' }}>No deals in this stage</p>
        )}
      </div>
    </div>
  );
}

// Icons
function MailIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
}

function EyeIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>;
}

function HandshakeIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 10a2 2 0 0 1 2-2 2 2 0 0 1 2 2"/><path d="M4.68 2.44 4 9.22"/><path d="m8 18 3 3 8-8.04L19 10"/><path d="M17.32 5 21 9.3a10 10 0 1 1-7.47 6.85 2.56 2.56 0 0 1 0-2.38l2.26-2.26"/><path d="M21 21v-4.86a2.56 2.56 0 0 0-1.17-2.04"/></svg>;
}

function FileIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
}

function CheckIcon() {
  return <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>;
}