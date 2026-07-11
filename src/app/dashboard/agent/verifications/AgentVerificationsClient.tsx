'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  CheckCircle,
  Clock,
  History,
  ArrowRight,
} from 'lucide-react';

type VerificationModule = {
  id: string;
  title: string;
  icon: string;
  description: string;
  status: 'verified' | 'pending' | 'not-started';
  actionLabel?: string;
};

type ActivityItem = {
  title: string;
  description: string;
  timestamp: string;
  icon: string;
};

const modules: VerificationModule[] = [
  {
    id: 'identity',
    title: 'Identity & Biometrics',
    icon: 'fingerprint',
    description: 'NIN and facial recognition biometric data have been successfully cross-referenced.',
    status: 'verified',
  },
  {
    id: 'license',
    title: 'Professional Licensing',
    icon: 'gavel',
    description: 'Estate Agent Registry (EAR) certificate #88120 is currently undergoing verification.',
    status: 'pending',
    actionLabel: 'Check Status',
  },
  {
    id: 'office',
    title: 'Office Verification',
    icon: 'storefront',
    description: 'Provide business premises address and ownership documents to proceed.',
    status: 'not-started',
    actionLabel: 'Start Process',
  },
];

const recentActivity: ActivityItem[] = [
  {
    title: 'EAR License Uploaded',
    description: 'Document EAR-88120-NIG submitted for review.',
    timestamp: 'Oct 24, 2024 • 14:32',
    icon: 'upload_file',
  },
  {
    title: 'Identity Verified',
    description: 'NIN Biometric match confirmed via NIMC gateway.',
    timestamp: 'Oct 22, 2024 • 09:15',
    icon: 'check',
  },
  {
    title: 'Account Created',
    description: 'New Agent Onboarding initiated.',
    timestamp: 'Oct 21, 2024 • 16:45',
    icon: 'person_add',
  },
];

const statusBadge = (status: VerificationModule['status']) => {
  switch (status) {
    case 'verified':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 text-xs font-bold">
          <CheckCircle className="h-3 w-3" /> Verified
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
          <Clock className="h-3 w-3" /> Pending Review
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-xs font-bold">
          Not Started
        </span>
      );
  }
};

export default function AgentVerificationsClient() {
  const [progress] = useState(60);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold">Verification Overview</h1>
        <p className="mt-2 text-muted-foreground">
          Complete your profile to unlock premium marketplace listings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Progress + Stepper */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="relative overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Verification Status</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Track your onboarding completion.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-bold">{progress}%</span>
                  <p className="text-xs uppercase tracking-tighter text-muted-foreground">
                    Profile Progress
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Progress value={progress} className="h-4" />
              <div className="grid grid-cols-5 gap-2">
                {['Identity', 'License', 'Office', 'Inspection', 'Clearance'].map(
                  (step, idx) => (
                    <div key={step} className="flex flex-col items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          idx < 2
                            ? 'bg-green-600 text-white'
                            : idx === 2
                              ? 'bg-amber-500 text-white'
                              : 'opacity-40 bg-gray-200 text-gray-500'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {idx < 2 ? 'check' : idx === 2 ? 'pending' : 'location_on'}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold uppercase text-center text-muted-foreground">
                        {step}
                      </span>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Modules Bento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {modules.map((mod) => (
              <Card
                key={mod.id}
                className={`flex flex-col transition-all hover:shadow-md ${
                  mod.status === 'not-started'
                    ? 'border-dashed border-2'
                    : mod.status === 'pending'
                      ? 'border-l-4 border-amber-400'
                      : ''
                }`}
              >
                <CardContent className="p-5 flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-muted rounded-lg">
                      <span className="material-symbols-outlined text-primary">
                        {mod.icon}
                      </span>
                    </div>
                    {statusBadge(mod.status)}
                  </div>
                  <h4 className="font-bold text-lg mb-2">{mod.title}</h4>
                  <p className="text-sm text-muted-foreground flex-1">{mod.description}</p>
                  {mod.actionLabel && (
                    <div className="mt-4">
                      <Button variant={mod.status === 'not-started' ? 'default' : 'outline'} className="gap-2">
                        {mod.status === 'not-started' ? 'Start Process' : 'Check Status'}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {mod.status === 'verified' && (
                    <div className="mt-4 flex items-center text-sm font-bold text-primary">
                      View Details <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-primary text-primary-foreground">
            <CardHeader>
              <CardTitle className="text-amber-300">Next Priority Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="opacity-90">
                Upload your Office Verification documents to schedule your mandatory physical site inspection.
              </p>
              <Button className="w-full bg-amber-500 text-primary font-bold hover:brightness-110">
                Complete Office Verification
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6 relative">
                <div className="absolute left-4 top-2 bottom-2 w-[1px] bg-border" />
                {recentActivity.map((item, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="z-10 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-sm">{item.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-sm">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <span className="text-[10px] text-muted-foreground/60">{item.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-6">
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
