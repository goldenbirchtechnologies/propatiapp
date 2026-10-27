'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { onboardingLocationSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';

interface Country {
  code: string;
  name: string;
  currency: string;
}

interface Jurisdiction {
  id: string;
  name: string;
  code: string;
}

interface Props {
  stepId: string;
}

export default function LocationStep({ stepId }: Props) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(onboardingLocationSchema),
    defaultValues: {
      countryCode: '',
      jurisdictionId: '',
      jurisdictionCode: '',
      city: '',
      addressLine1: '',
      addressLine2: '',
    },
  });

  const watchedCountry = form.watch('countryCode');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/onboarding/location/options')
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) {
          setCountries(json.data?.countries ?? []);
          setJurisdictions(json.data?.jurisdictions ?? []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!watchedCountry) {
      setJurisdictions([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/onboarding/location/options?countryCode=${watchedCountry}`)
      .then((r) => r.json())
      .then((json) => {
        if (!cancelled) setJurisdictions(json.data?.jurisdictions ?? []);
      });
    return () => {
      cancelled = true;
    };
  }, [watchedCountry]);

  async function onSubmit(values: any) {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/onboarding/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Could not save location');
        return;
      }
      window.location.hash = `step-${stepId}`;
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="countryCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="jurisdictionId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State / Region</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue('jurisdictionCode', '');
                }}
                value={field.value}
                defaultValue={field.value}
                disabled={!watchedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {jurisdictions.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <Input placeholder="e.g. Lekki" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addressLine1"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address line 1</FormLabel>
              <Input placeholder="e.g. 12A Main Street" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addressLine2"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Address line 2</FormLabel>
              <Input placeholder="Optional" {...field} />
              <FormMessage />
            </FormItem>
          )}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" disabled={saving} className="bg-[#10b981] hover:bg-[#006c49]">
          {saving ? 'Saving...' : 'Save &amp; continue'}
        </Button>
      </form>
    </Form>
  );
}