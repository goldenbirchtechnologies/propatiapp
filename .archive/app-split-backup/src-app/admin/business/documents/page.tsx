'use client';

import { useQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';

type Document = {
  id: string;
  type: string;
  version: number;
  name: string;
  url: string;
  uploadedById: string;
  createdAt: string;
};

export default function AdminDocuments() {
  const documents = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await fetch('/api/admin/documents');
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
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold">{doc.name}</div>
            <Badge variant="outline" className="text-xs">v{doc.version}</Badge>
          </div>
          <div className="text-sm text-gray-500">{doc.type}</div>
          <a href={doc.url} className="text-sm text-blue-600" target="_blank" rel="noreferrer">
            View Document
          </a>
        </div>
      ))}
    </div>
  );
}
