'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import UnifiedMessagesClient from '@/components/messaging/UnifiedMessagesClient';

type Props = {
  conversationId: string;
};

export default function ChatInitializer({ conversationId }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!searchParams.get('conversationId') || searchParams.get('conversationId') !== conversationId) {
      setSearchParams({ conversationId }, { scroll: false });
    }
  }, [conversationId, searchParams, setSearchParams]);

  return <UnifiedMessagesClient userId="" userName="" userRole="" />;
}
