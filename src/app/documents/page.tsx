'use client';

import { useQuery } from '@tanstack/react-query';

type Document = {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
};

export default function DocumentsPage() {
  const documents = useQuery({
    queryKey: ['documents-user'],
    queryFn: async () => {
      const res = await fetch('/api/documents');
      if (!res.ok) throw new Error('Failed to load documents');
      return (await res.json()) as { documents: Document[] };
    },
  });

  return (
    <div className="space-y-4">
      {documents.isLoading ? <p>Loading...</p> : null}
      {documents.isError ? <p className="text-red-600">Failed to load documents.</p> : null}
      {documents.data?.documents.map((doc) => (
        <div key={doc.id} className="rounded border p-3">
          <div className="font-semibold">{doc.name}</div>
          <div className="text-sm text-gray-500">{doc.type}</div>
          <a href={doc.url} className="text-sm text-blue-600" target="_blank" rel="noreferrer">
            View Document
          </a>
        </div>
      ))}
    </div>
  );
}
