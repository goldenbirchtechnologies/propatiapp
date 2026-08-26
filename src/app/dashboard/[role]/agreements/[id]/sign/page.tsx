'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, FileText, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useAgreement, useSignAgreement } from '@/hooks/useAgreements';
import { SignaturePad } from '@/components/agreements/signature-pad';
import { useToast } from '@/hooks/use-toast';

export default function SignAgreementPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const role = params.role as 'landlord' | 'tenant';
  const agreementId = params.id as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [consents, setConsents] = useState({
    readAndUnderstood: false,
    agreeToTerms: false,
    consentToESignature: false,
  });

  const { data: agreement, isLoading } = useAgreement(agreementId);
  const signAgreement = useSignAgreement();

  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Load preview when component mounts
  useState(() => {
    setLoadingPreview(true);
    fetch(`/api/agreements/${agreementId}/preview`)
      .then((res) => res.text())
      .then((html) => setPreviewHtml(html))
      .catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to load agreement preview',
          variant: 'destructive',
        });
      })
      .finally(() => setLoadingPreview(false));
  });

  const allConsentsGiven = Object.values(consents).every((v) => v === true);

  const handleSign = async (signatureData: {
    signature: string;
    ipAddress: string;
    userAgent: string;
  }) => {
    try {
      await signAgreement.mutateAsync({
        id: agreementId,
        data: {
          signature: signatureData.signature,
          consentGiven: true,
          ipAddress: signatureData.ipAddress,
          userAgent: signatureData.userAgent,
        },
      });

      toast({
        title: 'Agreement Signed',
        description: 'You have successfully signed the agreement.',
      });

      router.push(`/dashboard/${role}/agreements/${agreementId}`);
    } catch (error) {
      toast({
        title: 'Signing Failed',
        description: 'Failed to sign agreement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-zinc-950/50 rounded w-1/3"></div>
          <div className="h-64 bg-zinc-950/50 rounded"></div>
        </div>
      </div>
    );
  }

  if (!agreement) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="glass-card p-12 text-center">
          <h2 className="text-xl font-semibold mb-2">Agreement Not Found</h2>
          <Button onClick={() => router.push(`/dashboard/${role}/agreements`)}>
            Back to Agreements
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sign Agreement</h1>
        <p className="text-zinc-500">
          Review the agreement carefully and provide your electronic signature
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step
                    ? 'bg-primary text-white border-white/[0.08]'
                    : 'bg-background border-muted'
                }`}
              >
                {step}
              </div>
              {step < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-zinc-950/50'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-zinc-500">Preview</span>
          <span className="text-zinc-500">Consent</span>
          <span className="text-zinc-500">Sign</span>
          <span className="text-zinc-500">Confirm</span>
        </div>
      </div>

      {/* Step 1: Preview Agreement */}
      {currentStep === 1 && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-white" />
            <h2 className="text-xl font-semibold">Agreement Preview</h2>
          </div>

          {loadingPreview ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/[0.08]"></div>
            </div>
          ) : (
            <div className="border rounded-lg p-6 max-h-[600px] overflow-y-auto bg-zinc-950/50">
              <iframe
                srcDoc={previewHtml}
                className="w-full min-h-[500px] border-0"
                title="Agreement Preview"
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>
      )}

      {/* Step 2: Consent Checkboxes */}
      {currentStep === 2 && (
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-white" />
            <h2 className="text-xl font-semibold">Consent & Acknowledgment</h2>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent-1"
                checked={consents.readAndUnderstood}
                onCheckedChange={(checked) =>
                  setConsents((prev) => ({ ...prev, readAndUnderstood: checked as boolean }))
                }
              />
              <div className="space-y-1">
                <Label htmlFor="consent-1" className="text-base font-medium cursor-pointer">
                  I have read and understood the agreement
                </Label>
                <p className="text-sm text-zinc-500">
                  I confirm that I have carefully read all terms and conditions in this rental
                  agreement and understand my obligations.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent-2"
                checked={consents.agreeToTerms}
                onCheckedChange={(checked) =>
                  setConsents((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                }
              />
              <div className="space-y-1">
                <Label htmlFor="consent-2" className="text-base font-medium cursor-pointer">
                  I agree to all terms and conditions
                </Label>
                <p className="text-sm text-zinc-500">
                  I accept and agree to be legally bound by all terms, conditions, and obligations
                  outlined in this agreement.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="consent-3"
                checked={consents.consentToESignature}
                onCheckedChange={(checked) =>
                  setConsents((prev) => ({ ...prev, consentToESignature: checked as boolean }))
                }
              />
              <div className="space-y-1">
                <Label htmlFor="consent-3" className="text-base font-medium cursor-pointer">
                  I consent to electronic signature
                </Label>
                <p className="text-sm text-zinc-500">
                  I understand that my electronic signature will have the same legal effect as a
                  handwritten signature.
                </p>
              </div>
            </div>

            <div className="bg-zinc-900 border border-white/[0.08] rounded-lg p-4 mt-6">
              <p className="text-sm text-white">
                <strong>Legal Notice:</strong> By proceeding, you acknowledge that this electronic
                signature creates a legally binding contract. Your IP address, signature, and
                timestamp will be recorded for security and legal purposes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Signature Pad */}
      {currentStep === 3 && (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Provide Your Signature</h2>
            <p className="text-zinc-500">
              Draw your signature in the box below to complete the signing process
            </p>
          </div>
          <SignaturePad
            onSign={handleSign}
            agreementId={agreementId}
            disabled={signAgreement.isPending}
          />
        </div>
      )}

      {/* Step 4: Confirmation (handled by redirect) */}

      {/* Navigation Buttons */}
      {currentStep < 3 && (
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (currentStep === 1) {
                router.push(`/dashboard/${role}/agreements/${agreementId}`);
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          <Button
            type="button"
            onClick={() => setCurrentStep(currentStep + 1)}
            disabled={currentStep === 2 && !allConsentsGiven}
          >
            {currentStep === 2 ? 'Proceed to Sign' : 'Next'}
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {currentStep === 3 && (
        <div className="mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => setCurrentStep(currentStep - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      )}
    </div>
  );
}
