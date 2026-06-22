'use client';

import { useQuery } from '@tanstack/react-query';

type LawFirm = { id: string; name: string };
type Dispute = { id: string; type: string; status: string };
type LawFirmCase = {
  id: string;
  status: string;
  assignedAt: string;
  resolvedAt: string | null;
  firm: LawFirm;
  dispute: Dispute;
};

export default function AdminLawFirmCases() {
  const cases = useQuery({
    queryKey: ['law-firm-cases'],
    queryFn: async () => {
      const res = await fetch('/api/admin/law-firm-cases');
      if (!res.ok) throw new Error('Failed to load law firm cases');
      return (await res.json()) as { cases: LawFirmCase[] };
    },
  });

  return (
    <div className="space-y-4">
      {cases.isLoading ? <p>Loading...</p> : null}
      {cases.isError ? <p className="text-red-600">Failed to load cases.</p> : null}
      {cases.data?.cases.map((lawCase) => (
        <div key={lawCase.id} className="rounded border p-3">
          <div className="font-semibold">{lawCase.firm.name}</div>
          <div className="text-sm text-gray-500">Dispute: {lawCase.dispute.id}</div>
          <div className="text-sm text-gray-500">Status: {lawCase.status}</div>
          <div className="text-sm text-gray-500">Assigned: {new Date(lawCase.assignedAt).toLocaleString()}</div>
          {lawCase.resolvedAt ? (
            <div className="text-sm text-green-700">Resolved: {new Date(lawCase.resolvedAt).toLocaleString()}</div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
