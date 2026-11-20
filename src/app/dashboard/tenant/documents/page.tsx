import { redirect } from 'next/navigation';
import { getCurrentUserWithProfile } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import TenantRailShell from '@/components/layout/TenantRailShell';
import { TENANT_NAVIGATION } from '@/lib/navigation';
import TenantDocumentsClient from './TenantDocumentsClient';

export default async function TenantDocumentsPage() {
  const user = await getCurrentUserWithProfile();
  if (!user || user.role !== 'tenant') redirect('/dashboard');
  const documents = await prisma.document.findMany({ where: { uploadedById: user.id }, select: { id: true, type: true, version: true, name: true, url: true, createdAt: true }, orderBy: { createdAt: 'desc' } }).catch(() => []);
  return <TenantRailShell navigation={TENANT_NAVIGATION} userRole={user.role} userName={user.fullName} userAvatar={user.avatarUrl || undefined}><div className="mx-auto w-full max-w-5xl space-y-6"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Account management</p><h1 className="mt-2 text-2xl font-semibold text-zinc-950 dark:text-white">My documents</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">A central view of documents you have uploaded. Access remains private to your account unless you authorise sharing during an application.</p></div><TenantDocumentsClient initial={documents.map((document) => ({ ...document, createdAt: document.createdAt.toISOString() }))} /></div></TenantRailShell>;
}
