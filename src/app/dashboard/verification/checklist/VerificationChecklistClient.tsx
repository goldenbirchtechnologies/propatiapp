'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

type Layer = {
  label: string;
  status: string;
  desc: string;
};

type Props = {
  listingId: string;
  verificationId: string | null;
  title: string;
  currentLayer: number;
  overallStatus: string;
  layers: Layer[];
  adminNotes: string | null;
  reviewedAt: Date | null;
};

function statusIcon(status: string) {
  if (status === 'approved') return <CheckCircle2 className="h-5 w-5 text-[#00ff66]" />;
  if (status === 'rejected') return <XCircle className="h-5 w-5 text-red-500" />;
  if (status === 'pending') return <Loader2 className="h-5 w-4 animate-spin text-warning" />;
  return <Loader2 className="h-5 w-5 text-muted-foreground" />;
}

function statusColor(status: string) {
  if (status === 'approved') return 'bg-success/10 text-[#00ff66] border-success/20';
  if (status === 'rejected') return 'bg-red-500/10 text-red-500 border-red-500/20';
  if (status === 'pending') return 'bg-warning/10 text-warning border-warning/20';
  return 'bg-muted text-muted-foreground border-[#262626]';
}

function VerificationChecklistClient(props: Props) {
  const approvedCount = props.layers.filter((l) => l.status === 'approved').length;
  const progress = Math.round((approvedCount / props.layers.length) * 100);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Overall Progress</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {approvedCount} of {props.layers.length} layers completed
            </p>
          </div>
          <span className="text-2xl font-bold">{progress}%</span>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Layer Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {props.layers.map((layer, idx) => (
              <div key={layer.label}>
                <div className="flex items-center justify-between p-4 rounded-lg border border-[#262626]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-medium">{layer.label}</p>
                      <p className="text-sm text-muted-foreground">{layer.desc}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusIcon(layer.status)}
                    <Badge className={statusColor(layer.status)}>
                      {layer.status === 'pending' ? 'Pending Review' : layer.status.charAt(0).toUpperCase() + layer.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                {idx < props.layers.length - 1 && <Separator className="my-2" />}
              </div>
            ))}
          </div>
        </CardContent>
      </div>

      {props.adminNotes && (
        <Card>
          <CardHeader>
            <CardTitle>Admin Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{props.adminNotes}</p>
            {props.reviewedAt && (
              <p className="text-xs text-muted-foreground mt-2">Reviewed on {new Date(props.reviewedAt).toLocaleString()}</p>
            )}
          </CardContent>
        </div>
      )}

      <div className="flex justify-end">
        {props.overallStatus === 'certified' ? (
          <Badge className="bg-success/10 text-[#00ff66] border-success/20 px-4 py-2 text-sm font-bold">
            Fully Certified
          </Badge>
        ) : props.overallStatus === 'rejected' ? (
          <Badge className="bg-red-500/10 text-red-500 border-red-500/20 px-4 py-2 text-sm font-bold">
            Verification Rejected
          </Badge>
        ) : (
          <p className="text-sm text-muted-foreground">
            {progress === 100 ? 'Ready for final review' : 'Complete all layers for final certification'}
          </p>
        )}
      </div>
    </div>
  );
}

export default VerificationChecklistClient;
