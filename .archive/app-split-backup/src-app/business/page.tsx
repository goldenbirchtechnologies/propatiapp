'use client';

import { useQuery } from '@tanstack/react-query';

type BusinessProfile = {
  id: string;
  userId: string;
  cacNumber: string;
  rcNumber: string | null;
  companyName: string | null;
  verified: boolean;
  createdAt: string;
};

export default function BusinessProfiles() {
  const profiles = useQuery({
    queryKey: ['business-profiles'],
    queryFn: async () => {
      const res = await fetch('/api/business-profiles');
      if (!res.ok) throw new Error('Failed to load business profiles');
      return (await res.json()) as { profiles: BusinessProfile[] };
    },
  });

  return (
    <div className="space-y-4">
      {profiles.isLoading ? <p>Loading...</p> : null}
      {profiles.isError ? <p className="text-red-600">Failed to load profiles.</p> : null}
      {profiles.data?.profiles.map((profile) => (
        <div key={profile.id} className="rounded border p-3">
          <div className="font-semibold">{profile.companyName || 'Business Profile'}</div>
          <div className="text-sm text-gray-500">CAC: {profile.cacNumber}</div>
          <div className="text-sm text-gray-500">RC: {profile.rcNumber || '—'}</div>
          <div className="text-sm text-gray-500">User ID: {profile.userId}</div>
          <div className="text-sm text-green-700">Verified: {profile.verified ? 'Yes' : 'No'}</div>
        </div>
      ))}
    </div>
  );
}
