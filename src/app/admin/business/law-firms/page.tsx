'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

type LawFirm = {
  id: string;
  name: string;
  verified: boolean;
  cacNumber: string;
  email: string;
  jurisdiction: string[];
};

export default function AdminLawFirms() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', cacNumber: '', email: '', phone: '', address: '', jurisdiction: '' });

  const firms = useQuery({
    queryKey: ['law-firms'],
    queryFn: async () => {
      const res = await fetch('/api/admin/law-firms');
      if (!res.ok) throw new Error('Failed to load law firms');
      return (await res.json()) as { firms: LawFirm[] };
    },
  });

  const createMutation = useMutation({
    mutationFn: async (firm: LawFirm) => {
      const res = await fetch('/api/admin/law-firms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(firm) });
      if (!res.ok) throw new Error('Failed to create firm');
      return (await res.json()) as { firm: LawFirm };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['law-firms'] });
      setForm({ name: '', cacNumber: '', email: '', phone: '', address: '', jurisdiction: '' });
    },
  });

  return (
    <div className="space-y-4">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate({ ...form, jurisdiction: form.jurisdiction.split(',').map((value) => value.trim()).filter(Boolean) });
        }}
        className="space-y-2"
      >
        {(['name', 'cacNumber', 'email', 'phone', 'address'] as const).map((field) => (
          <input
            key={field}
            className="w-full rounded border p-2"
            placeholder={field}
            value={(form as Record<string, string>)[field]}
            onChange={(event) => setForm({ ...form, [field]: event.target.value })}
          />
        ))}
        <label>
          Jurisdiction (comma separated)
          <input className="w-full rounded border p-2" value={form.jurisdiction} onChange={(event) => setForm({ ...form, jurisdiction: event.target.value })} />
        </label>
        <button type="submit" className="rounded bg-gray-900 px-4 py-2 text-white">Add Law Firm</button>
        <span className="text-sm text-gray-600">{createMutation.isPending ? 'Saving...' : ''}</span>
      </form>

      {firms.isLoading ? <p>Loading...</p> : null}
      {firms.isError ? <p className="text-red-600">Failed to load firms.</p> : null}
      {firms.data?.firms.map((firm) => (
        <div key={firm.id} className="rounded border p-3">
          <div className="font-semibold">{firm.name}</div>
          <div className="text-sm text-gray-500">{firm.cacNumber}</div>
          <div className="text-sm text-gray-500">{firm.email}</div>
          <div className="text-sm text-gray-500">{firm.jurisdiction.join(', ') || 'Jurisdiction not set'}</div>
          <div className="text-sm text-green-700">Verified: {firm.verified ? 'Yes' : 'No'}</div>
        </div>
      ))}
    </div>
  );
}
