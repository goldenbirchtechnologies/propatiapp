'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import UnifiedMessagesClient from '@/components/messaging/UnifiedMessagesClient';

type Props = {
  conversationId: string;
};

export default function ChatInitializer({ conversationId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentConversationId = searchParams.get('conversationId');
    if (currentConversationId !== conversationId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('conversationId', conversationId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [conversationId, pathname, router, searchParams]);

  return <UnifiedMessagesClient userId="" userName="" userRole="" />;
}
