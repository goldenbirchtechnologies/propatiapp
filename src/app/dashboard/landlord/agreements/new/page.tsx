'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
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
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createAgreementSchema),
    defaultValues: {
      type: 'rental',
      rentPeriod: 'monthly',
      noticePeriodDays: 30,
    },
  });

  const watchedValues = watch();

  const onSubmit = async (data: FormData) => {
    try {
      const agreement = await createAgreement.mutateAsync(data);
      toast({
        title: 'Agreement Created',
        description: 'The agreement has been created successfully.',
      });
      router.push(`/dashboard/landlord/agreements/${agreement.id}`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create agreement. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const calculateLeaseDuration = () => {
    if (!watchedValues.startDate || !watchedValues.endDate) return null;
    const start = new Date(watchedValues.startDate);
    const end = new Date(watchedValues.endDate);
    const months = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    return months;
  };

  const calculateRentSchedule = () => {
    if (!watchedValues.rentAmount || !watchedValues.startDate || !watchedValues.endDate) {
      return [];
    }

    const schedule = [];
    const start = new Date(watchedValues.startDate);
    const end = new Date(watchedValues.endDate);
    let currentDate = new Date(start);

    const interval = watchedValues.rentPeriod === 'monthly' ? 1 :
                     watchedValues.rentPeriod === 'quarterly' ? 3 : 12;

    while (currentDate <= end) {
      schedule.push({
        date: format(currentDate, 'MMM dd, yyyy'),
        amount: watchedValues.rentAmount,
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

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Agreement</h1>
        <p className="text-muted-foreground">
          Create a rental agreement and invite your tenant to sign.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-muted'
                }`}
              >
                {step}
              </div>
              {step < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    currentStep > step ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-sm text-muted-foreground">Select Tenant</span>
          <span className="text-sm text-muted-foreground">Agreement Terms</span>
          <span className="text-sm text-muted-foreground">Review</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1: Select Tenant & Listing */}
        {currentStep === 1 && (
          <Card className="p-6 space-y-6">
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
                  <p className="text-sm text-red-600 mt-1">{errors.listingId.message}</p>
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
                  <p className="text-sm text-red-600 mt-1">{errors.tenantId.message}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  The tenant will receive an invitation to review and sign the agreement.
                </p>
              </div>

              <div>
                <Label htmlFor="type">Agreement Type *</Label>
                <Select
                  value={watchedValues.type}
                  onValueChange={(value) => setValue('type', value as any)}
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
                  <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Step 2: Agreement Terms */}
        {currentStep === 2 && (
          <Card className="p-6 space-y-6">
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
                  <p className="text-sm text-red-600 mt-1">{errors.startDate.message}</p>
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
                  <p className="text-sm text-red-600 mt-1">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {calculateLeaseDuration() && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-blue-900">
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
                  <p className="text-sm text-red-600 mt-1">{errors.rentAmount.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="rentPeriod">Payment Schedule *</Label>
                <Select
                  value={watchedValues.rentPeriod}
                  onValueChange={(value) => setValue('rentPeriod', value as any)}
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
                  <p className="text-sm text-red-600 mt-1">{errors.rentPeriod.message}</p>
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
                  {...register('terms')}
                  placeholder="Enter any additional terms or conditions..."
                  rows={4}
                />
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Review & Create */}
        {currentStep === 3 && (
          <Card className="p-6 space-y-6">
            <h2 className="text-xl font-semibold">Review Agreement</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Listing</p>
                  <p className="font-medium">{watchedValues.listingId || 'Not selected'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tenant</p>
                  <p className="font-medium">{watchedValues.tenantId || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Agreement Type</p>
                  <p className="font-medium capitalize">{watchedValues.type?.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Schedule</p>
                  <p className="font-medium capitalize">{watchedValues.rentPeriod}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                <div>
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">
                    {watchedValues.startDate
                      ? format(new Date(watchedValues.startDate), 'MMM dd, yyyy')
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">
                    {watchedValues.endDate
                      ? format(new Date(watchedValues.endDate), 'MMM dd, yyyy')
                      : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rent Amount</p>
                  <p className="font-medium">
                    {watchedValues.rentAmount ? formatCurrency(watchedValues.rentAmount) : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{calculateLeaseDuration()} months</p>
                </div>
              </div>

              {(watchedValues.cautionDeposit || watchedValues.serviceCharge) && (
                <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                  {watchedValues.cautionDeposit && (
                    <div>
                      <p className="text-sm text-muted-foreground">Caution Deposit</p>
                      <p className="font-medium">{formatCurrency(watchedValues.cautionDeposit)}</p>
                    </div>
                  )}
                  {watchedValues.serviceCharge && (
                    <div>
                      <p className="text-sm text-muted-foreground">Service Charge</p>
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
                          <span className="text-muted-foreground">{entry.date}</span>
                          <span className="font-medium">{formatCurrency(entry.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {watchedValues.terms && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Additional Terms</p>
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">{watchedValues.terms}</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
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
              onClick={() => setCurrentStep(currentStep + 1)}
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
