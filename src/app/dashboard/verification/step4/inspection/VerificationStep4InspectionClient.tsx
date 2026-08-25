'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, AlertCircle, ArrowRight, Calendar } from 'lucide-react';

type InspectionData = {
  l4Status: string | null;
  l4ScheduledAt: Date | null;
  l4CompletedAt: Date | null;
  l4ReportUrl: string | null;
  l4Agent: { fullName: string; phone: string; agentTier: string } | null;
};

type Props = {
  listingId: string;
  verificationId: string | null;
  listing: { title: string; address: string; area: string; state: string };
  inspection: InspectionData;
  currentLayer: number;
  overallStatus: string | null;
  l3Status: string | null;
};

function Step4InspectionClient(props: Props) {
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [notes, setNotes] = useState('');
  const [requesting, setRequesting] = useState(false);

  const canProceed = props.l3Status === 'approved' || props.currentLayer >= 4;
  const isReadOnly = !['not_started', 'in_progress'].includes(props.overallStatus || '') || props.inspection.l4Status === 'pending' || props.inspection.l4Status === 'approved';

  const progress = props.inspection.l4Status === 'approved' ? 100 : props.inspection.l4Status === 'pending' ? 50 : 0;

  const requestInspection = async () => {
    if (!props.verificationId) {
      toast.error('Verification record not ready');
      return;
    }
    if (!preferredDate) {
      toast.error('Please select a preferred date');
      return;
    }

    setRequesting(true);
    try {
      const res = await fetch('/api/verification/request-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: props.verificationId,
          listingId: props.listingId,
          preferredDate: new Date(preferredDate).toISOString(),
          preferredTime,
          notes,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to request inspection');
      }

      toast.success('Inspection requested successfully');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Inspection Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="h-3" />
          <p className="text-sm text-zinc-400 mt-2">
            {props.inspection.l4Status === 'approved' ? 'Inspection completed and approved' : props.inspection.l4Status === 'pending' ? 'Inspection scheduled' : 'Schedule a physical inspection'}
          </p>
        </CardContent>
      </Card>

      {!canProceed ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="h-5 w-5" />
              <p>Please complete Layer 3 (Video verification) before proceeding.</p>
            </div>
          </CardContent>
        </Card>
      ) : props.inspection.l4Status === 'approved' ? (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-[#10b981]">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">Inspection completed successfully</p>
            </div>
            {props.inspection.l4Agent && (
              <div className="text-sm text-zinc-400">
                Inspected by <span className="font-medium text-white">{props.inspection.l4Agent.fullName}</span> ({props.inspection.l4Agent.agentTier})
              </div>
            )}
            {props.inspection.l4CompletedAt && (
              <div className="text-sm text-zinc-400">
                Completed on {new Date(props.inspection.l4CompletedAt).toLocaleDateString()}
              </div>
            )}
          </CardContent>
        </Card>
      ) : props.inspection.l4Status === 'pending' ? (
        <Card>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-warning">
              <Loader2 className="h-4 w-4 animate-spin" />
              <p className="font-medium">Inspection scheduled</p>
            </div>
            {props.inspection.l4ScheduledAt && (
              <div className="text-sm text-zinc-400">
                Scheduled for {new Date(props.inspection.l4ScheduledAt).toLocaleDateString()} at {preferredTime}
              </div>
            )}
            {props.inspection.l4Agent && (
              <div className="text-sm text-zinc-400">
                Agent: <span className="font-medium text-white">{props.inspection.l4Agent.fullName}</span> - {props.inspection.l4Agent.phone}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Inspection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preferred Date</Label>
              <Input
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                disabled={isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred Time</Label>
              <select
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value as 'morning' | 'afternoon' | 'evening')}
                className="w-full h-11 bg-background border border-input rounded-lg px-3 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                disabled={isReadOnly}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special instructions for the agent..."
                className="w-full bg-background border border-input rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-sm min-h-[80px]"
                disabled={isReadOnly}
              />
            </div>
            <Button onClick={requestInspection} disabled={requesting || isReadOnly} className="w-full">
              {requesting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Request Inspection
            </Button>
          </CardContent>
        </Card>
      )}

      {props.inspection.l4Status === 'approved' && (
        <div className="flex justify-end">
          <Button onClick={() => { window.location.href = `/dashboard/verification/checklist?listingId=${props.listingId}`; }}>
            View Verification Checklist <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default Step4InspectionClient;
