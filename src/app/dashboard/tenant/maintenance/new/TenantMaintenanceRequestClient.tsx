'use client';

import { useState } from 'react';
import {
  ChevronRight, AlertCircle, Phone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';

type Step = 1 | 2;

const categories = ['Plumbing', 'Electrical', 'HVAC (AC/Heating)', 'General Repair'];
const urgencies = ['Low', 'Standard', 'Urgent', 'Emergency'];
const timeSlots = ['Morning (8 AM - 12 PM)', 'Afternoon (12 PM - 4 PM)', 'Evening (4 PM - 7 PM)'];

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps: { num: number; label: string }[] = [
    { num: 1, label: 'Issue Details' },
    { num: 2, label: 'Photos & Timing' },
  ];
  return (
    <div className="space-y-3">
      {steps.map((s) => (
        <div
          key={s.num}
          className={`flex items-center gap-3 ${s.num > currentStep ? 'opacity-40' : ''}`}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            s.num === currentStep ? 'bg-primary text-foreground' : s.num < currentStep ? 'bg-success text-foreground' : 'bg-surface-container-low text-on-surface-variant border border-border'
          }`}>
            {s.num < currentStep ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : s.num}
          </div>
          <span className={`text-sm font-semibold ${s.num === currentStep ? 'text-primary' : 'text-on-surface-variant'}`}>{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function TenantMaintenanceRequestClient({ ticketId }: { ticketId?: string }) {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState('');
  const [urgency, setUrgency] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  return (
    <div className="space-y-0">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <span className="bg-warning text-foreground text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                  PROPATI Verified
                </span>
              </div>
              <h1 className="font-heading text-2xl font-bold text-primary mb-2">New Maintenance Request</h1>
              <p className="text-sm text-on-surface-variant">
                Provide the details of your issue and we&apos;ll connect you with a certified technician from our verified network.
              </p>
              <div className="mt-6">
                <StepIndicator currentStep={step} />
              </div>
            </CardContent>
          </Card>
          <Card className="hidden lg:block">
            <CardContent className="p-6">
              <h3 className="font-heading text-base font-semibold text-primary mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-warning" /> Emergency Protocol
              </h3>
              <p className="text-sm text-on-surface-variant mb-4">
                For life-threatening emergencies, fire, or severe flooding, please call the local emergency services immediately before filing a report.
              </p>
              <Button variant="destructive" className="w-full flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> Emergency Hotline
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Form */}
        <div className="lg:col-span-8">
          <Card>
            <CardContent className="p-6 md:p-8">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="font-bold text-primary text-sm">Issue Category</Label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-surface-container-lowest appearance-none text-sm"
                      >
                        <option value="">Select Category</option>
                        {categories.map((c) => (
                          <option key={c} value={c.toLowerCase()}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="font-bold text-primary text-sm">Urgency Level</Label>
                      <div className="flex flex-wrap gap-2">
                        {urgencies.map((u) => (
                          <button
                            key={u}
                            type="button"
                            onClick={() => setUrgency(u.toLowerCase())}
                            className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all ${
                              urgency === u.toLowerCase()
                                ? u === 'emergency'
                                  ? 'bg-destructive text-foreground border-destructive'
                                  : 'bg-primary text-foreground border-primary'
                                : 'border-border hover:border-primary text-on-surface-variant'
                            }`}
                          >
                            {u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-primary text-sm">Description of the issue</Label>
                    <Textarea
                      placeholder="Tell us what happened... e.g., 'The kitchen faucet is leaking from the base and causing water damage to the cabinet.'"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[160px] resize-none"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!category || !urgency || !description.trim()}
                      className="flex items-center gap-2"
                    >
                      Continue <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-primary text-sm">Upload Photos</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-surface-container-low/30 transition-all cursor-pointer group">
                      <svg className="w-12 h-12 text-on-surface-variant group-hover:text-primary mb-3 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M18.75 21H5.25A2.25 2.25 0 013 18.75V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21z" /></svg>
                      <h4 className="font-bold text-primary mb-1">Drag and drop or click to upload</h4>
                      <p className="text-sm text-on-surface-variant">High-resolution photos help our technicians diagnose the issue faster (Max 5 photos, 10MB each)</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="font-bold text-primary text-sm">Preferred Availability</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-11" />
                      <select
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-border bg-surface-container-lowest appearance-none text-sm"
                      >
                        <option value="">Any Time</option>
                        {timeSlots.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                    <Button className="flex items-center gap-2">
                      Submit Request <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips bento - shown on step 1 */}
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {[
                { icon: '✓', color: 'bg-success text-success', title: 'Certified Techs', desc: 'All our technicians are background-checked and certified.' },
                { icon: '⏱', color: 'bg-surface-container-low text-primary', title: 'Fast Response', desc: 'Requests are usually acknowledged within 2 hours.' },
                { icon: '📋', color: 'bg-warning/10 text-warning', title: 'Track Progress', desc: 'Real-time tracking of your technician\'s arrival time.' },
              ].map((tip, i) => (
                <Card key={i}>
                  <CardContent className="p-5 flex flex-col items-center text-center">
                    <span className="text-2xl mb-2">{tip.icon}</span>
                    <p className="text-xs font-mono font-bold uppercase tracking-tighter text-primary">{tip.title}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{tip.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
