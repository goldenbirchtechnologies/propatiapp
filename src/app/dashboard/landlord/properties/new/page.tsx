'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { createListingSchema } from '@/lib/validators';
import { useCreateListing } from '@/hooks/useListings';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Check, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

// Amenities list
const AMENITIES = [
  { id: 'wifi', label: 'WiFi' },
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'gym', label: 'Gym/Fitness Center' },
  { id: 'security', label: '24/7 Security' },
  { id: 'generator', label: 'Generator/Backup Power' },
  { id: 'parking', label: 'Parking Space' },
  { id: 'elevator', label: 'Elevator' },
  { id: 'balcony', label: 'Balcony/Terrace' },
  { id: 'garden', label: 'Garden' },
  { id: 'ac', label: 'Air Conditioning' },
  { id: 'furnished', label: 'Fully Furnished' },
  { id: 'serviced', label: 'Serviced' },
  { id: 'pet_friendly', label: 'Pet Friendly' },
];

// Nigerian states
const NIGERIAN_STATES = [
  'Lagos',
  'Abuja',
  'Rivers',
  'Oyo',
  'Kano',
  'Kaduna',
  'Enugu',
  'Delta',
  'Edo',
  'Ogun',
  'Anambra',
  'Abia',
  'Akwa Ibom',
  'Bayelsa',
  'Cross River',
];

// Define step fields for validation
const step1Fields = ['title', 'listingType', 'propertyType', 'description'] as const;
const step2Fields = ['state', 'area', 'address', 'bedrooms', 'bathrooms', 'toilets', 'sizeSqm', 'floorLevel'] as const;
const step3Fields = ['price', 'pricePeriod', 'cautionDeposit', 'serviceCharge', 'availableFrom', 'minimumStay'] as const;
const step4Fields = ['furnished', 'parkingSpaces', 'amenities'] as const;

export default function NewListingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const createMutation = useCreateListing();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof createListingSchema>>({
    resolver: zodResolver(createListingSchema) as unknown,
    defaultValues: {
      title: '',
      description: '',
      listingType: 'rent',
      propertyType: 'apartment',
      state: 'Lagos',
      area: '',
      address: '',
      price: 0,
      pricePeriod: 'month',
      cautionDeposit: 0,
      serviceCharge: 0,
      bedrooms: 0,
      bathrooms: 0,
      toilets: 0,
      sizeSqm: 0,
      floorLevel: 0,
      furnished: false,
      parkingSpaces: 0,
      amenities: [],
      availableFrom: '',
      minimumStay: undefined,
    },
    mode: 'onChange',
  });

  const listingType = form.watch('listingType');
  const title = form.watch('title');
  const description = form.watch('description');

  const getStepFields = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return step1Fields;
      case 2:
        return step2Fields;
      case 3:
        return step3Fields;
      case 4:
        return step4Fields;
      default:
        return [];
    }
  };

  const onNext = async () => {
    const fieldsToValidate = getStepFields(step);
    const isValid = await form.trigger(fieldsToValidate as unknown);
    if (isValid) {
      setStep(step + 1);
    }
  };

  const onBack = () => {
    setStep(step - 1);
  };

  const onSubmit = async (data: z.infer<typeof createListingSchema>, isDraft: boolean) => {
    try {
      const finalData = {
        ...data,
        status: isDraft ? 'draft' : 'active',
      } as unknown;

      await createMutation.mutateAsync(finalData);
      toast({
        title: isDraft ? 'Saved as draft' : 'Listing published!',
        description: isDraft
          ? 'Your listing has been saved and you can complete it later.'
          : 'Your property listing is now live on PROPATI.',
        variant: isDraft ? 'default' : 'success',
      });
      router.push('/dashboard/landlord/properties');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create listing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = () => {
    form.handleSubmit((data) => onSubmit(data, true))();
  };

  const handlePublish = () => {
    form.handleSubmit((data) => onSubmit(data, false))();
  };

  const progressPercentage = (step / 4) * 100;

  return (
    <div className="container max-w-3xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Listing</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details to list your property on PROPATI
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Basic Info
            </span>
          </div>

          <div className="flex-1 h-1 bg-muted mx-2">
            <div className={`h-full bg-primary transition-all ${step > 1 ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Location
            </span>
          </div>

          <div className="flex-1 h-1 bg-muted mx-2">
            <div className={`h-full bg-primary transition-all ${step > 2 ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > 3 ? <Check className="h-4 w-4" /> : '3'}
            </div>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Pricing
            </span>
          </div>

          <div className="flex-1 h-1 bg-muted mx-2">
            <div className={`h-full bg-primary transition-all ${step > 3 ? 'w-full' : 'w-0'}`} />
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full ${
                step >= 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}
            >
              {step > 4 ? <Check className="h-4 w-4" /> : '4'}
            </div>
            <span className={`text-sm font-medium ${step >= 4 ? 'text-foreground' : 'text-muted-foreground'}`}>
              Features
            </span>
          </div>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Step {step} of 4</CardTitle>
          <CardDescription>
            {step === 1 && 'Tell us about your property'}
            {step === 2 && 'Where is your property located?'}
            {step === 3 && 'Set your pricing and availability'}
            {step === 4 && 'Add features and amenities'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Step 1: Basic Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control as unknown}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Modern 3 Bedroom Apartment in Lekki" {...field} />
                        </FormControl>
                        <FormDescription>
                          {title.length}/100 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as unknown}
                    name="listingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select listing type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="rent">For Rent</SelectItem>
                            <SelectItem value="sale">For Sale</SelectItem>
                            <SelectItem value="short_let">Short Let</SelectItem>
                            <SelectItem value="share">Shared Apartment</SelectItem>
                            <SelectItem value="commercial">Commercial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as unknown}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="apartment">Apartment</SelectItem>
                            <SelectItem value="house">House</SelectItem>
                            <SelectItem value="duplex">Duplex</SelectItem>
                            <SelectItem value="land">Land</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                            <SelectItem value="shop">Shop</SelectItem>
                            <SelectItem value="warehouse">Warehouse</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as unknown}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your property in detail..."
                            className="min-h-[150px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {description?.length || 0}/5000 characters (minimum 50)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Location & Details */}
              {step === 2 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control as unknown}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {NIGERIAN_STATES.map((state) => (
                              <SelectItem key={state} value={state}>
                                {state}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as unknown}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area/Locality *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Lekki Phase 1, Ikeja GRA" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as unknown}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter the complete address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control as unknown}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as unknown}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as unknown}
                      name="toilets"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Toilets</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="20"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as unknown}
                      name="sizeSqm"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Size (sqm) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 120"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as unknown}
                      name="floorLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Floor Level</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="e.g., 3"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormDescription>Ground floor = 0</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Pricing & Availability */}
              {step === 3 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as unknown}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price (NGN) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 1500000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as unknown}
                      name="pricePeriod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price Period *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select period" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="night">Per Night</SelectItem>
                              <SelectItem value="month">Per Month</SelectItem>
                              <SelectItem value="year">Per Year</SelectItem>
                              <SelectItem value="total">Total (One-time)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control as unknown}
                      name="cautionDeposit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Caution Deposit (NGN)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 1000000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control as unknown}
                      name="serviceCharge"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Charge (NGN)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="e.g., 50000"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control as unknown}
                    name="availableFrom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available From *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {listingType === 'short_let' && (
                    <FormField
                      control={form.control as unknown}
                      name="minimumStay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Stay (days)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="e.g., 7"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                            />
                          </FormControl>
                          <FormDescription>For short let properties only</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              )}

              {/* Step 4: Features & Amenities */}
              {step === 4 && (
                <div className="space-y-6">
                  <FormField
                    control={form.control as unknown}
                    name="furnished"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Furnished Property</FormLabel>
                          <FormDescription>Is this property fully furnished?</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as unknown}
                    name="parkingSpaces"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Parking Spaces</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="20"
                            placeholder="e.g., 2"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control as unknown}
                    name="amenities"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Amenities</FormLabel>
                          <FormDescription>Select all amenities available</FormDescription>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {AMENITIES.map((amenity) => (
                            <FormField
                              key={amenity.id}
                              control={form.control as unknown}
                              name="amenities"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={amenity.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(amenity.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), amenity.id])
                                            : field.onChange(
                                                field.value?.filter((value) => value !== amenity.id)
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{amenity.label}</FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t">
                <div className="flex gap-2">
                  {step > 1 && (
                    <Button type="button" variant="outline" onClick={onBack}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSaveDraft}
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Save Draft
                  </Button>
                </div>

                <div className="flex gap-2">
                  {step < 4 ? (
                    <Button type="button" onClick={onNext}>
                      Next
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="success"
                      onClick={handlePublish}
                      disabled={createMutation.isPending}
                    >
                      {createMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Publish Listing
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
