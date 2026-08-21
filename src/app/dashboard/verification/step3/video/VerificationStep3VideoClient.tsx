'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, QrCode } from 'lucide-react';
import { generateVerificationQR } from '@/lib/qr-code';

type Props = {
  listingId: string;
  verificationId: string | null;
  l3Status: string | null;
  currentLayer: number;
  overallStatus: string | null;
  l2Status: string | null;
};

function Step3VideoClient(props: Props) {
  const [uploading, setUploading] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const canProceed = props.l2Status === 'approved' || props.currentLayer >= 3;
  const isReadOnly = !['not_started', 'in_progress'].includes(props.overallStatus || '') || props.l3Status === 'pending';

  const progress = props.l3Status === 'approved' ? 100 : props.l3Status === 'pending' ? 50 : 0;

  const handleQrCode = async () => {
    if (!props.verificationId) return;
    try {
      const qr = await generateVerificationQR(props.verificationId, props.listingId);
      setQrCode(qr);
    } catch {
      toast.error('Failed to generate QR code');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('verificationId', props.verificationId || '');
      formData.append('listingId', props.listingId);

      const res = await fetch('/api/verification/upload-video', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Video upload failed');
      }

      const data = await res.json();
      setVideoUrl(data.video.url);
      toast.success('Video uploaded successfully');
      handleQrCode();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Verification Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {props.l3Status === 'approved' ? 'Video verified successfully' : props.l3Status === 'pending' ? 'Waiting for admin review' : 'Record and upload a video walkthrough'}
          </p>
        </CardContent>
      </div>

      {!canProceed ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              <p>Please complete Layer 2 (Identity verification) before proceeding.</p>
            </div>
          </CardContent>
        </div>
      ) : props.l3Status === 'approved' ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-[#00ff66]">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">Video verification complete.</p>
            </div>
            {videoUrl && (
              <video src={videoUrl} controls className="mt-4 rounded-lg max-h-[400px]" />
            )}
          </CardContent>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Video</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Record a video walking through the property. Show all rooms and display the QR code at the start.
              </p>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-input rounded-xl p-8 cursor-pointer hover:border-white hover:bg-muted/30 transition-all">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  className="hidden"
                  disabled={isReadOnly || uploading}
                  onChange={handleUpload}
                />
                {uploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                ) : (
                  <>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white mb-3">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p className="font-bold mb-1">Click to upload video</p>
                    <p className="text-sm text-muted-foreground text-center">MP4, MOV, or WebM. Max 100MB.</p>
                  </>
                )}
              </label>
              {videoUrl && (
                <video src={videoUrl} controls className="rounded-lg max-h-[300px]" />
              )}
            </CardContent>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Show this QR code at the start of your video. It verifies the timestamp and authenticity.
              </p>
              <div className="flex justify-center p-4 bg-surface rounded-lg">
                {qrCode ? (
                  <img src={qrCode} alt="Verification QR Code" className="h-48 w-48" />
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center bg-muted rounded-lg">
                    <span className="text-sm text-muted-foreground">QR code will appear here after upload</span>
                  </div>
                )}
              </div>
              <Button variant="outline" onClick={handleQrCode} className="w-full">
                Generate QR Code
              </Button>
            </CardContent>
          </div>
        </div>
      )}

      {props.l3Status === 'approved' && (
        <div className="flex justify-end">
          <Button onClick={() => { window.location.href = `/dashboard/verification/step4/inspection?listingId=${props.listingId}`; }}>
            Continue to Step 4 <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default Step3VideoClient;
