'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, ShieldCheck, Store } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(50, 'Description must be at least 50 characters').max(5000),
  listingType: z.enum(['rent', 'sale', 'short_let', 'share', 'commercial']),
  propertyType: z.enum(['apartment', 'house', 'duplex', 'land', 'office', 'shop', 'warehouse']).optional(),
  address: z.string().min(5, 'Address is required'),
  area: z.string().min(2, 'Area is required'),
  state: z.string().min(2).default('Lagos'),
  price: z.number().positive('Price must be positive'),
  pricePeriod: z.enum(['night', 'month', 'year', 'total']).optional(),
  cautionDeposit: z.number().nonnegative().optional(),
  serviceCharge: z.number().nonnegative().optional(),
  bedrooms: z.number().int().nonnegative().optional(),
  bathrooms: z.number().int().nonnegative().optional(),
  toilets: z.number().int().nonnegative().optional(),
  sizeSqm: z.number().positive().optional(),
  floorLevel: z.number().int().nonnegative().optional(),
  furnished: z.boolean().default(false),
  parkingSpaces: z.number().int().nonnegative().default(0),
  amenities: z.array(z.string()).optional(),
  availableFrom: z.string().datetime().optional(),
  minimumStay: z.number().int().positive().optional(),
});

type ListingInput = z.infer<typeof listingSchema>;

export default function AddListingClient() {
  const router = useRouter();
  const { toast } = useToast();
  const [verified, setVerified] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: '',
      description: '',
      listingType: 'rent',
      propertyType: 'apartment',
      address: '',
      area: '',
      state: 'Lagos',
      price: 0,
      pricePeriod: 'month',
      cautionDeposit: undefined,
      serviceCharge: undefined,
      bedrooms: 0,
      bathrooms: 0,
      toilets: 0,
      sizeSqm: undefined,
      floorLevel: 0,
      furnished: false,
      parkingSpaces: 0,
      amenities: [],
      availableFrom: '',
      minimumStay: undefined,
    },
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/verification/my');
        const data = await res.json();
        const overallStatus = data?.verification?.overallStatus;
        setVerified(overallStatus === 'certified');
      } catch {
        if (!cancelled) setVerified(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = async (data: ListingInput) => {
    if (verified !== true) {
      toast({
        title: 'Verification required',
        description: 'You must complete property verification before listing to the marketplace.',
        variant: 'destructive',
      });
      router.push('/dashboard/verification?type=property');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'active' }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create listing');
      }

      const listing = await res.json();
      toast({ title: 'Listed', description: 'Your property is now live on the marketplace.' });
      router.push(`/dashboard/landlord/properties/${listing.id}`);
    } catch (error) {
      toast({
        title: 'Listing failed',
        description: error instanceof Error ? error.message : 'Unexpected error',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">List to Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Create a live marketplace listing. Property verification is required before publishing.
        </p>
      </div>

      {verified === null ? (
        <div className="text-sm text-muted-foreground">Checking verification status...</div>
      ) : verified ? (
        <Card>
          <CardHeader>
            <CardTitle>Marketplace Listing Details</CardTitle>
            <CardDescription>Verified properties get priority placement and the Certified badge.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control as unknown}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Modern 3-Bed Apartment in Lekki" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as unknown}
                    name="listingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Type</FormLabel>
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
                        <FormLabel>Property Type</FormLabel>
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
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Full street address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as unknown}
                    name="area"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Lekki Phase 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as unknown}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Lagos" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control as unknown}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price (NGN)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
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
                        <FormLabel>Price Period</FormLabel>
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
                  <FormField
                    control={form.control as unknown}
                    name="description"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea rows={5} placeholder="Describe the property..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Store className="mr-2 h-4 w-4" />
                    Publish to Marketplace
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-border p-6">
          <h3 className="font-bold text-foreground">Verification required</h3>
          <p className="text-muted-foreground mt-2">
            Only verified properties can be published to the marketplace. Start or complete property verification first.
          </p>
          <Button className="mt-4" onClick={() => router.push('/dashboard/verification?type=property')}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Start Verification
          </Button>
        </div>
      )}
    </div>
  );
}

function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-outline-variant bg-surface-container-lowest p-6 ${className || ''}`}>{children}</div>;
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="mb-4">{children}</div>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-xl font-bold text-foreground">{children}</h2>;
}
function CardDescription({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground mt-1">{children}</p>;
}
function CardContent({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}
