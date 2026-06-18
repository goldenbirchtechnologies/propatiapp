import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';

export default async function OnboardingPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getCurrentUserWithProfile();

  if (!user) {
    redirect('/sign-in');
  }

  // If user already has completed profile, redirect to dashboard
  if (user.profileCompleted) {
    const dashboardPaths: Record<string, string> = {
      ADMIN: '/admin',
      AGENT: '/dashboard/agent',
      ESTATE_MANAGER: '/estate-manager',
      LANDLORD: '/dashboard/landlord',
      TENANT: '/dashboard/tenant',
    };
    redirect(dashboardPaths[user.role] || '/dashboard/tenant');
  }

  return (
    <OnboardingFlow user={user} />
  );
}

function OnboardingFlow({ user }: { user: any }) {
  const roleLabels: Record<string, string> = {
    LANDLORD: 'Landlord',
    TENANT: 'Tenant',
    AGENT: 'Agent',
    ADMIN: 'Admin',
    ESTATE_MANAGER: 'Estate Manager',
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-2xl">
        <div className="card p-8">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[
                { label: 'Role', completed: true },
                { label: 'Profile', completed: false },
                { label: 'Verification', completed: false },
                { label: 'Complete', completed: false },
              ].map((step, i) => (
                <div key={step.label} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 ${i === 1 ? 'bg-[var(--accent)] text-white' : 'bg-[var(--border)] text-[var(--muted)]'}`}>
                    {i + 1}
                  </div>
                  <span className="text-xs text-center" style={{ color: i <= 1 ? 'var(--text)' : 'var(--muted)' }}>{step.label}</span>
                </div>
              ))}
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full w-1/3 rounded-full transition-all" style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent2))' }} />
            </div>
          </div>

          <h1 className="font-heading font-bold text-2xl mb-2 text-center" style={{ color: 'var(--text)' }}>
            Complete Your Profile
          </h1>
          <p className="text-center mb-8" style={{ color: 'var(--muted)' }}>
            Help us personalize your experience as a {roleLabels[user.role] || 'user'}
          </p>

          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="inp-label">First Name</label>
                <input type="text" className="inp-field" defaultValue={user.fullName.split(' ')[0]} required />
              </div>
              <div>
                <label className="inp-label">Last Name</label>
                <input type="text" className="inp-field" defaultValue={user.fullName.split(' ').slice(1).join(' ')} required />
              </div>
            </div>

            <div>
              <label className="inp-label">Phone Number</label>
              <input type="tel" className="inp-field" placeholder="+234 800 000 0000" />
            </div>

            {user.role === 'tenant' && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Tenant Preferences</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="inp-label">Employment Status</label>
                    <select className="inp-field">
                      <option value="">Select...</option>
                      <option value="EMPLOYED">Employed</option>
                      <option value="SELF_EMPLOYED">Self Employed</option>
                      <option value="BUSINESS_OWNER">Business Owner</option>
                      <option value="STUDENT">Student</option>
                      <option value="RETIRED">Retired</option>
                      <option value="UNEMPLOYED">Unemployed</option>
                    </select>
                  </div>
                  <div>
                    <label className="inp-label">Employment Type</label>
                    <select className="inp-field">
                      <option value="">Select...</option>
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="CONTRACT">Contract</option>
                      <option value="FREELANCE">Freelance</option>
                      <option value="INTERNSHIP">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="inp-label">Employer Name</label>
                    <input type="text" className="inp-field" placeholder="Company name" />
                  </div>
                  <div>
                    <label className="inp-label">Job Title</label>
                    <input type="text" className="inp-field" placeholder="Your position" />
                  </div>
                  <div>
                    <label className="inp-label">Yearly Income (₦)</label>
                    <input type="number" className="inp-field" placeholder="e.g., 3000000" />
                  </div>
                </div>
              </div>
            )}

            {user.role === 'landlord' && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Landlord Information</h3>
                <div>
                  <label className="inp-label">Company Name (Optional)</label>
                  <input type="text" className="inp-field" placeholder="Your property company name" />
                </div>
                <div>
                  <label className="inp-label">Bio</label>
                  <textarea className="inp-field" rows={3} placeholder="Tell us about your property portfolio..." />
                </div>
              </div>
            )}

            {user.role === 'agent' && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Agent Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="inp-label">Agent Bio</label>
                    <textarea className="inp-field" rows={3} placeholder="Your experience and specialties..." />
                  </div>
                  <div>
                    <label className="inp-label">Service Areas (comma separated)</label>
                    <input type="text" className="inp-field" placeholder="Lekki, Victoria Island, Ikeja" />
                  </div>
                </div>
              </div>
            )}

            {user.role === 'estate_manager' && (
              <div className="space-y-4">
                <h3 className="font-heading font-bold" style={{ color: 'var(--text)' }}>Organization Setup</h3>
                <p className="text-sm" style={{ color: 'var(--muted)' }}>You'll create your organization after completing your profile.</p>
                <div>
                  <label className="inp-label">Professional Bio</label>
                  <textarea className="inp-field" rows={3} placeholder="Your experience in property management..." />
                </div>
              </div>
            )}

            <div className="pt-4">
              <button type="submit" className="btn btn-primary w-full text-lg py-4" style={{ fontSize: '1rem' }}>
                Save & Continue to Verification
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}