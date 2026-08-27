'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Home as ChatHome } from '@/components/ui/chat-template';
import { useUser } from '@clerk/nextjs';

type Props = {
  conversationId: string;
};

export default function ChatInitializer({ conversationId }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();

  useEffect(() => {
    const currentConversationId = searchParams.get('conversationId');
    if (currentConversationId !== conversationId) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('conversationId', conversationId);
      router.replace(`${pathname}?${params.toString()}`);
    }
  }, [conversationId, pathname, router, searchParams]);

  return <ChatHome userId={user?.id || ''} userName={user?.fullName || ''} userRole={user?.publicMetadata?.role as string || ''} />;
}
