'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface GlobalSearchProps {
  userRole?: string;
}

export default function GlobalSearch({ userRole }: GlobalSearchProps) {
  const [value, setValue] = useState('');
  const router = useRouter();

  const handleSubmit = (formData: FormData) => {
    const query = (formData.get('q') as string | null)?.trim();
    if (!query) return;
    if (userRole === 'tenant') {
      router.push(`/dashboard/tenant/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <form action={handleSubmit} className="hidden sm:flex items-center flex-1 max-w-lg">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: 'var(--muted)' }} />
        <Input
          name="q"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Search properties, invoices..."
          className="pl-9 h-9 w-full max-w-lg text-sm"
          style={{ background: 'var(--surface-elevated)', borderColor: 'var(--border)', color: 'var(--text)' }}
        />
      </div>
    </form>
  );
}
