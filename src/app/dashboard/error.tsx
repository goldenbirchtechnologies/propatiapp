'use client';

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Dashboard route error:', error);
  }, [error]);

  return (
    <div className="dashboard-error-boundary">
      <h2>Something went wrong</h2>
      <p className="text-red-400">Digest: {error.digest}</p>
      <pre className="text-xs text-red-300">{error.message}</pre>
      {error.stack && (
        <pre className="text-xs text-red-200 whitespace-pre-wrap">{error.stack}</pre>
      )}
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
