'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Eye, Calendar, Download, ChevronRight, ChevronLeft, User, DollarSign, Home, Clock } from 'lucide-react';

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/agent/pipeline" className="inline-flex items-center gap-1 text-sm" style={{ color: 'var(--muted)' }}>
              <ChevronLeft className="w-4 h-4" /> Pipeline
            </Link>
          </div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            {deal.title}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            {deal.property}
          </p>
        </div>
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
          style={{ background: statusStyle.bg, color: statusStyle.color }}
        >
          {deal.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
        {(['overview', 'timeline', 'actions', 'documents'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize"
            style={{
              borderColor: activeTab === tab ? 'var(--accent)' : 'transparent',
              color: activeTab === tab ? 'var(--accent)' : 'var(--muted)',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="font-heading font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>Deal Details</h3>
            <div className="space-y-3">
              <DetailRow icon={<Home className="w-4 h-4" />} label="Property" value={deal.property} />
              <DetailRow icon={<User className="w-4 h-4" />} label="Client" value={deal.client} />
              <DetailRow icon={<User className="w-4 h-4" />} label="Agent" value={deal.agent} />
              <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Value" value={formatCurrency(deal.value)} />
              <DetailRow icon={<Clock className="w-4 h-4" />} label="Last Contact" value={formatDate(deal.lastContact)} />
            </div>
          </div>
          <div className="card p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="font-heading font-bold text-sm mb-4" style={{ color: 'var(--text)' }}>Status Overview</h3>
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
        <div className="card p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="font-heading font-bold text-sm mb-6" style={{ color: 'var(--text)' }}>Deal Timeline</h3>
          <div className="space-y-0">
            {deal.timeline.map((item, idx) => (
              <div key={item.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full" style={{ background: 'var(--accent)' }} />
                  {idx < deal.timeline.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ background: 'var(--border)' }} />}
                </div>
                <div className="pb-6">
                  <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.event}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{formatDate(item.date)}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{item.detail}</p>
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
        <div className="card overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <div className="p-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="font-heading font-bold text-sm" style={{ color: 'var(--text)' }}>Documents</h3>
          </div>
          {deal.documents.length === 0 ? (
            <div className="p-10 text-center">
              <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--muted)', opacity: 0.5 }} />
              <p className="text-sm" style={{ color: 'var(--muted)' }}>No documents uploaded yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Name</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Type</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Size</th>
                  <th className="text-left p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Uploaded</th>
                  <th className="text-right p-4 text-sm font-medium" style={{ color: 'var(--muted)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {deal.documents.map((doc) => (
                  <tr key={doc.id} className="border-b transition-colors hover:bg-muted/30" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-4 font-medium text-sm flex items-center gap-2" style={{ color: 'var(--text)' }}>
                      <FileText className="w-4 h-4" style={{ color: 'var(--muted)' }} />
                      {doc.name}
                    </td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{doc.type}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{doc.size}</td>
                    <td className="p-4 text-sm" style={{ color: 'var(--muted)' }}>{formatDate(doc.uploadedAt)}</td>
                    <td className="p-4 text-right">
                      <button className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors" style={{ background: 'var(--surface-elevated)', color: 'var(--text)', border: '1px solid var(--border)' }}>
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
      <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
        <span className="inline-flex" style={{ color: 'var(--accent)' }}>{icon}</span>
        {label}
      </div>
      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

function StatusBar({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 rounded-full" style={{ background: 'var(--border)' }}>
        <div className="h-2 rounded-full" style={{ width: active ? '100%' : '0%', background: active ? 'var(--accent)' : 'transparent', transition: 'width 0.3s ease' }} />
      </div>
      <span className="text-xs font-medium w-24 text-right" style={{ color: active ? 'var(--accent)' : 'var(--muted)' }}>{label}</span>
    </div>
  );
}

function ActionCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return (
    <Link href={href} className="card p-5 flex items-start gap-4 transition-all hover:shadow-md group" style={{ background: 'var(--surface)', border: '1px solid var(--border)', textDecoration: 'none' }}>
      <div className="p-3 rounded-xl" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm" style={{ color: 'var(--text)' }}>{title}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 mt-1 transition-transform group-hover:translate-x-1" style={{ color: 'var(--muted)' }} />
    </Link>
  );
}
