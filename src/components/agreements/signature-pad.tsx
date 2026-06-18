'use client';

import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

interface SignaturePadProps {
  onSign: (signatureData: { signature: string; ipAddress: string; userAgent: string }) => void;
  agreementId: string;
  disabled?: boolean;
}

export function SignaturePad({ onSign, agreementId, disabled = false }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [agreed, setAgreed] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);
  const [ipAddress, setIpAddress] = useState<string>('');

  useEffect(() => {
    // Fetch IP address
    fetch('/api/get-client-ip')
      .then((res) => res.json())
      .then((data) => setIpAddress(data.ip))
      .catch(() => setIpAddress('unknown'));
  }, []);

  const handleClear = () => {
    sigCanvas.current?.clear();
    setIsEmpty(true);
  };

  const handleEnd = () => {
    setIsEmpty(sigCanvas.current?.isEmpty() || false);
  };

  const handleSign = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      return;
    }

    const signature = sigCanvas.current.toDataURL();
    const userAgent = window.navigator.userAgent;

    onSign({
      signature,
      ipAddress,
      userAgent,
    });
  };

  const canSign = agreed && !isEmpty && !disabled;

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signature-canvas" className="text-base font-semibold">
              Draw Your Signature
            </Label>
            <p className="text-sm text-muted-foreground">
              Please sign in the box below using your mouse, touchpad, or touchscreen.
            </p>
          </div>

          <div className="border-2 border-gray-300 rounded-lg bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                className: 'w-full h-48 cursor-crosshair',
                id: 'signature-canvas',
              }}
              onEnd={handleEnd}
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleClear}
              disabled={disabled || isEmpty}
            >
              Clear Signature
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="agree-terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
              disabled={disabled}
            />
            <div className="space-y-1">
              <Label
                htmlFor="agree-terms"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I agree to the terms and conditions
              </Label>
              <p className="text-sm text-muted-foreground">
                By checking this box and signing above, I confirm that I have read, understood, and
                agree to be legally bound by all terms and conditions of this agreement.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="text-xs text-muted-foreground space-y-1">
              <p>
                <strong>IP Address:</strong> {ipAddress || 'Loading...'}
              </p>
              <p>
                <strong>Timestamp:</strong> {new Date().toLocaleString()}
              </p>
              <p className="pt-2">
                Your signature, IP address, and timestamp will be recorded for legal purposes.
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSign}
          disabled={!canSign}
          size="lg"
          className="w-full sm:w-auto"
        >
          Sign Agreement
        </Button>
      </div>
    </div>
  );
}
