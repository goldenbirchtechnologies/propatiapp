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

  const update = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <DashboardShell navigation={LANDLORD_NAVIGATION} userRole="landlord" userName="Landlord" userAvatar={undefined}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-headline-sm text-headline-sm text-primary">
            Add New Listing
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Create a verified property listing and reach thousands of verified tenants
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${s <= step ? 'bg-accent text-white' : 'bg-surface-container-high/20 text-on-surface-variant'}`}>
                {s}
              </div>
              <span className="text-sm font-medium hidden sm:inline text-primary">
                {s === 1 ? 'Details' : s === 2 ? 'Media' : 'Review'}
              </span>
              {s < 3 && <div className="h-px w-8 bg-outline-variant" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-4">Property Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Property Title</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => update('title', e.target.value)}
                    placeholder="e.g., Modern 3-Bed Apartment in Lekki"
                    className="inp-field w-full"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update('description', e.target.value)}
                    placeholder="Describe the property, amenities, and neighbourhood..."
                    rows={4}
                    className="inp-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Property Type</label>
                  <select className="inp-field w-full" value={form.type} onChange={(e) => update('type', e.target.value)}>
                    {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Area</label>
                  <select className="inp-field w-full" value={form.area} onChange={(e) => update('area', e.target.value)}>
                    {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Price (₦/year)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => update('price', e.target.value)}
                    placeholder="e.g., 2500000"
                    className="inp-field w-full"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Address</label>
                  <input type="text" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="Full street address" className="inp-field w-full" />
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Bedrooms</label>
                  <input type="number" value={form.bedrooms} onChange={(e) => update('bedrooms', e.target.value)} className="inp-field w-full" min={1} />
                </div>
                <div>
                  <label className="block text-[10px] font-label-md uppercase tracking-wider text-on-surface-variant mb-1">Bathrooms</label>
                  <input type="number" value={form.bathrooms} onChange={(e) => update('bathrooms', e.target.value)} className="inp-field w-full" min={1} />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="font-headline-sm text-headline-sm text-primary mb-4">Photos & Documents</h2>
              <div className="border-2 border-dashed border-outline-variant rounded-xl p-8 text-center">
                <Upload className="w-10 h-10 mx-auto mb-3 text-on-surface-variant" />
                <p className="text-sm font-medium text-primary">Click to upload or drag and drop</p>
                <p className="text-xs mt-1 text-on-surface-variant">SVG, PNG, JPG or PDF (max. 10MB)</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-3">Listing Tips</h3>
              <ul className="space-y-3 text-sm text-on-surface-variant">
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-success" /> Add at least 5 high-quality photos</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-success" /> Include exact location and landmarks</li>
                <li className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-success" /> State utilities, security, and features</li>
                <li className="flex items-start gap-2"><AlertCircle className="w-4 h-4 mt-0.5 text-warning" /> Avoid misleading price or photos</li>
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
