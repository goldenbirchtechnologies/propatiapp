'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Edit as EditIcon,
  Shield as ShieldIcon,
  Eye as EyeIcon,
  Trash2 as TrashIcon,
} from 'lucide-react';

type Props = {
  id: string;
  status: string;
};

export default function ListingActionButtons({ id, status }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm('Are you sure you want to delete this property? This action cannot be undone.');
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/listings/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json().catch(() => ({ success: false, error: 'Failed to delete' }));

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || 'Failed to delete property');
      }

      toast({ title: 'Deleted', description: data?.message || 'Property deleted successfully' });
      router.refresh();
    } catch (error) {
      toast({
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link href={`/dashboard/landlord/properties/${id}/edit`} className="btn btn-ghost btn-sm" title="Edit">
        <EditIcon className="w-4 h-4" />
      </Link>
      <Link href={`/dashboard/landlord/verify?listingId=${id}`} className="btn btn-ghost btn-sm" title="Verification">
        <ShieldIcon className="w-4 h-4" />
      </Link>
      {status === 'draft' && (
        <Link href={`/dashboard/landlord/properties/${id}/publish`} className="btn btn-primary btn-sm" title="Publish">
          <EyeIcon className="w-4 h-4" />
        </Link>
      )}
      <Button
        type="button"
        size="sm"
        variant="ghost"
        title="Delete"
        disabled={deleting}
        onClick={handleDelete}
        className="text-destructive hover:text-destructive"
      >
        <TrashIcon className="w-4 h-4" />
      </Button>
    </div>
  );
}
