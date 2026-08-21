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
        <h1 className="font-headline-sm font-bold" style={{ fontSize: 'font-headline-sm', color: 'text-white' }}>Reputation</h1>
        <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400", marginTop: 'mt-1' }}>Client reviews and ratings</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="text-headline-sm font-bold" className="text-white" }}>{avgRating.toFixed(1)}</div>
          <div className="flex gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-6 h-6 ${i < Math.round(avgRating) ? 'fill-neutral-300 text-neutral-300' : 'text-neutral-400'}`} />)}</div>
          <span className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>{initialReviews.length} reviews</span>
        </div>
      </div>

      {initialReviews.length === 0 ? (
        <div className="card-body text-center py-16">
          <Star className="w-16 h-16 mx-auto mb-4" className="text-neutral-400", opacity: 0.5 }} />
          <h3 className="font-headline-sm font-bold text-lg mb-2" className="text-white" }}>No reviews yet</h3>
          <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>Reviews from completed deals will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {initialReviews.map((r) => (
            <div key={r.id} className="card p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium" className="text-white" }}>{r.author}</p>
                <span className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>{new Date(r.date).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="flex gap-1 mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-neutral-300 text-neutral-300' : 'text-neutral-400'}`} />)}</div>
              <p className="text-xs font-label-md uppercase tracking-wider" className="text-neutral-400" }}>{r.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
