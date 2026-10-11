import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, Plus, Users, MessageSquare, DollarSign, Bell } from 'lucide-react';

export default async function ZillowPropertiesPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?redirect_url=/dashboard/landlord/properties');
  if (user.role !== 'landlord') redirect('/dashboard');

  const navItems = [
    { label: 'Properties', icon: Building2, active: true },
    { label: 'Leads', icon: Users },
    { label: 'Messages', icon: MessageSquare },
    { label: 'Payments', icon: DollarSign },
    { label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        {/* Left Sidebar */}
        <aside className="w-64 h-screen border-r border-zinc-200 flex flex-col">
          <div className="p-4 border-b border-zinc-200">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg">Zillow Rentals</span>
            </div>
          </div>

          <nav className="flex-1 p-2">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <div
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      item.active
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                    {item.label === 'Properties' && (
                      <Plus className="h-4 w-4 ml-auto text-blue-600" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-sm">
                G
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">GoldenBirch Technolo...</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-zinc-900">Properties</h1>
              <Link href="/dashboard/landlord/listing/new">
                <Button className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add property
                </Button>
              </Link>
            </div>

            {/* Empty State */}
            <div className="flex flex-col items-center text-center py-12">
              {/* Illustration */}
              <div className="relative w-80 h-60 mb-8">
                <svg width="320" height="240" viewBox="0 0 320 240" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Sun */}
                  <circle cx="260" cy="70" r="45" fill="#FED7AA" />
                  {/* Building */}
                  <rect x="100" y="110" width="120" height="100" rx="4" fill="#F97316" />
                  <rect x="110" y="120" width="24" height="24" fill="white" rx="2" />
                  <rect x="142" y="120" width="24" height="24" fill="white" rx="2" />
                  <rect x="110" y="152" width="24" height="24" fill="white" rx="2" />
                  <rect x="142" y="152" width="24" height="24" fill="white" rx="2" />
                  <rect x="110" y="184" width="24" height="24" fill="white" rx="2" />
                  <rect x="142" y="184" width="24" height="24" fill="white" rx="2" />
                  {/* Awning */}
                  <rect x="100" y="100" width="120" height="12" fill="#3B82F6" rx="2" />
                  {/* Moving truck */}
                  <rect x="40" y="150" width="50" height="35" rx="4" fill="#2563EB" />
                  <rect x="45" y="135" width="40" height="20" fill="#2563EB" rx="3" />
                  <rect x="50" y="140" width="30" height="10" fill="white" rx="2" />
                  {/* Road */}
                  <rect x="0" y="210" width="320" height="8" fill="#E5E7EB" />
                </svg>
              </div>

              {/* Text */}
              <h2 className="text-2xl font-bold text-zinc-900 mb-2">
                Hi, GoldenBirch! Ready to add your property?
              </h2>
              <p className="text-zinc-600 max-w-md mb-1">
                Providing some basic information is the first step.
              </p>
              <p className="text-zinc-600 max-w-md mb-6">
                Once you find a renter for your listing, you can screen them, sign...
              </p>

              {/* Feature Box */}
              <div className="w-full max-w-md bg-white border border-zinc-200 rounded-lg p-6">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                    <path d="M11.5 2a9.5 9.5 0 0 1 9.5 9.5v5.5h-1v-5.5a8.5 8.5 0 0 0-17 0v5.5H5v-5.5A9.5 9.5 0 0 1 11.5 2z" />
                    <path d="M12 12v9" />
                    <path d="M9 16h6" />
                  </svg>
                </div>
                <h3 className="font-semibold text-zinc-900 mb-3">Our all-in-one solution saves time</h3>
                <ul className="text-left space-y-2 text-sm text-zinc-600">
                  <li>• List your property for rent</li>
                  <li>• Receive applications</li>
                  <li>• Screen tenants</li>
                  <li>• Message renters</li>
                  <li>• Create and sign leases</li>
                  <li>• Receive rent payments</li>
                </ul>
                <Link href="#" className="text-blue-600 text-sm font-medium mt-4 block text-center">
                  Learn more
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
