'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLandlordWallet } from '@/hooks/useLandlordWallet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function LandlordDashboard() {
  const router = useRouter();
  const { balance, isLoading, error } = useLandlordWallet();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <h1 className="text-3xl font-bold text-foreground">Landlord Dashboard</h1>
      <p className="mt-4 text-muted-foreground">
        Manage your properties, view applications, and publish new listings.
      </p>
      <button
        onClick={() => router.push('/dashboard/landlord/properties')}
        className="mt-6 w-full max-w-xs rounded-xl bg-primary text-primary-foreground py-3 font-semibold hover:bg-primary/90"
      >
        View My Properties <ArrowRight size={16} className="inline-block ml-1" />
      </button>
      <section className="mt-8 w-full max-w-2xl">
        <h2 className="text-lg font-medium text-foreground mb-2">Short‑let / Room‑share</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Review incoming short‑let or room‑share requests from tenants.
        </p>
        <Link
          href="/dashboard/landlord/shortlet-requests"
          className="inline-block rounded-xl bg-primary/10 text-primary py-2 px-4 text-sm font-medium hover:bg-primary/20 mr-4"
        >
          View Requests
        </Link>
      </section>
      <section className="mt-8 w-full max-w-2xl">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Wallet</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <p className="text-2xl font-bold text-foreground mb-2">₦{balance?.toLocaleString() ?? '0'}</p>
            <Link
              href="/dashboard/landlord/wallet"
              className="mt-2 rounded-xl bg-primary text-primary-foreground py-2 px-4 text-sm font-medium hover:bg-primary/90"
            >
              Manage Wallet
            </Link>
          </CardContent>
        </Card>
      </section>
      <section className="mt-8 w-full max-w-2xl">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Rent Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Link href="/dashboard/landlord/rent" className="mt-2 rounded-xl bg-primary text-primary-foreground py-2 px-4 text-sm font-medium hover:bg-primary/90">
              Manage Rent
            </Link>
          </CardContent>
        </Card>
      </section>
      <section className="mt-8 w-full max-w-2xl">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Agreements</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Link href="/dashboard/landlord/agreement" className="mt-2 rounded-xl bg-primary text-primary-foreground py-2 px-4 text-sm font-medium hover:bg-primary/90">
              View Agreements
            </Link>
          </CardContent>
        </Card>
      </section>
      <section className="mt-8 w-full max-w-2xl">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Applications</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <Link href="/dashboard/landlord/applications" className="mt-2 rounded-xl bg-primary text-primary-foreground py-2 px-4 text-sm font-medium hover:bg-primary/90">
              View Applications
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
