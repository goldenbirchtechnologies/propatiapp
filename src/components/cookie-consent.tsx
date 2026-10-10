'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has already accepted cookies
    const consent = localStorage.getItem('cookieconsent');
    if (!consent) {
      setIsVisible(true);
    }
    setIsLoading(false);
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieconsent', 'accepted');
    setIsVisible(false);
  };

  const decline = () => {
    localStorage.setItem('cookieconsent', 'declined');
    setIsVisible(false);
  };

  if (isLoading || !isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-zinc-900 border-t border-zinc-800 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm text-zinc-300">
              We use cookies to improve your experience on PROPATI and for marketing. 
              By clicking "Accept all", you agree to our{' '}
              <Link href="/terms-of-agreement" className="text-emerald-400 hover:underline">
                Terms &amp; Conditions
              </Link>
              {' '}and{' '}
              <Link href="/cookies" className="text-emerald-400 hover:underline">
                Cookies Policy
              </Link>
              .
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={decline}
              className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors border border-zinc-800 rounded-lg hover:bg-zinc-800"
            >
              Decline
            </button>
            <button
              onClick={acceptAll}
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors"
            >
              Accept all
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 text-zinc-500 hover:text-zinc-400 transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
