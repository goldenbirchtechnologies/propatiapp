import type { Metadata } from 'next';
import LawFirms from './law-firms/page';
import LawFirmCases from './law-firm-cases/page';
import Documents from './documents/page';
import Subscriptions from './subscriptions/page';

export const metadata: Metadata = {
  title: 'Admin Business',
  description: 'Manage law firms, documents, and subscriptions',
};

export default function AdminBusiness() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Admin Business</h1>
        <p className="text-gray-500">Law firms, documents, and subscription management</p>
      </header>
      <div className="grid gap-6 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-semibold">Law Firms</h2>
          <LawFirms />
        </section>
        <section>
          <h2 className="text-xl font-semibold">Law Firm Cases</h2>
          <LawFirmCases />
        </section>
        <section>
          <h2 className="text-xl font-semibold">Documents</h2>
          <Documents />
        </section>
        <section>
          <h2 className="text-xl font-semibold">Subscriptions</h2>
          <Subscriptions />
        </section>
      </div>
    </div>
  );
}
