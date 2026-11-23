'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, Loader2, Store, Users } from 'lucide-react';

type Space = { id: string; name: string; identifier: string; capacity: number | null; operationalStatus: string; currentTenant: { id: string; fullName: string | null; email: string } | null; photos: { id: string; url: string; isCover: boolean }[]; listings: { id: string; status: string; listingType: string; price: unknown; pricePeriod: string | null }[] };
type Tenant = { id: string; fullName: string | null; email: string };

const statuses = ['available', 'occupied', 'reserved', 'unavailable', 'maintenance'] as const;

const statusStyles: Record<string, string> = {
  available: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  occupied: 'border-blue-200 bg-blue-50 text-blue-700',
  reserved: 'border-violet-200 bg-violet-50 text-violet-700',
  unavailable: 'border-zinc-200 bg-zinc-100 text-zinc-600',
  maintenance: 'border-amber-200 bg-amber-50 text-amber-700',
};

const formatStatus = (status: string) => status.charAt(0).toUpperCase() + status.slice(1);

export default function RegistrySpaceManager({ propertyId, spaces: initialSpaces, tenants }: { propertyId: string; spaces: Space[]; tenants: Tenant[] }) {
  const [spaces, setSpaces] = useState(initialSpaces); const [saving, setSaving] = useState<string | null>(null); const [message, setMessage] = useState('');
  const update = async (spaceId: string, data: Record<string, unknown>) => { setSaving(spaceId); setMessage(''); try { const response = await fetch(`/api/properties/${propertyId}/spaces/${spaceId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Could not update space'); setSpaces((current) => current.map((space) => space.id === spaceId ? { ...space, ...body.space } : space)); setMessage('Inventory updated'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not update space'); } finally { setSaving(null); } };
  const upload = async (spaceId: string, file: File) => { setSaving(spaceId); setMessage(''); const data = new FormData(); data.append('file', file); data.append('setCover', 'true'); try { const response = await fetch(`/api/properties/${propertyId}/spaces/${spaceId}/photos/upload`, { method: 'POST', body: data }); const body = await response.json(); if (!response.ok) throw new Error(body.error || 'Could not upload photo'); setSpaces((current) => current.map((space) => space.id === spaceId ? { ...space, photos: [...space.photos, body.photo] } : space)); setMessage('Photo added'); } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not upload photo'); } finally { setSaving(null); } };
  return <section className="rounded-2xl border border-[#E5E7EB] bg-white p-6 sm:p-8">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div><h2 className="text-lg font-semibold tracking-tight text-zinc-950">Inventory</h2><p className="mt-1 text-sm text-zinc-500">Manage each space independently. Occupancy does not change listing status.</p></div>
      <Link href="/dashboard/landlord/listing/new" className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">Create listing</Link>
    </div>
    {message && <p className="mt-4 rounded-lg bg-zinc-50 px-3 py-2 text-sm text-zinc-600" role="status">{message}</p>}
    <div className="mt-7 overflow-hidden rounded-xl border border-[#E5E7EB]">
      <div className="hidden grid-cols-[minmax(180px,1.4fr)_minmax(150px,1fr)_minmax(170px,0.9fr)_auto] gap-5 bg-[#F9FAFB] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 lg:grid"><span>Unit</span><span>Photos & listings</span><span>Occupancy status</span><span className="text-right">Quick actions</span></div>
      <div className="divide-y divide-[#E5E7EB]">{spaces.map((space) => <div key={space.id} className="p-5 transition hover:bg-zinc-50/70">
        <div className="grid gap-5 lg:grid-cols-[minmax(180px,1.4fr)_minmax(150px,1fr)_minmax(170px,0.9fr)_auto] lg:items-center">
          <div className="min-w-0"><div className="flex items-center gap-3"><span className="rounded-md bg-emerald-50 px-2 py-1 font-mono text-xs font-semibold text-emerald-700">{space.identifier}</span><span className="truncate text-sm font-semibold text-zinc-900">{space.name}</span></div>{space.currentTenant && <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500"><Users size={13} />{space.currentTenant.fullName || space.currentTenant.email}</p>}</div>
          <div className="flex items-center gap-3 text-sm text-zinc-600"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500"><Camera size={16} /></div><div><p className="font-medium text-zinc-800">{space.photos.length} {space.photos.length === 1 ? 'photo' : 'photos'}</p><p className="text-xs text-zinc-500">{space.listings.filter((listing) => listing.status === 'active').length} active listings</p></div></div>
          <div><label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-zinc-400 lg:hidden">Occupancy status</label><select aria-label={`Occupancy status for ${space.identifier}`} value={space.operationalStatus} onChange={(event) => update(space.id, { operationalStatus: event.target.value, currentTenantId: event.target.value === 'occupied' ? space.currentTenant?.id ?? null : null })} disabled={saving === space.id} className={`h-9 w-full rounded-lg border px-3 text-sm font-medium outline-none transition focus:ring-2 focus:ring-emerald-500/30 ${statusStyles[space.operationalStatus] || statusStyles.unavailable}`}><option value="available">Available</option>{statuses.filter((status) => status !== 'available').map((status) => <option value={status} key={status}>{formatStatus(status)}</option>)}</select></div>
          <div className="flex items-center gap-2 lg:justify-end"><label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-[#DDE1E6] px-3 text-sm font-medium text-zinc-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"><Camera size={15} />Add photo<input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(space.id, file); event.currentTarget.value = ''; }} /></label>{saving === space.id && <Loader2 size={16} className="animate-spin text-emerald-600" />}</div>
        </div>
        {space.operationalStatus === 'occupied' && <div className="mt-4 flex flex-col gap-2 rounded-lg bg-blue-50/60 px-3 py-3 sm:flex-row sm:items-center"><label className="flex items-center gap-1.5 text-xs font-medium text-blue-800"><Users size={14} />Assigned tenant</label><select value={space.currentTenant?.id ?? ''} onChange={(event) => update(space.id, { currentTenantId: event.target.value || null })} className="h-9 rounded-md border border-blue-200 bg-white px-2 text-sm text-zinc-800 sm:min-w-72"><option value="">Select tenant</option>{tenants.map((tenant) => <option key={tenant.id} value={tenant.id}>{tenant.fullName || tenant.email} · {tenant.email}</option>)}</select></div>}
        {space.photos.length > 0 && <div className="mt-4 flex gap-2 overflow-x-auto">{space.photos.slice(0, 5).map((photo) => <img key={photo.id} src={photo.url} alt={`${space.name} photo`} className="h-14 w-20 rounded-md object-cover" />)}</div>}
        {space.listings.length > 0 && <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-zinc-100 pt-3 text-xs text-zinc-500"><Store size={14} />{space.listings.map((listing) => <span key={listing.id} className="rounded-md bg-zinc-100 px-2 py-1">{listing.status} · {listing.listingType}</span>)}</div>}
      </div>)}</div>
      {spaces.length === 0 && <div className="py-10 text-center text-sm text-zinc-500">No spaces registered yet.</div>}
    </div>
  </section>;
}
