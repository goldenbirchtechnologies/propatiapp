'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function AgreementStatusBadge({ status }: { status: string }) {
  const config: Record<string, { class: string; label: string }> = {
    draft: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Draft' },
    pending_landlord: { class: 'bg-primary/10 text-primary border-primary/20', label: 'Pending Landlord' },
    pending_tenant: { class: 'bg-primary/10 text-primary border-primary/20', label: 'Pending Tenant' },
    tenant_signed: { class: 'bg-success/10 text-success border-success/20', label: 'Tenant Signed' },
    landlord_signed: { class: 'bg-success/10 text-success border-success/20', label: 'Landlord Signed' },
    fully_signed: { class: 'bg-success-bright/10 text-success border-success-bright/20', label: 'Fully Signed' },
    terminated: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Terminated' },
    expired: { class: 'bg-muted/30 text-on-surface-variant border-muted/50', label: 'Expired' },
  };
  const cfg = config[status] || { class: 'bg-muted/30 text-on-surface-variant border-muted/50', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

const INVOICE_STATUS_CONFIG: Record<string, { class: string; label: string }> = {
  draft: { class: 'bg-muted/30 text-muted-foreground border-muted/50', label: 'Draft' },
  sent: { class: 'bg-primary/10 text-primary border-primary/20', label: 'Sent' },
  paid: { class: 'bg-success/10 text-success border-success/20', label: 'Paid' },
  overdue: { class: 'bg-destructive/10 text-destructive border-destructive/20', label: 'Overdue' },
  cancelled: { class: 'bg-muted/30 text-muted-foreground border-muted/50', label: 'Cancelled' },
};

function InvoiceStatusBadge({ status }: { status: string }) {
  const cfg = INVOICE_STATUS_CONFIG[status] || { class: 'bg-muted/30 text-muted-foreground border-muted/50', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

const TICKET_STATUS_CONFIG: Record<string, { class: string; label: string }> = {
  open: { class: 'bg-warning/10 text-warning border-warning/20', label: 'Open' },
  in_progress: { class: 'bg-info/10 text-info border-info/20', label: 'In Progress' },
  resolved: { class: 'bg-success/10 text-success border-success/20', label: 'Resolved' },
  closed: { class: 'bg-muted/30 text-muted-foreground border-muted/50', label: 'Closed' },
};

function TicketStatusBadge({ status }: { status: string }) {
  const cfg = TICKET_STATUS_CONFIG[status] || { class: 'bg-muted/30 text-muted-foreground border-muted/50', label: status };
  return <span className={`tag ${cfg.class}`}>{cfg.label}</span>;
}

function KycSummary({ kyc }: { kyc: Kyc | null }) {
  const label =
    kyc?.status === 'not_started'
      ? 'Not Started'
      : kyc?.status === 'pending'
        ? 'Pending Review'
        : kyc?.status === 'approved'
          ? 'Verified'
          : kyc?.status === 'rejected'
            ? 'Rejected'
            : kyc?.status === 'frozen'
              ? 'Frozen'
              : kyc?.status || 'Not Started';

  return (
    <div className="flex items-center gap-3">
      <div className="p-3 rounded-full bg-primary/10 text-primary">
        <ShieldCheck className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-primary">KYC Status</p>
        <p className="text-xs text-muted-foreground">{kyc ? `Level ${kyc.level} · ${label}` : 'Not Started'}</p>
      </div>
    </div>
  );
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-sm text-headline-sm font-bold text-primary">Tenant Profile</h1>
          <p className="text-on-surface-variant">Overview, agreements, payments, maintenance, and KYC.</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/landlord/messages?tenant=${tenant.id}`}>
            <Button variant="outline" size="sm" className="gap-2">
              <MessageSquare className="w-4 h-4" /> Message
            </Button>
          </Link>
          <Dialog open={invoiceOpen} onOpenChange={setInvoiceOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <FileText className="w-4 h-4" /> Issue Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Issue Invoice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label className="text-sm">Amount</Label>
                  <Input type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} />
                </div>
                <div>
                  <Label className="text-sm">Note (optional)</Label>
                  <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" size="sm" onClick={() => setInvoiceOpen(false)} disabled={isSaving}>Cancel</Button>
                <Button size="sm" onClick={handleCreateInvoice} disabled={isSaving}>
                  {isSaving ? 'Creating...' : 'Create Invoice'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents & KYC</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-2">Personal & Contact</h3>
                  <div className="space-y-2 text-sm text-primary">
                    <p className="flex items-center gap-2"><Users className="w-4 h-4 text-muted-foreground" /> {tenant.fullName}</p>
                    {tenant.email && <p className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /> {tenant.email}</p>}
                    {tenant.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /> {tenant.phone}</p>}
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-2">Emergency Contact</h3>
                  <p className="text-sm text-primary">
                    {tenant.guarantorName ? `${tenant.guarantorName}${tenant.guarantorRelationship ? ` (${tenant.guarantorRelationship})` : ''}` : 'Not provided'}
                  </p>
                  {tenant.guarantorPhone && <p className="text-xs text-muted-foreground">{tenant.guarantorPhone}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-3">Occupancy Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Unit</p>
                  <p className="font-medium text-primary">{unitLabel}</p>
                </div>
                {agreements[0] && (
                  <>
                    <div>
                      <p className="text-muted-foreground">Rent Amount</p>
                      <p className="font-medium text-primary">{formatCurrency(agreements[0].rentAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Agreement Status</p>
                      <AgreementStatusBadge status={agreements[0].status} />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <KycSummary kyc={kyc} />
              {kyc?.dojahRef && (
                <p className="text-xs text-muted-foreground mt-2">Reference: {kyc.dojahRef}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-primary mb-3">Lease Agreements</h3>
              {agreements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No agreements found.</p>
              ) : (
                <div className="space-y-3">
                  {agreements.map((agr) => (
                    <div key={agr.id} className="flex items-center justify-between rounded-lg border border-outline-variant p-3">
                      <div>
                        <p className="text-sm font-medium text-primary">{agr.listing?.title || 'Unlinked Property'}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(agr.startDate)} → {formatDate(agr.endDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
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
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-primary">Financial Summary</CardTitle>
                <span className={`text-sm font-medium ${outstanding > 0 ? 'text-destructive' : 'text-success'}`}>
                  Outstanding: {formatCurrency(outstanding > 0 ? outstanding : null)}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-muted-foreground text-sm">No invoices yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Invoice</th>
                        <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Due</th>
                        <th className="px-4 py-3 text-right text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Amount</th>
                        <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.map((inv) => (
                        <tr key={inv.id} className="border-b border-outline-variant">
                          <td className="px-4 py-3 font-mono text-xs text-primary">{inv.invoiceNumber}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(inv.dueDate)}</td>
                          <td className="px-4 py-3 text-right text-sm font-mono text-primary">{formatCurrency(inv.amount)}</td>
                          <td className="px-4 py-3"><InvoiceStatusBadge status={inv.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <div className="p-4">
              <h3 className="text-sm font-medium text-primary mb-3">Maintenance Requests</h3>
              {tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground">No maintenance requests yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Ticket</th>
                        <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Category</th>
                        <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-[10px] font-label-md uppercase tracking-wider text-muted-foreground">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr key={ticket.id} className="border-b border-outline-variant">
                          <td className="px-4 py-3 text-sm text-primary">{ticket.title}</td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{ticket.category.replace('_', ' ')}</td>
                          <td className="px-4 py-3"><TicketStatusBadge status={ticket.status} /></td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
