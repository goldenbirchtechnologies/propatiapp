import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Support page for PROPATI',
};

export default function SupportPage() {
  return (
    <section className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Support</h1>
      <p className="text-lg text-muted-foreground">
        If you need assistance, please reach out to our support team via email at{' '}
        <a href="mailto:support@propati.com" className="underline text-primary">
          support@propati.com
        </a>{' '}
        or use the contact form on the{' '}
        <a href="/contact-us" className="underline text-primary">
          Contact Us
        </a>{' '}
        page.
      </p>
    </section>
  );
}
