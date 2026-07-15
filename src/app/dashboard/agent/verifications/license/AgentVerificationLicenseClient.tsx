'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
import MaterialIcon from '@/components/icons/material-icon';

  FileUp,
  FileText,
  CheckCircle,
  Hourglass,
  Lock,
  X,
  Download,

} from 'lucide-react';

type Submission = {
  id: string;
  licenseType: string;
  submittedAt: string;
  refId: string;
  status: 'verified' | 'under-review' | 'rejected';
};

const initialSubmissions: Submission[] = [
  {
    id: '1',
    licenseType: 'EAR Registry 2023',
    submittedAt: 'Oct 24, 2023',
    refId: '#REF-9201',
    status: 'under-review',
  },
  {
    id: '2',
    licenseType: 'LASRERA Card (Front)',
    submittedAt: 'Sep 15, 2023',
    refId: '#REF-1102',
    status: 'verified',
  },
  {
    id: '3',
    licenseType: 'NIESV Certificate',
    submittedAt: 'Aug 02, 2023',
    refId: '#REF-0482',
    status: 'rejected',
  },
];

const licenseTypes = [
  'Estate Agent Registry (EAR)',
  'NIESV Membership Certificate',
  'ESVARBON Registration',
  'Lagos State Real Estate Regulatory Authority (LASRERA)',
];

export default function AgentVerificationLicenseClient() {
  const [licenseType, setLicenseType] = useState(licenseTypes[0]);
  const [licenseNumber, setLicenseNumber] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [submissions] = useState<Submission[]>(initialSubmissions);

  const statusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'verified':
        return (
          <span className="px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20">
            Verified
          </span>
        );
      case 'under-review':
        return (
          <span className="px-3 py-1 rounded-full bg-warning/10 text-warning border border-warning/20 text-xs font-bold">
            Under Review
          </span>
          );
          default:
          return (
            <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20 text-xs font-bold">
              Rejected
            </span>
          );
          }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Professional License</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          To ensure the integrity of our marketplace, all agents must provide valid regulatory documentation.
          Verified agents receive a &apos;Certified&apos; badge on all listings.
        </p>
      </div>

      {/* Header Status */}
      <Card className="bg-muted/50 border border-border">
        <CardContent className="p-4 flex flex-wrap items-center gap-6">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Current Status
            </span>
            <span className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Under Review
            </span>
          </div>
          <div className="h-10 w-[1px] bg-border" />
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              Last Update
            </span>
            <span className="font-bold">Oct 24, 2023</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form & Upload */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <CardTitle>License Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Type</label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    className="w-full h-11 bg-background border border-input rounded-lg px-3 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  >
                    {licenseTypes.map((lt) => (
                      <option key={lt}>{lt}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">License Number</label>
                  <input
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full h-11 bg-background border border-input rounded-lg px-3 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    placeholder="e.g. EAR/2023/8892"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Issuing Authority</label>
                  <input
                    value={issuingAuthority}
                    onChange={(e) => setIssuingAuthority(e.target.value)}
                    className="w-full h-11 bg-background border border-input rounded-lg px-3 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                    placeholder="e.g. EAR Council of Nigeria"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full h-11 bg-background border border-input rounded-lg px-3 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <CardTitle>File Upload</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <label
                htmlFor="license-upload"
                className="relative flex flex-col items-center justify-center border-2 border-dashed border-input rounded-xl p-10 cursor-pointer hover:border-primary hover:bg-muted/30 transition-all"
              >
                <input id="license-upload" type="file" accept=".pdf,.png,.jpg,.jpeg" className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <FileUp className="h-8 w-8 text-primary" />
                </div>
                <p className="font-bold text-lg mb-1">Drag & drop your certificate</p>
                <p className="text-sm text-muted-foreground text-center">
                  Support for PDF, PNG, or JPEG. Maximum file size 5MB.
                </p>
                <Button variant="outline" className="mt-4">
                  Browse Files
                </Button>
              </label>

              <div className="flex justify-end gap-4">
                <Button variant="outline">Save Draft</Button>
                <Button className="shadow-lg hover:-translate-y-1 transition-transform">
                  Submit for Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guidance */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <CardTitle className="text-success-bright">Verification Tips</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-4">
                {[
                  'Clear Legibility: Ensure all text, seal stamps, and signatures are clearly visible without glare.',
                  'No Expiration: The license must be valid for at least 3 months from today\'s date.',
                  'Full Document: Upload the full page. Cropped photos of just the badge/logo will be rejected.',
                ].map((tip, idx) => (
                  <li key={idx} className="flex gap-3">
                    <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 shrink-0" />
                    <p className="text-sm opacity-90" dangerouslySetInnerHTML={{ __html: tip }} />
                  </li>
                ))}
              </ul>
              <div className="p-3 bg-surface-container-lowest/10 rounded-lg border border-white/10">
                <p className="text-xs italic opacity-70">
                  Verification typically takes 24-48 business hours. You&apos;ll receive a push notification once approved.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Process Journey</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-muted" />
                {[
                  { label: 'Upload Document', sub: 'Completed Oct 12', status: 'done' },
                  { label: 'Authority Review', sub: 'In progress', status: 'pending' },
                  { label: 'Certified Badge Issued', sub: 'Pending review', status: 'locked' },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative z-10">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-background ${
                        step.status === 'done'
                          ? 'bg-green-600 text-white'
                          : step.status === 'pending'
                            ? 'bg-primary text-primary-foreground animate-pulse'
                            : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <MaterialIcon name={step.status} className="material-symbols-outlined" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submission History */}
      <Card>
        <CardHeader className="pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Submission History</CardTitle>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" /> Export Log
          </Button>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground">
                <th className="px-4 py-3 text-xs uppercase tracking-wider">License Type</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider">Submitted</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider">Reference ID</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {submissions.map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-primary/5 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium text-sm">{s.licenseType}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">{s.submittedAt}</td>
                  <td className="px-4 py-4 text-sm font-mono">{s.refId}</td>
                  <td className="px-4 py-4">{statusBadge(s.status)}</td>
                  <td className="px-4 py-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        s.status === 'rejected'
                          ? 'text-red-600 hover:underline'
                          : 'text-primary'
                      )}
                    >
                      {s.status === 'rejected' ? 'Fix & Re-upload' : <FileText className="h-4 w-4" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
