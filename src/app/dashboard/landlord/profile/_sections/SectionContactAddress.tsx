'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { BadgeCheck, Loader2, Phone, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PLATFORM_COUNTRIES } from '@/lib/locations/platform-countries';
import { NIGERIAN_STATES } from '@/lib/locations/nigeria-states';
import type { LandlordProfileValues } from '@/lib/landlord-profile/types';
import { SelectField, SubSection, TextField } from '../_components/parts';

const COUNTRY_OPTIONS = PLATFORM_COUNTRIES.filter((country) => country.active).map((country) => ({
  value: country.code,
  label: country.name,
}));

const STATE_OPTIONS = NIGERIAN_STATES.map((state) => ({
  value: state.name,
  label: state.name,
}));

export function SectionContactAddress({
  values,
  savedPhone,
  phoneVerified,
  onChange,
  onPhoneVerified,
}: {
  values: LandlordProfileValues;
  savedPhone: string;
  phoneVerified: boolean;
  onChange: (patch: Partial<LandlordProfileValues>) => void;
  onPhoneVerified: () => void;
}) {
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<'request' | 'verify' | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const phoneIsSaved = values.primaryPhone.trim() === savedPhone.trim();
  const isNigeria = (values.countryCode || 'NG') === 'NG';
  const noticePreview = [
    values.streetAddress,
    values.city,
    values.stateRegion,
    values.postalCode,
  ]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ');

  const requestCode = async () => {
    setBusy('request');
    setOtpError(null);
    try {
      const response = await fetch('/api/landlord/phone', { method: 'POST' });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.message || json?.error || 'Could not send the code');
      }
      if (json?.data?.alreadyVerified) {
        onPhoneVerified();
        toast.success('Phone already verified');
        return;
      }
      setOtpSent(true);
      setDevCode(json?.data?.devCode ?? null);
      toast.success('Verification code sent');
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : 'Could not send the code');
    } finally {
      setBusy(null);
    }
  };

  const verifyCode = async () => {
    setBusy('verify');
    setOtpError(null);
    try {
      const response = await fetch('/api/landlord/phone', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.error || 'Could not verify the code');
      }
      onPhoneVerified();
      setOtpSent(false);
      setCode('');
      setDevCode(null);
      toast.success('Phone verified');
    } catch (error) {
      setOtpError(error instanceof Error ? error.message : 'Could not verify the code');
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <SubSection
        title="Primary contact"
        description="Where PropatiBox and your tenants reach you about this ownership record."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <TextField
              id="primaryPhone"
              label="Primary phone"
              type="tel"
              value={values.primaryPhone}
              onChange={(value) => onChange({ primaryPhone: value })}
              placeholder="+234 801 234 5678"
              inputMode="tel"
              required
              autoComplete="tel"
              hint={
                phoneVerified && phoneIsSaved
                  ? 'This number is verified. Changing it will require verification again.'
                  : phoneIsSaved
                    ? 'Save this number, then verify it.'
                    : 'Save the new number before requesting a code.'
              }
            />
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={phoneVerified && phoneIsSaved ? 'success' : 'warning'}>
                {phoneVerified && phoneIsSaved ? (
                  <BadgeCheck className="h-3 w-3" aria-hidden />
                ) : (
                  <Phone className="h-3 w-3" aria-hidden />
                )}
                {phoneVerified && phoneIsSaved ? 'Verified' : 'Not verified'}
              </Badge>
              {!(phoneVerified && phoneIsSaved) && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={requestCode}
                  disabled={!phoneIsSaved || busy !== null}
                >
                  {busy === 'request' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  )}
                  Send code
                </Button>
              )}
            </div>
          </div>

          <TextField
            id="contactEmail"
            label="Contact email"
            type="email"
            value={values.contactEmail}
            onChange={(value) => onChange({ contactEmail: value })}
            placeholder="you@example.com"
            inputMode="email"
            required
            autoComplete="email"
            hint="Used for notices, statements, and tenancy correspondence."
          />
        </div>

        {otpSent && (
          <div className="mt-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Enter the six-digit code sent to {savedPhone || 'your phone'}.
            </p>
            {devCode && (
              <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-300">
                Development code: {devCode}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <Input
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                aria-label="Verification code"
                className="max-w-[160px]"
              />
              <Button
                type="button"
                size="sm"
                onClick={verifyCode}
                disabled={code.length !== 6 || busy !== null}
              >
                {busy === 'verify' && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                Verify
              </Button>
            </div>
            {otpError && <p className="mt-2 text-xs text-destructive">{otpError}</p>}
          </div>
        )}

        {!otpSent && otpError && <p className="mt-2 text-xs text-destructive">{otpError}</p>}
      </SubSection>

      <SubSection
        title="Registered address"
        description="The address we use for notices, statements, and legal correspondence."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="streetAddress"
            label="Street address"
            className="sm:col-span-2"
            value={values.streetAddress}
            onChange={(value) => onChange({ streetAddress: value })}
            placeholder="12 Bode Thomas Street"
            required
            autoComplete="street-address"
          />
          <TextField
            id="city"
            label="City"
            value={values.city}
            onChange={(value) => onChange({ city: value })}
            placeholder="Surulere"
            required
            autoComplete="address-level2"
          />
          <SelectField
            id="countryCode"
            label="Country"
            value={values.countryCode || 'NG'}
            options={COUNTRY_OPTIONS}
            onChange={(value) => onChange({ countryCode: value })}
            required
          />
          {isNigeria ? (
            <SelectField
              id="stateRegion"
              label="State"
              value={values.stateRegion}
              options={STATE_OPTIONS}
              onChange={(value) => onChange({ stateRegion: value })}
              required
              placeholder="Select state"
            />
          ) : (
            <TextField
              id="stateRegion"
              label="State / region"
              value={values.stateRegion}
              onChange={(value) => onChange({ stateRegion: value })}
              required
              autoComplete="address-level1"
            />
          )}
          <TextField
            id="postalCode"
            label="Postal code"
            value={values.postalCode}
            onChange={(value) => onChange({ postalCode: value })}
            placeholder="101241"
            autoComplete="postal-code"
          />
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          {noticePreview
            ? `Notice address: ${noticePreview}`
            : 'This becomes your one-line notice address when saved.'}
        </p>
      </SubSection>
    </div>
  );
}
