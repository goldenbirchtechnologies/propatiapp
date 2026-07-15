'use client';

import { DashboardShell } from '@/components/layout/DashboardShell';
import { ADMIN_NAVIGATION } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';

export default function VerificationOfficerRolePage() {
  const { user } = useUser();

  return (
    <DashboardShell
      navigation={ADMIN_NAVIGATION}
      userRole="admin"
      userName={(user?.fullName as string | undefined) || (user?.firstName as string) || 'Admin'}
      userAvatar={user?.imageUrl}
    >
      {/* Ported from role_permissions_verification_officer_propati_admin.html */}

      {/* Scrollable Content Canvas */}
      <div className="flex-1 overflow-y-auto p-lg space-y-lg">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-xs text-on-surface-variant mb-md">
          <a className="hover:text-primary transition-colors" href="#">User Management</a>
          <MaterialIcon name="chevron_right" className="material-symbols-outlined" />
          <a className="hover:text-primary transition-colors" href="#">Roles</a>
          <MaterialIcon name="chevron_right" className="material-symbols-outlined" />
          <span className="text-primary font-bold">Verification Officer</span>
        </nav>

        {/* Role Header Section */}
        <section className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-lg">
          <div className="space-y-sm">
            <div className="flex items-center gap-md">
              <h2 className="font-headline-lg text-headline-lg text-primary">Verification Officer</h2>
              <span className="px-3 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-md text-xs rounded-full border border-tertiary">SYSTEM_ROLE</span>
            </div>
            <p className="text-on-surface-variant max-w-2xl">
              Responsible for reviewing property ownership documents, conducting KYC on sellers, and approving property listings for the public marketplace.
            </p>
            <div className="flex items-center gap-xl mt-md">
              <div className="flex items-center gap-sm text-on-surface">
                <MaterialIcon name="group" className="material-symbols-outlined" />
                <span className="font-bold">14 Assigned Users</span>
              </div>
              <div className="flex items-center gap-sm text-on-surface">
                <MaterialIcon name="update" className="material-symbols-outlined" />
                <span className="text-sm opacity-70">Modified 2 days ago</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="px-lg py-2.5 border border-primary text-primary rounded-lg font-bold hover:bg-surface-container transition-all">Discard</button>
            <button className="px-xl py-2.5 bg-primary-container text-white rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all flex items-center gap-2">
              <MaterialIcon name="save" className="material-symbols-outlined" />
              Save Changes
            </button>
          </div>
        </section>

        {/* Main Layout Grid */}
        <div className="grid grid-cols-12 gap-lg">
          {/* Permission Matrix (Left Column) */}
          <div className="col-span-12 lg:col-span-8 space-y-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-md bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                <h3 className="font-headline-sm text-primary">Permission Matrix</h3>
                <button className="text-primary text-sm font-bold flex items-center gap-1">
                  <MaterialIcon name="select_all" className="material-symbols-outlined" />
                    <input className="flex-1 bg-surface border-outline-variant rounded-lg text-sm" type="time" defaultValue="18:00" />
                  </div>
                  <p className="text-[10px] text-on-surface-variant">Access will be blocked outside these hours.</p>
                </div>

                <hr className="border-outline-variant" />

                {/* Audit Logs Summary */}
                <div className="space-y-md">
                  <h4 className="font-label-md text-xs uppercase tracking-widest text-on-surface-variant">Recent Activity</h4>
                  <div className="space-y-sm">
                    <div className="flex items-center gap-sm">
                      <div className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></div>
                      <p className="text-xs font-bold">Policy Updated</p>
                      <span className="text-[10px] text-on-surface-variant ml-auto">12h ago</span>
                    </div>
                    <div className="flex items-center gap-sm">
                      <div className="w-2 h-2 rounded-full bg-primary-fixed-dim"></div>
                      <p className="text-xs font-bold">New User Added</p>
                      <span className="text-[10px] text-on-surface-variant ml-auto">Yesterday</span>
                    </div>
                  </div>
                  <button className="w-full text-center text-xs font-bold text-primary hover:underline">View Role Audit Logs</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAB for Quick Actions */}
      <button className="fixed bottom-lg right-lg w-14 h-14 bg-secondary-container text-on-secondary-container rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <MaterialIcon name="history" className="material-symbols-outlined" />
      </button>
    </DashboardShell>
  );
}
