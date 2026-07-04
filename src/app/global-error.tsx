'use client';
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen flex items-center justify-center bg-[#faf8f4] px-4">
          <div className="max-w-md text-center">
            <h1 className="text-4xl font-heading font-extrabold text-[#1a1a1a] mb-4">System error</h1>
            <p className="text-[#555] mb-6">{error.message || 'Something went wrong.'}</p>
            <button onClick={reset} className="px-6 py-3 bg-primary text-white font-semibold rounded-full hover:brightness-110 transition-all">Reload</button>
          </div>
        </div>
      </body>
    </html>
  );
}
