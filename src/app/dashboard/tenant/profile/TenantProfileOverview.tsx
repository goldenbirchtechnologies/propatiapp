'use client';

import Link from 'next/link';
import { ArrowRight, CheckCircle2, Edit3, Eye, FileText, ShieldCheck, UserRound } from 'lucide-react';
import type { TenantProfileData } from './TenantProfileClient';

const sections = [
  ['personal', 'Personal details', 'Date of birth, nationality and residence'],
  ['identity', 'Identity', 'ID and verification status'],
  ['employment', 'Employment', 'Work and income information'],
  ['financial', 'Other income', 'Additional income sources'],
  ['guarantor', 'Guarantor', 'Guarantor contact details'],
  ['nextOfKin', 'Next of kin', 'Your nominated contact'],
  ['addressHistory', 'Address history', 'Previous and current addresses'],
  ['emergencyContacts', 'Emergency contacts', 'Who to contact in an emergency'],
  ['preferences', 'Rental preferences', 'What you are looking for'],
  ['verification', 'Contact information', 'Phone, email and address'],
] as const;

function value(value: unknown) {
  if (value === null || value === undefined || value === '') return 'Not provided';
  return String(value);
}

export default function TenantProfileOverview({ data }: { data: TenantProfileData }) {
  const { completion } = data;
  const incomplete = completion.sections.filter((section) => !section.done);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Account management</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-3xl">Your tenant profile</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">Keep your rental profile current so landlords can review the information you choose to share during an application.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/tenant/profile?edit=1" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition active:scale-[.98]">
            <Edit3 className="h-4 w-4" /> Edit profile
          </Link>
          <button type="button" disabled className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-zinc-200 px-4 text-sm font-semibold text-zinc-400 dark:border-white/10 dark:text-zinc-600" title="Preview is available when you have completed enough profile information">
            <Eye className="h-4 w-4" /> Preview
          </button>
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-900/60 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
            {data.account.avatarUrl ? <img src={data.account.avatarUrl} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-7 w-7" />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-zinc-950 dark:text-white">{data.account.fullName}</h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300">Active account</span>
            </div>
            <p className="mt-1 text-sm text-zinc-500">Account ID: <span className="font-mono text-zinc-700 dark:text-zinc-300">{data.account.id}</span></p>
            <p className="mt-1 text-sm text-zinc-500">{data.account.email}</p>
          </div>
          <div className="w-full sm:w-48">
            <div className="flex items-center justify-between text-sm"><span className="font-medium text-zinc-700 dark:text-zinc-300">Profile completion</span><span className="font-semibold text-primary">{completion.percent}%</span></div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10"><div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${completion.percent}%` }} /></div>
            <p className="mt-2 text-xs text-zinc-500">{completion.completedCount} of {sections.length} sections complete</p>
          </div>
        </div>
      </section>

      {incomplete.length > 0 && (
        <section className="rounded-2xl border border-amber-300/70 bg-amber-50/60 p-5 dark:border-amber-300/20 dark:bg-amber-300/[0.06]">
          <div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-700 dark:text-amber-300" /><div><h2 className="font-semibold text-zinc-950 dark:text-white">Finish the information landlords need</h2><p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">You can save your progress and return later. Outstanding sections: {incomplete.map((item) => sections.find(([id]) => id === item.sectionId)?.[1]).filter(Boolean).join(', ')}.</p><Link href="/dashboard/tenant/profile?edit=1" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-800 hover:underline dark:text-amber-200">Continue profile <ArrowRight className="h-4 w-4" /></Link></div></div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]">
        <section className="rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/60">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-white/[0.08]"><div><h2 className="font-semibold text-zinc-950 dark:text-white">Profile information</h2><p className="mt-1 text-xs text-zinc-500">Review what is saved in your tenant profile.</p></div><FileText className="h-5 w-5 text-zinc-400" /></div>
          <div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">
            {sections.map(([id, label, description]) => { const item = completion.sections.find((section) => section.sectionId === id); return <div key={id} className="flex items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="font-medium text-zinc-900 dark:text-white">{label}</p><p className="mt-0.5 truncate text-xs text-zinc-500">{description}</p></div><div className="flex shrink-0 items-center gap-3">{item?.done ? <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"><CheckCircle2 className="h-4 w-4" /> Complete</span> : <span className="text-xs font-medium text-amber-700 dark:text-amber-300">Needs attention</span>}<Link href="/dashboard/tenant/profile?edit=1" className="text-xs font-semibold text-primary hover:underline">Edit</Link></div></div>; })}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-900/60"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="h-5 w-5" /></div><div><h2 className="font-semibold text-zinc-950 dark:text-white">Verification is separate</h2><p className="mt-1 text-xs text-zinc-500">A complete profile does not automatically verify your identity.</p></div></div><Link href="/dashboard/tenant/verification" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Open verification centre <ArrowRight className="h-4 w-4" /></Link></section>
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/[0.08] dark:bg-zinc-900/60"><h2 className="font-semibold text-zinc-950 dark:text-white">Contact snapshot</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between gap-4"><dt className="text-zinc-500">Phone</dt><dd className="text-right text-zinc-800 dark:text-zinc-200">{value(data.account.phone)}</dd></div><div className="flex justify-between gap-4"><dt className="text-zinc-500">Location</dt><dd className="text-right text-zinc-800 dark:text-zinc-200">{value(data.address.city)}</dd></div><div className="flex justify-between gap-4"><dt className="text-zinc-500">Preferred state</dt><dd className="text-right text-zinc-800 dark:text-zinc-200">{value(data.preferences.preferredState)}</dd></div></dl></section>
          <p className="px-1 text-xs leading-5 text-zinc-500">Only information authorised and necessary for a relevant application should be shared with a landlord.</p>
        </aside>
      </div>
    </div>
  );
}
