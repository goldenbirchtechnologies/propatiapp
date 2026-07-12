'use client';

import { useState } from 'react';
import { User, Camera, Save, Star } from 'lucide-react';

export default function RealtorProfilePage() {
  const [form, setForm] = useState({
    fullName: 'Realtor Name',
    email: 'realtor@propati.ng',
    phone: '0803 456 7890',
    bio: 'Experienced realtor specializing in residential and commercial properties in Lagos.',
    license: 'REA/2024/001',
    agency: 'Propati Estates',
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading font-bold" style={{ fontSize: 'var(--text-page-title)', color: 'var(--text)' }}>My Profile</h1>
        <p style={{ color: 'var(--muted)', marginTop: 'var(--space-vs)' }}>Professional information and settings</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Full Name</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="inp-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="inp-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="inp-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Agency</label>
              <input
                type="text"
                value={form.agency}
                onChange={(e) => setForm({ ...form, agency: e.target.value })}
                className="inp-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>License No.</label>
              <input
                type="text"
                value={form.license}
                onChange={(e) => setForm({ ...form, license: e.target.value })}
                className="inp-field w-full"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text)' }}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                className="inp-field w-full"
                rows={3}
              />
            </div>
          </div>
        </div>
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="relative">
            <div
              className="h-24 w-24 rounded-full flex items-center justify-center"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              <User className="w-10 h-10" />
            </div>
            <button
              className="absolute bottom-0 right-0 p-2 rounded-full border border-border bg-surface-container-lowest"
              style={{ borderColor: 'var(--border)' }}
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-4 font-medium" style={{ color: 'var(--text)' }}>{form.fullName}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>Realtor since 2026</p>
          <div className="flex items-center gap-1 mt-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span className="text-sm font-bold" style={{ color: 'var(--text)' }}>4.9</span>
          </div>
          <button className="btn btn-primary mt-4 w-full inline-flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
