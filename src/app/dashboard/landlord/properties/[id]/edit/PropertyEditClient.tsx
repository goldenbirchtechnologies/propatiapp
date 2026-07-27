'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

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
};

type Props = { listing: Listing };

function classNames(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PropertyEditClient({ listing }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: listing.title,
    address: listing.address,
    area: listing.area,
    state: listing.state,
    listingType: listing.listingType,
    propertyType: listing.propertyType,
    price: String(listing.price),
    pricePeriod: listing.pricePeriod,
    allowShortlet: listing.allowShortlet,
    amenities: listing.amenities.join(', '),
    description: listing.description,
  });

  const update = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? (target as HTMLInputElement).checked : target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/listings/${listing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          amenities: form.amenities
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        }),
      });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          <Label htmlFor="amenities">Amenities (comma separated)</Label>
          <Input id="amenities" value={form.amenities} onChange={update('amenities')} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            className="w-full rounded-md border border-border bg-background p-2 text-sm"
            value={form.description}
            onChange={update('description')}
          />
        </div>
      </div>
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
