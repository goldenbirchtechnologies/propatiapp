import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-heading font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-heading font-bold text-[#1a1a1a] mb-4">Page not found</h2>
        <p className="text-[#555] mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link href="/" className="inline-flex items-center px-8 py-3.5 bg-primary text-white font-bold rounded-full hover:brightness-110 transition-all">Back home</Link>
      </div>
    </div>
  );
}
