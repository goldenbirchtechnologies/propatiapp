'use client';

import { useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowUpRight,
  BadgeCheck,
  Building2,
  Clock,
  FileText,
  Loader2,
  Paperclip,
  Receipt,
  ShieldCheck,
  Trash2,
  UploadCloud,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DOCUMENT_CATEGORY_LABELS,
  type LandlordDocumentCategory,
  type LandlordDocumentRow,
  type LandlordProfileValues,
} from '@/lib/landlord-profile/types';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];

const CATEGORY_COPY: Record<
  LandlordDocumentCategory,
  { description: string; requiredFor?: LandlordProfileValues['legalEntityType']; icon: ReactNode }
> = {
  government_id: {
    description: 'A clear photo or scan of your government-issued ID.',
    icon: <ShieldCheck className="h-4 w-4" aria-hidden />,
  },
  ownership_evidence: {
    description: 'Title deed, C of O, deed of assignment, or a recent land registry extract.',
    icon: <FileText className="h-4 w-4" aria-hidden />,
  },
  company_registration: {
    description: 'CAC certificate of incorporation and, where available, the status report.',
    requiredFor: 'company',
    icon: <Building2 className="h-4 w-4" aria-hidden />,
  },
  joint_ownership: {
    description: 'Evidence naming every joint owner on the title.',
    requiredFor: 'joint',
    icon: <Users className="h-4 w-4" aria-hidden />,
  },
  tax_document: {
    description: 'TIN certificate, tax clearance, or a recent tax assessment.',
    icon: <Receipt className="h-4 w-4" aria-hidden />,
  },
  supporting: {
    description: 'Anything else that supports your ownership record.',
    icon: <Paperclip className="h-4 w-4" aria-hidden />,
  },
};

const CATEGORY_ORDER: LandlordDocumentCategory[] = [
  'government_id',
  'ownership_evidence',
  'company_registration',
  'joint_ownership',
  'tax_document',
  'supporting',
];

const statusVariant = (status: string) => {
  if (status === 'verified') return 'success' as const;
  if (status === 'rejected') return 'destructive' as const;
  if (status === 'under_review') return 'info' as const;
  if (status === 'action_required') return 'warning' as const;
  return 'warning' as const;
};

const statusLabel = (status: string) => {
  if (status === 'under_review') return 'Under review';
  if (status === 'action_required') return 'Action required';
  if (status === 'rejected') return 'Rejected';
  if (status === 'verified') return 'Verified';
  return 'Pending review';
};

const formatBytes = (bytes: number | null): string => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string | null): string | null => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export function SectionIdentityDocuments({
  profile,
  documents,
  account,
  onRefresh,
}: {
  profile: LandlordProfileValues;
  documents: LandlordDocumentRow[];
  account: { idType: string | null; idVerified: boolean; ninVerified: boolean };
  onRefresh: () => Promise<void>;
}) {
  const [busyCategory, setBusyCategory] = useState<LandlordDocumentCategory | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputs = useRef<Partial<Record<LandlordDocumentCategory, HTMLInputElement | null>>>({});

  const upload = async (category: LandlordDocumentCategory, file: File) => {
    setError(null);
    if (file.size > MAX_FILE_SIZE) {
      setError('File must be 10MB or smaller.');
      return;
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Upload a PDF, JPG, PNG, or WebP file.');
      return;
    }

    setBusyCategory(category);
    try {
      const body = new FormData();
      body.append('file', file);
      body.append('category', category);

      const response = await fetch('/api/landlord/documents', { method: 'POST', body });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.error || 'Could not upload the document');
      }
      await onRefresh();
      toast.success('Document uploaded');
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Could not upload the document');
    } finally {
      setBusyCategory(null);
    }
  };

  const remove = async (doc: LandlordDocumentRow) => {
    if (!window.confirm(`Remove “${doc.name}”?`)) return;
    setDeletingId(doc.id);
    setError(null);
    try {
      const response = await fetch(`/api/landlord/documents/${doc.id}`, { method: 'DELETE' });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(json?.error || 'Could not remove the document');
      }
      await onRefresh();
      toast.success('Document removed');
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Could not remove the document');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-white/[0.08]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <BadgeCheck className="h-4 w-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                Identity verification
              </p>
              <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                {account.idVerified
                  ? 'Your government identity has been verified.'
                  : 'Complete Dojah KYC to verify your identity once.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={account.idVerified ? 'success' : 'warning'}>
              {account.idVerified ? 'ID verified' : 'ID not verified'}
            </Badge>
            {account.ninVerified && <Badge variant="success">NIN verified</Badge>}
            {!account.idVerified && (
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/verification/dojah-kyc">
                  Verify identity
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {error && (
        <p className="flex items-start gap-1.5 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      )}

      <div className="space-y-3">
        {CATEGORY_ORDER.map((category) => {
          const copy = CATEGORY_COPY[category];
          const categoryDocs = documents.filter((doc) => doc.category === category);
          const required =
            category === 'government_id' ||
            category === 'ownership_evidence' ||
            copy.requiredFor === profile.legalEntityType;

          return (
            <div
              key={category}
              className={cn(
                'rounded-lg border p-4',
                required
                  ? 'border-zinc-200 dark:border-white/[0.08]'
                  : 'border-zinc-200/70 dark:border-white/[0.06]',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2.5">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-500 dark:bg-white/[0.06] dark:text-zinc-400">
                    {copy.icon}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {DOCUMENT_CATEGORY_LABELS[category]}
                      </p>
                      {required ? (
                        <Badge variant="secondary">Required</Badge>
                      ) : (
                        <Badge variant="outline">Optional</Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
                      {copy.description}
                    </p>
                  </div>
                </div>

                <div>
                  <input
                    ref={(node) => {
                      inputs.current[category] = node;
                    }}
                    type="file"
                    accept=".pdf,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      event.target.value = '';
                      if (file) void upload(category, file);
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputs.current[category]?.click()}
                    disabled={busyCategory !== null}
                  >
                    {busyCategory === category ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <UploadCloud className="h-3.5 w-3.5" aria-hidden />
                    )}
                    Upload
                  </Button>
                </div>
              </div>

              {categoryDocs.length > 0 && (
                <ul className="mt-3 divide-y divide-zinc-100 border-t border-zinc-100 dark:divide-white/[0.06] dark:border-white/[0.06]">
                  {categoryDocs.map((doc) => {
                    const expiry = formatDate(doc.expiresAt);
                    const expired = doc.expiresAt ? new Date(doc.expiresAt) < new Date() : false;
                    return (
                      <li key={doc.id} className="flex flex-wrap items-center gap-2 py-2.5">
                        <FileText className="h-4 w-4 shrink-0 text-zinc-400" aria-hidden />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-zinc-800 dark:text-zinc-200">
                            {doc.name}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                            <span>{formatDate(doc.createdAt)}</span>
                            {doc.sizeBytes ? <span>· {formatBytes(doc.sizeBytes)}</span> : null}
                            {expiry && (
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1',
                                  expired && 'text-destructive',
                                )}
                              >
                                <Clock className="h-3 w-3" aria-hidden />
                                {expired ? 'Expired' : 'Expires'} {expiry}
                              </span>
                            )}
                          </p>
                          {doc.reviewNote && (
                            <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-300">
                              {doc.reviewNote}
                            </p>
                          )}
                        </div>
                        <Badge variant={statusVariant(doc.status)}>{statusLabel(doc.status)}</Badge>
                        <Button asChild variant="ghost" size="sm">
                          <a href={doc.url} target="_blank" rel="noreferrer">
                            Open
                            <ArrowUpRight className="h-3 w-3" aria-hidden />
                          </a>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-zinc-500 hover:text-destructive"
                          onClick={() => void remove(doc)}
                          disabled={deletingId === doc.id}
                          aria-label={`Remove ${doc.name}`}
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" aria-hidden />
                          )}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        PDF, JPG, PNG, or WebP · 10MB maximum per file. Uploads are private to your account and
        reviewed before they are marked verified.
      </p>
    </div>
  );
}
