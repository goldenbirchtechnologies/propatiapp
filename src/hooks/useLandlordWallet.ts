import { useState, useEffect } from 'react';

/**
 * Hook that fetches the landlord's wallet balance from the backend.
 * Expected endpoint: GET `/api/landlord/wallet` returning `{ balance: number }`.
 */
export function useLandlordWallet() {
  const [balance, setBalance] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch('/api/landlord/wallet')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setBalance(data.balance);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Wallet fetch error:', err);
        // Fallback mock balance for development
        setBalance(1250000);
        setError(err as Error);
        setIsLoading(false);
      });
  }, []);

  return { balance, isLoading, error };
}
