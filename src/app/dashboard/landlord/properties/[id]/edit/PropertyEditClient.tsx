'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck, XCircle, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

type Listing = {
  id: string;
  title: string;
  address: string;
  area: string;
  state: string;
  status: string;
  listingType: string;
  propertyType: string;
  price: number;
  pricePeriod: string;
  allowShortlet: boolean;
  amenities: string[];
  description: string;
  images: { id: string; url: string; isCover: boolean }[];
  unitCount?: number;
  vacantUnitCount?: number;
  orgId?: string | null;
  units?: Array<{
    id: string;
    unitNumber: string;
    type: string;
    bedrooms: number;
    bathrooms: number;
    status: string;
    occupancy: string;
    rent: number;
  }>;
};

type Props = { listing: Listing };

export default function PropertyEditClient({ listing }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ description?: string; price?: string }>({});
  const [form, setForm] = useState({
    title: listing.title,
    address: listing.address,
    area: listing.area,
    state: listing.state,
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    price: String(listing.price ?? ''),
    pricePeriod: listing.pricePeriod,
    allowShortlet: listing.allowShortlet,
    amenities: listing.amenities,
    description: listing.description || '',
  });

  const unitCount = listing.unitCount ?? 0;
  const vacantUnitCount = listing.vacantUnitCount ?? 0;
  const hasOrg = !!listing.orgId;
  const [amenityInput, setAmenityInput] = useState('');

  const addAmenity = () => {
    const value = amenityInput.trim();
    if (!value) return;
    if (form.amenities.includes(value)) {
      setAmenityInput('');
      return;
    }
    setForm((prev) => ({ ...prev, amenities: [...prev.amenities, value] }));
    setAmenityInput('');
  };

  const removeAmenity = (item: string) => {
    setForm((prev) => ({ ...prev, amenities: prev.amenities.filter((a) => a !== item) }));
  };

  const validate = () => {
    const next: { description?: string; price?: string } = {};
    if (!form.description.trim()) {
      next.description = 'Add a short description to help tenants understand this property.';
    }
    const priceNum = Number(form.price);
    if (!Number.isFinite(priceNum) || priceNum < 100) {
      next.price = 'Enter a realistic rent amount.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'description' && errors.description) {
      setErrors((prev) => ({ ...prev, description: undefined }));
    }
    if (field === 'price' && errors.price) {
      setErrors((prev) => ({ ...prev, price: undefined }));
    }
  };

  const handleStatusChange = async (next: string) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json().catch(() => ({ success: false }));
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to update status');
      }
      toast({ title: 'Status updated', description: `Listing is now ${next}` });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Status update failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const amenities = form.amenities.map((item) => item.trim()).filter(Boolean);

      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          address: form.address,
          area: form.area,
          state: form.state,
          listingType: form.listingType,
          propertyType: form.propertyType,
          price: Number(form.price),
          pricePeriod: form.pricePeriod,
          allowShortlet: form.allowShortlet,
          amenities,
          description: form.description,
        }),
      });
      await new Promise((resolve) => setTimeout(resolve, 400));
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Failed to update' }));
        throw new Error(data.error || 'Failed to update');
      }
      toast({ title: 'Saved', description: 'Property updated successfully' });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const status = listing.status;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Property</h1>
          <p className="text-sm text-muted-foreground">Update property details, status, and units.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-outline-variant px-3 py-1 text-xs">
            {status === 'active' && <CheckCircle className="size-3 text-success" />}
            {status === 'draft' && <ShieldCheck className="size-3 text-warning" />}
            {status === 'suspended' && <XCircle className="size-3 text-destructive" />}
            <span className="font-label-md uppercase tracking-wider">{status}</span>
          </span>
          {status !== 'active' && (
            <Button size="sm" onClick={() => handleStatusChange('active')} disabled={saving}>
              Publish
            </Button>
          )}
          {status === 'active' && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange('draft')} disabled={saving}>
              Unpublish
            </Button>
          )}
        </div>
      </div>

      <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-headline-sm font-semibold">Units & Vacancy</h2>
            <p className="text-sm text-muted-foreground">
              {unitCount > 0
                ? `${unitCount} unit${unitCount === 1 ? '' : 's'} · ${vacantUnitCount} vacant`
                : 'No units added yet.'}
            </p>
          </div>
          {hasOrg ? (
            <Button asChild size="sm">
              <Link href={`/dashboard/landlord/properties/${listing.id}/units/new`}>Add Unit</Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" disabled title="Link this property to an organization first">
              Add Unit
            </Button>
          )}
        </div>

        {listing.units && listing.units.length > 0 && (
          <div className="mt-4 overflow-hidden rounded-lg border border-outline-variant">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-3 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Unit</th>
                  <th className="px-3 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Type</th>
                  <th className="px-3 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Beds</th>
                  <th className="px-3 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Baths</th>
                  <th className="px-3 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Rent</th>
                  <th className="px-3 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Status</th>
                  <th className="px-3 py-2 text-xs font-label-md uppercase tracking-wider text-muted-foreground">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {listing.units.map((unit) => (
                  <tr key={unit.id} className="bg-background">
                    <td className="px-3 py-2 font-medium">{unit.unitNumber}</td>
                    <td className="px-3 py-2 text-muted-foreground">{unit.type}</td>
                    <td className="px-3 py-2 text-muted-foreground">{unit.bedrooms}</td>
                    <td className="px-3 py-2 text-muted-foreground">{unit.bathrooms}</td>
                    <td className="px-3 py-2 text-muted-foreground">{formatCurrency(unit.rent)}</td>
                    <td className="px-3 py-2">
                      <span className="inline-flex rounded-full border border-outline-variant px-2 py-1 text-xs">
                        {unit.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={unit.occupancy === 'VACANT' ? 'text-success' : 'text-destructive'}>
                        {unit.occupancy}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <form onSubmit={handleSubmit} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={update('title')} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={form.address} onChange={update('address')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="area">Area</Label>
            <Input id="area" value={form.area} onChange={update('area')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" value={form.state} onChange={update('state')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="listingType">Listing Type</Label>
            <Input id="listingType" value={form.listingType} onChange={update('listingType')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type</Label>
            <Input id="propertyType" value={form.propertyType} onChange={update('propertyType')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (NGN)</Label>
            <Input id="price" type="number" value={form.price} onChange={update('price')} />
            {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePeriod">Price Period</Label>
            <Input id="pricePeriod" value={form.pricePeriod} onChange={update('pricePeriod')} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.allowShortlet} onChange={update('allowShortlet')} />
              <span className="text-sm">Allow Shortlet</span>
            </label>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="amenities">Amenities</Label>
            <div className="flex flex-wrap gap-2 rounded-md border border-input bg-background p-2">
              {form.amenities.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full border border-outline-variant bg-surface-container-low px-2 py-1 text-xs"
                >
                  <span>{item}</span>
                  <button
                    type="button"
                    onClick={() => removeAmenity(item)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                id="amenities"
                className="min-w-[160px] flex-1 bg-transparent text-sm outline-none"
                value={amenityInput}
                onChange={(e) => setAmenityInput(e.target.value)}
                onBlur={addAmenity}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addAmenity();
                  }
                }}
                placeholder={form.amenities.length ? 'Add another' : 'e.g. generator, parking, ac'}
              />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full rounded-md border border-border bg-background p-2 text-sm"
              value={form.description}
              onChange={update('description')}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
