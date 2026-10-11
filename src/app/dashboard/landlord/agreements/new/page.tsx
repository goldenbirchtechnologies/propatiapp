'use client';

import { useState } from 'react';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCreateAgreement } from '@/hooks/useAgreements';
import { createAgreementSchema } from '@/lib/validators';
import { cn } from '@/lib/utils';

type FormData = z.infer<typeof createAgreementSchema>;

export default function NewAgreementPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const createAgreement = useCreateAgreement();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createAgreementSchema) as unknown,
    defaultValues: {
      type: 'rental',
      rentPeriod: 'monthly',
      noticePeriodDays: 30,
    },
  } as unknown);

  const watchedValues = watch();

  const onSubmit = async (data: unknown) => {
    try {
      const agreement = await createAgreement.mutateAsync(data as unknown);
      toast({
        title: 'Agreement Created',
        description: 'The agreement has been created successfully.',
      } as unknown);
      router.push(`/dashboard/landlord/agreements/${agreement.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create agreement. Please try again.',
        variant: 'destructive',
      } as unknown);
    }
  };

  const calculateLeaseDuration = () => {
    const { startDate, endDate } = watchedValues;
    if (
      !startDate ||
      !endDate ||
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate))
    ) {
      return null;
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Guard against invalid date objects
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return null;
    }
    const diffTime = end.getTime() - start.getTime();
    if (diffTime <= 0) {
      return null;
    }
    const months = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30));
    return isNaN(months) ? null : months;
  };

  const calculateRentSchedule = () => {
    const { rentAmount, startDate, endDate, rentPeriod } = watchedValues;
    if (
      !rentAmount ||
      !startDate ||
      !endDate ||
      isNaN(Date.parse(startDate)) ||
      isNaN(Date.parse(endDate))
    ) {
      return [];
    }

    const schedule: { date: string; amount: number }[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Guard against invalid date objects
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return [];
    }

    const currentDate = new Date(start);

    const interval = rentPeriod === 'monthly' ? 1 :
                     rentPeriod === 'quarterly' ? 3 : 12;

    while (currentDate <= end) {
      schedule.push({
        date: format(currentDate, 'MMM dd, yyyy'),
        amount: rentAmount,
      });
      currentDate.setMonth(currentDate.getMonth() + interval);
    }

    return schedule;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
    }).format(amount);
  };

  const validateStep = async (step: number): Promise<boolean> => {
    const fieldsToValidate: Record<number, string[]> = {
      1: ['listingId', 'tenantId', 'type'],
      2: ['startDate', 'endDate', 'rentAmount', 'rentPeriod'],
    };

    const fields = fieldsToValidate[step];
    if (!fields) return true;

    const promises = fields.map(async (field) => {
      const input = document.querySelector(`[name="${field}"]`) as HTMLInputElement | null;
      if (input) {
        input.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      return await trigger(field as keyof FormData);
    });

    const results = await Promise.all(promises);
    return results.every((valid) => valid);
  };

  const nextStep = async () => {
    const isValid = await validateStep(currentStep);
    if (isValid) {
      setCurrentStep(currentStep + 1);
    }
  };
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Agreement</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Create a rental agreement and invite your tenant to sign.
        </p>
      </div>

      {/* Progress Indicator - Visual Stepper */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { id: 1, label: 'Select Tenant & Property' },
            { id: 2, label: 'Agreement Terms & Pricing' },
            { id: 3, label: 'Review & Dispatch' },
          ].map((step, idx, arr) => {
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;
            const isUpcoming = currentStep < step.id;
            const showLine = idx < arr.length - 1;
            const isLineComplete = currentStep > step.id;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                      isCompleted
                        ? 'bg-emerald-500 text-zinc-900 dark:text-white border-emerald-500'
                        : isActive
                        ? 'bg-white text-emerald-600 border-white'
                        : 'bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-700'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{step.id}</span>
                    )}
                  </div>
                  <span className={cn(
                    'text-xs mt-2 text-center',
                    isCompleted ? 'text-emerald-400 font-medium' :
                    isActive ? 'text-zinc-900 dark:text-white font-medium' :
                    'text-zinc-600 dark:text-zinc-400'
                  )}>
                    {step.label}
                  </span>
                </div>
                {showLine && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-1 my-auto',
                      isLineComplete ? 'bg-emerald-500' : 'bg-zinc-700'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Select Tenant & Listing */}
        {currentStep === 1 && (
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-semibold">Select Tenant & Listing</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="listingId">Select Listing *</Label>
                <Select
                  value={watchedValues.listingId}
                  onValueChange={(value) => setValue('listingId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a listing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="listing-1">3 Bedroom Apartment - Lekki</SelectItem>
                    <SelectItem value="listing-2">2 Bedroom Flat - Victoria Island</SelectItem>
                    <SelectItem value="listing-3">4 Bedroom Duplex - Ikeja</SelectItem>
                  </SelectContent>
                </Select>
                {errors.listingId && (
                  <p className="text-sm text-red-500 mt-1">{errors.listingId.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="tenantId">Tenant Email or ID *</Label>
                <Input
                  id="tenantId"
                  {...register('tenantId')}
                  placeholder="Enter tenant email or ID"
                />
                {errors.tenantId && (
                  <p className="text-sm text-red-500 mt-1">{errors.tenantId.message}</p>
                )}
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  The tenant will receive an invitation to review and sign the agreement.
                </p>
              </div>

              <div>
                <Label htmlFor="type">Agreement Type *</Label>
                <Select
                  value={watchedValues.type}
                  onValueChange={(value) => setValue('type', value as unknown)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select agreement type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rental">Rental Agreement</SelectItem>
                    <SelectItem value="sale">Sale Agreement</SelectItem>
                    <SelectItem value="short_let">Short Let Agreement</SelectItem>
                    <SelectItem value="share">Property Share Agreement</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Agreement Terms */}
        {currentStep === 2 && (
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-semibold">Agreement Terms</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  {...register('startDate')}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  {...register('endDate')}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {calculateLeaseDuration() && (
              <div className="bg-accent/10 p-4 rounded-lg">
                <p className="text-sm font-medium text-zinc-900 dark:text-white">
                  Lease Duration: {calculateLeaseDuration()} months
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="rentAmount">Rent Amount (NGN) *</Label>
                <Input
                  id="rentAmount"
                  type="number"
                  {...register('rentAmount', { valueAsNumber: true })}
                  placeholder="e.g., 500000"
                />
                {errors.rentAmount && (
                  <p className="text-sm text-red-500 mt-1">{errors.rentAmount.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="rentPeriod">Payment Schedule *</Label>
                <Select
                  value={watchedValues.rentPeriod}
                  onValueChange={(value) => setValue('rentPeriod', value as unknown)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
                {errors.rentPeriod && (
                  <p className="text-sm text-red-500 mt-1">{errors.rentPeriod.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cautionDeposit">Caution Deposit (NGN)</Label>
                <Input
                  id="cautionDeposit"
                  type="number"
                  {...register('cautionDeposit', { valueAsNumber: true })}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label htmlFor="serviceCharge">Service Charge (NGN)</Label>
                <Input
                  id="serviceCharge"
                  type="number"
                  {...register('serviceCharge', { valueAsNumber: true })}
                  placeholder="Optional"
                />
              </div>

              <div>
                <Label htmlFor="terms">Additional Terms</Label>
                <Textarea
                  id="terms"
                  {...(register as unknown)('terms')}
                  placeholder="Enter unknown additional terms or conditions..."
                  rows={4}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Create */}
        {currentStep === 3 && (
          <div className="glass-card p-6 space-y-6">
            <h2 className="text-xl font-semibold">Review Agreement</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Listing</p>
                  <p className="font-medium">{watchedValues.listingId || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Tenant</p>
                  <p className="font-medium">{watchedValues.tenantId || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Agreement Type</p>
                  <p className="font-medium capitalize">{watchedValues.type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Payment Schedule</p>
                  <p className="font-medium capitalize">{watchedValues.rentPeriod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Start Date</p>
                  <p className="font-medium">
                    {watchedValues.startDate
                      ? format(new Date(watchedValues.startDate), 'MMM dd, yyyy')
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">End Date</p>
                  <p className="font-medium">
                    {watchedValues.endDate
                      ? format(new Date(watchedValues.endDate), 'MMM dd, yyyy')
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Rent Amount</p>
                  <p className="font-medium">
                    {watchedValues.rentAmount ? formatCurrency(watchedValues.rentAmount) : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Duration</p>
                  <p className="font-medium">{calculateLeaseDuration() ?? '—'} {calculateLeaseDuration() !== null ? calculateLeaseDuration() === 1 ? 'month' : 'months' : ''}</p>
                </div>
              </div>

              {(watchedValues.cautionDeposit || watchedValues.serviceCharge) && (
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  {watchedValues.cautionDeposit && (
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Caution Deposit</p>
                      <p className="font-medium">{formatCurrency(watchedValues.cautionDeposit)}</p>
                    </div>
                  )}
                  {watchedValues.serviceCharge && (
                    <div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">Service Charge</p>
                      <p className="font-medium">{formatCurrency(watchedValues.serviceCharge)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Estimated Rent Schedule */}
              {calculateRentSchedule().length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Estimated Payment Schedule</h3>
                  <div className="bg-muted/30 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {calculateRentSchedule().map((entry, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-zinc-600 dark:text-zinc-400">{entry.date}</span>
                          <span className="font-medium">{formatCurrency(entry.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {watchedValues && (watchedValues as unknown).terms && (
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Additional Terms</p>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{(watchedValues as unknown).terms}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}



        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (currentStep === 1) {
                router.back();
              } else {
                setCurrentStep(currentStep - 1);
              }
            }}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Back'}
          </Button>

          {currentStep < 3 ? (
            <Button
              type="button"
              onClick={nextStep}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button type="submit" disabled={createAgreement.isPending}>
              {createAgreement.isPending ? 'Creating...' : 'Create Agreement'}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}