'use client';
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h2 className="text-3xl font-heading font-extrabold text-foreground mb-4">Something went wrong</h2>
        <p className="text-muted-foreground mb-6">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:brightness-110 transition-all">Try again</button>
      </div>
    </div>
  );
}
