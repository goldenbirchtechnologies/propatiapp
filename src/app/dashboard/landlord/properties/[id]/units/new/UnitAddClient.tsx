'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateUnit } from '@/hooks/useUnits';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

type Props = {
  listingId: string;
  orgId: string | null;
  listingTitle: string;
  existingUnits: string[];
};

export default function UnitAddClient({ listingId, orgId, listingTitle, existingUnits }: Props) {
  const router = useRouter();
  const createUnit = useCreateUnit();
  const [submitting, setSubmitting] = useState(false);

  const [unitNumber, setUnitNumber] = useState('');
  const [buildingName, setBuildingName] = useState(listingTitle || '');
  const [type, setType] = useState('apartment');
  const [bedrooms, setBedrooms] = useState(1);
  const [bathrooms, setBathrooms] = useState(1);
  const [sizeSqm, setSizeSqm] = useState('');
  const [rent, setRent] = useState('');
  const [cautionDeposit, setCautionDeposit] = useState('');
  const [serviceCharge, setServiceCharge] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitNumber.trim()) {
      toast({ title: 'Unit number required', description: 'Enter a unit number for this unit.', variant: 'destructive' });
      return;
    }
    if (existingUnits.includes(unitNumber.trim())) {
      toast({ title: 'Duplicate unit', description: 'This unit number already exists on this property.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      if (!orgId) {
        toast({ title: 'Organization required', description: 'This property is not linked to an organization yet.', variant: 'destructive' });
        return;
      }
      await createUnit.mutateAsync({
        orgId,
        listingId,
        buildingName: buildingName || undefined,
        unitNumber: unitNumber.trim(),
        type,
        bedrooms,
        bathrooms,
        sizeSqm: sizeSqm ? Number(sizeSqm) : undefined,
        rent: Number(rent),
        cautionDeposit: cautionDeposit ? Number(cautionDeposit) : undefined,
        serviceCharge: serviceCharge ? Number(serviceCharge) : undefined,
        status: 'AVAILABLE',
        occupancy: 'VACANT',
      });

      toast({ title: 'Unit added', description: 'New unit has been added to this property.' });
      router.push('/dashboard/landlord/properties');
    } catch (error) {
      toast({
        title: 'Failed to add unit',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Add Unit</h1>
        <p className="text-muted-foreground mt-1">Create a new unit under this property.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="unitNumber">Unit Number</Label>
            <Input id="unitNumber" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="buildingName">Building Name</Label>
            <Input id="buildingName" value={buildingName} onChange={(e) => setBuildingName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Input id="type" value={type} onChange={(e) => setType(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bedrooms">Bedrooms</Label>
            <Input id="bedrooms" type="number" value={bedrooms} onChange={(e) => setBedrooms(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bathrooms">Bathrooms</Label>
            <Input id="bathrooms" type="number" value={bathrooms} onChange={(e) => setBathrooms(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sizeSqm">Size (sqm)</Label>
            <Input id="sizeSqm" type="number" value={sizeSqm} onChange={(e) => setSizeSqm(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="rent">Rent (NGN)</Label>
            <Input id="rent" type="number" value={rent} onChange={(e) => setRent(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cautionDeposit">Caution Deposit</Label>
            <Input id="cautionDeposit" type="number" value={cautionDeposit} onChange={(e) => setCautionDeposit(e.target.value)} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="serviceCharge">Service Charge</Label>
            <Input id="serviceCharge" type="number" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={submitting || !orgId}>
            {submitting ? 'Saving...' : 'Add Unit'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
