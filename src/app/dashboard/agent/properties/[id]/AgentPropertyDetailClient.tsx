'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Building2,
  Home,
  User,
  Phone,
  Mail,
  MapPin,
  BedDouble,
  Bath,
  Square,
  Car,
  Users,
  Calendar,
  FileText,
  MessageSquare,
  ShieldCheck,
  Download,
  ExternalLink,
  MoreHorizontal,
  ChevronRight,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Image as ImageIcon,
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
  partyA: { fullName: string } | null;
  partyB: { fullName: string } | null;
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

interface Document {
  id: string;
  type: string;
  name: string;
  url: string;
  createdAt: string;
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
  coverImage: string | null;
  units: Unit[];
  permissions: string[];
  totalUnits: number;
  vacantUnits: number;
  occupiedUnits: number;
  listedUnits: number;
  applications: Applicant[];
  agreements: Agreement[];
  bookings: Booking[];
  maintenanceTickets: Ticket[];
  conversations: Conversation[];
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

function AmenityBadge({ label }: { label: string }) {
  return (
    <Badge variant="outline" className="border-white/10 text-zinc-300">
      {label}
    </Badge>
  );
}

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

export default function AgentPropertyDetailClient({ listing }: Props) {
  const router = useRouter();
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const occupancyRate = listing.totalUnits > 0 ? Math.round((listing.occupiedUnits / listing.totalUnits) * 100) : 0;

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setSending(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          agentId: listing.agent?.id || (await import('@/lib/auth')).getCurrentUserWithProfile().then((u) => u?.id),
          landlordId: listing.owner?.id,
          tenantId: null,
          orgId: null,
          propertyId: null,
          subject: listing.title,
          content: messageText,
        }),
      });
      if (!res.ok) throw new Error('Failed to send');
      toast({ title: 'Message sent', description: 'Your message has been delivered.' });
      setMessageText('');
      setMessageOpen(false);
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unexpected error' });
    } finally {
      setSending(false);
    }
  };

  const handleMessageOwner = async () => {
    if (!listing.owner?.id) return;
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listing.id,
          agentId: listing.agent?.id || null,
          landlordId: listing.owner.id,
          tenantId: null,
          orgId: null,
          propertyId: null,
          subject: listing.title,
          content: messageText || 'Hello, I am reaching out regarding this property.',
        }),
      });
      if (!res.ok) throw new Error('Failed');
      toast({ title: 'Message sent to owner' });
      setMessageText('');
      setMessageOpen(false);
    } catch (e) {
      toast({ title: 'Failed', description: e instanceof Error ? e.message : 'Unexpected error' });
    }
  };

  return (
    <div className="p-6 space-y-6">
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
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/agent/listings/${listing.id}`}>Manage Listing</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/agent/properties`}>All Properties</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => setMessageOpen(true)}>Message Owner</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />

      {/* Hero */}
      <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
        <div className="relative h-56 bg-zinc-900">
          {listing.coverImage ? (
            <img src={listing.coverImage} alt={listing.title} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center">
              <ImageIcon className="h-10 w-10 text-zinc-600" style={{ opacity: 0.5 }} />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={listing.status} />
              <Badge variant="outline" className="border-white/20 text-white capitalize">
                {listing.listingType.replace('_', ' ')}
              </Badge>
              {listing.propertyType && (
                <Badge variant="outline" className="border-white/10 text-zinc-300 capitalize">
                  {listing.propertyType.replace('_', ' ')}
                </Badge>
              )}
              {listing.verificationTier !== 'basic' && (
                <Badge className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="mr-1 size-3" /> {listing.verificationTier}
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-semibold text-white mt-2">{listing.title}</h1>
            <p className="text-sm text-zinc-300 mt-1 truncate">{listing.address}</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Units" value={String(listing.totalUnits)} icon={Home} />
        <StatCard label="Vacant" value={String(listing.vacantUnits)} icon={XCircle} accentColor="#ef4444" />
        <StatCard label="Occupied" value={String(listing.occupiedUnits)} icon={CheckCircle2} accentColor="#10b981" />
        <StatCard label="Listed" value={String(listing.listedUnits)} icon={ExternalLink} accentColor="#3b82f6" />
      </div>

      {/* Main Layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-zinc-900/60 border border-white/[0.08]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="units">Units ({listing.units.length})</TabsTrigger>
              <TabsTrigger value="applications">Applications ({listing.applications.length})</TabsTrigger>
              <TabsTrigger value="agreements">Agreements ({listing.agreements.length})</TabsTrigger>
              <TabsTrigger value="bookings">Bookings ({listing.bookings.length})</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance ({listing.maintenanceTickets.length})</TabsTrigger>
              <TabsTrigger value="documents">Documents ({listing.documents.length})</TabsTrigger>
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

                {listing.amenities && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(listing.amenities) ? listing.amenities : []).map((a: string) => (
                        <AmenityBadge key={a} label={a} />
                      ))}
                    </div>
                  </div>
                )}

                {listing.houseRules && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">House Rules</p>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(listing.houseRules) ? listing.houseRules : []).map((r: string) => (
                        <AmenityBadge key={r} label={r} />
                      ))}
                    </div>
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
                      <TableHead className="text-right text-zinc-400">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listing.units.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-sm text-zinc-500 py-12">
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
                          <TableCell className="py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="rounded-lg text-zinc-400 hover:text-white">
                                  <MoreHorizontal className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#0d1117] border border-white/10 text-zinc-300">
                                <DropdownMenuItem asChild>
                                  <Link href={`/dashboard/agent/properties/${listing.id}/units/${unit.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem>Assign Tenant</DropdownMenuItem>
                                <DropdownMenuItem>Update Pricing</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="applications" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-900/40">
                      <TableHead className="text-zinc-400">Applicant</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listing.applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-sm text-zinc-500 py-12">
                          No applications yet.
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
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="agreements" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-900/40">
                      <TableHead className="text-zinc-400">Parties</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listing.agreements.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-sm text-zinc-500 py-12">
                          No agreements yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      listing.agreements.map((agr) => (
                        <TableRow key={agr.id} className="border-b border-white/[0.06]">
                          <TableCell className="py-3">
                            <p className="text-sm text-white">
                              {agr.partyA?.fullName || '—'} & {agr.partyB?.fullName || '—'}
                            </p>
                          </TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={agr.status} />
                          </TableCell>
                          <TableCell className="py-3 text-xs text-zinc-400">{formatDate(agr.createdAt)}</TableCell>
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

            <TabsContent value="maintenance" className="space-y-4">
              <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-zinc-900/40">
                      <TableHead className="text-zinc-400">Title</TableHead>
                      <TableHead className="text-zinc-400">Priority</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listing.maintenanceTickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-sm text-zinc-500 py-12">
                          No maintenance tickets.
                        </TableCell>
                      </TableRow>
                    ) : (
                      listing.maintenanceTickets.map((t) => (
                        <TableRow key={t.id} className="border-b border-white/[0.06]">
                          <TableCell className="py-3 text-sm text-white">{t.title}</TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="text-[11px] border-white/10 text-zinc-300 capitalize">
                              {t.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3">
                            <StatusBadge status={t.status} />
                          </TableCell>
                          <TableCell className="py-3 text-xs text-zinc-400">{formatDate(t.createdAt)}</TableCell>
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
          </Tabs>
        </div>

        {/* Right sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-3">
            <SectionHeader title="Pricing" />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-500">Price</span>
                <span className="text-white font-medium">{formatCurrency(listing.price)}</span>
              </div>
              {listing.pricePeriod && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Period</span>
                  <span className="text-zinc-300 capitalize">{listing.pricePeriod}</span>
                </div>
              )}
              {listing.cautionDeposit > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Caution Deposit</span>
                  <span className="text-white font-medium">{formatCurrency(listing.cautionDeposit)}</span>
                </div>
              )}
              {listing.serviceCharge > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-500">Service Charge</span>
                  <span className="text-white font-medium">{formatCurrency(listing.serviceCharge)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Owner */}
          {listing.owner && (
            <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-3">
              <SectionHeader title="Owner" />
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
                    <Phone className="size-3.5" /> {listing.owner.phone}
                  </a>
                )}
                <a href={`mailto:${listing.owner.email}`} className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white">
                  <Mail className="size-3.5" /> {listing.owner.email}
                </a>
              </div>
            </div>
          )}

          {/* Agent */}
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

          {/* Quick Actions */}
          <div className="rounded-xl border border-white/[0.08] bg-[#0d1117] p-5 space-y-3">
            <SectionHeader title="Quick Actions" />
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                onClick={() => setMessageOpen(true)}
              >
                <MessageSquare className="mr-2 size-3.5" /> Message
              </Button>
              <Button asChild size="sm" variant="outline" className="rounded-lg border border-white/10 text-zinc-300 hover:bg-zinc-900">
                <Link href={`/dashboard/agent/properties/${listing.id}`}>
                  <ExternalLink className="mr-2 size-3.5" /> Manage
                </Link>
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

      {/* Message Dialog */}
      <Dialog open={messageOpen} onOpenChange={setMessageOpen}>
        <DialogContent className="bg-[#0d1117] border border-white/10 text-zinc-300 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Message {listing.owner ? 'Owner' : 'Contact'}</DialogTitle>
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
              <Button onClick={listing.owner ? handleMessageOwner : handleSendMessage} disabled={sending || !messageText.trim()} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {sending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
