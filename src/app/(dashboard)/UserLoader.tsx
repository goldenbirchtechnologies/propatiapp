'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function UserLoader() {
  const { isLoaded, isSignedIn } = useUser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setReady(true);
    }
  }, [isLoaded, isSignedIn]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-4 text-center">
          <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-64 mx-auto"></div>
        </div>
      </div>
    );
  }

  return null;
}
