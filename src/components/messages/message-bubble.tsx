'use client';

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatMessageTimestamp } from '@/lib/message-utils';
import { Check, CheckCheck, Clock } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    createdAt: string | Date;
    senderId: string;
    attachmentUrl?: string | null;
    attachmentType?: string | null;
    readAt?: string | null;
    sender?: {
      id: string;
      fullName: string;
      avatarUrl?: string | null;
    };
  };
  isOwn: boolean;
  showAvatar?: boolean;
}

export function MessageBubble({ message, isOwn, showAvatar = true }: MessageBubbleProps) {
  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isPending = message.id.startsWith('temp-');
  const isRead = !!message.readAt;

  return (
    <div
      className={cn(
        'flex gap-2 group',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      {showAvatar && message.sender && (
        <Avatar className="h-8 w-8 flex-shrink-0">
          <AvatarImage src={message.sender.avatarUrl || undefined} alt={message.sender.fullName} />
          <AvatarFallback className="text-xs">
            {getInitials(message.sender.fullName)}
          </AvatarFallback>
        </Avatar>
      )}
      {showAvatar && !message.sender && (
        <div className="h-8 w-8 flex-shrink-0" />
      )}

      {/* Message Content */}
      <div
        className={cn(
          'flex flex-col max-w-[70%] md:max-w-[60%]',
          isOwn ? 'items-end' : 'items-start'
        )}
      >
        <div
          className={cn(
            'rounded-2xl px-4 py-2 shadow-sm',
            isOwn
              ? 'bg-blue-600 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md'
          )}
        >
          {/* Message Text */}
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>

          {/* Attachment */}
          {message.attachmentUrl && (
            <div className="mt-2">
              {message.attachmentType?.startsWith('image/') ? (
                <img
                  src={message.attachmentUrl}
                  alt="Attachment"
                  className="max-w-full rounded-lg"
                />
              ) : (
                <a
                  href={message.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'text-xs underline flex items-center gap-1',
                    isOwn ? 'text-blue-100' : 'text-blue-600'
                  )}
                >
                  View Attachment
                </a>
              )}
            </div>
          )}
        </div>

        {/* Timestamp and Status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity',
            isOwn && 'flex-row-reverse'
          )}
        >
          <span className="text-xs text-gray-500">
            {formatMessageTimestamp(message.createdAt)}
          </span>

          {/* Status Indicators (only for own messages) */}
          {isOwn && (
            <span className="text-gray-500">
              {isPending ? (
                <Clock className="h-3 w-3" />
              ) : isRead ? (
                <CheckCheck className="h-3 w-3 text-blue-600" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
