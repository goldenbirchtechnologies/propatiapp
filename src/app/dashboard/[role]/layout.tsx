// src/app/dashboard/[role]/layout.tsx
import { ReactNode } from 'react';
import Link from 'next/link';

export default function RoleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-residential-teal to-residential-teal-fixed text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Propati Dashboard</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard/admin" className="hover:underline">Admin</Link>
            <Link href="/dashboard/agent" className="hover:underline">Agent</Link>
            <Link href="/dashboard/landlord" className="hover:underline">Landlord</Link>
            <Link href="/dashboard/tenant" className="hover:underline">Tenant</Link>
            <Link href="/dashboard/estate-manager" className="hover:underline">Estate Manager</Link>
            <Link href="/dashboard/realtor" className="hover:underline">Realtor</Link>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
