'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Eye, Calendar, Download, ChevronRight, ChevronLeft, User, DollarSign, Home, Clock, Lock, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

type Deal = {
  id: string;
  title: string;
  property: string;
  value: number;
  client: string;
  agent: string;
  status: string;
  type: 'buy' | 'sell';
  createdAt: string;
  lastContact: string;
  documents: { id: string; name: string; type: string; size: string; uploadedAt: string }[];
  timeline: { id: string; event: string; date: string; detail: string }[];
};

const STATUS_STYLE: Record<string, { color: string; bg: string }> = {
  enquiries: { color: 'var(--blue)', bg: 'var(--blue-bg)' },
  viewings: { color: 'var(--amber)', bg: 'var(--amber-bg)' },
  offers: { color: 'var(--green)', bg: 'var(--green-bg)' },
  agreements: { color: 'var(--accent)', bg: 'var(--accent-bg)' },
  closed: { color: 'var(--green)', bg: 'var(--green-bg)' },
};

export default function AgentDealDetailClient({ deal }: { deal: Deal }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'actions' | 'documents'>('overview');

  const formatCurrency = (val: number) => `₦${val.toLocaleString()}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
  const statusStyle = STATUS_STYLE[deal.status] || STATUS_STYLE.enquiries;

  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => { console.log('deal loaded', deal); }, [deal]);

  async function closeDeal() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/agent/' + deal.id + '/close', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Deal marked closed. Commission is now held.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed'); }
    finally { setActionLoading(false); }
  }

  async function releaseCommission() {
    setActionLoading(true);
    try {
      const res = await fetch('/api/agent/' + deal.id + '/commission', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Commission released');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Failed'); }
    finally { setActionLoading(false); }
  }

  const isInEscrow = String(deal.status).toLowerCase() === 'in_escrow';
  const showActions = isInEscrow || String(deal.status).toLowerCase() === 'commission_held';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/agent/pipeline" className="inline-flex items-center gap-1 text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>
              <ChevronLeft className="w-4 h-4" /> Pipeline
            </Link>
          </div>
          <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-white' }}>
            {deal.title}
          </h1>
          <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400", marginTop: 'mt-1' }}>
            {deal.property}
          </p>
        </div>
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          {deal.status.replace(/_/g, ' ')}
        </span>
      </div>

      {showActions && (
        <div className="rounded-xl border border-border/60 bg-background p-4">
          <h3 className="text-sm font-semibold mb-3">Deal actions</h3>
          <div className="flex flex-wrap items-center gap-3">
            {isInEscrow && (
              <Button variant="secondary" onClick={closeDeal} disabled={actionLoading} className="gap-2">
                <Lock className="h-4 w-4" /> Mark deal closed
              </Button>
            )}
            {(String(deal.status).toLowerCase() === 'commission_held' || deal.agentCommissionStatus === 'held') && (
              <Button onClick={releaseCommission} disabled={actionLoading} className="gap-2">
                <Wallet className="h-4 w-4" /> Release commission
              </Button>
            )}
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => fetch('/api/transactions/' + deal.id + '/confirm', { method: 'POST' }).then(() => toast.success('Payment confirmed'))} disabled={actionLoading}>Confirm payment sent/received</Button>
              <Button variant="destructive" onClick={() => fetch('/api/transactions/' + deal.id + '/dispute', { method: 'POST' }).then(() => toast.error('Dispute filed'))} disabled={actionLoading}>Dispute</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'border-[#262626]' }}>
        {(['overview', 'timeline', 'actions', 'documents'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize"
            style={{
              borderColor: activeTab === tab ? 'text-white' : 'transparent',
              color: activeTab === tab ? 'text-white' : 'text-neutral-400',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5" style={{ background: 'bg-surface-container-lowest', border: '1px solid border-[#262626]' }}>
            <h3 className="font-headline-sm font-bold text-sm mb-4" className="text-white" }}>Deal Details</h3>
            <div className="space-y-3">
              <DetailRow icon={<Home className="w-4 h-4" />} label="Property" value={deal.property} />
              <DetailRow icon={<User className="w-4 h-4" />} label="Client" value={deal.client} />
              <DetailRow icon={<User className="w-4 h-4" />} label="Agent" value={deal.agent} />
              <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Value" value={formatCurrency(deal.value)} />
              <DetailRow icon={<Clock className="w-4 h-4" />} label="Last Contact" value={formatDate(deal.lastContact)} />
            </div>
          </div>
          <div className="card p-5" style={{ background: 'bg-surface-container-lowest', border: '1px solid border-[#262626]' }}>
            <h3 className="font-headline-sm font-bold text-sm mb-4" className="text-white" }}>Status Overview</h3>
            <div className="space-y-3">
              <StatusBar label="Enquiries" active={deal.status === 'enquiries'} />
              <StatusBar label="Viewings" active={deal.status === 'viewings'} />
              <StatusBar label="Offers" active={deal.status === 'offers'} />
              <StatusBar label="Agreements" active={deal.status === 'agreements'} />
              <StatusBar label="Closed" active={deal.status === 'closed'} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="card p-5" style={{ background: 'bg-surface-container-lowest', border: '1px solid border-[#262626]' }}>
          <h3 className="font-headline-sm font-bold text-sm mb-6" className="text-white" }}>Deal Timeline</h3>
          <div className="space-y-0">
            {deal.timeline.map((item, idx) => (
              <div key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full" style={{ background: 'text-white' }} />
                  {idx < deal.timeline.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ background: 'border-[#262626]' }} />}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-medium" className="text-white" }}>{item.event}</p>
                  <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>{formatDate(item.date)}</p>
                  <p className="text-sm mt-1" className="text-neutral-400" }}>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'actions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard
            icon={<Eye className="w-6 h-6" />}
            title="View Listing"
            description="Open the property listing details page"
            href={`/listings/${deal.id}`}
          />
          <ActionCard
            icon={<Calendar className="w-6 h-6" />}
            title="Schedule Inspection"
            description="Book a property inspection for this deal"
            href={`/dashboard/agent/inspections/new?dealId=${deal.id}`}
          />
          <ActionCard
            icon={<FileText className="w-6 h-6" />}
            title="Generate Agreement"
            description="Create a new agreement draft for this deal"
            href={`/dashboard/agent/agreements/new?dealId=${deal.id}`}
          />
          <ActionCard
            icon={<User className="w-6 h-6" />}
            title="Contact Client"
            description="Reach out to the client directly"
            href={`/dashboard/agent/messages?to=${encodeURIComponent(deal.client)}`}
          />
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="card overflow-hidden" style={{ background: 'bg-surface-container-lowest', border: '1px solid border-[#262626]' }}>
          <div className="p-4 border-b" style={{ borderColor: 'border-[#262626]' }}>
            <h3 className="font-headline-sm font-bold text-sm" className="text-white" }}>Documents</h3>
          </div>
          {deal.documents.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-10 h-10 mx-auto mb-3" className="text-neutral-400", opacity: 0.5 }} />
              <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>No documents uploaded yet</p>
            </div>
          ) : (
            <table className="w-full divide-y divide-[#262626]">
              <thead>
                <tr className="border-b" style={{ borderColor: 'border-[#262626]' }}>
                  <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" className="text-neutral-400" }}>Name</th>
                  <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" className="text-neutral-400" }}>Type</th>
                  <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" className="text-neutral-400" }}>Size</th>
                  <th className="text-left p-4 text-sm font-label-md uppercase tracking-wider" className="text-neutral-400" }}>Uploaded</th>
                  <th className="text-right p-4 text-sm font-label-md uppercase tracking-wider" className="text-neutral-400" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deal.documents.map((doc) => (
                  <tr key={doc.id} className="border-b transition-colors hover:bg-[#171717]/30" style={{ borderColor: 'border-[#262626]' }}>
                    <td className="p-4 font-medium text-sm flex items-center gap-2" className="text-white" }}>
                      <FileText className="w-4 h-4" className="text-neutral-400" }} />
                      {doc.name}
                    </td>
                    <td className="p-4 text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>{doc.type}</td>
                    <td className="p-4 text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>{doc.size}</td>
                    <td className="p-4 text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>{formatDate(doc.uploadedAt)}</td>
                    <td className="p-4 text-right">
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors" style={{ background: 'bg-surface-container-low', color: 'text-white', border: '1px solid border-[#262626]' }}>
                        <Download className="w-3 h-3" /> Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>
        <span className="inline-flex" className="text-white" }}>{icon}</span>
        {label}
      </div>
      <span className="text-sm font-medium" className="text-white" }}>{value}</span>
    </div>
  );
}

function StatusBar({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full" style={{ background: 'border-[#262626]' }}>
        <div className="h-2 rounded-full" style={{ width: active ? '100%' : '0%', background: active ? 'text-white' : 'transparent', transition: 'width 0.3s ease' }} />
      </div>
      <span className="text-xs font-label-md uppercase tracking-wider font-medium w-24 text-right" style={{ color: active ? 'text-white' : 'text-neutral-400' }}>{label}</span>
    </div>
  );
}

function ActionCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return (
    <Link href={href} className="card p-5 flex items-start gap-4 transition-all hover:shadow-md group" style={{ background: 'bg-surface-container-lowest', border: '1px solid border-[#262626]', textDecoration: 'none' }}>
      <div className="p-3 rounded-xl" style={{ background: 'bg-[#00ff66]/10', color: 'text-white' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-headline-sm font-bold text-sm" className="text-white" }}>{title}</p>
        <p className="text-xs font-label-md uppercase tracking-wider mt-1" className="text-neutral-400" }}>{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 mt-1 transition-transform group-hover:translate-x-1" className="text-neutral-400" }} />
    </Link>
  );
}
