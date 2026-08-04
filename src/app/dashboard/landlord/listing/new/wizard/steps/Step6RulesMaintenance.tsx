'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Info, ExternalLink } from 'lucide-react';

export interface Step6Props {
  house_rules?: string[];
  unit_description?: string;
  onChange: (data: { house_rules?: string[]; unit_description?: string }) => void;
}

const HOUSE_RULES = [
  { value: 'none', label: 'None', link: '#' },
  { value: 'no_smoking', label: 'No smoking', link: '#' },
  { value: 'no_pets', label: 'No pets', link: '#' },
  { value: 'no_inflammables', label: 'No inflammables', link: '#' },
  { value: 'no_overnight_guests', label: 'No overnight guests', link: '#' },
  { value: 'no_parties_events', label: 'No parties or events', link: '#' },
  { value: 'no_loud_music_after_10pm', label: 'No loud music after 10pm', link: '#' },
  { value: 'not_suitable_children_under_12', label: 'Not suitable for children under 12 years', link: '#' },
  { value: 'not_suitable_children_under_2', label: 'Not suitable for children under 2 years', link: '#' },
  { value: 'replacement_charge_access_key', label: 'Replacement charge if you lose access key', link: '#' },
  { value: 'no_structural_changes', label: 'No structural changes without host permission', link: '#' },
  { value: 'cctv_surveillance', label: 'CCTV surveillance', link: '#' },
  { value: 'private_residential_only', label: 'Private/residential use only', link: '#' },
  { value: 'smoking_balconies_only', label: 'Smoking is allowed on balconies only', link: '#' },
  { value: 'no_illegal_activities', label: 'No illegal activities', link: '#' },
];

export default function Step6RulesMaintenance({ house_rules: houseRules, unit_description: unitDescription, onChange }: Step6Props) {
  const [selected, setSelected] = useState<string[]>(houseRules ?? []);
  const [description, setDescription] = useState(unitDescription ?? '');

  const toggleRule = (value: string) => {
    let next: string[];
    if (value === 'none') {
      next = selected.includes('none') ? [] : ['none'];
    } else {
      next = selected.filter((x) => x !== 'none');
      if (selected.includes(value)) {
        next = next.filter((x) => x !== value);
      } else {
        next = [...next, value];
      }
    }
    setSelected(next);
    onChange({ house_rules: next });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">House rules</h2>
          <Info className="size-4 text-muted-foreground" />
        </div>
        <p className="text-sm text-muted-foreground">Select the rules you want to set for your guests.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {HOUSE_RULES.map((rule) => {
            const checked = selected.includes(rule.value);
            return (
              <label
                key={rule.value}
                className={`flex items-center justify-between gap-2 rounded-md border p-3 cursor-pointer transition ${
                  checked
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleRule(rule.value)}
                  />
                  <span className="text-sm">{rule.label}</span>
                </div>
                <a
                  href={rule.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary flex items-center gap-1"
                >
                  Details <ExternalLink className="size-3" />
                </a>
              </label>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Label htmlFor="description" className="text-sm font-medium">Property description</Label>
          <Info className="size-4 text-muted-foreground" />
        </div>
        <Textarea
          id="description"
          placeholder="Describe your property, its features, and what makes it special..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            onChange({ unit_description: e.target.value });
          }}
          rows={5}
        />
      </div>
    </div>
  );
}

export function validate(data: unknown): string[] {
  const errors: string[] = [];
  const d = data as Step6Props | undefined;
  if (!d) {
    errors.push('Rules and description are required');
    return errors;
  }
  if (!d.unit_description?.trim()) {
    errors.push('Property description is required');
  }
  return errors;
}

export function getData(): { house_rules?: string[]; unit_description?: string } {
  return {};
}
