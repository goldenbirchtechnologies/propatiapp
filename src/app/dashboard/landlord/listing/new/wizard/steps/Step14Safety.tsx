'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import type { SafetyDisclosures } from '../types';

export interface Step14Props {
  value?: Partial<SafetyDisclosures>;
  onChange: (value: Partial<SafetyDisclosures>) => void;
}

const ITEMS: { key: keyof SafetyDisclosures; label: string; description: string; link?: string }[] = [
  {
    key: 'exterior_security_camera_present',
    label: 'Exterior security cameras present',
    description: 'Security cameras are installed outside the property for safety.',
  },
  {
    key: 'noise_decibel_monitor_present',
    label: 'Noise decibel monitor present',
    description: 'A noise level monitor is installed to enforce quiet hours.',
  },
  {
    key: 'weapons_on_property',
    label: 'Weapons on property',
    description: 'There are weapons on the property that guests may encounter.',
  },
];

export default function Step14Safety({ value, onChange }: Step14Props) {
  const [exteriorCamera, setExteriorCamera] = useState(value?.exterior_security_camera_present ?? false);
  const [noiseMonitor, setNoiseMonitor] = useState(value?.noise_decibel_monitor_present ?? false);
  const [weapons, setWeapons] = useState(value?.weapons_on_property ?? false);

  useEffect(() => {
    onChange({
      exterior_security_camera_present: exteriorCamera,
      noise_decibel_monitor_present: noiseMonitor,
      weapons_on_property: weapons,
    });
  }, [exteriorCamera, noiseMonitor, weapons, onChange]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Safety details and legal disclosures</h2>
        <Shield className="size-5 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">Please disclose any safety features or hazards on your property.</p>

      <Card className="p-4 space-y-4">
        {ITEMS.map((item) => {
          const checked = item.key === 'exterior_security_camera_present' ? exteriorCamera
            : item.key === 'noise_decibel_monitor_present' ? noiseMonitor
            : weapons;
          const setter = item.key === 'exterior_security_camera_present' ? setExteriorCamera
            : item.key === 'noise_decibel_monitor_present' ? setNoiseMonitor
            : setWeapons;

          return (
            <div key={item.key} className="flex items-start gap-3 border-b last:border-b-0 pb-3 last:pb-0">
              <Checkbox
                id={item.key}
                checked={checked}
                onCheckedChange={(c) => setter(c as boolean)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label htmlFor={item.key} className="text-sm font-medium flex items-center gap-1">
                  {item.label}
                  {item.key === 'weapons_on_property' && (
                    <AlertTriangle className="size-4 text-yellow-500" />
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

export function validate(_data: unknown): string[] {
  return [];
}

export function getData(): Partial<SafetyDisclosures> {
  return {};
}
