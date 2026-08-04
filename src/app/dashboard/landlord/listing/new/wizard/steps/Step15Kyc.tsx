'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, User, FileCheck2 } from 'lucide-react';
import type { KycAddress, KycCompliance } from '../types';

export interface Step15Props {
  value?: Partial<KycCompliance>;
  onChange: (value: Partial<KycCompliance>) => void;
}

export default function Step15Kyc({ value, onChange }: Step15Props) {
  const [countryCode, setCountryCode] = useState(value?.address?.country_code ?? '');
  const [streetAddress, setStreetAddress] = useState(value?.address?.street_address ?? '');
  const [aptUnit, setAptUnit] = useState(value?.address?.apt_unit ?? '');
  const [city, setCity] = useState(value?.address?.city ?? '');
  const [stateProvince, setStateProvince] = useState(value?.address?.state_province ?? '');
  const [postalCode, setPostalCode] = useState(value?.address?.postal_code ?? '');
  const [isBusinessEntity, setIsBusinessEntity] = useState(value?.is_business_entity ?? false);
  const [attestation, setAttestation] = useState(value?.attestation_accepted ?? false);

  useEffect(() => {
    onChange({
      address: {
        country_code: countryCode,
        street_address: streetAddress,
        apt_unit: aptUnit || undefined,
        city,
        state_province: stateProvince,
        postal_code: postalCode,
      } as KycAddress,
      is_business_entity: isBusinessEntity,
      attestation_accepted: attestation,
    });
  }, [countryCode, streetAddress, aptUnit, city, stateProvince, postalCode, isBusinessEntity, attestation, onChange]);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Host identity and compliance</h2>
      <p className="text-sm text-muted-foreground">Provide your address and confirm compliance details.</p>

      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Building2 className="size-4" /> Address
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country_code">Country code</Label>
            <Input
              id="country_code"
              placeholder="US"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state_province">State / Province</Label>
            <Input
              id="state_province"
              placeholder="California"
              value={stateProvince}
              onChange={(e) => setStateProvince(e.target.value)}
            />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label htmlFor="street_address">Street address</Label>
            <Input
              id="street_address"
              placeholder="123 Main St"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="apt_unit">Apt / Unit (optional)</Label>
            <Input
              id="apt_unit"
              placeholder="Apt 4B"
              value={aptUnit}
              onChange={(e) => setAptUnit(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="New York"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postal_code">Postal code</Label>
            <Input
              id="postal_code"
              placeholder="10001"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <User className="size-4" /> Business entity
        </h3>
        <div className="flex gap-2">
          <Button
            type="button"
            variant={isBusinessEntity ? 'default' : 'outline'}
            onClick={() => setIsBusinessEntity(true)}
            className="flex-1"
          >
            Yes, listing for a business
          </Button>
          <Button
            type="button"
            variant={!isBusinessEntity ? 'default' : 'outline'}
            onClick={() => setIsBusinessEntity(false)}
            className="flex-1"
          >
            No, individual
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="attestation"
            checked={attestation}
            onChange={(e) => setAttestation(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="attestation" className="text-sm cursor-pointer">
            <span className="font-medium">I attest that the information provided is accurate and I agree to the terms and conditions.</span>
          </Label>
        </div>
      </Card>
    </div>
  );
}

export function validate(data: unknown): string[] {
  const errors: string[] = [];
  const d = data as Partial<KycCompliance> | undefined;
  if (!d) {
    errors.push('KYC compliance details are required');
    return errors;
  }
  const addr = d.address;
  if (!addr?.street_address?.trim()) errors.push('Street address is required');
  if (!addr?.city?.trim()) errors.push('City is required');
  if (!addr?.state_province?.trim()) errors.push('State/Province is required');
  if (!addr?.postal_code?.trim()) errors.push('Postal code is required');
  if (!addr?.country_code?.trim()) errors.push('Country code is required');
  if (typeof d.is_business_entity !== 'boolean') errors.push('Business entity status is required');
  if (!d.attestation_accepted) errors.push('You must accept the attestation');
  return errors;
}

export function getData(): Partial<KycCompliance> {
  return {};
}
