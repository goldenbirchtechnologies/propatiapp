'use client';

import { useState } from 'react';
import { FileText, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

type DocumentItem = { id: string; type: string; version: number; name: string; url: string; createdAt: string };

export default function TenantDocumentsClient({ initial }: { initial: DocumentItem[] }) {
  const [documents, setDocuments] = useState(initial);
  const [uploading, setUploading] = useState(false);
  async function upload(file: File) {
    setUploading(true);
    try { const body = new FormData(); body.append('file', file); body.append('type', 'other'); const response = await fetch('/api/documents', { method: 'POST', body }); const json = await response.json(); if (!response.ok) throw new Error(json.error || 'Upload failed'); setDocuments((current) => [{ ...json.document, createdAt: new Date().toISOString() }, ...current]); toast.success('Document uploaded'); } catch (error) { toast.error(error instanceof Error ? error.message : 'Upload failed'); } finally { setUploading(false); }
  }
  return <div className="space-y-4"><label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white"><Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload document'}<input type="file" className="sr-only" accept="application/pdf,image/jpeg,image/png" disabled={uploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ''; }} /></label><div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/[0.08] dark:bg-zinc-900/60"><div className="divide-y divide-zinc-100 dark:divide-white/[0.06]">{documents.length ? documents.map((document) => <a key={document.id} href={document.url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-white/[0.03]"><div className="flex min-w-0 items-center gap-3"><FileText className="h-5 w-5 shrink-0 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium text-zinc-900 dark:text-white">{document.name}</p><p className="mt-1 text-xs capitalize text-zinc-500">{document.type} · version {document.version} · {new Date(document.createdAt).toLocaleDateString('en-NG')}</p></div></div><span className="text-xs font-medium text-zinc-500">View</span></a>) : <div className="px-5 py-10 text-center"><FileText className="mx-auto h-8 w-8 text-zinc-400" /><p className="mt-3 text-sm text-zinc-500">No documents uploaded yet.</p></div>}</div></div>{uploading && <p className="flex items-center gap-2 text-xs text-zinc-500"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading securely...</p>}</div>;
}
