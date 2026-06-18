'use client';

import React from 'react';
import { MessageSquare, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface MessagesEmptyStateProps {
  variant?: 'inbox' | 'conversation';
  userRole?: 'landlord' | 'tenant' | 'agent' | 'admin';
}

export function MessagesEmptyState({ variant = 'inbox', userRole = 'tenant' }: MessagesEmptyStateProps) {
  const router = useRouter();

  if (variant === 'conversation') {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 px-4 text-center">
        <div className="bg-gray-100 rounded-full p-6 mb-4">
          <MessageSquare className="h-12 w-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
        <p className="text-sm text-gray-600 max-w-sm mb-6">
          Send your first message to start the conversation
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] py-12 px-4 text-center">
      <div className="bg-gray-100 rounded-full p-6 mb-4">
        <Inbox className="h-12 w-12 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
      <p className="text-sm text-gray-600 max-w-sm mb-6">
        {userRole === 'landlord'
          ? 'When tenants contact you about your properties, their messages will appear here.'
          : 'Start a conversation about a property you are interested in.'}
      </p>
      {userRole !== 'landlord' && (
        <Button
          onClick={() => router.push('/listings')}
          variant="default"
        >
          Browse Listings
        </Button>
      )}
    </div>
  );
}
