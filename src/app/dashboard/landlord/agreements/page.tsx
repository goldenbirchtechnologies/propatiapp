import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { FileText as FileIcon, CheckCircle as CheckCircleIcon, Clock as ClockIcon, XCircle as XCircleIcon, Building2 as BuildingIcon, Plus as PlusIcon, Eye as EyeIcon, Pen as PenIcon, Download as DownloadIcon, Check as CheckIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export default async function LandlordAgreementsPage() {
  const user = await getCurrentUserWithProfile();

  if (!user || user.role !== 'landlord') {
    redirect('/dashboard');
  }

  // Fetch agreements where user is landlord
  const agreements = await prisma.agreement.findMany({
    where: { landlordId: user.id },
    include: {
      listing: { select: { id: true, title: true, area: true, images: { where: { isCover: true }, take: 1 } } },
      tenant: { select: { id: true, fullName: true, email: true, phone: true, avatarUrl: true } },
      agent: { select: { id: true, fullName: true, email: true } },
      signatures: { include: { signer: { select: { id: true, fullName: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardShell
      navigation={LANDLORD_NAVIGATION}
      userRole={user.role}
      userName={user.fullName}
      userAvatar={user.avatarUrl || undefined}
    >

      <ErrorBoundary>

      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading font-bold">
              Agreements
            </h1>
            <p className="text-neutral-400">
              Manage rental and sale agreements, track signatures, and download documents
            </p>
          </div>
          <Link href="/dashboard/landlord/agreements/new" className="btn btn-primary">
            <PlusIcon className="w-4 h-4 mr-2" /> Create Agreement
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total" value={agreements.length} icon={<FileIcon />} />
          <StatCard
            label="Fully Signed"
            value={agreements.filter(a => a.status === 'fully_signed').length}
            icon={<CheckCircleIcon />}
            trendPositive
          />
          <StatCard
            label="Pending Signature"
            value={agreements.filter(a => ['pending_landlord', 'pending_tenant', 'tenant_signed', 'landlord_signed'].includes(a.status)).length}
            icon={<ClockIcon />}
          />
          <StatCard
            label="Draft"
            value={agreements.filter(a => a.status === 'draft').length}
            icon={<FileIcon />}
          />
          <StatCard
            label="Terminated"
            value={agreements.filter(a => a.status === 'terminated').length}
            icon={<XCircleIcon />}
          />
        </div>

        {/* Filters */}
        <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-4">
          <div className="flex flex-wrap gap-4">
            <select className="inp-field flex-1 min-w-[180px]" style={{ maxWidth: '200px' }}>
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="pending_landlord">Pending Landlord</option>
              <option value="pending_tenant">Pending Tenant</option>
              <option value="tenant_signed">Tenant Signed</option>
              <option value="landlord_signed">Landlord Signed</option>
              <option value="fully_signed">Fully Signed</option>
              <option value="terminated">Terminated</option>
              <option value="expired">Expired</option>
            </select>
            <select className="inp-field" style={{ maxWidth: '180px' }}>
              <option value="all">All Types</option>
              <option value="rental">Rental</option>
              <option value="sale">Sale</option>
              <option value="short_let">Short Let</option>
              <option value="share">Share</option>
            </select>
          </div>
        </div>

        {/* Agreements Table */}
        <section>
          <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] overflow-hidden">
            {agreements.length === 0 ? (
              <div className="bg-obsidian-800/30 rounded-xl border border-[#262626]-body text-center py-16">
                <FileIcon className="w-5 h-5" />
                <h3 className="text-white">No agreements yet</h3>
                <p className="text-neutral-400">Create your first agreement from a verified property listing.</p>
                <Link href="/dashboard/landlord/agreements/new" className="btn btn-primary">
                  <PlusIcon className="w-4 h-4 mr-2" /> Create Agreement
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-[#262626]">
                      <th className="text-neutral-400">Agreement</th>
                      <th className="text-neutral-400">Property</th>
                      <th className="text-neutral-400">Tenant</th>
                      <th className="text-neutral-400">Type</th>
                      <th className="text-neutral-400">Rent/Price</th>
                      <th className="text-neutral-400">Status</th>
                      <th className="text-neutral-400">Signatures</th>
                      <th className="text-neutral-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {agreements.map((agreement) => (
                      <tr key={agreement.id} className="border-[#262626]">
                        <td className="p-4">
                          <p className="text-white">{agreement.id.slice(-8).toUpperCase()}</p>
                          <p className="text-neutral-400">
                            {new Date(agreement.createdAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            {agreement.listing?.images[0] ? (
                              <img src={agreement.listing.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            ) : (
                              <div className="bg-[#262626] text-white">
                                <BuildingIcon className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="text-white">{agreement.listing?.title || 'N/A'}</p>
                              <p className="text-neutral-400">{agreement.listing?.area}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {agreement.tenant ? (
                            <div className="flex items-center gap-2">
                              <div
                                className="w-8 h-8 rounded-full bg-[#262626] text-white flex items-center justify-center font-bold text-sm"
                              >
                                {agreement.tenant.fullName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-white">{agreement.tenant.fullName}</p>
                                <p className="text-neutral-400">{agreement.tenant.email}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-neutral-400">Not assigned</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 text-xs rounded-full bg-surface-container text-neutral-400 border border-[#262626]">{agreement.type}</span>
                        </td>
                        <td className="text-white">
                          {agreement.rentAmount ? `₦${Number(agreement.rentAmount).toLocaleString()}` : '—'}
                          {agreement.rentPeriod && agreement.rentAmount && `/${agreement.rentPeriod}`}
                        </td>
                        <td className="p-4">
                          <AgreementStatusBadge status={agreement.status} />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {['landlord', 'tenant'].map((role) => {
                              const sig = agreement.signatures.find(s => s.signer?.fullName === (role === 'landlord' ? user.fullName : agreement.tenant?.fullName));
                              return (
                                <div
                                  key={role}
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${sig ? 'bg-[#00ff66]/10 text-[#00ff66] border-[#00ff66]/20' : 'bg-surface-container text-neutral-400 border-[#262626]'}`}
                                  title={role === 'landlord' ? 'Landlord' : 'Tenant'}
                                >
                                  {sig ? <CheckIcon className="w-4 h-4" /> : role.charAt(0).toUpperCase()}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link
                              href={`/dashboard/landlord/agreements/${agreement.id}`}
                              className="btn btn-ghost btn-sm"
                              title="View Details"
                            >
                              <EyeIcon className="w-4 h-4" />
                            </Link>
                            {agreement.status !== 'fully_signed' && agreement.status !== 'terminated' && agreement.status !== 'expired' && (
                              <Link
                                href={`/dashboard/landlord/agreements/${agreement.id}/sign`}
                                className="btn btn-primary btn-sm"
                                title="Sign"
                              >
                                <PenIcon className="w-4 h-4" />
                              </Link>
                            )}
                            {agreement.status === 'fully_signed' && (
                              <Link
                                href={`/api/agreements/${agreement.id}/pdf`}
                                className="btn btn-ghost btn-sm"
                                title="Download PDF"
                              >
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
        </section>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}

function StatCard({ label, value, icon: Icon, trendPositive = false }: { label: string; value: number; icon: React.ReactNode; trendPositive?: boolean }) {
  return (
    <div className="bg-obsidian-800/30 rounded-xl border border-[#262626] p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-400">{label}</p>
          <p className="text-white">{value}</p>
        </div>
        <div className="bg-[#262626] text-white">
          {Icon}
        </div>
      </div>
    </div>
  );
}

function AgreementStatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    draft: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Draft' },
    pending_landlord: { class: 'bg-[#262626] text-white border-primary/20', label: 'Pending Landlord' },
    pending_tenant: { class: 'bg-[#262626] text-white border-primary/20', label: 'Pending Tenant' },
    tenant_signed: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Tenant Signed' },
    landlord_signed: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Landlord Signed' },
    fully_signed: { class: 'bg-success/10 text-[#00ff66] border-success/20', label: 'Fully Signed ✓' },
    terminated: { class: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Terminated' },
    expired: { class: 'bg-muted/30 text-neutral-400 border-muted/50', label: 'Expired' },
  };
  const cfg = config[status] || { class: 'bg-muted/30 text-neutral-400 border-muted/50', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

