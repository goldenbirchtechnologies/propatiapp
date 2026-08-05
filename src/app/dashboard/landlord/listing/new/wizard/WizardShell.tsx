'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Save, HelpCircle, X, CheckCircle2, PlusCircle } from 'lucide-react';
import type { ShortletListingPayload } from './types';
import Step1PropertyStructure from './steps/Step1PropertyStructure';
import Step2PrivacyType from './steps/Step2PrivacyType';
import Step3Location from './steps/Step3Location';
import Step4Capacity from './steps/Step4Capacity';
import Step5RoomDetails from './steps/Step5RoomDetails';
import Step6RulesMaintenance from './steps/Step6RulesMaintenance';
import Step7Amenities from './steps/Step7Amenities';
import Step8Photos from './steps/Step8Photos';
import Step9Title from './steps/Step9Title';
import Step10Highlights from './steps/Step10Highlights';
import Step11BookingSettings from './steps/Step11BookingSettings';
import Step12Pricing from './steps/Step12Pricing';
import Step13Discounts from './steps/Step13Discounts';
import Step14Safety from './steps/Step14Safety';
import Step15Kyc from './steps/Step15Kyc';

const STORAGE_KEY = 'shortlet-draft';

type StepConfig = {
  title: string;
  component: React.ComponentType<any>;
  validate: (data: unknown) => string[];
};

const STEPS: StepConfig[] = [
  { title: 'Property Structure', component: Step1PropertyStructure, validate: Step1PropertyStructure.validate },
  { title: 'Privacy Type', component: Step2PrivacyType, validate: (d) => validateStep(d, 'privacy_type') },
  { title: 'Location', component: Step3Location, validate: (d) => validateStep(d, 'location') },
  { title: 'Capacity', component: Step4Capacity, validate: Step4Capacity.validate },
  { title: 'Room Details', component: Step5RoomDetails, validate: Step5RoomDetails.validate },
  { title: 'Rules', component: Step6RulesMaintenance, validate: Step6RulesMaintenance.validate },
  { title: 'Amenities', component: Step7Amenities, validate: Step7Amenities.validate },
  { title: 'Photos', component: Step8Photos, validate: Step8Photos.validate },
  { title: 'Title', component: Step9Title, validate: Step9Title.validate },
  { title: 'Highlights', component: Step10Highlights, validate: Step10Highlights.validate },
  { title: 'Booking', component: Step11BookingSettings, validate: (d) => validateStep(d, 'booking_model') },
  { title: 'Pricing', component: Step12Pricing, validate: Step12Pricing.validate },
  { title: 'Discounts', component: Step13Discounts, validate: Step13Discounts.validate },
  { title: 'Safety', component: Step14Safety, validate: Step14Safety.validate },
  { title: 'Compliance', component: Step15Kyc, validate: Step15Kyc.validate },
];

function validateStep(data: unknown, key: string): string[] {
  const d = data as Record<string, unknown> | undefined;
  const val = d?.[key];
  if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
    return [`${key} is required`];
  }
  return [];
}

function getEmptyDraft(): Partial<ShortletListingPayload> {
  return {
    property_structure: undefined,
    privacy_type: undefined,
    location: { formatted_address: '', coordinates: { lat: 0, lng: 0 }, show_precise_location: true },
    floor_plan: { guests_count: 1, bedrooms_count: 0, beds_count: 1, bathrooms_count: 0.5 },
    photos: [],
    pricing: { currency: 'USD', base_price: 10 },
    kyc_compliance: { address: { country_code: '', street_address: '', city: '', state_province: '', postal_code: '' }, is_business_entity: false, attestation_accepted: false },
  };
}

type Props = {
  onComplete?: (listing: { id: string }) => void;
};

export default function WizardShell({ onComplete }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get('listingId');

  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const [draft, setDraft] = useState<Partial<ShortletListingPayload>>(() => {
    if (typeof window === 'undefined') return getEmptyDraft();
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return getEmptyDraft();
  });

  const saveDraft = useCallback((nextDraft: Partial<ShortletListingPayload>) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextDraft));
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      // ignore storage errors
    }
  }, []);

  const currentStepData = useCallback(() => {
    const step = STEPS[currentStep];
    const dataKey = step.title.toLowerCase().replace(/\s+/g, '_');
    switch (currentStep) {
      case 0: return draft.property_structure;
      case 1: return draft.privacy_type;
      case 2: return draft.location;
      case 3: return draft.floor_plan;
      case 4: return { bedroom_furnishings: draft.bedroom_furnishings, space_images: draft.space_images };
      case 5: return { house_rules: draft.house_rules, unit_description: draft.unit_description };
      case 6: return draft.amenities;
      case 7: return draft.photos;
      case 8: return draft.title;
      case 9: return draft.highlights;
      case 10: return draft.booking_model;
      case 11: return draft.pricing;
      case 12: return draft.discounts;
      case 13: return draft.safety_disclosures;
      case 14: return draft.kyc_compliance;
      default: return {};
    }
  }, [currentStep, draft]);

  const getStepData = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: return draft.property_structure;
      case 1: return draft.privacy_type;
      case 2: return draft.location;
      case 3: return draft.floor_plan;
      case 4: return { bedroom_furnishings: draft.bedroom_furnishings, space_images: draft.space_images };
      case 5: return { house_rules: draft.house_rules, unit_description: draft.unit_description };
      case 6: return draft.amenities;
      case 7: return draft.photos;
      case 8: return draft.title;
      case 9: return draft.highlights;
      case 10: return draft.booking_model;
      case 11: return draft.pricing;
      case 12: return draft.discounts;
      case 13: return draft.safety_disclosures;
      case 14: return draft.kyc_compliance;
      default: return {};
    }
  };

  const handleStepChange = useCallback((stepIndex: number, stepData: unknown) => {
    setDraft((prev) => {
      const next = { ...prev };
      switch (stepIndex) {
        case 0: next.property_structure = stepData as any; break;
        case 1: next.privacy_type = stepData as any; break;
        case 2: next.location = stepData as any; break;
        case 3: next.floor_plan = stepData as any; break;
        case 4: next.bedroom_furnishings = (stepData as any)?.bedroom_furnishings; next.space_images = (stepData as any)?.space_images; break;
        case 5: next.house_rules = (stepData as any)?.house_rules; next.unit_description = (stepData as any)?.unit_description; break;
        case 6: next.amenities = stepData as any; break;
        case 7: next.photos = stepData as any; break;
        case 8: next.title = stepData as any; break;
        case 9: next.highlights = stepData as any; break;
        case 10: next.booking_model = stepData as any; break;
        case 11: next.pricing = stepData as any; break;
        case 12: next.discounts = stepData as any; break;
        case 13: next.safety_disclosures = stepData as any; break;
        case 14: next.kyc_compliance = stepData as any; break;
      }
      saveDraft(next);
      return next;
    });
    setCompletedSteps((prev) => new Set([...prev, stepIndex]));
  }, [saveDraft]);

  const goNext = () => {
    setErrors([]);
    const step = STEPS[currentStep];
    const data = currentStepData();
    const validationErrors = step.validate(data);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goBack = () => {
    setErrors([]);
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCreateListing = async () => {
    setErrors([]);
    let allErrors: string[] = [];
    for (let i = 0; i < STEPS.length; i++) {
      const step = STEPS[i];
      const data = getStepData(i);
      const stepErrors = step.validate(data);
      if (stepErrors.length > 0) {
        allErrors = [...allErrors, ...stepErrors];
      }
    }
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const masterPayload: ShortletListingPayload = {
        listingType: 'short_let',
        property_structure: draft.property_structure,
        privacy_type: draft.privacy_type!,
        location: draft.location!,
        floor_plan: draft.floor_plan!,
        amenities: draft.amenities,
        bedroom_furnishings: draft.bedroom_furnishings,
        space_images: draft.space_images,
        photos: draft.photos ?? [],
        house_rules: draft.house_rules,
        unit_description: draft.unit_description,
        title: draft.title!,
        highlights: draft.highlights,
        booking_model: draft.booking_model!,
        pricing: draft.pricing!,
        discounts: draft.discounts,
        safety_disclosures: draft.safety_disclosures,
        kyc_compliance: draft.kyc_compliance!,
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(masterPayload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Failed to create listing');
      }

      const listing = await res.json();

      // Clear draft after successful creation
      localStorage.removeItem(STORAGE_KEY);

      onComplete?.(listing);
      if (!onComplete) {
        router.push('/dashboard/landlord?listing=created');
      }
    } catch (err) {
      setErrors([err instanceof Error ? err.message : 'Failed to create listing. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveExit = () => {
    saveDraft(draft);
    router.push('/dashboard/landlord');
  };

  const StepComponent = STEPS[currentStep].component;

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-bold">N</div>
              <span className="hidden sm:inline">NewPropati</span>
            </Link>
            <Separator orientation="vertical" className="h-6 hidden sm:block" />
            <Badge variant="outline" className="hidden sm:inline-flex">Shortlet Listing</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              <HelpCircle className="size-4" /> Questions?
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSaveExit} className="gap-1">
              {saved ? <><CheckCircle2 className="size-4 text-green-500" /> Saved</> : <><Save className="size-4" /> Save & exit</>}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSaveExit}>
              <X className="size-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div className="flex-1 flex max-w-5xl mx-auto w-full">
        {/* Sidebar Progress Tracker */}
        <aside className="hidden lg:block w-56 shrink-0 border-r bg-background/50 p-4">
          <nav className="space-y-1 sticky top-20">
            {STEPS.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = completedSteps.has(idx);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (idx <= currentStep || isCompleted) {
                      setCurrentStep(idx);
                      setErrors([]);
                    }
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold'
                      : isCompleted
                      ? 'text-muted-foreground hover:bg-muted'
                      : 'text-muted-foreground/50 cursor-not-allowed'
                  }`}
                  disabled={idx > currentStep && !isCompleted}
                >
                  <div className="flex items-center gap-2">
                    <span className={`size-5 rounded-full flex items-center justify-center text-xs border ${
                      isCompleted ? 'bg-primary border-primary text-primary-foreground' : isActive ? 'border-primary text-primary' : 'border-muted-foreground/30'
                    }`}>
                      {isCompleted ? <CheckCircle2 className="size-3" /> : idx + 1}
                    </span>
                    <span>{step.title}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main Form Area */}
        <main className="flex-1 p-4 sm:p-6 pb-32">
          <Card className="p-6 sm:p-8 max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                Step {currentStep + 1} of {STEPS.length}
                <Separator orientation="vertical" className="h-3" />
                {STEPS[currentStep].title}
              </div>
              <Progress value={((currentStep + 1) / STEPS.length) * 100} />
            </div>

            {errors.length > 0 && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
                <ul className="text-sm text-destructive space-y-1">
                  {errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <StepComponent
              value={currentStepData() as any}
              onChange={(data: unknown) => handleStepChange(currentStep, data)}
            />
          </Card>
        </main>
      </div>

      {/* Sticky Footer */}
      <footer className="sticky bottom-0 z-50 bg-background/95 backdrop-blur border-t">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={currentStep === 0 || isSubmitting}
            className="gap-1"
          >
            <ArrowLeft className="size-4" /> Back
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < STEPS.length - 1 ? (
              <Button onClick={goNext} disabled={isSubmitting} className="gap-1">
                Next <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleCreateListing} disabled={isSubmitting} className="gap-1">
                {isSubmitting ? 'Creating...' : <><PlusCircle className="size-4" /> Create listing</>}
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
