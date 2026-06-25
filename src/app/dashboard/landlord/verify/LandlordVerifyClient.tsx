'use client';

import { Shield, FileText, CheckCircle, Clock } from 'lucide-react';

type Verification = {
  id: string;
  listing: { title: string; address: string };
  currentLayer: number;
  status: string;
};

export default function LandlordVerifyClient({ initialVerifications }: { initialVerifications: Verification[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>Verifications</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Track 5-layer property verification</p>
      </div>

      {initialVerifications.length === 0 ? (
        <div className="card-body text-center py-16">
          <Shield className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)', opacity: 0.5 }} />
          <h3 className="font-heading font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>No verifications</h3>
          <p style={{ color: 'var(--muted)' }}>Start a verification for your listings.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {initialVerifications.map((v) => (
            <div key={v.id} className="card p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-medium" style={{ color: 'var(--text)' }}>{v.listing?.title || 'Unknown'}</h3>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{v.listing?.address}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs" style={{ color: 'var(--green)' }}><CheckCircle className="w-3 h-3" /> Layer {v.currentLayer}</span>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>ID: {v.id.slice(-8).toUpperCase()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
