import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { FileText as FileIcon, CheckCircle as CheckCircleIcon, Clock as ClockIcon, XCircle as XCircleIcon, Building2 as BuildingIcon, Eye as EyeIcon, Download as DownloadIcon, Check as CheckIcon } from 'lucide-react';

export default async function AdminAgreementsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  const rolePaths: Record<string, string> = {
    landlord: '/dashboard/landlord',
    tenant: '/dashboard/tenant',
    agent: '/dashboard/agent',
    admin: '/admin',
    estate_manager: '/dashboard/estate-manager',
    realtor: '/dashboard/realtor',
  };
  const roleRedirect = (u: typeof user) => rolePaths[u.role] ?? '/dashboard/tenant';
  if (!user || user.role !== 'admin') redirect(roleRedirect(user));

  const agreements = await prisma.agreement.findMany({
    include: {
      listing: { select: { id: true, title: true, area: true, images: { where: { isCover: true }, take: 1 } } },
      tenant: { select: { id: true, fullName: true, email: true } },
      agent: { select: { id: true, fullName: true } },
      landlord: { select: { id: true, fullName: true } },
      signatures: { include: { signer: { select: { id: true, fullName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
              Agreements
            </h1>
            <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
              Manage platform agreements, track signatures, and audit documents
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total" value={agreements.length} icon={<FileIcon />} />
          <StatCard label="Fully Signed" value={agreements.filter(a => a.status === 'fully_signed').length} icon={<CheckCircleIcon />} />
          <StatCard label="Pending" value={agreements.filter(a => ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status)).length} icon={<ClockIcon />} />
          <StatCard label="Draft" value={agreements.filter(a => a.status === 'draft').length} icon={<FileIcon />} />
          <StatCard label="Terminated" value={agreements.filter(a => a.status === 'terminated').length} icon={<XCircleIcon />} />
        </div>

        <div className="card overflow-hidden">
          {agreements.length === 0 ? (
            <div className="card-body text-center py-16">
              <FileIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
              <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No agreements found</h3>
              <p style={{ color: 'var(--muted)' }}>Agreements will appear here as they are created across the platform.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Agreement</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Property</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Tenant</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
                    <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Rent/Price</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Status</th>
                    <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {agreements.map((agreement) => (
                    <tr key={agreement.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <td className="p-4">
                        <p className="font-mono text-sm font-medium" style={{ color: 'var(--text)' }}>{agreement.id.slice(-8).toUpperCase()}</p>
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>
                          {new Date(agreement.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {agreement.listing?.images[0] ? (
                            <img src={agreement.listing.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                              <BuildingIcon className="w-5 h-5" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium" style={{ color: 'var(--text)' }}>{agreement.listing?.title || 'N/A'}</p>
                            <p className="text-xs" style={{ color: 'var(--muted)' }}>{agreement.listing?.area}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {agreement.tenant ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm"
                              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }}
                            >
                              {agreement.tenant.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium" style={{ color: 'var(--text)' }}>{agreement.tenant.fullName}</p>
                              <p className="text-xs" style={{ color: 'var(--muted)' }}>{agreement.tenant.email}</p>
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--muted)' }}>Not assigned</span>
                        )}
                      </td>
                      <td className="p-4"><span className="tag tag-blue">{agreement.type}</span></td>
                      <td className="p-4 text-right font-heading font-bold" style={{ color: 'var(--text)' }}>
                        {agreement.rentAmount ? `₦${Number(agreement.rentAmount).toLocaleString()}` : '—'}
                        {agreement.rentPeriod && agreement.rentAmount ? `/${agreement.rentPeriod}` : ''}
                      </td>
                      <td className="p-4"><AgreementStatusBadge status={agreement.status} /></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/agreements/${agreement.id}`} className="btn btn-ghost btn-sm" title="View Details">
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          {agreement.status === 'fully_signed' && (
                            <Link href={`/api/agreements/${agreement.id}/pdf`} className="btn btn-ghost btn-sm" title="Download PDF">
                              <DownloadIcon className="w-4 h-4" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-2xl font-heading font-bold" style={{ color: 'var(--text)' }}>{value}</p>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{Icon}</div>
      </div>
    </div>
  );
}

function AgreementStatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    draft: { class: 'tag-amber', label: 'Draft' },
    pending_landlord: { class: 'tag-blue', label: 'Pending Landlord' },
    pending_tenant: { class: 'tag-blue', label: 'Pending Tenant' },
    tenant_signed: { class: 'tag-teal', label: 'Tenant Signed' },
    landlord_signed: { class: 'tag-teal', label: 'Landlord Signed' },
    fully_signed: { class: 'tag-green', label: 'Fully Signed ✓' },
    terminated: { class: 'tag-red', label: 'Terminated' },
    expired: { class: 'tag-gray', label: 'Expired' },
  };
  const cfg = config[status] || { class: 'tag-gray', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}
