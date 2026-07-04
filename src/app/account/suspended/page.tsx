import Link from 'next/link';
import { Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata = {
  title: 'Account Suspended — PROPATI',
};

export default function AccountSuspendedPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Card className="border-border shadow-1">
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Snowflake className="h-8 w-8 text-frozen" aria-hidden="true" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Account Suspended</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-center text-sm text-muted-foreground">
              Your account has been suspended. Contact our support team for assistance and next steps to restore your access.
            </p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <Button asChild variant="outline">
                <Link href="/">Go to home</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="mailto:support@propati.ng">Contact support</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
