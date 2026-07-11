'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useConversations } from '@/hooks/useMessages';
import { ConversationCard } from '@/components/messages/conversation-card';
import { MessagesEmptyState } from '@/components/messages/messages-empty-state';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface MessagesPageClientProps {
  userId: string;
  userName: string;
  userRole: 'landlord' | 'tenant' | 'agent' | 'admin';
}

export default function MessagesPageClient({
  userId,
  userName,
  userRole,
}: MessagesPageClientProps) {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useConversations({ page: 1, limit: 50 });

  // Polling: Refetch every 4 seconds when page is visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    // Set up polling interval
    const intervalId = setInterval(() => {
      if (!document.hidden) {
        refetch();
      }
    }, 4000);

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  const conversations = data?.data || [];

  const handleConversationClick = (conversationId: string) => {
    router.push(`/dashboard/${userRole}/messages/${conversationId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-6 w-6 text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>
        <p className="text-gray-600">
          {userRole === 'landlord'
            ? 'Communicate with potential tenants about your properties'
            : 'View your conversations with landlords'}
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load conversations. Please try again.</p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && conversations.length === 0 && (
        <MessagesEmptyState variant="inbox" userRole={userRole} />
      )}

      {/* Conversations List */}
      {!isLoading && !error && conversations.length > 0 && (
        <div className="space-y-3">
          {conversations.map((conversation: any) => (
            <ConversationCard
              key={conversation.id}
              conversation={conversation}
              currentUserId={userId}
              userRole={userRole}
              onClick={() => handleConversationClick(conversation.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
