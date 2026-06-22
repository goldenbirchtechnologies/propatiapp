'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Search,
  Handshake,
  Building,
  CheckCircle2,
  ArrowRight,
  Loader2,
} from 'lucide-react';

type Role = 'landlord' | 'tenant' | 'agent' | 'estate_manager' | 'realtor';

interface Props {
  userId: string;
  initialRole: string;
  initialName: string;
}

const roleOptions: {
  id: Role;
  label: string;
  subtitle: string;
  Icon: React.ElementType;
}[] = [
  { id: 'landlord', label: 'Landlord', subtitle: 'I own properties', Icon: Building2 },
  { id: 'tenant', label: 'Tenant', subtitle: "I'm looking for a home", Icon: Search },
  { id: 'agent', label: 'Agent', subtitle: 'I help people find homes', Icon: Handshake },
  { id: 'estate_manager', label: 'Estate Manager', subtitle: 'I manage property portfolios', Icon: Building },
  { id: 'realtor', label: 'Realtor', subtitle: 'I buy and sell properties', Icon: Handshake },
];

const roleDashboard: Record<Role, string> = {
  landlord: '/dashboard/landlord',
  tenant: '/dashboard/tenant',
  agent: '/dashboard/agent',
  estate_manager: '/dashboard/estate-manager',
  realtor: '/dashboard/realtor',
};

const roleNextStep: Record<Role, { label: string; href: string }> = {
  landlord: { label: 'Add your first property', href: '/dashboard/landlord/properties/new' },
  tenant: { label: 'Start searching', href: '/dashboard/tenant/search' },
  agent: { label: 'View your pipeline', href: '/dashboard/agent' },
  estate_manager: { label: 'Set up your portfolio', href: '/dashboard/estate-manager' },
  realtor: { label: 'Go to your dashboard', href: '/dashboard/realtor' },
};

const stepLabels = ['Role', 'Profile', 'Done'];

export default function OnboardingClient({ initialRole, initialName }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedRole, setSelectedRole] = useState<Role>((initialRole as Role) ?? 'tenant');

  const nameParts = initialName?.split(' ') ?? [];
  const [firstName, setFirstName] = useState(nameParts[0] ?? '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') ?? '');
  const [phone, setPhone] = useState('');

  const [bio, setBio] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [serviceAreas, setServiceAreas] = useState('');
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [employmentType, setEmploymentType] = useState('');
  const [employerName, setEmployerName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [yearlyIncome, setYearlyIncome] = useState('');

  useEffect(() => {
    const pending = sessionStorage.getItem('propati_pending_role');
    if (pending && roleOptions.some((r) => r.id === pending)) {
      setSelectedRole(pending as Role);
    }
    sessionStorage.removeItem('propati_pending_role');
  }, []);

  async function patchProfile(body: Record<string, unknown>) {
    const res = await fetch('/api/users/me/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error ?? 'Failed to save. Please try again.');
    }
    return res.json();
  }

  async function handleRoleConfirm() {
    setError('');
    setLoading(true);
    try {
      if (!selectedRole) {
        throw new Error('Please select a role.');
      }
      await patchProfile({ role: selectedRole });
      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleProfileSave() {
    setError('');
    if (!firstName.trim()) {
      setError('First name is required.');
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, unknown> = {
        fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
        phone: phone || undefined,
        profileCompleted: true,
      };

      if (selectedRole === 'landlord') {
        body.profileBio = bio || undefined;
        body.companyName = companyName || undefined;
      }
      if (selectedRole === 'tenant') {
        body.employmentStatus = employmentStatus || undefined;
        body.employmentType = employmentType || undefined;
        body.employerName = employerName || undefined;
        body.jobTitle = jobTitle || undefined;
        body.yearlyIncome = yearlyIncome ? parseInt(yearlyIncome, 10) : undefined;
      }
      if (selectedRole === 'agent') {
        body.agentBio = bio || undefined;
        body.agentAreas = serviceAreas
          ? serviceAreas.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined;
      }
      if (selectedRole === 'estate_manager') {
        body.profileBio = bio || undefined;
      }

      await patchProfile(body);
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const progressPercent = ((step - 1) / (stepLabels.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <span className="text-2xl font-bold tracking-tight text-primary">PROPATI</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {step === 1 && 'Confirm your role'}
            {step === 2 && 'Complete your profile'}
            {step === 3 && "You're all set!"}
          </h1>
        </div>

        <div className="bg-card border border-border rounded-2xl shadow-sm p-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {stepLabels.map((label, i) => {
                const num = i + 1;
                const isActive = num === step;
                const isDone = num < step;
                return (
                  <div key={label} className="flex flex-col items-center gap-1">
                    <div
                      className={[
                        'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                        isDone
                          ? 'bg-primary text-primary-foreground'
                          : isActive
                          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
                          : 'bg-muted text-muted-foreground',
                      ].join(' ')}
                    >
                      {isDone ? <CheckCircle2 size={16} /> : num}
                    </div>
                    <span
                      className={[
                        'text-xs font-medium',
                        isActive ? 'text-primary' : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="relative h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {step === 1 && (
            <StepRole
              selectedRole={selectedRole}
              onSelect={setSelectedRole}
              onConfirm={handleRoleConfirm}
              loading={loading}
            />
          )}

          {step === 2 && (
            <StepProfile
              role={selectedRole}
              firstName={firstName}
              lastName={lastName}
              phone={phone}
              bio={bio}
              companyName={companyName}
              serviceAreas={serviceAreas}
              employmentStatus={employmentStatus}
              employmentType={employmentType}
              employerName={employerName}
              jobTitle={jobTitle}
              yearlyIncome={yearlyIncome}
              onChange={{
                firstName: setFirstName,
                lastName: setLastName,
                phone: setPhone,
                bio: setBio,
                companyName: setCompanyName,
                serviceAreas: setServiceAreas,
                employmentStatus: setEmploymentStatus,
                employmentType: setEmploymentType,
                employerName: setEmployerName,
                jobTitle: setJobTitle,
                yearlyIncome: setYearlyIncome,
              }}
              onSave={handleProfileSave}
              loading={loading}
            />
          )}

          {step === 3 && (
            <StepDone role={selectedRole} router={router} />
          )}
        </div>
      </div>
    </div>
  );
}

function StepRole({
  selectedRole,
  onSelect,
  onConfirm,
  loading,
}: {
  selectedRole: Role;
  onSelect: (r: Role) => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm text-center">
        This determines your dashboard and the features you see.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roleOptions.map(({ id, label, subtitle, Icon }) => {
          const isSelected = selectedRole === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelect(id)}
              className={[
                'relative flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 text-center transition-all duration-200',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:border-primary/40',
              ].join(' ')}
            >
              {isSelected && (
                <CheckCircle2 size={15} className="absolute top-2.5 right-2.5 text-primary" />
              )}
              <div
                className={[
                  'flex h-12 w-12 items-center justify-center rounded-lg',
                  isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                ].join(' ')}
              >
                <Icon size={24} />
              </div>
              <div>
                <p className={['text-xs font-semibold', isSelected ? 'text-primary' : 'text-foreground'].join(' ')}>
                  {label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? 'Saving...' : 'This is my role'}
      </button>
    </div>
  );
}

interface ProfileChangeHandlers {
  firstName: (v: string) => void;
  lastName: (v: string) => void;
  phone: (v: string) => void;
  bio: (v: string) => void;
  companyName: (v: string) => void;
  serviceAreas: (v: string) => void;
  employmentStatus: (v: string) => void;
  employmentType: (v: string) => void;
  employerName: (v: string) => void;
  jobTitle: (v: string) => void;
  yearlyIncome: (v: string) => void;
}

function StepProfile({
  role,
  firstName,
  lastName,
  phone,
  bio,
  companyName,
  serviceAreas,
  employmentStatus,
  employmentType,
  employerName,
  jobTitle,
  yearlyIncome,
  onChange,
  onSave,
  loading,
}: {
  role: Role;
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  companyName: string;
  serviceAreas: string;
  employmentStatus: string;
  employmentType: string;
  employerName: string;
  jobTitle: string;
  yearlyIncome: string;
  onChange: ProfileChangeHandlers;
  onSave: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="First Name" required>
          <input
            type="text"
            value={firstName}
            onChange={(e) => onChange.firstName(e.target.value)}
            placeholder="Ada"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
        <Field label="Last Name">
          <input
            type="text"
            value={lastName}
            onChange={(e) => onChange.lastName(e.target.value)}
            placeholder="Okonkwo"
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </Field>
      </div>

      <Field label="Phone Number">
        <input
          type="tel"
          value={phone}
          onChange={(e) => onChange.phone(e.target.value)}
          placeholder="+234 800 000 0000"
          className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </Field>

      {role === 'landlord' && (
        <>
          <Field label="Company Name" hint="Optional">
            <input
              type="text"
              value={companyName}
              onChange={(e) => onChange.companyName(e.target.value)}
              placeholder="Your property company"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={bio}
              onChange={(e) => onChange.bio(e.target.value)}
              placeholder="Tell us about your property portfolio..."
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </Field>
        </>
      )}

      {role === 'tenant' && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Employment Status">
              <select
                value={employmentStatus}
                onChange={(e) => onChange.employmentStatus(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select...</option>
                <option value="employed">Employed</option>
                <option value="self_employed">Self Employed</option>
                <option value="business_owner">Business Owner</option>
                <option value="student">Student</option>
                <option value="retired">Retired</option>
                <option value="unemployed">Unemployed</option>
              </select>
            </Field>
            <Field label="Employment Type">
              <select
                value={employmentType}
                onChange={(e) => onChange.employmentType(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select...</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </Field>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Employer Name">
              <input
                type="text"
                value={employerName}
                onChange={(e) => onChange.employerName(e.target.value)}
                placeholder="Company name"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
            <Field label="Job Title">
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => onChange.jobTitle(e.target.value)}
                placeholder="Your position"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </Field>
          </div>
          <Field label="Yearly Income (₦)">
            <input
              type="number"
              value={yearlyIncome}
              onChange={(e) => onChange.yearlyIncome(e.target.value)}
              placeholder="e.g. 3000000"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </>
      )}

      {role === 'agent' && (
        <>
          <Field label="Agent Bio">
            <textarea
              value={bio}
              onChange={(e) => onChange.bio(e.target.value)}
              placeholder="Your experience and specialties..."
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </Field>
          <Field label="Service Areas" hint="Comma separated">
            <input
              type="text"
              value={serviceAreas}
              onChange={(e) => onChange.serviceAreas(e.target.value)}
              placeholder="Lekki, Victoria Island, Ikeja"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </>
      )}

      {role === 'estate_manager' && (
        <Field label="Professional Bio">
          <textarea
            value={bio}
            onChange={(e) => onChange.bio(e.target.value)}
            placeholder="Your experience in property management..."
            rows={3}
            className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </Field>
      )}
      {role === 'realtor' && (
        <>
          <Field label="Bio">
            <textarea
              value={bio}
              onChange={(e) => onChange.bio(e.target.value)}
              placeholder="Tell us about your real estate experience..."
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </Field>
          <Field label="Service Areas" hint="Comma separated">
            <input
              type="text"
              value={serviceAreas}
              onChange={(e) => onChange.serviceAreas(e.target.value)}
              placeholder="Lekki, Victoria Island, Ikeja"
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </Field>
        </>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? 'Saving...' : 'Save & Continue'}
      </button>
    </div>
  );
}

function StepDone({ role, router }: { role: Role; router: any }) {
  const next = roleNextStep[role];
  const dashboard = roleDashboard[role];

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <CheckCircle2 size={40} className="text-primary" />
        </div>
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">Welcome to PROPATI!</h2>
        <p className="text-muted-foreground text-sm">
          Your profile is complete. You&apos;re ready to get started.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => router.push(next.href)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground py-3.5 text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          {next.label}
          <ArrowRight size={16} />
        </button>
        <Link
          href={dashboard}
          className="w-full flex items-center justify-center rounded-xl border border-border bg-background text-foreground py-3.5 text-sm font-medium hover:bg-muted transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-foreground">
        {label}
        {hint && <span className="text-xs text-muted-foreground font-normal">({hint})</span>}
        {required && <span className="text-destructive text-xs">*</span>}
      </label>
      {children}
    </div>
  );
}
