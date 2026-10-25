'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Info, ShieldCheck } from 'lucide-react';

export interface Step6Props {
  house_rules?: string[];
  unit_description?: string;
  onChange: (data: { house_rules?: string[]; unit_description?: string }) => void;
}

const HOUSE_RULES = [
  { value: 'none', label: 'None' },
  { value: 'no_smoking', label: 'No smoking' },
  { value: 'no_pets', label: 'No pets' },
  { value: 'no_inflammables', label: 'No inflammables' },
  { value: 'no_overnight_guests', label: 'No overnight guests' },
  { value: 'no_parties_events', label: 'No parties or events' },
  { value: 'no_loud_music_after_10pm', label: 'No loud music after 10pm' },
  { value: 'not_suitable_children_under_12', label: 'Not suitable for children under 12 years' },
  { value: 'not_suitable_children_under_2', label: 'Not suitable for children under 2 years' },
  { value: 'replacement_charge_access_key', label: 'Replacement charge if you lose access key' },
  { value: 'no_structural_changes', label: 'No structural changes without host permission' },
  { value: 'cctv_surveillance', label: 'CCTV surveillance' },
  { value: 'private_residential_only', label: 'Private/residential use only' },
  { value: 'smoking_balconies_only', label: 'Smoking is allowed on balconies only' },
  { value: 'no_illegal_activities', label: 'No illegal activities' },
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <span className="text-xs font-bold tracking-wider uppercase text-emerald-600 dark:text-emerald-400">Step 06 / Rules & Maintenance</span>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">Rules & Maintenance</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Select the rules you want to set for your guests and describe the property.</p>
      </div>
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">House rules</h3>
          <Info className="size-4 text-zinc-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {HOUSE_RULES.map((rule) => {
            const checked = selected.includes(rule.value);
            return (
              <label
                key={rule.value}
                className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition ${
                  checked
                    ? 'border-emerald-600 dark:border-emerald-500 bg-emerald-600/5'
                    : 'border-zinc-200 dark:border-white/[0.08] bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-white/20'
                }`}
              >
                <Checkbox checked={checked} onCheckedChange={() => toggleRule(rule.value)} />
                <span className="text-sm text-zinc-900 dark:text-white">{rule.label}</span>
              </label>
            );
          })}
        </div>
      </div>
      <div className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/[0.08] rounded-xl space-y-3">
        <Label htmlFor="description" className="text-sm font-medium text-zinc-900 dark:text-white">Property description / unit description</Label>
        <Textarea
          id="description"
          placeholder="Describe your property, its features, and what makes it special..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            onChange({ unit_description: e.target.value });
          }}
          rows={5}
          className="bg-zinc-50 dark:bg-white/[0.04] border-zinc-200 dark:border-white/[0.08]"
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