'use client';

import { useState } from 'react';
import { BriefcaseBusiness, Building2, ClipboardCheck } from 'lucide-react';
import { DCallout, DField, DGrid, DInput, DToggleChip } from '@/components/onboarding/dossier/primitives';
import { StepActions } from './_shared';
import type { StepProps } from './types';

const CONFIG = {
  landlordPortfolio: {
    endpoint: '/api/onboarding/landlord/portfolio', icon: Building2, title: 'Portfolio readiness',
    intro: 'This prepares your owner workspace. It does not publish a property or mark ownership as verified.',
    groups: [
      { key: 'portfolioCategories', label: 'Property categories', options: ['Residential', 'Commercial', 'Land', 'Short-let', 'Office', 'Shop', 'Warehouse'] },
      { key: 'services', label: 'Services you need', options: ['Listing and marketing', 'Tenant sourcing', 'Rent collection', 'Property management', 'Maintenance coordination'] },
    ],
  },
  agentServices: {
    endpoint: '/api/onboarding/agent/services', icon: BriefcaseBusiness, title: 'Services offered',
    intro: 'Choose what clients can request from your profile. Credentials and approvals remain separate verification states.',
    groups: [{ key: 'services', label: 'Services', options: ['Property sourcing', 'Property marketing', 'Tenant sourcing', 'Property inspection', 'Rental negotiations', 'Sales facilitation', 'Property management', 'Client representation'] }],
  },
  estateCapabilities: {
    endpoint: '/api/onboarding/estate/capabilities', icon: ClipboardCheck, title: 'Management capabilities',
    intro: 'Describe your operating scope. Property access still requires an owner invitation or other authorization workflow.',
    groups: [{ key: 'capabilities', label: 'Capabilities', options: ['Tenant management', 'Rent tracking', 'Property maintenance', 'Inspection', 'Lease administration', 'Property operations', 'Owner reporting', 'Vendor coordination', 'Vacancy management'] }],
  },
} as const;

type ReadinessStep = keyof typeof CONFIG;

export default function RoleReadinessStep({ stepId, onSaved }: StepProps) {
  const config = CONFIG[stepId as ReadinessStep];
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [ownsProperties, setOwnsProperties] = useState<string>('');
  const [propertyCount, setPropertyCount] = useState('');
  const [managementType, setManagementType] = useState('');
  const [managesOnBehalf, setManagesOnBehalf] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: string, option: string) {
    setSelected((current) => {
      const values = current[key] ?? [];
      return { ...current, [key]: values.includes(option) ? values.filter((v) => v !== option) : [...values, option] };
    });
    setSaved(false);
  }

  async function save() {
    setSaving(true); setError(null);
    try {
      const response = await fetch(config.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...selected,
          ownsProperties: ownsProperties === '' ? undefined : ownsProperties === 'yes',
          propertyCount: propertyCount === '' ? undefined : Number(propertyCount),
          managementType: managementType || undefined,
          managesOnBehalf: managesOnBehalf === '' ? undefined : managesOnBehalf === 'yes',
        }),
      });
      const json = await response.json().catch(() => null);
      if (!response.ok) throw new Error(json?.error ?? 'Could not save this section.');
      setSaved(true); await onSaved();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not save this section.'); }
    finally { setSaving(false); }
  }

  const Icon = config.icon;
  return (
    <form onSubmit={(event) => { event.preventDefault(); void save(); }}>
      <DCallout icon={<Icon className="h-4 w-4" />} title={config.title} className="mb-5">{config.intro}</DCallout>
      {stepId === 'landlordPortfolio' ? <DGrid cols={2} className="mb-5"><DField label="Do you currently own property?" required><div className="flex flex-wrap gap-2"><DToggleChip active={ownsProperties === 'yes'} onClick={() => setOwnsProperties('yes')}>Yes</DToggleChip><DToggleChip active={ownsProperties === 'no'} onClick={() => setOwnsProperties('no')}>Not yet</DToggleChip></div></DField><DField label="Number of properties" note="Optional"><DInput type="number" min="0" value={propertyCount} onChange={(e) => setPropertyCount(e.target.value)} placeholder="3" /></DField></DGrid> : null}
      {stepId === 'estateCapabilities' ? <DGrid cols={2} className="mb-5"><DField label="Management structure" required><DInput value={managementType} onChange={(e) => setManagementType(e.target.value)} placeholder="Independent manager or company" /></DField><DField label="Do you manage for property owners?" required><div className="flex flex-wrap gap-2"><DToggleChip active={managesOnBehalf === 'yes'} onClick={() => setManagesOnBehalf('yes')}>Yes</DToggleChip><DToggleChip active={managesOnBehalf === 'no'} onClick={() => setManagesOnBehalf('no')}>No</DToggleChip></div></DField></DGrid> : null}
      <div className="space-y-5">{config.groups.map((group) => <DField key={group.key} label={group.label} required><div className="flex flex-wrap gap-2">{group.options.map((option) => <DToggleChip key={option} active={(selected[group.key] ?? []).includes(option)} onClick={() => toggle(group.key, option)}>{option}</DToggleChip>)}</div></DField>)}</div>
      <StepActions saving={saving} error={error} saved={saved} label={`Save ${config.title.toLowerCase()}`} />
    </form>
  );
}
