import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Payment Successful — PROPATI',
};

interface OrderRow {
  label: string;
  value: string;
  highlight?: boolean;
}

const ORDER_SUMMARY: OrderRow[] = [
  { label: 'Reference', value: 'PROP-2025-42B7A9' },
  { label: 'Amount', value: '₦ 185,000.00' },
  { label: 'Method', value: 'Paystack' },
  { label: 'Date', value: '26 Jun 2025' },
  { label: 'Status', value: 'Confirmed', highlight: true },
];

const NEXT_STEPS = [
  'Your payment has been received and is being processed.',
  'A receipt is available from the link below.',
  'Your subscription is now active — head to the dashboard to continue.',
];

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-border shadow-1">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Payment Successful</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-sm text-muted-foreground">
              Your payment has been received. A receipt is available from the link below.
            </p>

            <div className="rounded-lg border border-border bg-muted/50 divide-y divide-border-subtle">
              {ORDER_SUMMARY.map(({ label, value, highlight }) => (
                <div key={label} className="flex items-center justify-between px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className={`font-medium ${highlight ? 'text-success' : 'text-foreground'}`}>{value}</span>
                </div>
              ))}
            </div>

            <ul className="space-y-2 text-sm text-muted-foreground">
              {NEXT_STEPS.map((step) => (
                <li key={step} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <a href="/dashboard/payments/receipts/42B7A9.pdf" download>
                  Download receipt
                </a>
              </Button>
              <Button asChild>
                <Link href="/dashboard">Back to dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
