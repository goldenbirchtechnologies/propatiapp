'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Building2,
  Eye,
  Upload,
  Calendar,
  FileText,
  MessageSquare,
  ShieldCheck,
  Download,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  BedDouble,
  Bath,
  Square,
  Car,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
  Lock,
  Unlock,
  Settings2,
  Send,
  Inbox,
  BarChart3,
  FileBarChart,
  CreditCard,
  Edit3,
  ToggleLeft,
  ToggleRight,
  X,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCard, PageHeader } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

interface Unit {
  id: string;
  unitNumber: string;
  buildingName: string | null;
  type: string;
  listingType: string;
  rent: number;
  pricePeriod: string | null;
  status: string;
  occupancy: string;
  isListed: boolean;
  currentTenant?: { id: string; fullName: string; email: string } | null;
}

interface Applicant {
  id: string;
  status: string;
  createdAt: string;
  applicant: { fullName: string; email: string } | null;
}

interface Agreement {
  id: string;
  status: string;
  createdAt: string;
}

interface Booking {
  id: string;
  status: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  tenant: { fullName: string } | null;
}

interface Ticket {
  id: string;
  status: string;
  priority: string;
  title: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  subject: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
}

interface Invoice {
  id: string;
  status: string;
  amount: number;
  dueDate: string | null;
  createdAt: string;
}

interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  createdAt: string;
}

interface Assignment {
  id: string;
  permissions: string[];
  scope: string;
  status: string;
}

interface Listing {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  city: string | null;
  postalCode: string | null;
  listingType: string;
  propertyType: string | null;
  price: number;
  pricePeriod: string | null;
  cautionDeposit: number;
  serviceCharge: number;
  bedrooms: number | null;
  bathrooms: number | null;
  toilets: number | null;
  sizeSqm: number | null;
  floorLevel: number | null;
  furnished: boolean;
  parkingSpaces: number;
  amenities: unknown;
  availableFrom: string | null;
  minimumStay: number | null;
  status: string;
  allowShortlet: boolean;
  guestsCount: number | null;
  bedsCount: number | null;
  privacyType: string | null;
  propertyStructure: string | null;
  bookingModel: string | null;
  weekendPricing: number;
  discounts: unknown;
  highlights: unknown;
  houseRules: unknown;
  safetyDisclosures: unknown;
  kycCompliance: unknown;
  verificationTier: string;
  viewsCount: number;
  createdAt: string;
  description: string;
  owner: { id: string; fullName: string; email: string; phone: string | null; avatarUrl: string | null } | null;
  agent: { id: string; fullName: string; email: string; phone: string | null; avatarUrl: string | null } | null;
  images: { id: string; url: string; isCover: boolean; sortOrder: number }[];
  units: Unit[];
  permissions: string[];
  assignments: Assignment[];
  applications: Applicant[];
  agreements: Agreement[];
  bookings: Booking[];
  maintenanceTickets: Ticket[];
  conversations: Conversation[];
  invoices: Invoice[];
  documents: Document[];
}

function formatCurrency(value: number): string {
  return `₦${value.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatRelativeDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(value);
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

type Props = { listing: Listing };

const PERMISSION_LABELS: Record<string, string> = {
  view_analytics: 'Performance & Analytics',
  view_inquiries: 'Enquiry & Viewing Audit',
  view_financials: 'Financial Visibility',
  publish_listings: 'Publishing Clearance',
  edit_listings: 'Edit Listing Details',
  upload_media: 'Upload Photos & Docs',
  schedule_viewings: 'Schedule Viewings',
  record_payments: 'Record Payments',
  manage_team: 'Manage Team',
};

function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div>
        <h3 className="text-white font-semibold text-sm">{title}</h3>
        {subtitle && <p className="text-zinc-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function PermissionModal({
  listing,
  open,
  onOpenChange,
}: {
  listing: Listing;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [permissions, setPermissions] = useState<string[]>(listing.assignments[0]?.permissions || []);
  const [scope, setScope] = useState(listing.assignments[0]?.scope || 'limited_scope');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setPermissions(listing.assignments[0]?.permissions || []);
      setScope(listing.assignments[0]?.scope || 'limited_scope');
    }
  }, [open, listing.assignments]);

  const togglePermission = (perm: string) => {
    setPermissions((prev) => (prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const assignmentId = listing.assignments[0]?.id;
      if (!assignmentId) {
        toast({ title: 'No assignment found for this listing', variant: 'destructive' });
        setSaving(false);
        return;
      }
      const res = await fetch(`/api/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions, scope }),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast({ title: 'Owner access updated', description: 'Permission settings saved successfully.' });
      onOpenChange(false);
    } catch (e) {
      toast({ title: 'Update failed', description: e instanceof Error ? e.message : 'Unexpected error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#0d1117] border border-white/10 text-zinc-300 sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">Owner Access Controls</DialogTitle>
          <DialogDescription>Customize what the owner can see and do in their portal.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-3">
            {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3">
                <div>
                  <p className="text-sm text-white">{label}</p>
                  <p className="text-xs text-zinc-500">{key.replace(/_/g, ' ')}</p>
                </div>
                <Switch
                  checked={permissions.includes(key)}
                  onCheckedChange={() => togglePermission(key)}
                  className="data-[state=checked]:bg-emerald-500"
                />
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400">Scope</Label>
            <div className="flex gap-2">
              {['full_access', 'limited_scope', 'read_only'].map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={scope === s ? 'default' : 'outline'}
                  className={cn(
                    'rounded-lg capitalize',
                    scope === s ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'border-white/10 text-zinc-300 hover:bg-zinc-900'
                  )}
                  onClick={() => setScope(s)}
                >
                  {s.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-zinc-400 hover:text-white">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-500 hover:bg-emerald-600 text-white">
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AgentListingDetailClient({ listing }: Props) {
  const router = useRouter();
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  const coverImage = listing.images.find((img) => img.isCover) || listing.images[0];
  const otherImages = listing.images.filter((img) => img.id !== coverImage?.id).slice(0, 8);

  const ownerAccessLevel = listing.assignments[0]?.scope || 'read_only';
  const ownerPermissions = listing.assignments[0]?.permissions || [];

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Listing published', description: 'Your listing is now live.' });
      router.refresh();
    } catch (e) {
      toast({ title: 'Publish failed', description: e instanceof Error ? e.message : 'Unexpected error' });
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      // Placeholder: integrate Cloudinary/S3 upload here
      toast({ title: 'Upload started', description: `${files.length} file(s) queued.` });
    } catch (e) {
      toast({ title: 'Upload failed', description: e instanceof Error ? e.message : 'Unexpected error' });
    } finally {
      setUploading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          agentId: listing.agent?.id || null,
          landlordId: listing.owner?.id || null,
          tenantId: null,
          orgId: null,
          propertyId: null,
          subject: listing.title,
          content: messageText,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Message sent', description: 'Your message has been delivered.' });
      setMessageText('');
      setMessageOpen(false);
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unexpected error' });
    } finally {
      setSending(false);
    }
  };

  const amenityList = Array.isArray(listing.amenities)
    ? listing.amenities
    : listing.amenities && typeof listing.amenities === 'object'
      ? Object.values(listing.amenities as Record<string, unknown>)
      : [];

  const houseRulesList = Array.isArray(listing.houseRules)
    ? listing.houseRules
    : listing.houseRules && typeof listing.houseRules === 'object'
      ? Object.values(listing.houseRules as Record<string, unknown>)
      : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={listing.title}
        description={listing.address}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 size-3.5" /> Back
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-lg text-zinc-400 hover:text-white">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0d1117] border border-white/10 text-zinc-300">
                <DropdownMenuItem onClick={() => setPermissionOpen(true)}>
                  <Settings2 className="mr-2 size-3.5" /> Owner Access Controls
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/agent/listings/${listing.id}/edit`}>
                    <Edit3 className="mr-2 size-3.5" /> Edit Listing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => setMessageOpen(true)}>
                  <MessageSquare className="mr-2 size-3.5" /> Message Owner
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white" onClick={handlePublish}>
          <CheckCircle2 className="mr-2 size-3.5" /> Publish Listing
        </Button>
        <Button asChild size="sm" variant="outline" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900">
          <Link href={`/dashboard/agent/listings/${listing.id}/edit`}>
            <Edit3 className="mr-2 size-3.5" /> Edit
          </Link>
        </Button>
        <Button size="sm" variant="outline" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900" onClick={() => document.getElementById('upload-input')?.click()}>
          <Upload className="mr-2 size-3.5" /> Upload Photos
        </Button>
        <input id="upload-input" type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
        <Button asChild size="sm" variant="outline" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900">
          <Link href={`/dashboard/agent/calendar`}>
            <Calendar className="mr-2 size-3.5" /> Schedule Viewing
          </Link>
        </Button>
        <Button size="sm" variant="outline" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900" onClick={() => setPermissionOpen(true)}>
          <Settings2 className="mr-2 size-3.5" /> Owner Access
        </Button>
      </div>

      {/* Permission Banner */}
      {listing.assignments.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "size-10 rounded-lg flex items-center justify-center",
              ownerAccessLevel === 'full_access' ? 'bg-emerald-500/10 text-emerald-400' :
                ownerAccessLevel === 'read_only' ? 'bg-zinc-800 text-zinc-400' : 'bg-amber-500/10 text-amber-400'
            )}>
              {ownerAccessLevel === 'full_access' ? <Unlock className="size-5" /> :
                ownerAccessLevel === 'read_only' ? <Lock className="size-5" /> : <ToggleRight className="size-5" />}
            </div>
            <div>
              <p className="text-sm text-white font-medium">Owner Access: {ownerAccessLevel.replace(/_/g, ' ')}</p>
              <p className="text-xs text-zinc-500">{ownerPermissions.length} permissions enabled</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-1">
            {ownerPermissions.slice(0, 3).map((perm) => (
              <Badge key={perm} variant="outline" className="text-[11px] border-white/10 text-zinc-300">
                {PERMISSION_LABELS[perm] || perm}
              </Badge>
            ))}
            {ownerPermissions.length > 3 && (
              <Badge variant="outline" className="text-[11px] border-white/10 text-zinc-300">
                +{ownerPermissions.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Listed Units" value={String(listing.units.filter((u) => u.isListed).length)} icon={Eye} />
        <StatCard label="Applications" value={String(listing.applications.length)} icon={Inbox} accentColor="#3b82f6" />
        <StatCard label="Agreements" value={String(listing.agreements.length)} icon={FileText} accentColor="#10b981" />
        <StatCard label="Bookings" value={String(listing.bookings.length)} icon={Calendar} accentColor="#f59e0b" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-zinc-900/60 border border-white/[0.08]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="media">Media ({listing.images.length})</TabsTrigger>
              <TabsTrigger value="units">Units ({listing.units.length})</TabsTrigger>
              <TabsTrigger value="inquiries">Inquiries ({listing.applications.length})</TabsTrigger>
              <TabsTrigger value="bookings">Bookings ({listing.bookings.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({listing.documents.length})</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-4">
                <SectionHeader title="Description" />
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {listing.description || 'No description provided for this property.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { label: 'Bedrooms', value: listing.bedrooms ?? '—', icon: BedDouble },
                    { label: 'Bathrooms', value: listing.bathrooms ?? '—', icon: Bath },
                    { label: 'Toilets', value: listing.toilets ?? '—', icon: Square },
                    { label: 'Size', value: listing.sizeSqm ? `${listing.sizeSqm} sqm` : '—', icon: Square },
                    { label: 'Floor Level', value: listing.floorLevel ?? '—', icon: Building2 },
                    { label: 'Parking', value: String(listing.parkingSpaces), icon: Car },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3">
                      <div className="flex items-center gap-2 text-zinc-500 mb-1">
                        <item.icon className="size-3.5" />
                        <span className="text-xs">{item.label}</span>
                      </div>
                      <p className="text-sm text-white font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>

                {amenityList.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {amenityList.map((a: unknown, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-white/10 text-zinc-300">
                          {String(a)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {listing.highlights && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Highlights</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(listing.highlights) ? listing.highlights : []).map((h: unknown, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-emerald-500/20 text-emerald-300">
                          {String(h)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {houseRulesList.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">House Rules</p>
                    <div className="flex flex-wrap gap-2">
                      {houseRulesList.map((r: unknown, idx: number) => (
                        <Badge key={idx} variant="outline" className="border-white/10 text-zinc-300">
                          {String(r)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-4">
                <SectionHeader
                  title="Gallery"
                  action={
                    <Button size="sm" variant="outline" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900" onClick={() => document.getElementById('gallery-upload')?.click()}>
                      <Upload className="mr-2 size-3.5" /> Upload
                    </Button>
                  }
                />
                <input id="gallery-upload" type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
                {listing.images.length === 0 ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 p-10 text-center">
                    <ImageIcon className="size-8 text-zinc-600 mb-3" />
                    <p className="text-sm text-zinc-500">No photos uploaded yet</p>
                    <p className="text-xs text-zinc-600 mt-1">Upload photos to showcase this property</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {listing.images.map((img) => (
                      <div key={img.id} className="relative rounded-xl overflow-hidden border border-white/[0.08] aspect-video bg-zinc-900">
                        <img src={img.url} alt={listing.title} className="h-full w-full object-cover" />
                        {img.isCover && (
                          <Badge className="absolute top-2 left-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                            Cover
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="units" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-900/40">
                      <TableHead className="text-zinc-400">Unit</TableHead>
                      <TableHead className="text-zinc-400">Type</TableHead>
                      <TableHead className="text-zinc-400">Rent</TableHead>
                      <TableHead className="text-zinc-400">Occupancy</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Tenant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listing.units.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-sm text-zinc-500 py-12">
                          No units added yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      listing.units.map((unit) => (
                        <TableRow key={unit.id} className="border-b border-white/[0.06]">
                          <TableCell className="py-3">
                            <div>
                              <p className="text-sm font-medium text-white">{unit.unitNumber}</p>
                              <p className="text-xs text-zinc-500">{unit.buildingName || '—'}</p>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="text-[11px] border-white/10 text-zinc-300 capitalize">
                              {unit.type || unit.listingType}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-sm text-white">
                              {unit.rent > 0 ? formatCurrency(unit.rent) : 'Contact for Pricing'}
                            </span>
                          </TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={unit.occupancy} />
                          </TableCell>
                          <TableCell className="py-3">
                            {unit.isListed ? (
                              <span className="tag bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs px-2 py-1 rounded-full">
                                Listed
                              </span>
                            ) : (
                              <span className="tag bg-muted text-zinc-500 border border-white/[0.08] text-xs px-2 py-1 rounded-full">
                                Unlisted
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="py-3">
                            {unit.currentTenant ? (
                              <div className="flex items-center gap-2">
                                <div className="size-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] text-white">
                                  {initials(unit.currentTenant.fullName)}
                                </div>
                                <span className="text-xs text-zinc-300">{unit.currentTenant.fullName}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-zinc-600">Vacant</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="inquiries" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-900/40">
                      <TableHead className="text-zinc-400">Applicant</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Date</TableHead>
                      <TableHead className="text-right text-zinc-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listing.applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-zinc-500 py-12">
                          No inquiries yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      listing.applications.map((app) => (
                        <TableRow key={app.id} className="border-b border-white/[0.06]">
                          <TableCell className="py-3">
                            <div>
                              <p className="text-sm text-white">{app.applicant?.fullName || '—'}</p>
                              <p className="text-xs text-zinc-500">{app.applicant?.email || ''}</p>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={app.status} />
                          </TableCell>
                          <TableCell className="py-3 text-xs text-zinc-400">{formatDate(app.createdAt)}</TableCell>
                          <TableCell className="py-3 text-right">
                            <Button asChild size="sm" variant="ghost" className="rounded-lg text-zinc-400 hover:text-white">
                              <Link href={`/dashboard/agent/applications/${app.id}`}>Review</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-900/40">
                      <TableHead className="text-zinc-400">Tenant</TableHead>
                      <TableHead className="text-zinc-400">Check-in</TableHead>
                      <TableHead className="text-zinc-400">Check-out</TableHead>
                      <TableHead className="text-zinc-400">Amount</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listing.bookings.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-sm text-zinc-500 py-12">
                          No bookings yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      listing.bookings.map((bk) => (
                        <TableRow key={bk.id} className="border-b border-white/[0.06]">
                          <TableCell className="py-3 text-sm text-white">{bk.tenant?.fullName || '—'}</TableCell>
                          <TableCell className="py-3 text-xs text-zinc-400">{formatDate(bk.checkIn)}</TableCell>
                          <TableCell className="py-3 text-xs text-zinc-400">{formatDate(bk.checkOut)}</TableCell>
                          <TableCell className="py-3 text-sm text-white">{formatCurrency(bk.totalPrice)}</TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={bk.status} />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-900/40">
                      <TableHead className="text-zinc-400">Name</TableHead>
                      <TableHead className="text-zinc-400">Type</TableHead>
                      <TableHead className="text-zinc-400">Added</TableHead>
                      <TableHead className="text-right text-zinc-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listing.documents.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-zinc-500 py-12">
                          No documents uploaded.
                        </TableCell>
                      </TableRow>
                    ) : (
                      listing.documents.map((d) => (
                        <TableRow key={d.id} className="border-b border-white/[0.06]">
                          <TableCell className="py-3 text-sm text-white">{d.name}</TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="text-[11px] border-white/10 text-zinc-300 capitalize">
                              {d.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-xs text-zinc-400">{formatDate(d.createdAt)}</TableCell>
                          <TableCell className="py-3 text-right">
                            <Button asChild variant="ghost" size="sm" className="rounded-lg text-zinc-400 hover:text-white">
                              <a href={d.url} target="_blank" rel="noreferrer">
                                <Download className="size-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="financials" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-4">
                <SectionHeader title="Pricing" />
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Price', value: formatCurrency(listing.price) },
                    { label: 'Period', value: listing.pricePeriod ? listing.pricePeriod.charAt(0).toUpperCase() + listing.pricePeriod.slice(1) : '—' },
                    { label: 'Caution Deposit', value: listing.cautionDeposit > 0 ? formatCurrency(listing.cautionDeposit) : '—' },
                    { label: 'Service Charge', value: listing.serviceCharge > 0 ? formatCurrency(listing.serviceCharge) : '—' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/[0.08] bg-zinc-950/60 p-3">
                      <p className="text-xs text-zinc-500 mb-1">{item.label}</p>
                      <p className="text-sm text-white font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {listing.invoices.length > 0 && (
                <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-zinc-900/40">
                        <TableHead className="text-zinc-400">Invoice</TableHead>
                        <TableHead className="text-zinc-400">Amount</TableHead>
                        <TableHead className="text-zinc-400">Due</TableHead>
                        <TableHead className="text-zinc-400">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listing.invoices.map((inv) => (
                        <TableRow key={inv.id} className="border-b border-white/[0.06]">
                          <TableCell className="py-3 text-sm text-white">#{inv.id.slice(-6)}</TableCell>
                          <TableCell className="py-3 text-sm text-white">{formatCurrency(inv.amount)}</TableCell>
                          <TableCell className="py-3 text-xs text-zinc-400">{formatDate(inv.dueDate)}</TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={inv.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Owner / Landlord */}
          {listing.owner && (
            <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-3">
              <SectionHeader title="Owner / Landlord" />
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center text-white text-sm font-medium">
                  {initials(listing.owner.fullName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{listing.owner.fullName}</p>
                  <p className="text-xs text-zinc-500 truncate">{listing.owner.email}</p>
                </div>
              </div>
              <div className="space-y-2">
                {listing.owner.phone && (
                  <a href={`tel:${listing.owner.phone}`} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
                    <ShieldCheck className="size-3.5" /> {listing.owner.phone}
                  </a>
                )}
                <a href={`mailto:${listing.owner.email}`} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
                  <MessageSquare className="size-3.5" /> {listing.owner.email}
                </a>
              </div>
            </div>
          )}

          {/* Assigned Agent */}
          {listing.agent && (
            <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-3">
              <SectionHeader title="Assigned Agent" />
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-zinc-800 flex items-center justify-center text-white text-sm font-medium">
                  {initials(listing.agent.fullName)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium truncate">{listing.agent.fullName}</p>
                  <p className="text-xs text-zinc-500 truncate">{listing.agent.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Lease Terms */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-3">
            <SectionHeader title="Lease Terms" />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Billing</span>
                <span className="text-white font-medium">{listing.pricePeriod ? listing.pricePeriod.charAt(0).toUpperCase() + listing.pricePeriod.slice(1) : '—'}</span>
              </div>
              {listing.minimumStay && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Min Stay</span>
                  <span className="text-zinc-300">{listing.minimumStay} {listing.minimumStay === 1 ? 'month' : 'months'}</span>
                </div>
              )}
              {listing.availableFrom && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Available From</span>
                  <span className="text-zinc-300">{formatDate(listing.availableFrom)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-3">
            <SectionHeader title="Quick Actions" />
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => setMessageOpen(true)}>
                <MessageSquare className="mr-2 size-3.5" /> Message
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900">
                <Link href={`/dashboard/agent/listings/${listing.id}/edit`}>
                  <Edit3 className="mr-2 size-3.5" /> Edit
                </Link>
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900" onClick={handlePublish}>
                <CheckCircle2 className="mr-2 size-3.5" /> Publish
              </Button>
              <Button size="sm" variant="outline" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900" onClick={() => setPermissionOpen(true)}>
                <Settings2 className="mr-2 size-3.5" /> Permissions
              </Button>
            </div>
          </div>

          {/* Recent Conversations */}
          {listing.conversations.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-3">
              <SectionHeader title="Recent Conversations" subtitle={formatRelativeDate(listing.conversations[0].lastMessageAt)} />
              <div className="space-y-3">
                {listing.conversations.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/agent/messages`}
                    className="flex items-start gap-3 rounded-lg border border-white/[0.06] bg-zinc-950/60 p-3 hover:border-zinc-700/80 transition-colors"
                  >
                    <div className="size-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-xs">
                      <MessageSquare className="size-3.5 text-zinc-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white truncate">{c.subject}</p>
                      <p className="text-xs text-zinc-500 truncate">{c.lastMessage || 'No messages yet'}</p>
                    </div>
                    <span className="text-[10px] text-zinc-600 whitespace-nowrap">{formatRelativeDate(c.lastMessageAt)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent Documents */}
          {listing.documents.length > 0 && (
            <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-3">
              <SectionHeader title="Documents" />
              <div className="space-y-2">
                {listing.documents.map((d) => (
                  <a
                    key={d.id}
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-950/60 px-3 py-2 hover:border-zinc-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="size-3.5 text-zinc-500 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-white truncate">{d.name}</p>
                        <p className="text-[10px] text-zinc-600 capitalize">{d.type}</p>
                      </div>
                    </div>
                    <Download className="size-3.5 text-zinc-500 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Permission Modal */}
      <PermissionModal listing={listing} open={permissionOpen} onOpenChange={setPermissionOpen} />

      {/* Message Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="bg-[#0d1117] border border-white/10 text-zinc-300 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Message Owner</DialogTitle>
            <DialogDescription>Send a message about {listing.title}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type your message..."
              className="bg-zinc-900 border-white/10 text-white min-h-[120px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setMessageOpen(false)} className="text-zinc-400 hover:text-white">
                Cancel
              </Button>
              <Button onClick={handleSendMessage} disabled={sending || !messageText.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
