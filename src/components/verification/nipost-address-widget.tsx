'use client';

import { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { NipostValidationResult } from '@/lib/nipost';

interface NipostAddressWidgetProps {
  listingId?: string;
  postalCode?: string;
  state?: string;
  address?: string;
  onValidated?: (result: NipostValidationResult) => void;
}

export function NipostAddressWidget({
  listingId,
  postalCode,
  state,
  address,
  onValidated,
}: NipostAddressWidgetProps) {
  const { toast } = useToast();
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState<NipostValidationResult | null>(null);

  const handleValidate = async () => {
    if (!postalCode) {
      toast({
        title: 'Postal code required',
        description: 'A postal code must be set on the listing before validation.',
        variant: 'destructive',
      });
      return;
    }

    setValidating(true);
    try {
      const params = new URLSearchParams({
        postalCode: postalCode,
        ...(state ? { state } : {}),
        ...(address ? { address } : {}),
      });

      const res = await fetch(`/api/nipost/validate?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'NIPOST validation failed');
      }

      const validation: NipostValidationResult = {
        valid: data.valid,
        postalCode: data.postalCode,
        state: data.state,
        lga: data.lga,
        locality: data.locality,
        confidence: data.confidence,
      };

      setResult(validation);
      onValidated?.(validation);

      if (validation.valid) {
        toast({
          title: 'Address verified via NIPOST',
          description: `${validation.state} • ${validation.lga} • ${validation.locality}`,
        });
      } else {
        toast({
          title: 'Address could not be verified',
          description: data.message || 'Postal code not found in NIPOST records',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Validation failed',
        description: error instanceof Error ? error.message : 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setValidating(false);
    }
  };

  // Already validated successfully
  if (result?.valid) {
    return (
      <Card className="p-6 border-green-200 bg-primary/10">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-[#4edea3]" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-green-900">NIPOST Address Verified</h3>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {result.confidence} confidence
              </Badge>
            </div>
            <p className="text-sm text-[#4edea3] mb-3">
              Nigerian Postal Service cross-reference complete
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-green-800">
                <span className="font-medium">Postal Code:</span> {result.postalCode}
              </p>
              <p className="text-green-800">
                <span className="font-medium">Address:</span> {result.locality}, {result.lga}, {result.state}
              </p>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Not valid or no result yet
  return (
    <Card className="p-6 border-zinc-200 dark:border-white/[0.08]">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <MapPin className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">NIPOST Address Validation</h3>
            <Badge variant="outline">Optional</Badge>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
            Validate the property's postal code against the official Nigerian Postal Service database.
          </p>

          {result && !result.valid && (
            <div className="flex items-center gap-2 mb-3 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{result.message || 'Postal code could not be verified'}</span>
            </div>
          )}

          {!postalCode && (
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
              No postal code set. Add one in the property address form.
            </p>
          )}

          <Button
            onClick={handleValidate}
            disabled={validating || !postalCode}
            size="sm"
          >
            {validating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Validating…
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Validate with NIPOST
              </>
            )}
          </Button>

          {listingId && (
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-2">
              Listing: {listingId}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
