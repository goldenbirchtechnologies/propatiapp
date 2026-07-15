'use client';

import { useState } from 'react';
import Link from 'next/link';
import {

  ArrowLeft,
  FileText,
  Eye,
  Calendar,
  Download,
  ChevronRight,
  User,
  DollarSign,
  Home,
  Clock,
  MessageSquare,
  Building2,
  MapPin,
  Loader2,
  Mail,
  Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

type Deal = {
  id: string;
  title: string;
  property: string;
  address: string;
  area: string;
  state: string;
  value: number;
  client: string;
  clientEmail: string;
  clientPhone: string;
  landlord: string;
  status: string;
  type: 'buy' | 'sell';
  createdAt: string;
  updatedAt: string;
  coverImage: string | null;
  propertyType: string;
  listingType: string;
};

const statusClasses: Record<string, string> = {
  draft: 'bg-surface-container text-on-surface-variant border-outline-variant',
  pending_landlord: 'bg-warning/10 text-warning border border-warning/20',
  pending_tenant: 'bg-warning/10 text-warning border border-warning/20',
  tenant_signed: 'bg-primary/10 text-primary border border-primary/20',
  landlord_signed: 'bg-primary/10 text-primary border border-primary/20',
  fully_signed: 'bg-success/10 text-success border border-success/20',
  terminated: 'bg-destructive/10 text-destructive border border-destructive/20',
  expired: 'bg-surface-container text-on-surface-variant border-outline-variant',
};

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm text-on-surface-variant" >
        <span className="inline-flex text-primary" >{icon}</span>
        {label}
      </div>
      <span className="text-sm font-medium text-primary" >{value}</span>
    </div>
  );
}

function ActionCard({ icon, title, description, href }: { icon: React.ReactNode; title: string; description: string; href: string }) {
  return (
    <Link href={href} className="card p-5 flex items-start gap-4 transition-all hover:shadow-md group no-underline" style={{ textDecoration: 'none' }}>
      <div className="p-3 rounded-xl bg-surface-container-lowest text-primary" >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-heading font-bold text-sm text-primary" >{title}</p>
        <p className="text-xs mt-1 text-on-surface-variant" >{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 mt-1 transition-transform group-hover:translate-x-1 text-on-surface-variant"  />
    </Link>
  );
}

export default function RealtorDealDetailClient({ deal }: { deal: Deal }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'actions'>('overview');
  const [actionLoading, setActionLoading] = useState(false);

  const statusClass = statusClasses[deal.status] || statusClasses.draft;
  const formatCurrency = (val: number) => `₦${val.toLocaleString()}`;
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });

  const handleSendMessage = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: deal.client, type: 'direct' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Conversation started');
    } catch {
      toast.error('Could not start conversation');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-on-surface-variant" >
        <Link href="/dashboard/agent" className="hover:underline">Dashboard</Link>
        <MaterialIcon name="/" className="material-symbols-outlined" />
        <Link href="/dashboard/agent/deals" className="hover:underline text-primary">Deals</Link>
        <MaterialIcon name="/" className="material-symbols-outlined" />
        <span  className="font-medium truncate">{deal.title}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/agent/deals"
            className="p-2 rounded-lg hover:bg-surface-container text-on-surface-variant"
            
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-heading font-bold text-headline-sm text-primary" >
              {deal.title}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1" >
              {deal.property} · Deal created {formatDate(deal.createdAt)}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusClass}`}>
          {deal.status.replace(/_/g, ' ')}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-outline-variant" >
        {(['overview', 'timeline', 'actions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent hover:text-primary'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading font-bold text-lg text-primary" >
                <Home className="inline w-5 h-5 mr-2 text-primary"  />
                Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {deal.coverImage && (
                <div className="aspect-video rounded-lg overflow-hidden bg-surface-container" >
                  <img src={deal.coverImage} alt={deal.property} className="w-full h-full object-cover" />
                </div>
              )}
              <p className="font-bold text-primary" >{deal.property}</p>
              <p className="text-sm flex items-center gap-1 text-on-surface-variant" >
                <MapPin className="w-3 h-3" /> {deal.area}, {deal.state}
              </p>
              <div className="space-y-2 pt-2 border-t border-outline-variant" >
                <DetailRow icon={<DollarSign className="w-4 h-4" />} label="Deal Value" value={formatCurrency(deal.value)} />
                <DetailRow icon={<Building2 className="w-4 h-4" />} label="Type" value={`${deal.listingType || '—'} / ${deal.propertyType || '—'}`} />
                <DetailRow icon={<User className="w-4 h-4" />} label="Landlord" value={deal.landlord} />
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading font-bold text-lg text-primary" >
                <User className="inline w-5 h-5 mr-2 text-primary"  />
                Client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="font-bold text-primary" >{deal.client}</p>
              <p className="text-sm flex items-center gap-2 text-on-surface-variant" >
                <Mail className="w-3 h-3" /> {deal.clientEmail}
              </p>
              {deal.clientPhone && (
                <p className="text-sm flex items-center gap-2 text-on-surface-variant" >
                  <Phone className="w-3 h-3" /> {deal.clientPhone}
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                className="mt-2 gap-2"
                onClick={handleSendMessage}
                disabled={actionLoading}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
                Message Client
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'timeline' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading font-bold text-lg text-primary" >
              <Clock className="inline w-5 h-5 mr-2 text-primary"  />
              Deal Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {[
                { event: 'Deal Created', date: deal.createdAt, detail: 'Initial agreement draft created' },
                { event: 'Last Updated', date: deal.updatedAt, detail: `Status: ${deal.status.replace(/_/g, ' ')}` },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    {idx < 1 && <div className="w-0.5 flex-1 mt-1 bg-surface-container" />}
                  </div>
                  <div className="pb-6">
                    <p className="text-sm font-medium text-primary" >{item.event}</p>
                    <p className="text-xs text-on-surface-variant" >{formatDate(item.date)}</p>
                    <p className="text-sm mt-1 text-on-surface-variant" >{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
            href="/dashboard/agent/listings"
          />
          <ActionCard
            icon={<FileText className="w-6 h-6" />}
            title="View Agreement"
            description="Review the sale agreement for this deal"
            href={`/dashboard/[role]/agreements/${deal.id}`}
          />
          <ActionCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Contact Client"
            description="Reach out to the client directly"
            href="#"
            // onSend removed from props due to prop type
          />
        </div>
      )}
    </div>
  );
}
