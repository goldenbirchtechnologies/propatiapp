'use client';

import { Star } from 'lucide-react';

type Review = {
  id: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
};

export default function AgentReputationClient({ initialReviews }: { initialReviews: Review[] }) {
  const avgRating = initialReviews.length > 0 ? initialReviews.reduce((sum, r) => sum + r.rating, 0) / initialReviews.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Reputation</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Client reviews and ratings</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl font-bold" style={{ color: 'var(--text)' }}>{avgRating.toFixed(1)}</div>
          <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-6 h-6 ${i < Math.round(avgRating) ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />)}</div>
          <span className="text-sm" style={{ color: 'var(--muted)' }}>{initialReviews.length} reviews</span>
        </div>
      </div>

      {initialReviews.length === 0 ? (
        <div className="card-body text-center py-16">
          <Star className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
          <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No reviews yet</h3>
          <p style={{ color: 'var(--muted)' }}>Reviews from completed deals will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {initialReviews.map((r) => (
            <div key={r.id} className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium" style={{ color: 'var(--text)' }}>{r.author}</p>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex gap-1 mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />)}</div>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
