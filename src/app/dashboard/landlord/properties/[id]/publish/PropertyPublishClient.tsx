'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

type Props = { listingId: string };

export default function PropertyPublishClient({ listingId }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('active');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price: Number(price),
          status,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to publish');
      }
      toast({ title: 'Published', description: 'Listing updated successfully' });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Publish failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Publish Listing</h1>
        <p className="text-muted-foreground mt-1">Set price and publish status for this listing.</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price (NGN)</Label>
          <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Input id="status" value={status} onChange={(e) => setStatus(e.target.value)} />
        </div>
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Save Changes'}
      </Button>
    </form>
  );
}
