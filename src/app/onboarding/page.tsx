'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Home, User, CheckCircle, ArrowRight, ArrowLeft,
  Camera, Phone, FileText, Loader2, PartyPopper
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Welcome', icon: Home },
  { id: 2, title: 'Profile Setup', icon: User },
  { id: 3, title: 'Complete', icon: CheckCircle },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const [formData, setFormData] = useState({
    phone: '',
    bio: '',
    avatar: null as File | null,
    organizationName: '',
    organizationType: 'individual',
  });

  const handleNext = () => {
    setError(null);
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    // Simulate API progress
    setProgress(20);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setProgress(50);

    try {
      const formDataPayload = new FormData();
      formDataPayload.append('phone', formData.phone);
      formDataPayload.append('bio', formData.bio);
      formDataPayload.append('organizationName', formData.organizationName);
      formDataPayload.append('organizationType', formData.organizationType);
      if (formData.avatar) {
        formDataPayload.append('avatar', formData.avatar);
      }

      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        body: formDataPayload,
      });

      setProgress(80);

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Onboarding failed');
      }

      setProgress(100);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete onboarding. Please try again.');
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, avatar: e.target.files[0] });
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Header */}
      <header className="border-b border-white/[0.07] px-6 sm:px-12 py-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">
            Propati<span className="text-[#10b981]">Box</span>
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-zinc-500 text-sm">Step {step} of 3</span>
            <div className="w-24 h-1.5 rounded-full bg-[#18181b] overflow-hidden">
              <div
                className="h-full bg-[#10b981] transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicators */}
      <div className="px-6 sm:px-12 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between">
            {STEPS.map((s, index) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;

              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-[#10b981] text-white'
                          : isActive
                          ? 'bg-[#10b981]/20 text-[#10b981] ring-2 ring-[#10b981]'
                          : 'bg-[#18181b] text-zinc-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isActive ? 'text-[#10b981]' : isCompleted ? 'text-white' : 'text-zinc-500'
                      }`}
                    >
                      {s.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 mt-[-20px] ${
                        step > s.id ? 'bg-[#10b981]' : 'bg-white/[0.07]'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-6 sm:px-12 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-6">
                <PartyPopper className="w-10 h-10 text-[#10b981]" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Welcome to PropatiBox!</h2>
              <p className="text-zinc-400 max-w-md mx-auto mb-8">
                We&apos;re excited to have you on board. Let&apos;s get your profile set up so you can start
                managing properties with confidence.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="p-5 rounded-xl bg-[#18181b] border border-white/[0.07]">
                  <CheckCircle className="w-6 h-6 text-[#10b981] mb-3 mx-auto" />
                  <h3 className="text-white text-sm font-medium mb-1">Verified Listings</h3>
                  <p className="text-zinc-500 text-xs">All properties are verified for authenticity</p>
                </div>
                <div className="p-5 rounded-xl bg-[#18181b] border border-white/[0.07]">
                  <Phone className="w-6 h-6 text-[#10b981] mb-3 mx-auto" />
                  <h3 className="text-white text-sm font-medium mb-1">Secure Communication</h3>
                  <p className="text-zinc-500 text-xs">Built-in messaging and notifications</p>
                </div>
                <div className="p-5 rounded-xl bg-[#18181b] border border-white/[0.07]">
                  <FileText className="w-6 h-6 text-[#10b981] mb-3 mx-auto" />
                  <h3 className="text-white text-sm font-medium mb-1">Digital Agreements</h3>
                  <p className="text-zinc-500 text-xs">Sign and manage leases electronically</p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md mx-auto">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#006c49] text-white font-medium transition-colors"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Profile Setup */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Set up your profile</h2>
              <p className="text-zinc-500 mb-8">Add some details to personalize your experience</p>

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-full bg-[#18181b] border border-white/[0.07] flex items-center justify-center overflow-hidden">
                    {formData.avatar ? (
                      <img
                        src={URL.createObjectURL(formData.avatar)}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-zinc-500" />
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#18181b] border border-white/[0.07] text-white text-sm cursor-pointer hover:bg-[#27272a] transition-colors">
                      <Camera className="w-4 h-4" />
                      Upload Photo
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                    <p className="text-zinc-600 text-xs mt-2">JPG or PNG, max 2MB</p>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-zinc-400 mb-2">
                    Phone number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500" />
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+234 800 000 0000"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
                    />
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-zinc-400 mb-2">
                    Short bio
                  </label>
                  <textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors resize-none"
                  />
                </div>

                {/* Organization Name */}
                <div>
                  <label htmlFor="orgName" className="block text-sm font-medium text-zinc-400 mb-2">
                    Organization name <span className="text-zinc-600">(optional)</span>
                  </label>
                  <input
                    id="orgName"
                    type="text"
                    value={formData.organizationName}
                    onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                    placeholder="Your company or estate name"
                    className="w-full px-4 py-3 rounded-xl bg-[#18181b] border border-white/[0.07] text-white placeholder-zinc-600 focus:outline-none focus:border-[#10b981]/50 focus:ring-1 focus:ring-[#10b981]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/[0.07] bg-[#18181b] text-white hover:bg-[#27272a] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#10b981] hover:bg-[#006c49] text-white font-medium transition-colors"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#10b981]/20 flex items-center justify-center mx-auto mb-6">
                {isLoading ? (
                  <Loader2 className="w-10 h-10 text-[#10b981] animate-spin" />
                ) : (
                  <CheckCircle className="w-10 h-10 text-[#10b981]" />
                )}
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                {isLoading ? 'Setting things up...' : 'You\'re all set!'}
              </h2>
              <p className="text-zinc-400 max-w-md mx-auto mb-8">
                {isLoading
                  ? 'We\'re finalizing your profile and preparing your dashboard.'
                  : 'Your account is ready. You can now access all PropatiBox features.'}
              </p>

              {/* Progress bar */}
              {isLoading && (
                <div className="max-w-sm mx-auto mb-8">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-zinc-400">Progress</span>
                    <span className="text-[#10b981] font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#18181b] overflow-hidden">
                    <div
                      className="h-full bg-[#10b981] transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-zinc-500 text-xs mt-3">
                    {progress < 30 && 'Creating your profile...'}
                    {progress >= 30 && progress < 60 && 'Setting up your preferences...'}
                    {progress >= 60 && progress < 90 && 'Preparing your dashboard...'}
                    {progress >= 90 && 'Finalizing...'}
                  </p>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md mx-auto">
                  {error}
                </div>
              )}

              {!isLoading && progress === 100 && (
                <button
                  type="button"
                  onClick={handleComplete}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#006c49] text-white font-medium transition-colors"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {isLoading && (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#18181b] text-zinc-500 font-medium cursor-not-allowed"
                >
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
