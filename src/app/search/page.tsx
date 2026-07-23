import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { userId } = await auth();
  if (userId) {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const query = params?.q?.trim() || '';

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 px-4 text-center">
      <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text)' }}>
        Global Search
      </h1>
      <p className="text-sm max-w-md" style={{ color: 'var(--muted)' }}>
        {query
          ? `No results yet for "${query}". Global search is being connected to listings, agents, and properties.`
          : 'Enter a query from the header search bar to explore listings, properties, and agents.'}
      </p>
    </div>
  );
}
