'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Search,
  Globe,
  Lock,
  Map,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  RefreshCw,
  Key,
  Server,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

// ─── Types ────────────────────────────────────────────────────────────────────
type LicenseStatus = 'active' | 'expired' | 'revoked' | 'trial';

interface LicenseRecord {
  id: string;
  name: string;
  status: LicenseStatus;
  seats: number;
  usedSeats: number;
  expiryDate: string;
  plan: string;
  keyFingerprint: string;
  lastValidatedAt: string;
}

interface LicensingClientProps {
  initialLicense?: LicenseRecord;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function licenseStatusBadge(status: LicenseStatus) {
  switch (status) {
    case 'active':
      return <Badge className="tag-green">Active</Badge>;
    case 'expired':
      return <Badge className="tag-amber">Expired</Badge>;
    case 'revoked':
      return <Badge className="tag-red">Revoked</Badge>;
    case 'trial':
      return <Badge className="tag-blue">Trial</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

function daysUntilExpiry(expiryDate: string) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LicensingClient({ initialLicense }: LicensingClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const mockLicense: LicenseRecord = initialLicense ?? {
    id: 'lic_001',
    name: 'Propati Enterprise',
    status: 'active',
    seats: 50,
    usedSeats: 31,
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    plan: 'Enterprise',
    keyFingerprint: 'FPK-8a3f...7e2d',
    lastValidatedAt: new Date().toISOString(),
  };

  const [license, setLicense] = useState<LicenseRecord>(mockLicense);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [editing, setEditing] = useState(false);

  // Form state
  const [licenseKey, setLicenseKey] = useState('');
  const [seatRequest, setSeatRequest] = useState(license.seats.toString());
  const [autoRenew, setAutoRenew] = useState(true);
  const [trialDurationDays, setTrialDurationDays] = useState('14');

  const daysLeft = useMemo(() => daysUntilExpiry(license.expiryDate), [license.expiryDate]);
  const utilizationPct = Math.round((license.usedSeats / Math.max(license.seats, 1)) * 100);

  const handleActivate = async () => {
    if (!licenseKey.trim()) {
      toast({
        title: 'License key required',
        description: 'Please enter a valid license key.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
      return;
    }
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setLicense({
        ...license,
        status: 'active',
        lastValidatedAt: new Date().toISOString(),
      });
      setLicenseKey('');
      setEditing(false);
      toast({
        title: 'License activated',
        description: 'The license key has been applied successfully.',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
    } catch {
      toast({
        title: 'Activation failed',
        description: 'Could not activate the license key.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setLicense({
        ...license,
        seats: Number(seatRequest),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast({
        title: 'Settings saved',
        description: 'Licensing settings updated.',
        className: 'bg-green-50 border-green-200 text-green-800',
      });
    } catch {
      toast({
        title: 'Save failed',
        description: 'Could not update licensing settings.',
        className: 'bg-red-50 border-red-200 text-red-800',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRetry = () => {
    setError(null);
    router.refresh();
  };

  // ─── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Licensing</h1>
            <p className="text-muted-foreground mt-1">Manage platform license and activation.</p>
          </div>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800 font-medium">Unable to load licensing data</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>
            Licensing
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Activate and manage your platform license.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <Dialog open={editing} onOpenChange={setEditing}>
            <DialogTrigger asChild>
              <Button>
                <Key className="h-4 w-4 mr-2" /> {license.status === 'active' ? 'Change License' : 'Activate License'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{license.status === 'active' ? 'Change License Key' : 'Activate License'}</DialogTitle>
                <DialogDescription>
                  Enter your license key to {license.status === 'active' ? 'update the platform' : 'activate the platform'}.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 py-2">
                <div className="space-y-2">
                  <Label htmlFor="licenseKey">License Key</Label>
                  <Input
                    id="licenseKey"
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={licenseKey}
                    onChange={(e) => setLicenseKey(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button onClick={handleActivate} disabled={saving}>
                  {saving ? 'Processing...' : license.status === 'active' ? 'Update' : 'Activate'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status summary */}
      <div
        className="grid gap-4"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}
      >
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 tag-green" />
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Status</p>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>{license.status}</p>
            {licenseStatusBadge(license.status)}
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" style={{ color: 'var(--muted)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Plan</p>
          </div>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--text)' }}>{license.plan}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Key: {license.keyFingerprint}</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" style={{ color: 'var(--muted)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Seats</p>
          </div>
          <p className="text-xl font-bold mt-1" style={{ color: 'var(--text)' }}>
            {license.usedSeats} / {license.seats}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>{utilizationPct}% utilized</p>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4" style={{ color: 'var(--muted)' }} />
            <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>Expires In</p>
          </div>
          <p
            className="text-xl font-bold mt-1"
            style={{
              color:
                daysLeft < 0
                  ? 'var(--danger)'
                  : daysLeft < 30
                  ? 'var(--warning)'
                  : 'var(--text)',
            }}
          >
            {daysLeft < 0 ? 'Expired' : `${daysLeft} days`}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
            {new Date(license.expiryDate).toLocaleDateString()}
          </p>
        </div>
      </div>

      <Tabs defaultValue="activation" className="w-full">
        <TabsList className="w-full grid grid-cols-3 max-w-md">
          <TabsTrigger value="activation">Activation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="activation" className="mt-6 space-y-4">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Current License</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>License Name</Label>
                  <Input value={license.name} disabled />
                </div>
                <div className="space-y-2">
                  <Label>Plan Tier</Label>
                  <Input value={license.plan} disabled />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    {licenseStatusBadge(license.status)}
                    <span className="text-xs" style={{ color: 'var(--muted)' }}>
                      Last validated: {new Date(license.lastValidatedAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Expiry</Label>
                  <Input value={new Date(license.expiryDate).toLocaleDateString()} disabled />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Key className="h-4 w-4 mr-2" /> Update License Key
              </Button>
              <Button variant="outline" disabled={license.status !== 'active'}>
                <RefreshCw className="h-4 w-4 mr-2" /> Validate Now
              </Button>
              <Button variant="outline" disabled>
                <ExternalLink className="h-4 w-4 mr-2" /> Open Vendor Portal
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-6 space-y-4">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>License Settings</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seatRequest">Max Seats</Label>
                <Input
                  id="seatRequest"
                  type="number"
                  min={1}
                  value={seatRequest}
                  onChange={(e) => setSeatRequest(e.target.value)}
                />
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  Currently in use: {license.usedSeats}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium" style={{ color: 'var(--text)' }}>Auto-renew</p>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>Automatically renew license before expiry</p>
                </div>
                <Switch checked={autoRenew} onCheckedChange={setAutoRenew} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trialDurationDays">Trial Duration (days)</Label>
                <Input
                  id="trialDurationDays"
                  type="number"
                  min={1}
                  value={trialDurationDays}
                  onChange={(e) => setTrialDurationDays(e.target.value)}
                />
              </div>
              <Button onClick={handleSaveGeneral} disabled={saving}>
                {saving ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4 animate-spin" /> Saving...
                  </span>
                ) : saved ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Saved
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4 mr-2" /> Save Settings
                  </span>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6 space-y-4">
          <div className="card p-6">
            <h3 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Validation History</h3>
            <div className="space-y-3">
              {[
                { date: license.lastValidatedAt, action: 'License validated', result: 'success' },
                { date: new Date(Date.now() - 86400000).toISOString(), action: 'Scheduled check', result: 'success' },
                { date: new Date(Date.now() - 3 * 86400000).toISOString(), action: 'Seat usage sync', result: 'success' },
              ].map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-md border p-3"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <div className="flex items-center gap-3">
                    {entry.result === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 tag-green" />
                    ) : (
                      <XCircle className="h-4 w-4 tag-red" />
                    )}
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{entry.action}</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        {new Date(entry.date).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {entry.result}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
