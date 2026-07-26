'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { getNavigationForRole } from '@/lib/navigation';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, ExternalLink, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Document = {
  id: string;
  type: string;
  version: number;
  name: string;
  url: string;
  createdAt: string;
  updatedAt: string;
};

type DocumentType = 'agreement' | 'receipt' | 'verification' | 'other';

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useUser();
  const [selectedType, setSelectedType] = useState<DocumentType>('other');
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const documentsQuery = useQuery({
    queryKey: ['documents-user'],
    queryFn: async () => {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to load documents');
      const json = await res.json();
      return (json.documents as Document[]);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: DocumentType }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(err.error || 'Upload failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents-user'] });
      setFile(null);
      // Reset file input by cloning it
      const input = document.getElementById('document-file-input') as HTMLInputElement | null;
      if (input) input.value = '';
      toast({
        title: 'Document uploaded',
        description: 'New version has been added successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Upload failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  if (!user) return null;

  const documents = documentsQuery.data ?? [];
  const grouped = documents.reduce<Record<DocumentType, Document[]>>((acc, doc) => {
    const type = (doc.type as DocumentType) || 'other';
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {
    agreement: [],
    receipt: [],
    verification: [],
    other: [],
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a file to upload.',
        variant: 'destructive',
      });
      return;
    }
    setIsUploading(true);
    try {
      await uploadMutation.mutateAsync({ file, type: selectedType });
    } finally {
      setIsUploading(false);
    }
  };

  // For the selected type, build version options sorted descending
  const typeDocuments = grouped[selectedType] || [];
  const sortedVersions = [...typeDocuments].sort((a, b) => b.version - a.version);
  const selectedDoc = sortedVersions.find(d => d.version.toString() === selectedVersion) || sortedVersions[0] || null;

  return (
    <DashboardShell
      navigation={getNavigationForRole(user.publicMetadata?.role as string || 'tenant')}
      userRole={(user.publicMetadata?.role as string) || 'tenant'}
      userName={user.fullName || 'User'}
      userAvatar={user.imageUrl || undefined}
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>
            Documents
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Manage your documents. Each type supports multiple versions.
          </p>
        </div>

        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Upload New Version
            </CardTitle>
            <CardDescription>
              Upload a replacement document. A new version will be created automatically.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
              <div className="grid gap-1.5 w-full sm:w-auto">
                <Label htmlFor="upload-type">Document Type</Label>
                <select
                  id="upload-type"
                  value={selectedType}
                  onChange={(e) => {
                    const val = e.target.value as DocumentType;
                    setSelectedType(val);
                    const versions = grouped[val] || [];
                    const sorted = [...versions].sort((a, b) => b.version - a.version);
                    setSelectedVersion(sorted[0]?.version.toString() || '');
                  }}
                  className="w-full sm:w-[200px] rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
                >
                  <option value="agreement">Agreement</option>
                  <option value="receipt">Receipt</option>
                  <option value="verification">Verification</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid gap-1.5 w-full sm:w-auto flex-1">
                <Label htmlFor="document-file-input">File</Label>
                <Input
                  id="document-file-input"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  disabled={isUploading}
                />
              </div>

              <Button
                type="submit"
                disabled={isUploading || !file}
                className="w-full sm:w-auto"
              >
                {isUploading ? (
                  <>Uploading...</>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Documents List by Type */}
        <div className="grid gap-6 md:grid-cols-2">
          {(Object.keys(grouped) as DocumentType[]).map((type) => {
            const typeDocs = grouped[type] || [];
            if (typeDocs.length === 0) return null;

            const sorted = [...typeDocs].sort((a, b) => b.version - a.version);
            const currentSelection =
              sorted.find(d => d.version.toString() === selectedVersion && type === selectedType)
              || (type === selectedType ? selectedDoc : sorted[0]);

            // If this type matches the currently selected type and user hasn't manually chosen,
            // ensure selection is synced.
            if (type === selectedType && !selectedVersion && sorted.length > 0) {
              // This is handled by the initial state and the useEffect-like behavior above.
            }

            return (
              <Card key={type}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base capitalize flex items-center gap-2">
                      <FileText className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                      {type.replace('_', ' ')}
                    </CardTitle>
                    <Badge variant="secondary" className="text-xs font-mono">
                      {typeDocs.length} version{typeDocs.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <select
                    value={currentSelection?.version.toString()}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedVersion(val);
                      if (!grouped[type]?.some((d) => d.version.toString() === val)) {
                        // keep type consistent with selection
                      }
                      setSelectedType(type);
                    }}
                    className="w-full rounded-md border border-input bg-background py-2 px-3 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring/50"
                  >
                    <option value="" disabled>Select version</option>
                    {sorted.map((doc) => (
                      <option key={doc.id} value={doc.version.toString()}>
                        Version {doc.version}
                      </option>
                    ))}
                  </select>

                  {currentSelection && (
                    <div className="rounded-lg border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
                          {currentSelection.name}
                        </span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          v{currentSelection.version}
                        </Badge>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        Uploaded {new Date(currentSelection.createdAt).toLocaleString()}
                      </p>
                      <a
                        href={currentSelection.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium hover:underline"
                        style={{ color: 'var(--accent)' }}
                      >
                        <ExternalLink className="h-3 w-3" />
                        View Document
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {documentsQuery.isLoading && <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading documents...</p>}
        {documentsQuery.isError && (
          <p className="text-sm text-red-600">Failed to load documents.</p>
        )}
      </div>
    </DashboardShell>
  );
}
