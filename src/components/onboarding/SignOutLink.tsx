'use client';

import { useClerk } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

export function SignOutLink() {
  const { signOut } = useClerk();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/sign-in');
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-xs text-zinc-500 underline underline-offset-4 hover:text-white hover:underline-offset-0"
    >
      Sign out
    </button>
  );
}
