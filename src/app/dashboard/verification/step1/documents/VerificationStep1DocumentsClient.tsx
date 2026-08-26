'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  CheckCircle2,
  XCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

type DocumentType = 'ownership' | 'id' | 'photos' | 'utility';

type Props = {
  listingId: string;
  verificationId: string | null;
  documents: Array<{
    id: string;
    documentType: string;
    url: string;
    fileName: string | null;
    uploadedAt: Date;
  }>;
  currentStatus: string | null;
  overallStatus: string | null;
};

const REQUIRED_DOCS: DocumentType[] = ['ownership', 'id', 'photos', 'utility'];

const docLabels: Record<DocumentType, string> = {
  ownership: 'Certificate of Occupancy / Deed of Assignment',
  id: 'Valid Government ID',
  photos: 'Property Photos',
  utility: 'Utility Bill / Tax Receipt',
};

function Step1DocumentsClient(props: Props) {
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState(props.documents);

  const counts = documents.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.documentType] = (acc[doc.documentType] || 0) + 1;
    return acc;
  }, {});

  const progress = Math.min(100, Math.round((Object.keys(counts).length / 4) * 100));

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', type);
      formData.append('listingId', props.listingId);

      const res = await fetch('/api/verification/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload failed');
      }

      const data = await res.json();
      setDocuments((prev) => [
        {
          id: data.document.id,
          documentType: data.document.type,
          url: data.document.url,
          fileName: data.document.fileName,
          uploadedAt: new Date(data.document.uploadedAt),
        },
        ...prev,
      ]);
      toast.success(`${docLabels[type]} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const submitLayer1 = async () => {
    if (!props.verificationId) {
      toast.error('Verification record not ready yet');
      return;
    }
    try {
      const res = await fetch('/api/verification/layer1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: props.listingId, docUrl: documents[0]?.url || '' }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Submission failed');
      }

      toast.success('Layer 1 submitted for review');
      setTimeout(() => {
        window.location.href = `/dashboard/verification/submitted?listingId=${props.listingId}&layer=1`;
      }, 800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  const isReadOnly = props.currentStatus === 'pending' && props.overallStatus !== 'not_started' && props.overallStatus !== 'rejected';

  return (
    <div className="space-y-6">
      <div className="glass-card">
        <div className="px-6 py-5 border-b border-white/[0.08] flex flex-row items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Progress</h3>
            <p className="text-sm text-zinc-400 mt-1">
              {REQUIRED_DOCS.length} document categories required
            </p>
          </div>
          <span className="text-2xl font-bold">{progress}%</span>
        </div>
        <div className="p-6">
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIRED_DOCS.map((type) => {
          const hasDoc = (counts[type] || 0) > 0;
          return (
            <div className="glass-card" key={type} className={hasDoc ? 'border-success/30' : 'border-dashed'}>
              <div className="px-6 py-5 border-b border-white/[0.08] flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  {hasDoc ? (
                    <CheckCircle2 className="h-5 w-5 text-[#10b981]" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-zinc-400" />
                  )}
                  <h3 className="text-lg font-semibold text-white text-base">{docLabels[type]}</h3>
                </div>
                <Badge variant={hasDoc ? 'default' : 'outline'}>{hasDoc ? 'Uploaded' : 'Required'}</Badge>
              </div>
              <div className="p-6">
                <p className="text-sm text-zinc-400 mb-3">
                  {hasDoc ? 'Document uploaded and ready for review' : 'Please upload this document to continue'}
                </p>
                {!isReadOnly && (
                  <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white cursor-pointer hover:opacity-90 transition">
                    <Upload className="h-4 w-4" />
                    <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => handleUpload(e, type)}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-zinc-400">
          {currentStatusLabel(props.currentStatus)}
        </p>
        <Button
          onClick={submitLayer1}
          disabled={uploading || Object.keys(counts).length < 1}
          className="min-w-[160px]"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Submit for Review
        </Button>
      </div>
    </div>
  );
}

function currentStatusLabel(status: string | null) {
  if (!status) return 'Not submitted yet';
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default Step1DocumentsClient;
