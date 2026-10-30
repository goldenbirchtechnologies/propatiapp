'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle, FileText, Siren } from 'lucide-react';
import type { SafetyDisclosures } from '../types';

export interface Step14Props {
  value?: Partial<SafetyDisclosures>;
  onChange: (value: Partial<SafetyDisclosures>) => void;
}

const ITEMS: { key: keyof SafetyDisclosures; label: string; description: string; policyLink?: string }[] = [
  {
    key: 'exterior_security_camera_present',
    label: 'Exterior security cameras present',
    description: 'Security cameras are installed outside the property for safety.',
    policyLink: '#',
  },
  {
    key: 'noise_decibel_monitor_present',
    label: 'Noise decibel monitor present',
    description: 'A noise level monitor is installed to enforce quiet hours.',
    policyLink: '#',
  },
  {
    key: 'weapons_on_property',
    label: 'Weapons on property',
    description: 'There are weapons on the property that guests may encounter.',
    policyLink: '#',
  },
];

export default function Step14Safety({ value, onChange }: Step14Props) {
  const [exteriorCamera, setExteriorCamera] = useState(value?.exterior_security_camera_present ?? false);
  const [noiseMonitor, setNoiseMonitor] = useState(value?.noise_decibel_monitor_present ?? false);
  const [weapons, setWeapons] = useState(value?.weapons_on_property ?? false);

  const sync = (ec: boolean, nm: boolean, w: boolean) => {
    onChange({
      exterior_security_camera_present: ec,
      noise_decibel_monitor_present: nm,
      weapons_on_property: w,
    });
  };

  const getVal = (key: keyof SafetyDisclosures) =>
    key === 'exterior_security_camera_present' ? exteriorCamera
    : key === 'noise_decibel_monitor_present' ? noiseMonitor
    : weapons;

  const setVal = (key: keyof SafetyDisclosures, v: boolean) => {
    if (key === 'exterior_security_camera_present') { setExteriorCamera(v); sync(v, noiseMonitor, weapons); }
    else if (key === 'noise_decibel_monitor_present') { setNoiseMonitor(v); sync(exteriorCamera, v, weapons); }
    else { setWeapons(v); sync(exteriorCamera, noiseMonitor, v); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-primary dark:text-[#4edea3]">Step 14 / Safety Protocols & Audit</span>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Fire Safety, Life Protection & Statutory Verification</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Affirm compliance with Lagos State Safety Commission (LSSC) high-rise directives.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Mandatory Life Safety Equipment</span>
            <div className="flex flex-col gap-3">
              {[
                { icon: 'detector_smoke' as const, title: 'Integrated Optical Smoke Detectors', desc: 'Installed in all bedrooms, kitchen, and common corridors.', badge: 'INSTALLED' },
                { icon: 'fire_extinguisher' as const, title: 'Dry Chemical & CO2 Fire Extinguishers', desc: 'Inspected & recertified by Lagos State Fire Service January 2025.', badge: 'INSPECTED JAN 2025' },
                { icon: 'medical_services' as const, title: 'Commercial Trauma First Aid Station', desc: 'Wall-mounted medical supply box in service entrance lobby.', badge: 'VERIFIED' },
                { icon: 'videocam' as const, title: 'Common Area High-Definition CCTV', desc: 'Perimeter, lift foyer & basement car parks with 60-day cloud recording.', badge: 'ACTIVE 24/7' },
              ].map((item) => (
                <div key={item.title} className="p-4 bg-zinc-50 dark:bg-white/[0.04] rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Siren className="size-4" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-zinc-900 dark:text-white">{item.title}</div>
                      <div className="text-xs text-zinc-600 dark:text-zinc-400">{item.desc}</div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded bg-primary/10 text-primary font-semibold">{item.badge}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-4">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">24/7 Institutional Emergency Dispatch Contact</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">FACILITY DESK MOBILE</Label>
                <Input defaultValue="+234 803 555 0192" className="bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]" />
              </div>
              <div>
                <Label className="text-xs text-zinc-600 dark:text-zinc-400 block mb-1">DISPATCH ESCALATION OFFICER</Label>
                <Input defaultValue="Engr. Babatunde Sanusi" className="bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]" />
              </div>
            </div>
          </div>

          <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Safety disclosures</span>
            {ITEMS.map((item) => {
              const checked = getVal(item.key);
              return (
                <div key={item.key} className="flex items-start gap-3 border-b border-zinc-200 dark:border-white/[0.08] last:border-b-0 pb-3 last:pb-0">
                  <Checkbox
                    id={item.key}
                    checked={checked}
                    onCheckedChange={(c) => setVal(item.key, Boolean(c))}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={item.key} className="text-sm font-medium text-zinc-900 dark:text-white flex items-center gap-1">
                        {item.label}
                        {item.key === 'weapons_on_property' && (
                          <AlertTriangle className="size-4 text-amber-500" />
                        )}
                      </Label>
                      {item.policyLink && (
                        <a href={item.policyLink} className="text-xs text-primary flex items-center gap-1">
                          <FileText className="size-3" /> Policy
                        </a>
                      )}
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-zinc-50 dark:bg-white/[0.04] border border-dashed border-zinc-200 dark:border-white/[0.08] rounded-xl">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              You are required to keep this information accurate. Review your local safety regulations before submitting.
            </p>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="p-5 bg-primary/10 border border-primary/20 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="size-5 text-primary" />
              <span className="text-sm font-semibold text-zinc-900 dark:text-white">Institutional Landlord Attestation</span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              I, Chief Olawale Adeleke, certify under penalty of perjury that this asset possesses clean and unencumbered title, fulfills the Lagos Tenancy Act 2011 habitability covenants, and all stated amenities are in operational order.
            </p>
            <div className="p-3 bg-white dark:bg-zinc-900 rounded-lg flex items-center justify-between">
              <span className="text-xs text-zinc-400">DIGITAL CAC HASH</span>
              <span className="font-mono text-xs text-primary font-bold">SHA256: 9e01...b28a</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): Partial<SafetyDisclosures> {
  return {};
}