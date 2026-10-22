import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Move-In Coordination – Landlord',
  description: 'Coordinate commercial move-in appointments.',
};

export default async function CommercialMoveInPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'landlord') redirect('/dashboard');

  const recentBookings = await prisma.booking.findMany({
    where: {
      listing: { ownerId: user.id, listingType: 'commercial' },
    },
    include: {
      guest: { select: { fullName: true } },
      listing: { select: { title: true, address: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName={user.fullName} userAvatar={user.avatarUrl || undefined}>
      <ErrorBoundary>
        <div className="max-w-7xl mx-auto py-10 space-y-8">
          <section className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-br from-[#000f22] to-[#0a2540] p-12 text-white">
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-[#feae2c]/20 text-[#feae2c] px-4 py-1 rounded-full border border-[#feae2c]/30 mb-4">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <span className="text-xs font-bold uppercase tracking-widest">Handover Ready</span>
              </div>
              <h2 className="text-4xl font-extrabold mb-4">Welcome to your new HQ</h2>
              <p className="text-lg text-[#768dad] max-w-lg mb-6">
                {recentBookings.length > 0
                  ? `Congratulations on securing your premium commercial space at ${recentBookings[0].listing.title}. Everything is ready for your official move-in.`
                  : 'No commercial move-ins scheduled yet. New bookings will appear here.'}
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-[#feae2c] text-[#000f22] rounded-lg font-bold hover:scale-105 transition-transform">View Digital Key</button>
                <button className="px-6 py-3 border border-[#768dad] text-white rounded-lg font-bold hover:bg-[#768dad]/10 transition-colors">Download Welcome Pack</button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4 bg-white border border-zinc-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-xl font-bold text-[#000f22]">Payment Status</h3>
                </div>
                <div className="bg-[#002a1b] text-[#71fbc0] p-4 rounded-lg mb-6 border-l-4 border-[#009e6f]">
                  <p className="text-xs mb-1 opacity-70 uppercase">Escrow Clearance</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold">—</p>
                    <span className="bg-[#009e6f] text-white px-2 py-0.5 rounded text-[10px] font-bold">CLEARED</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Security Deposit</span>
                  <span className="font-bold text-[#000f22]">Verified</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Service Charge (Yr 1)</span>
                  <span className="font-bold text-[#000f22]">Settled</span>
                </div>
                <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#009e6f] h-full w-full" />
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#000f22]">Key Handover Schedule</h3>
                <span className="text-sm font-medium text-[#835500] bg-[#ffddb4]/30 px-4 py-1 rounded-full">Coming Up: 48 Hours</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden group">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAjXPQuzYQ9BQgeKlkmI5qOSO4dH0sEJvHsFmmmAvf47fFbm2DKEfcuhJeEH7gWrv_GONzUR_XiyydtPOXTBeBsMjp6BG_8PpHJk4jUDY07-jJa5mN4GUSlEjnmuM9opvWiKtH-9ZrotpcSEhnjsh2X8d6BISU-EaAG3zrxweJeQjhu5DTkSory-aaNsOht9fAgDU6WGUw39qvT6mNw3u1nKk7YMPWLtFg_f5bbXTy_w47A9gU2AN0O" alt="Office lobby" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-xs">Collection Point</p>
                      <p className="font-bold">Main Lobby Concierge</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
                    <div className="p-2 bg-[#feae2c] text-[#000f22] rounded-full">
                      <span className="material-symbols-outlined">event</span>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase">Thursday, Oct 12th</p>
                      <p className="font-bold">10:00 AM — 11:30 AM</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="text-sm font-medium text-zinc-500 mb-2">Preparation Checklist</p>
                  {['Print Handover Protocol Form', 'Assign IT Representative for Biometric Access', 'Final Inventory Signature'].map((t, i) => (
                    <div key={t} className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${i < 2 ? 'border-[#feae2c] bg-[#feae2c]/10' : 'border-zinc-300'}`}>
                        {i < 2 && <span className="material-symbols-outlined text-xs text-[#000f22]">check</span>}
                      </div>
                      <span className={`text-[#000f22] ${i === 2 ? 'opacity-60' : ''}`}>{t}</span>
                    </div>
                  ))}
                  <button className="w-full mt-6 py-3 border-2 border-[#835500] text-[#835500] rounded-lg font-bold hover:bg-[#835500] hover:text-white transition-all">
                    Reschedule Appointment
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-7 bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-[#000f22] mb-6">Utility &amp; HVAC Onboarding</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl text-center hover:border-[#feae2c] transition-colors">
                  <span className="material-symbols-outlined text-4xl text-[#835500] mb-3 block">bolt</span>
                  <p className="font-bold mb-1">Electrical</p>
                  <span className="text-[#009e6f] text-xs font-bold">CONNECTED</span>
                </div>
                <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl text-center hover:border-[#feae2c] transition-colors">
                  <span className="material-symbols-outlined text-4xl text-[#835500] mb-3 block" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
                  <p className="font-bold mb-1">HVAC System</p>
                  <span className="text-[#835500] text-xs font-bold">TESTING REQUIRED</span>
                </div>
                <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl text-center hover:border-[#feae2c] transition-colors">
                  <span className="material-symbols-outlined text-4xl text-[#835500] mb-3 block">wifi</span>
                  <p className="font-bold mb-1">Fibre Optic</p>
                  <span className="text-[#009e6f] text-xs font-bold">READY</span>
                </div>
              </div>
              <div className="mt-6 p-4 bg-zinc-100 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-zinc-500">info</span>
                <p className="text-sm text-zinc-500">
                  Temperature controls can be managed via the PROPATI Smart Facility App starting from handover day.
                </p>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-5 bg-[#0a2540] text-[#768dad] p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-[#feae2c] mb-6">Facility Contacts</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#000f22]/40 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700" />
                    <div>
                      <p className="font-bold text-white">Chidi Okafor</p>
                      <p className="text-xs">Head of Facilities</p>
                    </div>
                  </div>
                  <button className="p-2 text-[#feae2c] hover:bg-[#feae2c] hover:text-[#000f22] rounded-full transition-colors">
                    <span className="material-symbols-outlined">call</span>
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-[#000f22]/40 rounded-lg border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700" />
                    <div>
                      <p className="font-bold text-white">Sarah Alabi</p>
                      <p className="text-xs">Security &amp; Access</p>
                    </div>
                  </div>
                  <button className="p-2 text-[#feae2c] hover:bg-[#feae2c] hover:text-[#000f22] rounded-full transition-colors">
                    <span className="material-symbols-outlined">chat</span>
                  </button>
                </div>
                <div className="pt-4 border-t border-white/10 flex flex-col gap-1">
                  <p className="text-xs uppercase opacity-60">24/7 Concierge Hotline</p>
                  <p className="text-xl font-bold text-[#feae2c]">0-800-PROPATI-SOS</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#000f22]">Your New Neighborhood</h3>
                <p className="text-sm text-zinc-500">Lagos Business District, Block 4, Suite 402</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-zinc-100 border border-zinc-200 rounded-full text-sm font-bold hover:bg-zinc-200 transition-colors">
                <span className="material-symbols-outlined text-[18px]">directions</span>
                Open in Maps
              </button>
            </div>
            <div className="h-80 w-full rounded-xl overflow-hidden bg-zinc-200 relative grayscale hover:grayscale-0 transition-all duration-700 cursor-crosshair">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbdxnzEfun54wZp5PXlniYVnxvvNvtF3Zqo5uH51l-Ohidk-BCzKTBbSP8xnT6TW5xDl3ZT2r6Yu2wnHigbg5fNSZ3pP0Rro7LK9K2i1H0J4QcOxA_5rUTKejzFo5Wv3pq4YxefQI6uB1_bKa-KIuNgXZzi098oGhtUsZMaRrDY0spL2r3o9cRMyG3yhSI5nElZHIV96blRycVB0mamPPAdZ7JVu_vO-L5ybhicYLG3TVOdrjiV4CQ" alt="Map" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <span className="material-symbols-outlined text-[#000f22] bg-[#feae2c] p-3 rounded-full shadow-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <div className="mt-3 bg-[#000f22] text-white px-4 py-1 rounded-lg shadow-xl border border-[#feae2c]/50">
                  <p className="text-xs font-bold">Suite 402</p>
                </div>
              </div>
            </div>
          </div>

          {recentBookings.length > 0 && (
            <div className="bg-white border border-zinc-200 p-6 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-[#000f22] mb-4">Upcoming Move-Ins</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-zinc-500 border-b">
                    <tr>
                      <th className="py-3 font-medium">Property</th>
                      <th className="py-3 font-medium">Tenant</th>
                      <th className="py-3 font-medium">Check-in</th>
                      <th className="py-3 font-medium">Check-out</th>
                      <th className="py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="border-b last:border-0">
                        <td className="py-3 font-medium">{b.listing.title}</td>
                        <td className="py-3">{b.guest.fullName}</td>
                        <td className="py-3">{String(b.checkIn)}</td>
                        <td className="py-3">{String(b.checkOut)}</td>
                        <td className="py-3">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200">
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </ErrorBoundary>
    </DashboardShell>
  );
}
