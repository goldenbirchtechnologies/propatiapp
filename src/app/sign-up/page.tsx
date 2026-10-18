'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, ArrowRight, CheckCircle, Eye, EyeOff } from 'lucide-react';

const ROLES = [
  {
    id: 'landlord',
    title: 'Landlord',
    description: 'Manage your properties, tenants, and rental income',
    icon: '🏠',
  },
  {
    id: 'tenant',
    title: 'Tenant',
    description: 'Find verified properties and manage your leases',
    icon: '🔑',
  },
  {
    id: 'agent',
    title: 'Agent',
    description: 'List properties, manage clients, and close deals',
    icon: '💼',
  },
  {
    id: 'estate_manager',
    title: 'Estate Manager',
    description: 'Oversee estate operations and coordinate services',
    icon: '🏢',
  },
];

export default function SignUpPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  });

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  const handleNext = () => {
    if (!selectedRole) {
      setError('Please select a role to continue');
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      setError('Please agree to the terms and conditions');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Registration failed');
      }

      router.push('/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#09090b]">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/3 xl:w-1/4 bg-gradient-to-b from-[#0a1628] to-[#09090b] flex-col justify-between p-8 xl:p-12 border-r border-white/[0.07]">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Propati<span className="text-[#10b981]">Box</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Create your account</p>
        </div>

        <div className="space-y-6">
          {/* Step indicators */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= 1 ? 'bg-[#10b981] text-white' : 'bg-[#18181b] text-zinc-500'
                }`}
              >
                {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
              </div>
              <span className={`text-sm ${step >= 1 ? 'text-white' : 'text-zinc-500'}`}>
                Role Selection
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= 2 ? 'bg-[#10b981] text-white' : 'bg-[#18181b] text-zinc-500'
                }`}
              >
                {step > 2 ? <CheckCircle className="w-4 h-4" /> : '2'}
              </div>
              <span className={`text-sm ${step >= 2 ? 'text-white' : 'text-zinc-500'}`}>
                Account Details
              </span>
            </div>
          </div>

          {/* Selected role preview */}
          {selectedRole && (
            <div className="p-4 rounded-xl bg-[#18181b] border border-white/[0.07]">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Your role</p>
              <p className="text-white font-medium">
                {ROLES.find((r) => r.id === selectedRole)?.icon}{' '}
                {ROLES.find((r) => r.id === selectedRole)?.title}
              </p>
            </div>
          )}
        </div>

        <div className="text-zinc-600 text-xs">
          <p>By creating an account, you agree to our</p>
          <p>
            <a href="/terms" className="text-[#10b981] hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="text-[#10b981] hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* Right Panel - Form Content */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12">
        <div className="w-full max-w-lg mx-auto">
          {/* Mobile step indicator */}
          <div className="lg:hidden flex items-center justify-center gap-4 mb-8">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 1 ? 'bg-[#10b981] text-white' : 'bg-[#18181b] text-zinc-500'
              }`}
            >
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
            </div>
            <div className="w-12 h-px bg-white/[0.07]" />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= 2 ? 'bg-[#10b981] text-white' : 'bg-[#18181b] text-zinc-500'
              }`}
            >
              2
            </div>
          </div>

          {/* Step 1: Role Selection */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose your role</h2>
              <p className="text-zinc-500 mb-8">Select the option that best describes you</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`p-5 rounded-xl border text-left transition-all ${
                      selectedRole === role.id
                        ? 'border-[#10b981] bg-[#10b981]/10 ring-1 ring-[#10b981]/50'
                        : 'border-white/[0.07] bg-[#18181b] hover:border-white/[0.14] hover:bg-[#27272a]'
                    }`}
                  >
                    <span className="text-2xl mb-3 block">{role.icon}</span>
                    <h3 className="text-white font-medium mb-1">{role.title}</h3>
                    <p className="text-zinc-500 text-xs leading-relaxed">{role.description}</p>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#10b981] hover:bg-[#006c49] text-white font-medium transition-colors"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Account Credentials */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
              <p className="text-zinc-500 mb-8">Fill in your details to get started</p>

              {/* Social Login */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-[#18181b] text-white hover:bg-[#27272a] transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-zinc-500 text-xs uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-zinc-400 mb-2">
                      First name
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      placeholder="John"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-zinc-400 mb-2">
                      Last name
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      placeholder="Doe"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-email" className="block text-sm font-medium text-zinc-400 mb-2">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                    <input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="signup-password" className="block text-sm font-medium text-zinc-400 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-400 mb-2">
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirm your password"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
                  />
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer pt-2">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-white/[0.07] bg-[#18181b] text-[#10b981] focus:ring-[#10b981]/50"
                  />
                  <span className="text-sm text-zinc-400">
                    I agree to the{' '}
                    <a href="/terms" className="text-[#10b981] hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-[#10b981] hover:underline">
                      Privacy Policy
                    </a>
                  </span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/[0.07] bg-[#18181b] text-white hover:bg-[#27272a] transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#10b981] hover:bg-[#006c49] text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sign In Link */}
          <p className="mt-8 text-center text-sm text-zinc-500">
            Already have an account?{' '}
            <a href="/sign-in" className="text-[#10b981] hover:text-[#006c49] font-medium transition-colors">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
