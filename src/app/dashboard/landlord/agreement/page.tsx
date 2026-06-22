import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Agreements – Landlord',
  description: 'View and manage lease agreements for your properties.'
};

export default function AgreementsPage() {
  const agreements = [
    { id: '1', property: 'Unit A', tenant: 'Alice', start: '2024-01-01', end: '2025-01-01' },
    { id: '2', property: 'Unit B', tenant: 'Bob', start: '2024-02-15', end: '2025-02-15' }
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <Card className="w-full max-w-3xl bg-gradient-to-br from-primary/10 via-primary/20 to-primary/30 hover:shadow-xl transition-shadow duration-200 animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Lease Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {agreements.map(a => (
              <li key={a.id} className="text-sm text-foreground">
                {a.property} – {a.tenant} ({a.start} → {a.end})
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}
