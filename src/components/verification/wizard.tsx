'use client';

import * as React from 'react';
import MaterialIcon from '@/components/icons/material-icon';
import { ChevronRight, CheckCircle, AlertCircle, XCircle, Clock, FileText, User, Camera, MapPin, Shield, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { DroppableArea } from '@/components/ui/droppable-area';
import { formatRelativeTime } from '@/lib/utils';


export type VerificationLayer = 1 | 2 | 3 | 4 | 5;

export interface VerificationStep {
  layer: VerificationLayer;
  title: string;
  description: string;
  icon: React.ReactNode;
  status: 'pending' | 'in_progress' | 'submitted' | 'approved' | 'rejected' | 'requires_action';
  completedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  requirements: VerificationRequirement[];
  actions?: VerificationAction[];
}

export interface VerificationRequirement {
  id: string;
  label: string;
  type: 'document' | 'video' | 'confirmation' | 'schedule' | 'wait';
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  url?: string;
  fileName?: string;
  fileSize?: number;
  rejectionReason?: string;
}

export interface VerificationAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'destructive';
  icon?: React.ReactNode;
}

export interface VerificationWizardProps {
  steps: VerificationStep[];
  currentLayer: VerificationLayer;
  overallStatus: 'not_started' | 'in_progress' | 'under_review' | 'approved' | 'rejected';
  onLayerSubmit?: (layer: VerificationLayer, data: Record<string, unknown>) => Promise<void>;
  onLayerAction?: (layer: VerificationLayer, actionId: string) => Promise<void>;
  onDocumentUpload?: (layer: VerificationLayer, requirementId: string, file: File) => Promise<void>;
  onDocumentRemove?: (layer: VerificationLayer, requirementId: string) => Promise<void>;
  onVideoRecord?: (layer: VerificationLayer) => Promise<void>;
  onScheduleInspection?: (layer: VerificationLayer, data: { date: Date; notes: string }) => Promise<void>;
  className?: string;
  isSubmitting?: boolean;
}

const stepConfig: Record<VerificationLayer, { title: string; description: string; icon: React.ReactNode }> = {
  1: {
    title: 'Documents',
    description: 'Upload required ownership and identity documents',
    icon: <FileText className="h-5 w-5" />,
  },
  2: {
    title: 'Identity',
    description: 'Verify your identity via Prembly (NIN/BVN/DL/PVC)',
    icon: <User className="h-5 w-5" />,
  },
  3: {
    title: 'Video',
    description: 'Record a verification video with QR code',
    icon: <Camera className="h-5 w-5" />,
  },
  4: {
    title: 'Inspection',
    description: 'Schedule a physical property inspection',
    icon: <MapPin className="h-5 w-5" />,
  },
  5: {
    title: 'Certified',
    description: 'Final review and certification',
    icon: <Award className="h-5 w-5" />,
  },
};

const statusConfig = {
  pending: { label: 'Pending', variant: 'secondary' as const, icon: <Clock className="h-3.5 w-3.5" /> },
  in_progress: { label: 'In Progress', variant: 'default' as const, icon: <Clock className="h-3.5 w-3.5 animate-spin" /> },
  submitted: { label: 'Submitted', variant: 'outline' as const, icon: <Clock className="h-3.5 w-3.5" /> },
  approved: { label: 'Approved', variant: 'success' as const, icon: <CheckCircle className="h-3.5 w-3.5" /> },
  rejected: { label: 'Rejected', variant: 'destructive' as const, icon: <XCircle className="h-3.5 w-3.5" /> },
  requires_action: { label: 'Action Required', variant: 'warning' as const, icon: <AlertCircle className="h-3.5 w-3.5" /> },
};

function StepIndicator({
  step,
  index,
  isActive,
  isCompleted,
}: {
  step: VerificationStep;
  index: number;
  isActive: boolean;
  isCompleted: boolean;
}) {
  const status = isCompleted ? 'approved' : isActive ? step.status : 'pending';
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <div className="flex flex-col items-center gap-2 flex-1 relative">
      {/* Connector line */}
      {index < 4 && (
        <div
          className="absolute top-5 left-1/2 w-full h-1 -translate-x-1/2 z-0"
          style={{
            background: isCompleted ? 'var(--accent)' : 'var(--border)',
          }}
        />
      )}

      {/* Step Circle */}
      <div
        className={cn(
          'relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300',
          'font-heading font-bold text-sm',
          isCompleted
            ? 'bg-accent border-accent text-white'
            : isActive
            ? 'bg-accent/10 border-accent text-accent'
            : 'bg-surface border-border text-muted-foreground'
        )}
        style={{ minWidth: '40px' }}
      >
        {isCompleted ? (
          <CheckCircle className="h-5 w-5" />
        ) : isActive && step.status === 'in_progress' ? (
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        ) : (
          <MaterialIcon name={index + 1} className="material-symbols-outlined" />
        )}
      </div>

      {/* Step Label */}
      <div className="text-center w-24">
        <p className={cn(
          'font-medium text-xs transition-colors',
          isActive || isCompleted ? 'text-text' : 'text-muted-foreground'
        )}>
          {step.title}
        </p>
        <Badge variant={config.variant} className="text-[10px] mt-1">
          {config.icon}
          {config.label}
        </Badge>
      </div>
    </div>
  );
}

function RequirementItem({
  requirement,
  layer,
  onUpload,
  onRemove,
  onRecord,
  onSchedule,
  isSubmitting,
}: {
  requirement: VerificationRequirement;
  layer: VerificationLayer;
  onUpload?: (requirementId: string, file: File) => Promise<void>;
  onRemove?: (requirementId: string) => Promise<void>;
  onRecord?: () => Promise<void>;
  onSchedule?: (data: { date: Date; notes: string }) => Promise<void>;
  isSubmitting?: boolean;
}) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [showSchedule, setShowSchedule] = React.useState(false);
  const [scheduleDate, setScheduleDate] = React.useState<Date>(new Date());
  const [scheduleNotes, setScheduleNotes] = React.useState('');

  const statusConfigReq = {
    pending: { label: 'Pending', variant: 'secondary' as const, color: 'var(--muted)' },
    uploaded: { label: 'Uploaded', variant: 'outline' as const, color: 'var(--accent)' },
    verified: { label: 'Verified', variant: 'success' as const, color: 'var(--green)' },
    rejected: { label: 'Rejected', variant: 'destructive' as const, color: 'var(--red)' },
  };

  const config = statusConfigReq[requirement.status];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUpload) return;
    setIsUploading(true);
    try {
      await onUpload(requirement.id, file);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSchedule = async () => {
    if (!onSchedule) return;
    await onSchedule({ date: scheduleDate, notes: scheduleNotes });
    setShowSchedule(false);
  };

  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-sm" style={{ color: 'var(--text)' }}>{requirement.label}</span>
            <Badge variant={config.variant} className="text-xs">
              {config.label}
            </Badge>
          </div>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            {requirement.type === 'document' && 'Upload a PDF, JPG, or PNG file (max 10MB)'}
            {requirement.type === 'video' && 'Record a 30-60 second video showing the property'}
            {requirement.type === 'confirmation' && 'Confirm your identity details match the records'}
            {requirement.type === 'schedule' && 'Book an appointment with a certified inspector'}
            {requirement.type === 'wait' && 'Waiting for admin review'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {requirement.type === 'document' && requirement.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById(`upload-${requirement.id}`)?.click()}
              disabled={isSubmitting || isUploading}
              className="gap-1"
            >
              <FileText className="h-3.5 w-3.5" />
              Upload
            </Button>
          )}

          {requirement.type === 'document' && requirement.status === 'uploaded' && (
            <>
              <Button variant="ghost" size="icon" onClick={() => window.open(requirement.url!, '_blank')} aria-label="View document">
                <FileText className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onRemove?.(requirement.id)} disabled={isSubmitting} aria-label="Remove document">
                <XCircle className="h-4 w-4 text-destructive" />
              </Button>
            </>
          )}

          {requirement.type === 'video' && requirement.status === 'pending' && (
            <Button variant="default" size="sm" onClick={onRecord} disabled={isSubmitting} className="gap-1">
              <Camera className="h-3.5 w-3.5" />
              Record Video
            </Button>
          )}

          {requirement.type === 'confirmation' && requirement.status === 'pending' && (
            <Button variant="outline" size="sm" disabled={isSubmitting} className="gap-1">
              <Shield className="h-3.5 w-3.5" />
              Confirm Identity
            </Button>
          )}

          {requirement.type === 'schedule' && requirement.status === 'pending' && (
            <>
              <Button variant="default" size="sm" onClick={() => setShowSchedule(true)} disabled={isSubmitting} className="gap-1">
                <Calendar className="h-3.5 w-3.5" />
                Schedule
              </Button>
            </>
          )}

          {requirement.fileName && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {requirement.fileName}
            </span>
          )}
        </div>
      </div>

      {/* File Upload Input */}
      <input
        id={`upload-${requirement.id}`}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={handleFileUpload}
        className="hidden"
        disabled={isSubmitting}
      />

      {/* Schedule Modal */}
      <Dialog open={showSchedule} onOpenChange={setShowSchedule}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Inspection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="inspection-date">Preferred Date & Time</Label>
              <Input
                id="inspection-date"
                type="datetime-local"
                value={scheduleDate.toISOString().slice(0, 16)}
                onChange={(e) => setScheduleDate(new Date(e.target.value))}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
            <div>
              <Label htmlFor="inspection-notes">Notes (Optional)</Label>
              <Input
                id="inspection-notes"
                placeholder="Any specific access instructions or notes..."
                value={scheduleNotes}
                onChange={(e) => setScheduleNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSchedule(false)}>Cancel</Button>
            <Button onClick={handleSchedule} disabled={isSubmitting}>
              Confirm Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {requirement.rejectionReason && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium text-sm">Rejection Reason:</span>
          </div>
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{requirement.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}

import { Calendar } from 'lucide-react';

function StepContent({
  step,
  onDocumentUpload,
  onDocumentRemove,
  onVideoRecord,
  onScheduleInspection,
  isSubmitting,
}: {
  step: VerificationStep;
  onDocumentUpload?: (layer: VerificationLayer, requirementId: string, file: File) => Promise<void>;
  onDocumentRemove?: (layer: VerificationLayer, requirementId: string) => Promise<void>;
  onVideoRecord?: (layer: VerificationLayer) => Promise<void>;
  onScheduleInspection?: (layer: VerificationLayer, data: { date: Date; notes: string }) => Promise<void>;
  isSubmitting?: boolean;
}) {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
        {step.icon}
        <div>
          <h3 className="font-heading font-semibold" style={{ color: 'var(--text)' }}>{step.title}</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{step.description}</p>
        </div>
      </div>

      {step.status === 'requires_action' && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
            <AlertCircle className="h-5 w-5" />
            <span className="font-medium">Action Required</span>
          </div>
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            This step requires your attention before proceeding.
          </p>
        </div>
      )}

      {step.status === 'rejected' && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <XCircle className="h-5 w-5" />
            <span className="font-medium">Rejected</span>
            {step.rejectedAt && <span className="text-xs ml-auto">{formatRelativeTime(step.rejectedAt)}</span>}
          </div>
          {step.rejectionReason && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{step.rejectionReason}</p>
          )}
        </div>
      )}

      {step.status === 'approved' && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Approved</span>
            {step.completedAt && <span className="text-xs ml-auto">Completed {formatRelativeTime(step.completedAt)}</span>}
          </div>
        </div>
      )}

      <div className="space-y-3">
        {step.requirements.map((requirement) => (
          <RequirementItem
            key={requirement.id}
            requirement={requirement}
            layer={step.layer}
            onUpload={(reqId, file) => onDocumentUpload?.(step.layer, reqId, file) ?? Promise.resolve()}
            onRemove={(reqId) => onDocumentRemove?.(step.layer, reqId) ?? Promise.resolve()}
            onRecord={() => onVideoRecord?.(step.layer) ?? Promise.resolve()}
            onSchedule={(data) => onScheduleInspection?.(step.layer, data) ?? Promise.resolve()}
            isSubmitting={isSubmitting}
          />
        ))}
      </div>

      {step.actions && step.actions.length > 0 && (
        <div className="pt-4 border-t border-border flex flex-wrap gap-3">
          {step.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
              disabled={isSubmitting}
              className="gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export function VerificationWizard({
  steps,
  currentLayer,
  overallStatus,
  onLayerSubmit,
  onLayerAction,
  onDocumentUpload,
  onDocumentRemove,
  onVideoRecord,
  onScheduleInspection,
  className,
  isSubmitting = false,
}: VerificationWizardProps) {
  const sortedSteps = [...steps].sort((a, b) => a.layer - b.layer);
  const completedLayers = sortedSteps.filter((s) => s.status === 'approved').map((s) => s.layer);
  const currentStep = sortedSteps.find((s) => s.layer === currentLayer) || sortedSteps[0];

  const overallProgress = React.useMemo(() => {
    const total = sortedSteps.length;
    const completed = completedLayers.length;
    const currentIndex = sortedSteps.findIndex((s) => s.layer === currentLayer);
    if (overallStatus === 'approved') return 100;
    if (overallStatus === 'rejected') return 0;
    return Math.round(((completed + (currentStep.status === 'in_progress' ? 0.5 : 0)) / total) * 100);
  }, [sortedSteps, completedLayers, currentLayer, currentStep, overallStatus]);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold" style={{ color: 'var(--text)' }}>
              Property Verification
            </h2>
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Complete all 5 layers to get your property certified
            </p>
          </div>
          <Badge variant={overallStatus === 'approved' ? 'success' : overallStatus === 'rejected' ? 'destructive' : 'outline'} className="text-sm px-3 py-1">
            {overallStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="relative">
          <Progress value={overallProgress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <MaterialIcon name="0%" className="material-symbols-outlined" />
            <MaterialIcon name="{overallProgress}%" className="material-symbols-outlined" />
            <MaterialIcon name="100%" className="material-symbols-outlined" />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="relative">
          <div className="flex items-start justify-between">
            {sortedSteps.map((step, index) => (
              <StepIndicator
                key={step.layer}
                step={step}
                index={index}
                isActive={step.layer === currentLayer}
                isCompleted={completedLayers.includes(step.layer)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Tabs defaultValue={String(currentLayer)} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted/50 border-b border-border p-1" role="tablist">
            {sortedSteps.map((step) => (
              <TabsTrigger
                key={step.layer}
                value={String(step.layer)}
                className={cn(
                  'data-[state=active]:bg-background data-[state=active]:shadow-sm',
                  'text-xs py-2 px-1',
                  completedLayers.includes(step.layer) && 'text-accent',
                  step.status === 'rejected' && 'text-destructive'
                )}
                disabled={!completedLayers.includes(step.layer) && step.layer < currentLayer && step.status !== 'in_progress'}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="font-medium">{step.title}</span>
                  <Badge
                    variant={
                      completedLayers.includes(step.layer) ? 'success' :
                      step.layer === currentLayer ? 'default' :
                      step.status === 'rejected' ? 'destructive' : 'secondary'
                    }
                    className="text-[10px]"
                  >
                    {statusConfig[step.status as keyof typeof statusConfig]?.label || step.status}
                  </Badge>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>

          {sortedSteps.map((step) => (
            <TabsContent key={step.layer} value={String(step.layer)} className="p-6 focus-visible:ring-0">
              <StepContent
                step={step}
                onDocumentUpload={onDocumentUpload}
                onDocumentRemove={onDocumentRemove}
                onVideoRecord={onVideoRecord}
                onScheduleInspection={onScheduleInspection}
                isSubmitting={isSubmitting}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Navigation Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <Button
          variant="outline"
          onClick={() => {}}
          disabled={currentLayer === 1 || isSubmitting}
        >
          Previous Step
        </Button>

        <div className="flex gap-3">
          {currentLayer < 5 && currentStep.status !== 'rejected' && (
            <Button
              onClick={() => onLayerSubmit?.(currentLayer, {})}
              disabled={isSubmitting || currentStep.status !== 'in_progress'}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit for Review
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}

          {currentLayer === 5 && overallStatus === 'approved' && (
            <Badge variant="success" className="self-center px-4 py-2 text-sm">
              <Award className="mr-1 h-3.5 w-3.5" />
              Property Certified
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function VerificationStatusBadge({ tier }: { tier: 'basic' | 'verified' | 'inspected' | 'certified' }) {
  const config = {
    basic: { label: 'Basic', variant: 'secondary' as const, icon: <Shield className="h-3 w-3" /> },
    verified: { label: 'Verified', variant: 'success' as const, icon: <CheckCircle className="h-3 w-3" /> },
    inspected: { label: 'Inspected', variant: 'warning' as const, icon: <Shield className="h-3 w-3" /> },
    certified: { label: 'Certified', variant: 'default' as const, icon: <Award className="h-3 w-3" /> },
  };

  const c = config[tier];
  return (
    <Badge variant={c.variant} className="gap-1.5 px-3 py-1">
      {c.icon}
      {c.label}
    </Badge>
  );
}

export function VerificationProgressRing({
  progress,
  size = 80,
  strokeWidth = 6,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted"
          style={{ opacity: 0.2 }}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="text-accent transition-all duration-500"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-heading font-bold" style={{ fontSize: size * 0.25, color: 'var(--text)' }}>
          {progress}%
        </span>
      </div>
    </div>
  );
}
