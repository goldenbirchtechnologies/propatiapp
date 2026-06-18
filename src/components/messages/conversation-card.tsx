'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { formatMessageTime, truncateMessage } from '@/lib/message-utils';

interface ConversationCardProps {
  conversation: {
    id: string;
    lastMessage?: string | null;
    lastMessageAt?: string | Date | null;
    landlord?: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
    };
    tenant?: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
    };
    listing?: {
      id: string;
      title: string;
      images?: Array<{ url: string; isCover?: boolean }>;
    };
    unreadLandlord?: number;
    unreadTenant?: number;
  };
  currentUserId: string;
  userRole: 'landlord' | 'tenant' | 'agent' | 'admin';
  onClick: () => void;
}

export function ConversationCard({
  conversation,
  currentUserId,
  userRole,
  onClick,
}: ConversationCardProps) {
  // Determine the other participant
  const isLandlord = userRole === 'landlord' || conversation.landlord?.id === currentUserId;
  const otherParticipant = isLandlord ? conversation.tenant : conversation.landlord;

  // Determine unread count for current user
  const unreadCount = isLandlord ? conversation.unreadLandlord : conversation.unreadTenant;
  const hasUnread = unreadCount && unreadCount > 0;

  // Get property image
  const propertyImage = conversation.listing?.images?.find(img => img.isCover)?.url ||
                       conversation.listing?.images?.[0]?.url;

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Card
      className={cn(
        'p-4 cursor-pointer transition-all hover:shadow-md hover:border-blue-300',
        hasUnread && 'bg-blue-50/50 border-blue-200'
      )}
      onClick={onClick}
    >
      <div className="flex gap-3">
        {/* Property Image */}
        {propertyImage && (
          <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <img
              src={propertyImage}
              alt={conversation.listing?.title || 'Property'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            {/* Participant Info */}
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage
                  src={otherParticipant?.avatarUrl || undefined}
                  alt={otherParticipant?.fullName || 'User'}
                />
                <AvatarFallback className="text-xs">
                  {otherParticipant ? getInitials(otherParticipant.fullName) : 'U'}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <h3
                  className={cn(
                    'text-sm font-medium truncate',
                    hasUnread && 'font-semibold'
                  )}
                >
                  {otherParticipant?.fullName || 'Unknown User'}
                </h3>
              </div>
            </div>

            {/* Timestamp */}
            {conversation.lastMessageAt && (
              <span
                className={cn(
                  'text-xs flex-shrink-0',
                  hasUnread ? 'text-blue-600 font-medium' : 'text-gray-500'
                )}
              >
                {formatMessageTime(conversation.lastMessageAt)}
              </span>
            )}
          </div>

          {/* Property Title */}
          {conversation.listing && (
            <p className="text-xs text-gray-600 truncate mb-1">
              {conversation.listing.title}
            </p>
          )}

          {/* Last Message Preview */}
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                'text-sm truncate flex-1',
                hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'
              )}
            >
              {conversation.lastMessage
                ? truncateMessage(conversation.lastMessage, 60)
                : 'No messages yet'}
            </p>

            {/* Unread Badge */}
            {hasUnread && (
              <Badge
                variant="default"
                className="bg-blue-600 text-white rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
