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
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <a className="hover:text-primary transition-colors" href="#">Roles</a>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
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
                <span className="material-symbols-outlined text-primary">group</span>
                <span className="font-bold">14 Assigned Users</span>
              </div>
              <div className="flex items-center gap-sm text-on-surface">
                <span className="material-symbols-outlined text-primary">update</span>
                <span className="text-sm opacity-70">Modified 2 days ago</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="px-lg py-2.5 border border-primary text-primary rounded-lg font-bold hover:bg-surface-container transition-all">Discard</button>
            <button className="px-xl py-2.5 bg-primary-container text-white rounded-lg font-bold hover:shadow-lg active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">save</span>
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
                  <span className="material-symbols-outlined text-sm">select_all</span> Select All
                </button>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-highest/30 text-on-surface-variant text-xs uppercase tracking-widest font-label-md">
                    <tr>
                      <th className="px-lg py-md border-b border-outline-variant">Module</th>
                      <th className="px-md py-md border-b border-outline-variant text-center">View</th>
                      <th className="px-md py-md border-b border-outline-variant text-center">Edit</th>
                      <th className="px-md py-md border-b border-outline-variant text-center">Delete</th>
                      <th className="px-md py-md border-b border-outline-variant text-center">Approve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {/* Row: Verification */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-lg">
                        <div className="flex items-center gap-md">
                          <div className="p-2 bg-secondary-fixed rounded-lg">
                            <span className="material-symbols-outlined text-on-secondary-fixed">verified_user</span>
                          </div>
                          <div>
                            <p className="font-bold text-primary">Verification</p>
                            <p className="text-xs text-on-surface-variant">KYC, Document Audit</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-lg text-center">
                        <input checked={true} className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input checked={true} className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input checked={true} className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                    </tr>

                    {/* Row: Listings */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-lg">
                        <div className="flex items-center gap-md">
                          <div className="p-2 bg-surface-container-high rounded-lg">
                            <span className="material-symbols-outlined text-primary">domain</span>
                          </div>
                          <div>
                            <p className="font-bold text-primary">Property Listings</p>
                            <p className="text-xs text-on-surface-variant">Inventory, Descriptions</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-lg text-center">
                        <input checked={true} className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input checked={true} className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                    </tr>

                    {/* Row: User Management */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-lg">
                        <div className="flex items-center gap-md">
                          <div className="p-2 bg-surface-container-high rounded-lg">
                            <span className="material-symbols-outlined text-primary">group</span>
                          </div>
                          <div>
                            <p className="font-bold text-primary">User Management</p>
                            <p className="text-xs text-on-surface-variant">Profile Data, Support Chats</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-lg text-center">
                        <input checked={true} className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                    </tr>

                    {/* Row: Financials */}
                    <tr className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="px-lg py-lg">
                        <div className="flex items-center gap-md">
                          <div className="p-2 bg-error-container rounded-lg">
                            <span className="material-symbols-outlined text-error">payments</span>
                          </div>
                          <div>
                            <p className="font-bold text-primary">Financials</p>
                            <p className="text-xs text-on-surface-variant">Escrow, Refunds, Payouts</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                      <td className="px-md py-lg text-center">
                        <input className="w-5 h-5 text-primary-container rounded-sm focus:ring-primary border-outline-variant" type="checkbox" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assigned Users Table */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="p-md bg-surface-container-low border-b border-outline-variant flex items-center justify-between">
                <h3 className="font-headline-sm text-primary">Assigned Users</h3>
                <button className="px-md py-1.5 bg-primary text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-primary-container transition-all">
                  <span className="material-symbols-outlined text-sm">person_add</span> Add User
                </button>
              </div>
              <div className="p-md">
                <div className="grid grid-cols-2 gap-md">
                  <div className="flex items-center justify-between p-sm border border-outline-variant rounded-lg">
                    <div className="flex items-center gap-sm">
                      <img
                        className="w-8 h-8 rounded-full"
                        data-alt="A detailed digital avatar of a young Nigerian male professional, clean-cut with a smart casual white shirt."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRPd5ThSfI1_3iYrdiyUnVhGxamOmr629yDTtQzURUrofM01TRNyUB8xAvxwHg1Dm3TFLUiNldlBrr1DO3Mpj0K0R014QZ-0NKD-6QaQkgAGNpwRNygFDYYnE35tfnFHQroa-K_RipXuTxElgOFlu7vjqtimDrZDoNtOkbpdazk7av9vqV4lbm0P03RHqpHVM5MMuKMP6u2cJ0N3myKsTq_A7n6BWbmsM8QAQA_ZDw7BCC6M9_DgRsr8cE49tS0CpAFnv0xYHojPg"
                      />
                      <div>
                        <p className="text-sm font-bold">Chidi Nwosu</p>
                        <p className="text-[10px] text-on-surface-variant">Lagos HQ</p>
                      </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-md">close</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-sm border border-outline-variant rounded-lg">
                    <div className="flex items-center gap-sm">
                      <img
                        className="w-8 h-8 rounded-full"
                        data-alt="A professional profile photo of a Nigerian female administrator, wearing glasses and a formal navy blazer."
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcmjvLLJqRVjpDcCshj9U2TvUkuqwqToOv6bZ7an91_0lvcj9M_--rogAi6xLGhSRMixXnDq5Bq-w_CyTAlwP1-jEuHo5TKZAx6ybO7Us5AAkZtyu9IWrixNT4fGrjNtodjwfb9yX7GYT4CWRh0jtm75yaJvgSzgPqew3ySRmZED_HbPU6EzTVMXsM64eJYjOD1Gt6djICrGfNLXRXnbKkWYH22283IFKu0T8fHlPztSg-CjwOeQEoHF6kvgeICjr6Y2caNa4dbZs"
                      />
                      <div>
                        <p className="text-sm font-bold">Fatima Yusuf</p>
                        <p className="text-[10px] text-on-surface-variant">Abuja Branch</p>
                      </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-md">close</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-sm border border-outline-variant rounded-lg">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-xs font-bold text-on-secondary-fixed">BE</div>
                      <div>
                        <p className="text-sm font-bold">Babatunde E.</p>
                        <p className="text-[10px] text-on-surface-variant">Remote Ops</p>
                      </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-md">close</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-sm border border-outline-variant rounded-lg">
                    <div className="flex items-center gap-sm">
                      <div className="w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-xs font-bold text-on-primary-fixed">OA</div>
                      <div>
                        <p className="text-sm font-bold">Olumide A.</p>
                        <p className="text-[10px] text-on-surface-variant">Remote Ops</p>
                      </div>
                    </div>
                    <button className="text-on-surface-variant hover:text-error transition-colors">
                      <span className="material-symbols-outlined text-md">close</span>
                    </button>
                  </div>
                </div>
                <button className="w-full mt-md py-2 text-primary font-bold text-sm border border-dashed border-outline-variant rounded-lg hover:bg-surface-container-low transition-colors">
                  View all 14 users
                </button>
              </div>
            </div>
          </div>

          {/* Security Policy (Right Column) */}
          <div className="col-span-12 lg:col-span-4 space-y-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden sticky top-lg">
              <div className="p-md bg-surface-container-low border-b border-outline-variant">
                <h3 className="font-headline-sm text-primary">Security Policy</h3>
              </div>
              <div className="p-lg space-y-xl">
                {/* Toggle: 2FA */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-primary">Requires 2FA</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Users with this role must authenticate via TOTP or SMS to access the dashboard.
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input checked={true} className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface-container-lowest after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </div>
                </div>

                {/* Toggle: IP Restricted */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-bold text-primary">IP Restricted Access</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">
                      Limit access to approved office IP addresses only.
                    </p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input className="sr-only peer" type="checkbox" />
                    <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-surface-container-lowest after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
                  </div>
                </div>

                {/* Field: Session Timeout */}
                <div className="space-y-2">
                  <label className="font-bold text-sm text-primary">Session Timeout (minutes)</label>
                  <select className="w-full bg-surface border-outline-variant rounded-lg text-sm focus:ring-primary focus:border-primary">
                    <option>15 Minutes</option>
                    <option selected={true}>30 Minutes</option>
                    <option>60 Minutes</option>
                    <option>No timeout</option>
                  </select>
                  <p className="text-[10px] text-on-surface-variant">Recommended: 30 mins for high-security roles.</p>
                </div>

                {/* Field: Allowed Login Window */}
                <div className="space-y-2">
                  <label className="font-bold text-sm text-primary">Login Window (WAT)</label>
                  <div className="flex items-center gap-sm">
                    <input className="flex-1 bg-surface border-outline-variant rounded-lg text-sm" type="time" defaultValue="08:00" />
                    <span className="text-xs">to</span>
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
        <span className="material-symbols-outlined font-bold">history</span>
      </button>
    </DashboardShell>
  );
}
