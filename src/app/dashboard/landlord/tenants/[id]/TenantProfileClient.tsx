'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  MessageSquare,
  FileText,
  Download,
  Phone,
  Mail,
  Users,
  ShieldCheck,
  Home,
  MapPin,
  Shield,
  Fingerprint,
  MessageCircle,
  CalendarDays,
  Eye,
  X,
  Info,
  Gavel,
  BadgeCheck,
  CheckCircle2,
  Building2,
  UserCheck,
  FileCheck,
  Calendar,
  Video,
  Plus,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Tenant {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  idVerified: boolean;
  ninVerified: boolean;
  phoneVerified: boolean;
  employmentStatus: string | null;
  employmentType: string | null;
  employerName: string | null;
  jobTitle: string | null;
  yearlyIncome: string | null;
  incomeVerified: boolean;
  profileBio: string | null;
  guarantorName: string | null;
  guarantorPhone: string | null;
  guarantorRelationship: string | null;
}

interface Agreement {
  id: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  rentAmount: number | null;
  cautionDeposit: number | null;
  serviceCharge: number | null;
  listing: { id: string; title: string; area: string; state: string } | null;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  type: string;
  status: string;
  dueDate: Date;
  createdAt: Date;
}

interface Kyc {
  id: string;
  status: string;
  level: number;
  dojahRef: string | null;
  verifiedAt: Date | null;
}

interface Unit {
  id: string;
  buildingName: string | null;
  unitNumber: string;
  leaseStartDate: Date | null;
  leaseEndDate: Date | null;
}

interface Ticket {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string;
  createdAt: Date;
  resolutionNote: string | null;
}

interface TenantProfileClientProps {
  tenant: Tenant;
  agreements: Agreement[];
  invoices: Invoice[];
  outstanding: number;
  kyc: Kyc | null;
  units: Unit[];
  tickets: Ticket[];
}

function formatCurrency(value: number | null) {
  if (value === null) return '—';
  return `₦${Number(value).toLocaleString()}`;
}

function formatDate(date: Date | null) {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG');
}

const AGREEMENT_STATUS_CONFIG: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-white/10', label: 'Draft' },
  pending_landlord: { class: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400', label: 'Pending Landlord' },
  pending_tenant: { class: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400', label: 'Pending Tenant' },
  tenant_signed: { class: 'bg-primary/10 text-[var(--sovereign-hover)] border-primary/20 dark:text-[#4edea3]', label: 'Tenant Signed' },
  landlord_signed: { class: 'bg-primary/10 text-[var(--sovereign-hover)] border-primary/20 dark:text-[#4edea3]', label: 'Landlord Signed' },
  fully_signed: { class: 'bg-primary/10 text-[var(--sovereign-hover)] border-primary/20 dark:text-[#4edea3]', label: 'Fully Signed' },
  terminated: { class: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400', label: 'Terminated' },
  expired: { class: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-white/10', label: 'Expired' },
};

function AgreementStatusBadge({ status }: { status: string }) {
  const cfg = AGREEMENT_STATUS_CONFIG[status] || { class: 'bg-zinc-100 text-zinc-600 border-zinc-200', label: status };
  return <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.class}`}>{cfg.label}</span>;
}

const INVOICE_STATUS_CONFIG: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300', label: 'Draft' },
  sent: { class: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400', label: 'Sent' },
  paid: { class: 'bg-primary/10 text-[var(--sovereign-hover)] border-primary/20 dark:text-[#4edea3]', label: 'Paid' },
  overdue: { class: 'bg-red-500/10 text-red-700 border-red-500/20 dark:text-red-400', label: 'Overdue' },
  cancelled: { class: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400', label: 'Cancelled' },
};

function InvoiceStatusBadge({ status }: { status: string }) {
  const cfg = INVOICE_STATUS_CONFIG[status] || { class: 'bg-zinc-100 text-zinc-600 border-zinc-200', label: status };
  return <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.class}`}>{cfg.label}</span>;
}

const TICKET_STATUS_CONFIG: Record<string, { class: string; label: string }> = {
  open: { class: 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400', label: 'Open' },
  in_progress: { class: 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:text-blue-400', label: 'In Progress' },
  resolved: { class: 'bg-primary/10 text-[var(--sovereign-hover)] border-primary/20 dark:text-[#4edea3]', label: 'Resolved' },
  closed: { class: 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400', label: 'Closed' },
};

function TicketStatusBadge({ status }: { status: string }) {
  const cfg = TICKET_STATUS_CONFIG[status] || { class: 'bg-zinc-100 text-zinc-600 border-zinc-200', label: status };
  return <span className={`text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.class}`}>{cfg.label}</span>;
}

function kycLabel(status: string | undefined) {
  if (status === 'not_started') return 'Not Started';
  if (status === 'pending') return 'Pending Review';
  if (status === 'approved') return 'Verified';
  if (status === 'rejected') return 'Rejected';
  if (status === 'frozen') return 'Frozen';
  return status || 'Not Started';
}

export default function TenantProfileClient({
  tenant,
  agreements,
  invoices,
  outstanding,
  kyc,
  units,
  tickets,
}: TenantProfileClientProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const unitLabel = units[0]
    ? `${units[0].buildingName ? `${units[0].buildingName} · ` : ''}${units[0].unitNumber}`
    : '—';

  const primaryAgreement = agreements[0];
  const listingTitle = primaryAgreement?.listing?.title || unitLabel || 'Property';
  const listingLocation = primaryAgreement?.listing
    ? `${primaryAgreement.listing.area}, ${primaryAgreement.listing.state}`
    : '';

  const handleCreateInvoice = async () => {
    if (!amount) {
      toast.error('Enter an amount');
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: tenant.id,
          amount: Number(amount),
          note: note || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to create invoice' }));
        toast.error(data.error || 'Failed to create invoice');
        return;
      }
      toast.success('Invoice created');
      setInvoiceOpen(false);
      setAmount('');
      setNote('');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const statusChipClass = (status: string) => {
    if (status === 'fully_signed') return 'bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3]';
    if (status === 'terminated' || status === 'rejected') return 'bg-red-500/10 text-red-700 dark:text-red-400';
    if (status === 'pending_landlord' || status === 'pending_tenant' || status === 'draft') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    return 'bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400';
  };

  const overallStatus = primaryAgreement?.status || (kyc?.status === 'approved' ? 'verified' : 'pending');

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/dashboard/landlord" className="hover:text-primary transition-colors flex items-center gap-1">
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <Link href="/dashboard/landlord/tenants" className="hover:text-primary transition-colors font-medium">
          Tenants
        </Link>
        <span className="text-zinc-300 dark:text-zinc-600">/</span>
        <span className="text-zinc-900 dark:text-white font-semibold truncate max-w-xs">{tenant.fullName}</span>
      </nav>

      {/* Header Card */}
      <section className="relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] shadow-sm p-6">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              {tenant.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tenant.avatarUrl} alt={tenant.fullName} className="w-16 h-16 rounded-full object-cover shadow-sm bg-zinc-100 dark:bg-zinc-800" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl">
                  {tenant.fullName.charAt(0).toUpperCase()}
                </div>
              )}
              {tenant.idVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center shadow-xs">
                  <BadgeCheck className="w-3 h-3" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">{tenant.fullName}</h1>
                <span className={`text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${statusChipClass(overallStatus)}`}>
                  {String(overallStatus).replace(/_/g, ' ')}
                </span>
              </div>
              <div className="flex items-center flex-wrap gap-y-1 gap-x-3 text-sm text-zinc-500 dark:text-zinc-400">
                {tenant.email && (
                  <span className="flex items-center gap-1 text-zinc-900 dark:text-white">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    {tenant.email}
                  </span>
                )}
                {tenant.phone && (
                  <>
                    <span className="text-zinc-300 dark:text-zinc-600">•</span>
                    <span className="flex items-center gap-1 text-zinc-900 dark:text-white">
                      <Phone className="w-3.5 h-3.5 text-zinc-400" />
                      {tenant.phone}
                    </span>
                  </>
                )}
              </div>
              <div className="pt-1 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  REF: {tenant.id.slice(0, 8).toUpperCase()}
                </span>
                {primaryAgreement?.startDate && (
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Since {formatDate(primaryAgreement.startDate)}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end justify-between self-stretch pt-1 gap-2">
            <div className="text-left md:text-right">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Target Property</span>
              <span className="text-sm font-semibold text-primary">{listingTitle}</span>
            </div>
            {primaryAgreement?.rentAmount != null && (
              <div className="text-left md:text-right">
                <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Annual Rent</span>
                <span className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                  {formatCurrency(primaryAgreement.rentAmount)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center flex-wrap gap-2.5 mt-5 pt-4 bg-zinc-50 dark:bg-zinc-800/50 -mx-6 -mb-6 px-6 py-3.5 rounded-b-2xl border-t border-zinc-200 dark:border-white/[0.08]">
          <Link href={`/dashboard/landlord/messages?tenant=${tenant.id}`}>
            <Button className="bg-primary hover:bg-[var(--sovereign-hover)] text-white gap-1.5">
              <MessageSquare className="w-4 h-4" />
              Message Tenant
            </Button>
          </Link>
          <Button variant="outline" className="gap-1.5" onClick={() => setInvoiceOpen(true)}>
            <FileText className="w-4 h-4" />
            Issue Invoice
          </Button>
          {tenant.phone && (
            <Button variant="outline" className="gap-1.5" onClick={() => toast.info('Opening WhatsApp/SMS channel')}>
              <MessageCircle className="w-4 h-4" />
              Chat
            </Button>
          )}
        </div>
      </section>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN */}
        <div className="space-y-6">
          {/* Tenancy Details Card */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Tenancy Details</h2>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--sovereign-hover)] dark:text-[#4edea3] px-2.5 py-0.5 rounded-full bg-primary/10">
                  {primaryAgreement?.status ? primaryAgreement.status.replace(/_/g, ' ') : 'Residential'}
                </span>
              </div>
              <div className="space-y-3 text-sm">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-3.5 rounded-lg space-y-1">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Target Property</div>
                  <div className="text-sm font-semibold text-zinc-900 dark:text-white">{listingTitle}</div>
                  {listingLocation && (
                    <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 text-xs">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{listingLocation}</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Listing Type</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">Residential Long-Term</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Tenancy Term</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">
                      {primaryAgreement?.startDate && primaryAgreement?.endDate
                        ? `${Math.round((new Date(primaryAgreement.endDate).getTime() - new Date(primaryAgreement.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30))} Months`
                        : '12 Months (Renewable)'}
                    </span>
                  </div>
                </div>

                {primaryAgreement && (
                  <div className="pt-1">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block mb-2">
                      Itemized Financial Breakdown
                    </span>
                    <div className="rounded-lg bg-zinc-50 dark:bg-zinc-800/50 p-3 space-y-2">
                      {primaryAgreement.rentAmount != null && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-500 dark:text-zinc-400">Annual Base Rent</span>
                          <span className="font-mono font-semibold text-zinc-900 dark:text-white">{formatCurrency(primaryAgreement.rentAmount)}</span>
                        </div>
                      )}
                      {primaryAgreement.serviceCharge != null && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-500 dark:text-zinc-400">Service Charge &amp; CAM</span>
                          <span className="font-mono font-semibold text-zinc-900 dark:text-white">{formatCurrency(primaryAgreement.serviceCharge)}</span>
                        </div>
                      )}
                      {primaryAgreement.cautionDeposit != null && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            Refundable Caution Deposit
                            <Shield className="w-3.5 h-3.5 text-primary" />
                          </span>
                          <span className="font-mono font-semibold text-zinc-900 dark:text-white">{formatCurrency(primaryAgreement.cautionDeposit)}</span>
                        </div>
                      )}
                      <div className="pt-2 mt-2 bg-zinc-100 dark:bg-zinc-800 -mx-3 -mb-3 p-3 rounded-b-lg flex justify-between items-center">
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">Total Initial Outlay</span>
                        <span className="text-base font-bold text-primary font-mono">
                          {formatCurrency(
                            (primaryAgreement.rentAmount || 0) +
                              (primaryAgreement.serviceCharge || 0) +
                              (primaryAgreement.cautionDeposit || 0)
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs px-1 pt-1 text-zinc-500 dark:text-zinc-400">
                  <span>Lease Period:</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">
                    {primaryAgreement ? `${formatDate(primaryAgreement.startDate)} → ${formatDate(primaryAgreement.endDate)}` : '—'}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tenant Profile & Background Card */}
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Tenant Profile &amp; Background</h2>
                </div>
                {kyc && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--sovereign-hover)] dark:text-[#4edea3] px-2.5 py-0.5 rounded bg-primary/10">
                    {kycLabel(kyc.status)}
                  </span>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Employment Status</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">{tenant.employmentStatus || '—'}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Employment Type</span>
                    <span className="text-sm font-medium text-zinc-900 dark:text-white">{tenant.employmentType || '—'}</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">Employer</span>
                    {tenant.incomeVerified && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3]">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-zinc-900 dark:text-white">{tenant.employerName || '—'}</div>
                  {tenant.jobTitle && <div className="text-zinc-500 dark:text-zinc-400 text-xs">{tenant.jobTitle}</div>}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <div className="bg-white dark:bg-zinc-900 p-2.5 rounded border border-zinc-200 dark:border-white/[0.08]">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Yearly Income</span>
                      <span className="text-sm font-bold text-primary font-mono">{tenant.yearlyIncome ? `₦${Number(tenant.yearlyIncome).toLocaleString()}` : '—'}</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-2.5 rounded border border-zinc-200 dark:border-white/[0.08]">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Income Verified</span>
                      <span className={`text-sm font-bold font-mono ${tenant.incomeVerified ? 'text-primary' : 'text-zinc-400'}`}>
                        {tenant.incomeVerified ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </div>
                </div>

                {tenant.profileBio && (
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed italic">
                    “{tenant.profileBio}”
                  </div>
                )}

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold block">
                    Statutory Identity Tokens
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${tenant.idVerified ? 'bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3]' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="w-4 h-4" />
                        <span className="text-sm font-medium">ID Verification</span>
                      </div>
                      <span className="text-[11px] font-mono uppercase font-bold">{tenant.idVerified ? 'Validated' : 'Pending'}</span>
                    </div>
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${tenant.ninVerified ? 'bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3]' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4" />
                        <span className="text-sm font-medium">NIN Verification</span>
                      </div>
                      <span className="text-[11px] font-mono uppercase font-bold">{tenant.ninVerified ? 'NIMC Active' : 'Pending'}</span>
                    </div>
                    <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${tenant.phoneVerified ? 'bg-primary/10 text-[var(--sovereign-hover)] dark:text-[#4edea3]' : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'}`}>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">Phone OTP</span>
                      </div>
                      <span className="text-[11px] font-mono uppercase font-bold">{tenant.phoneVerified ? 'Confirmed' : 'Pending'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {(tenant.guarantorName || tenant.guarantorPhone) && (
            <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">Guarantor Information</h2>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-1">
                    <div className="text-sm font-bold text-zinc-900 dark:text-white">{tenant.guarantorName || '—'}</div>
                    {tenant.guarantorRelationship && <div className="text-zinc-500 dark:text-zinc-400 text-xs">{tenant.guarantorRelationship}</div>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded bg-zinc-50 dark:bg-zinc-800/50">
                      <span className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">Phone</span>
                      <span className="font-mono font-medium text-zinc-900 dark:text-white">{tenant.guarantorPhone || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">KYC Status</h2>
                </div>
                <span className="text-[11px] font-mono font-bold text-[var(--sovereign-hover)] dark:text-[#4edea3] bg-primary/10 px-2.5 py-1 rounded-full">
                  {kyc ? `Level ${kyc.level}` : '—'}
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white">Status</span>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">{kyc ? kycLabel(kyc.status) : 'Not Started'}</div>
                  </div>
                  <span className={`flex items-center gap-1 text-[11px] font-bold ${kyc?.status === 'approved' ? 'text-primary' : 'text-zinc-400'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                    {kyc?.status === 'approved' ? 'PASSED' : 'PENDING'}
                  </span>
                </div>
                {kyc?.dojahRef && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Reference: {kyc.dojahRef}</p>
                )}
              </div>
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Lease Agreements</h2>
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">All Encrypted AES-256</span>
              </div>
              {agreements.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No agreements found.</p>
              ) : (
                <div className="space-y-2">
                  {agreements.map((agr) => (
                    <div key={agr.id} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <div className="min-w-0 pr-2">
                        <div className="text-sm font-semibold text-zinc-900 dark:text-white truncate">
                          {agr.listing?.title || 'Unlinked Property'}
                        </div>
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                          {formatDate(agr.startDate)} → {formatDate(agr.endDate)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <AgreementStatusBadge status={agr.status} />
                        {agr.status === 'fully_signed' && (
                          <Link href={`/api/agreements/${agr.id}/pdf`}>
                            <Button variant="ghost" size="sm">
                              <Download className="w-4 h-4" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
                    <CalendarDays className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Financial Summary</h2>
                </div>
                <span className={`text-sm font-medium ${outstanding > 0 ? 'text-red-600 dark:text-red-400' : 'text-primary dark:text-[#4edea3]'}`}>
                  Outstanding: {formatCurrency(outstanding > 0 ? outstanding : null)}
                </span>
              </div>
              {invoices.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No invoices yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-white/[0.08]">
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Invoice</th>
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Due</th>
                        <th className="px-3 py-2 text-right text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Amount</th>
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-b border-zinc-100 dark:border-white/[0.05]">
                          <td className="px-3 py-2 font-mono text-xs text-zinc-900 dark:text-white">{inv.invoiceNumber}</td>
                          <td className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(inv.dueDate)}</td>
                          <td className="px-3 py-2 text-right text-sm font-mono text-zinc-900 dark:text-white">{formatCurrency(inv.amount)}</td>
                          <td className="px-3 py-2"><InvoiceStatusBadge status={inv.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
                    <Gavel className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Maintenance Requests</h2>
                </div>
              </div>
              {tickets.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No maintenance requests yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-white/[0.08]">
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Ticket</th>
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Category</th>
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</th>
                        <th className="px-3 py-2 text-left text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b border-zinc-100 dark:border-white/[0.05]">
                          <td className="px-3 py-2 text-sm text-zinc-900 dark:text-white">{ticket.title}</td>
                          <td className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">{ticket.category.replace(/_/g, ' ')}</td>
                          <td className="px-3 py-2"><TicketStatusBadge status={ticket.status} /></td>
                          <td className="px-3 py-2 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(ticket.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>

          <Card className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-primary">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">Internal Notes &amp; Audit Log</h2>
                </div>
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">Strictly Confidential</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-white">Landlord</span>
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400">recent</span>
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Tenant profile reviewed. {tenant.fullName} — {kyc ? kycLabel(kyc.status) : 'KYC pending'}.
                  </p>
                </div>
              </div>
              <div className="pt-2 space-y-2">
                <Textarea
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add an internal note or screening comment (minimum 20 characters)..."
                  className="bg-zinc-50 dark:bg-zinc-800/50"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">{note.trim().length} / 20 chars min</span>
                  <Button
                    size="sm"
                    disabled={note.trim().length < 20}
                    onClick={() => {
                      toast.success('Audit log note recorded.');
                      setNote('');
                    }}
                    className="gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Add Note
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
        <DialogContent className="max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="text-zinc-900 dark:text-white">Issue Invoice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-sm text-zinc-700 dark:text-zinc-300">Amount</Label>
              <Input type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <Label className="text-sm text-zinc-700 dark:text-zinc-300">Note (optional)</Label>
              <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setInvoiceOpen(false)} disabled={isSaving}>Cancel</Button>
            <Button size="sm" onClick={handleCreateInvoice} disabled={isSaving} className="bg-primary hover:bg-[var(--sovereign-hover)] text-white">
              {isSaving ? 'Creating...' : 'Create Invoice'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}