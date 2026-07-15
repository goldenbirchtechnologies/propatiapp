'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2, FileText, Download, Printer, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  { label: 'Card Endpoint Auth', done: true },
  { label: 'Payment Capture', done: true },
  { label: 'Ledger Reconciliation', done: true },
  { label: 'Statement Emailed', done: false },
  { label: 'Property Verified', done: false },
];

export default function PaymentSuccessPage() {
  const [countdown, setCountdown] = useState(15);
  const [paymentStatus] = useState<'success' | 'pending' | 'failed'>('success');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm">
        <span className="font-mono text-muted-foreground">PAYMENTS</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-muted-foreground">PROPERTY 1</span>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
        <span className="font-mono text-primary font-semibold">{paymentStatus.toUpperCase()}</span>
      </nav>

      {/* Success Hero */}
      <section className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-tertiary-container mb-4 shadow-[0_20px_50px_rgba(0,158,111,0.2)]">
          <span
            className="material-symbols-outlined text-success-bright text-5xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-primary mb-2">
          Payment Successful
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-lg mx-auto">
          Your transaction has been processed securely. A confirmation email and receipt have been
          sent to your registered address.
        </p>
      </section>

      {/* Transaction Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Main Summary Card */}
        <div className="md:col-span-7 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="text-label-sm text-on-surface-variant uppercase tracking-widest mb-1">
                  Total Amount Paid
                </p>
                <h3 className="font-headline-lg headline-lg text-primary">₦1,450,000.00</h3>
              </div>
              <div className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-label-md font-bold flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]"><MaterialIcon name=verified className="material-symbols-outlined" />
                Verified
              </div>
            </div>
            <div className="space-y-3 border-t border-outline-variant pt-5">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Payment Method</span>
                <div className="flex items-center gap-2 font-semibold">
                  <span className="material-symbols-outlined text-primary"><MaterialIcon name=credit_card className="material-symbols-outlined" />
                  <span>Visa ending in 4242</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Transaction ID</span>
                <span className="font-label-md label-md text-primary">PRP-TXN-882910442X</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Date &amp; Time</span>
                <span className="text-body-sm font-medium">Oct 24, 2023 • 14:32 WAT</span>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button className="flex-1 items-center justify-center gap-2 bg-primary-container text-white hover:bg-primary transition-all active:scale-95">
              <Download className="w-4 h-4" /> Download Receipt
            </Button>
            <Link href="/dashboard/tenant" className="flex-1">
              <Button variant="outline" className="w-full border-primary-container text-primary-container hover:bg-surface-container-low transition-all">
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Breakdown & Property Card */}
        <div className="md:col-span-5 space-y-6">
          <Card>
            <CardContent className="p-5">
              <h4 className="font-headline text-headline-sm text-primary mb-3">
                Payment Breakdown
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                  <div className="flex flex-col">
                    <span className="font-semibold text-primary">Q4 Rent (Oct - Dec)</span>
                    <span className="text-body-sm text-on-surface-variant">Prime Apartments, Unit 4B</span>
                  </div>
                  <span className="font-medium">₦1,200,000.00</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-outline-variant/30">
                  <span className="text-on-surface-variant">Service Charge</span>
                  <span className="font-medium">₦200,000.00</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-on-surface-variant">Utilities &amp; Internet</span>
                  <span className="font-medium">₦50,000.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="relative overflow-hidden rounded-xl h-32 border border-outline-variant cursor-pointer group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
              style={{
                backgroundImage:
                  "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCjOCZK2Ig5uFHSX7sppbICDBSfLBa1JL3RHFFGxGVAxYipFnvibFsj7-FCRMZMjwFKgO08X25TdiaW3_ZEg11OsGXSInjZ-C9k7NB8nYozQ7EKjRZomKbyrDIUE7OhufVdr6da67B8xmjoy0ObLuuPWBTnNCYDy9ZiBMOUmseKJ4WwZeP0bwDUjHMNDbNI1zv5cwq6bOQz-rUKVxmEGIoNgXimFsU2rwOtQDvexEC_ONOGNYly1sXE')",
              }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            <div className="absolute bottom-4 left-4 text-white">
              <p className="text-label-sm uppercase tracking-wider opacity-80">Connected Property</p>
              <h5 className="font-bold">The Lux Apartments, Ikoyi</h5>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Link href="/dashboard/tenant/receipts" className="block">
          <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <p className="font-headline text-base font-bold text-primary group-hover:underline">
                  Download Official Receipt
                </p>
                <p className="text-sm text-muted-foreground">PDF format for your records.</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <button className="block w-full">
          <Card className="hover:shadow-lg transition-all cursor-pointer group hover:border-primary/50">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/5 text-primary rounded-xl flex items-center justify-center">
                <Printer className="w-6 h-6" />
              </div>
              <div>
                <p className="font-heading text-base font-bold text-primary group-hover:underline">
                  Print Receipt
                </p>
                <p className="text-sm text-muted-foreground">
                  Use this option if you have no PDF viewer available.
                </p>
              </div>
            </CardContent>
          </Card>
        </button>
      </div>

      {/* Footer */}
      <div className="text-center p-6 border-t border-outline-variant">
        <p className="text-sm text-muted-foreground">
          You will be redirected to your Property Dashboard in{' '}
          <span className="font-bold text-primary">{countdown}s</span>
        </p>
        <Link href="/dashboard/tenant/payments">
          <Button className="mt-4 font-bold">Return to Payment Portal</Button>
        </Link>
      </div>

      {/* Trust Footer */}
      <footer className="pt-5 border-t border-outline-variant flex flex-col items-center gap-4">
        <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-300">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[20px]"><MaterialIcon name=security className="material-symbols-outlined" />
            <span className="text-label-sm">PCI-DSS Compliant</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[20px]"><MaterialIcon name=encrypted className="material-symbols-outlined" />
            <span className="text-label-sm">256-bit SSL Encryption</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[20px]"><MaterialIcon name=verified_user className="material-symbols-outlined" />
            <span className="text-label-sm">Central Bank Regulated</span>
          </div>
        </div>
        <p className="text-center text-body-sm text-on-surface-variant max-w-md">
          PROPATI uses industry-leading security protocols to ensure your financial data is always
          protected. Need help?{' '}
          <a className="text-primary font-bold underline decoration-[#feae2c] underline-offset-4" href="#">
            Contact Support
          </a>
        </p>
      </footer>
    </div>
  );
}
