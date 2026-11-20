import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowRight, CheckCircle2, Clock3, ShieldCheck } from 'lucide-react';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';

const items = [
  { key: 'email', label: 'Email verification', description: 'Confirm the email on your PropatiBox account.' },
  { key: 'phone', label: 'Phone number', description: 'Use your verified phone number for secure updates.' },
  { key: 'identity', label: 'Identity verification', description: 'Complete an identity check before sharing sensitive application information.' },
  { key: 'documents', label: 'Supporting documents', description: 'Documents uploaded for an application may require review.' },
] as const;

function status(done: boolean, pending = false) {
  if (done) return { label: 'Verified', className: 'text-emerald-700 dark:text-emerald-300', icon: <CheckCircle2 className="h-4 w-4" /> };
  if (pending) return { label: 'Pending', className: 'text-amber-700 dark:text-amber-300', icon: <Clock3 className="h-4 w-4" /> };
  return { label: 'Not started', className: 'text-zinc-500', icon: <Clock3 className="h-4 w-4" /> };
}

export default async function TenantVerificationPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');
  const latest = await prisma.verification.findFirst({ where: { ownerId: user.id, type: 'identity' }, orderBy: { updatedAt: 'desc' }, select: { overallStatus: true } }).catch(() => null);
  const identityDone = Boolean(user.idVerified || user.ninVerified);
  const identityPending = latest?.overallStatus === 'in_progress';
  const states = { email: Boolean(user.emailVerified), phone: Boolean(user.phoneVerified), identity: identityDone, documents: false };
  const verifiedCount = Object.values(states).filter(Boolean).length;

  return <TenantRailShell navigation={TENANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}><div className="mx-auto w-full max-w-5xl space-y-6">
    <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Account management</p><h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">Verification centre</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Verification is independent from profile completion. We only show a verified status when the account or verification provider confirms it.</p></div>
    <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-900/60"><div className="flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-6 w-6" /></div><div className="flex-1"><div className="flex items-center justify-between gap-4 text-sm"><span className="font-semibold text-zinc-900 dark:text-white">Verification overview</span><span className="font-semibold text-primary">{verifiedCount}/4 verified</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10"><div className="h-full rounded-full bg-primary" style={{ width: `${verifiedCount * 25}%` }} /></div></div></div></section>
    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/60"><div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">{items.map((item) => { const current = status(states[item.key], item.key === 'identity' && identityPending); return <div key={item.key} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h2 className="font-semibold text-zinc-900 dark:text-white">{item.label}</h2><span className={`inline-flex items-center gap-1 text-xs font-medium ${current.className}`}>{current.icon}{current.label}</span></div><p className="mt-1 text-sm text-zinc-500">{item.description}</p></div>{item.key === 'identity' && !identityDone && !identityPending ? <Link href="/dashboard/verification/dojah-kyc" className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-white">Start check <ArrowRight className="h-4 w-4" /></Link> : <span className="text-xs text-zinc-400">Updated from account records</span>}</div>; })}</div></section>
  </div></TenantRailShell>;
}
