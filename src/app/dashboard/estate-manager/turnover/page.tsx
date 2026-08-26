'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ErrorBoundary } from '@/components/error/ErrorBoundary';
import { ESTATE_MANAGER_NAVIGATION } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui';
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

      <ErrorBoundary>

      <div className="space-y-6">
        <div>
          <h1 className="text-white font-bold" style={{ fontSize: 'text-white', color: 'text-white' }}>Turnover</h1>
          <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500', marginTop: 'mt-1' }}>Vacate / handover checklist and inspection tracking</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4">
            <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Pending Handovers</p>
            <p className="text-2xl font-bold text-white">{queue.length}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Inspections</p>
            <p className="text-2xl font-bold text-white">{inspections.length}</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Avg Score</p>
            <p className="text-2xl font-bold text-[#00ff66]">{inspections.length > 0 ? Math.round(inspections.reduce((sum, i) => sum + i.score, 0) / inspections.length) : 0}%</p>
          </div>
          <div className="glass-card p-4">
            <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>Open Issues</p>
            <p className="text-2xl font-bold text-red-500">{queue.filter((t) => t.priority === 'high').length}</p>
          </div>
        </div>

        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white text-white font-bold" className="text-white">Inspection Queue</h3>
          </div>
          <div className="p-6">
            {queue.length === 0 ? (
              <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>No inspections in queue.</p>
            ) : (
              <div className="space-y-3">
                {queue.map((t) => (
                  <div key={t.id} className="glass-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-white">{t.title}</p>
                      <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>{t.unit} · {t.category}</p>
                    </div>
                    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', t.priority === 'high' ? 'bg-red-500/10 text-red-500 border border-white/[0.08]' : t.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-white/[0.08]' : 'bg-zinc-900 text-zinc-500 border border-white/[0.08]')}>{t.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="glass-card">
          <div className="px-6 py-5 border-b border-white/[0.08]">
            <h3 className="text-lg font-semibold text-white text-white font-bold" className="text-white">Recent Inspections</h3>
          </div>
          <div className="p-6">
            {inspections.length === 0 ? (
              <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>No inspections yet.</p>
            ) : (
              <div className="space-y-3">
                {inspections.map((ins) => (
                  <div key={ins.id} className="glass-card p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm text-white">Unit {ins.unit}</p>
                        <p className="text-xs text-xs uppercase tracking-wider" style={{ color: 'text-zinc-500' }}>{new Date(ins.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <span className={cn('inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border', ins.result === 'Passed' ? 'bg-emerald-500/10 text-[#00ff66] border border-white/[0.08]' : 'bg-amber-500/10 text-amber-400 border border-white/[0.08]')}>{ins.result}</span>
                    </div>
                    <div className="mt-3">
                      <Progress value={ins.score} className="h-2" />
                      <p className="text-xs text-xs uppercase tracking-wider mt-1 text-right" style={{ color: 'text-zinc-500' }}>{ins.score}%</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    
      </ErrorBoundary>
</DashboardShell>
  );
}
