'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { AGENT_NAVIGATION } from '@/lib/navigation';
import { Star, ThumbsUp } from 'lucide-react';

const mockReviews = [
  { id: 'r1', client: 'John Doe', deal: 'Lekki Phase 1 Apartment', rating: 5, comment: 'Very professional and responsive.', date: '2026-07-10' },
  { id: 'r2', client: 'Mary Johnson', deal: 'Ikeja GRA Flat', rating: 4, comment: 'Good service, completed on time.', date: '2026-07-08' },
  { id: 'r3', client: 'Peter Okonkwo', deal: 'VI Duplex', rating: 5, comment: 'Exceeded expectations.', date: '2026-07-05' },
];

export default function AgentReputationPage() {
  const avg = mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length;
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? mockReviews : mockReviews.filter((r) => r.rating === Number(filter));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Reputation</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Client ratings and feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-6 text-center">
          <Star className="w-10 h-10 mx-auto mb-2 text-amber-500 fill-amber-500" />
          <p className="text-4xl font-bold" style={{ color: 'var(--text)' }}>{avg.toFixed(1)}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Average Rating ({mockReviews.length} reviews)</p>
        </div>
        <div className="card p-6">
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = mockReviews.filter((r) => r.rating === star).length;
              const pct = (count / mockReviews.length) * 100;
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-medium w-3" style={{ color: 'var(--text)' }}>{star}</span>
                  <div className="flex-1 h-2 rounded-full bg-muted/30 overflow-hidden">
                    <div className="h-2 rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs w-8 text-right" style={{ color: 'var(--muted)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3"><ThumbsUp className="w-8 h-8 text-green-500" /><div><p className="text-sm font-bold" style={{ color: 'var(--text)' }}>92%</p><p className="text-xs" style={{ color: 'var(--muted)' }}>Recommend</p></div></div>
            <div className="flex items-center gap-3"><Star className="w-8 h-8 text-amber-500" /><div><p className="text-sm font-bold" style={{ color: 'var(--text)' }}>Top 10%</p><p className="text-xs" style={{ color: 'var(--muted)' }}>On platform</p></div></div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-4 flex flex-wrap gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {['all', '5', '4', '3'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-md text-sm font-medium border transition-colors capitalize ${filter === f ? 'bg-accent/10 text-accent border-accent/30' : 'border-transparent hover:bg-muted/50'}`}>{f === 'all' ? 'All' : `${f} Stars`}</button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-body text-center py-16"><Star className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} /><h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No reviews</h3><p style={{ color: 'var(--muted)' }}>Reviews will appear here after closed deals.</p></div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map((rev) => (
              <div key={rev.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>{rev.client}</p>
                    <p className="text-xs" style={{ color: 'var(--muted)' }}>{rev.deal}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />)}
                  </div>
                </div>
                <p className="mt-2 text-sm" style={{ color: 'var(--muted)' }}>{rev.comment}</p>
                <p className="mt-1 text-xs" style={{ color: 'var(--muted)' }}>{new Date(rev.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}