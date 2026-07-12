'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AlertTriangle, Wrench } from 'lucide-react';

type Ticket = {
  id: string;
  title: string;
  status: string;
  priority: string;
  unit: string;
  category: string;
};

export default function EstateManagerTurnoverPage() {
  const [queue] = useState<Ticket[]>([
    { id: '1', title: 'Unit A-101: Paint Touch-ups', status: 'open', priority: 'low', unit: 'A-101', category: 'Cosmetics' },
    { id: '2', title: 'Unit B-204: HVAC Filter Replacement', status: 'open', priority: 'medium', unit: 'B-204', category: 'HVAC' },
    { id: '3', title: 'Unit C-301: Plumbing Leak', status: 'in_progress', priority: 'high', unit: 'C-301', category: 'Plumbing' },
  ]);

  const inspections = [
    { id: '1', unit: 'A-101', result: 'Passed', score: 92, date: '2024-08-10' },
    { id: '2', unit: 'B-204', result: 'Conditional', score: 78, date: '2024-08-09' },
  ];

  return (
    <DashboardShell navigation={ESTATE_MANAGER_NAVIGATION} userRole="estate_manager" userName="Estate Manager" userAvatar={undefined}>
      <div className="space-y-6">
        <div>
          <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-primary' }}>Turnover</h1>
          <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant', marginTop: 'mt-1' }}>Vacate / handover checklist and inspection tracking</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Pending Handovers</p>
            <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{queue.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Inspections</p>
            <p className="text-2xl font-bold" style={{ color: 'text-primary' }}>{inspections.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Avg Score</p>
            <p className="text-2xl font-bold text-success">{inspections.length > 0 ? Math.round(inspections.reduce((sum, i) => sum + i.score, 0) / inspections.length) : 0}%</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>Open Issues</p>
            <p className="text-2xl font-bold text-destructive">{queue.filter((t) => t.priority === 'high').length}</p>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline-sm font-bold" style={{ color: 'text-primary' }}>Inspection Queue</CardTitle>
          </CardHeader>
          <CardContent>
            {queue.length === 0 ? (
              <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>No inspections in queue.</p>
            ) : (
              <div className="space-y-3">
                {queue.map((t) => (
                  <div key={t.id} className="card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'text-primary' }}>{t.title}</p>
                      <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>{t.unit} · {t.category}</p>
                    </div>
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', t.priority === 'high' ? 'bg-destructive/10 text-destructive border border-outline-variant' : t.priority === 'medium' ? 'bg-warning/10 text-warning border border-outline-variant' : 'bg-muted text-on-surface-variant border border-outline-variant')}>{t.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-headline-sm font-bold" style={{ color: 'text-primary' }}>Recent Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            {inspections.length === 0 ? (
              <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>No inspections yet.</p>
            ) : (
              <div className="space-y-3">
                {inspections.map((ins) => (
                  <div key={ins.id} className="card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm" style={{ color: 'text-primary' }}>Unit {ins.unit}</p>
                        <p className="text-xs font-label-md uppercase tracking-wider" style={{ color: 'text-on-surface-variant' }}>{new Date(ins.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', ins.result === 'Passed' ? 'bg-success/10 text-success border border-outline-variant' : 'bg-warning/10 text-warning border border-outline-variant')}>{ins.result}</span>
                    </div>
                    <div className="mt-3">
                      <Progress value={ins.score} className="h-2" />
                      <p className="text-xs font-label-md uppercase tracking-wider mt-1 text-right" style={{ color: 'text-on-surface-variant' }}>{ins.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
