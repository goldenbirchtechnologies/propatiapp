'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { LANDLORD_NAVIGATION } from '@/lib/navigation';
import { Plus, Home, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const PROPERTY_TYPES = ['Residential', 'Commercial', 'Short Let', 'Share'];
const AREAS = ['Lekki', 'Victoria Island', 'Ikeja GRA', 'Yaba', 'Surulere', 'Banana Island', 'Ajah', 'Gbagada'];

export default function AddListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'Residential',
    area: 'Lekki',
    price: '',
    address: '',
    bedrooms: '1',
    bathrooms: '1',
   Parking: '1',
    isVerified: false,
  });
  const [step, setStep] = useState(1);

  const update = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName="Landlord" userAvatar={undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>
            Add New Listing
          </h1>
          <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>
            Create a verified property listing and reach thousands of verified tenants
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${s <= step ? 'bg-accent text-white' : 'bg-muted/20 text-muted'}`}>
                {s}
              </div>
              <span className="text-sm font-medium hidden sm:inline" style={{ color: s <= step ? 'var(--text)' : 'var(--muted)' }}>
                {s === 1 ? 'Details' : s === 2 ? 'Media' : 'Review'}
              </span>
              {s < 3 && <div className="h-px w-8 bg-border" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-6">
              <h2 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Property Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="e.g., Modern 3-Bed Apartment in Lekki"
                    className="inp-field w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="Describe the property, amenities, and neighbourhood..."
                    rows={4}
                    className="inp-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Property Type</label>
                  <select className="inp-field w-full" value={form.type} onChange={(e) => update('type', e.target.value)}>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Area</label>
                  <select className="inp-field w-full" value={form.area} onChange={(e) => update('area', e.target.value)}>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Price (₦/year)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="e.g., 2500000"
                    className="inp-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Address</label>
                  <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Full street address" className="inp-field w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className="inp-field w-full" min={1} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className="inp-field w-full" min={1} />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="card p-6">
              <h2 className="font-heading font-bold mb-4" style={{ color: 'var(--text)' }}>Photos & Documents</h2>
              <div className="border-2 border-dashed rounded-xl p-8 text-center" style={{ borderColor: 'var(--border)' }}>
                <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--muted)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Click to upload or drag and drop</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>SVG, PNG, JPG or PDF (max. 10MB)</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="font-heading font-bold mb-3" style={{ color: 'var(--text)' }}>Listing Tips</h3>
              <ul className="space-y-3 text-sm" style={{ color: 'var(--muted)' }}>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-green-500" /> Add at least 5 high-quality photos</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-green-500" /> Include exact location and landmarks</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-green-500" /> State utilities, security, and features</li>
                <li className="flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5 text-amber-500" /> Avoid misleading price or photos</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={() => router.back()} className="btn btn-outline flex-1">Cancel</button>
              <button onClick={() => setStep((s) => Math.min(3, s + 1))} className="btn btn-primary flex-1">Continue</button>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}