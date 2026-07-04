'use client';

import * as React from 'react';
import { MessageInput } from '@/components/messages/message-input';
import { ConversationCard } from '@/components/messages/conversation-card';
import { cn } from '@/lib/utils';
import { SpatialSection } from '@/components/sections/SpatialSection';
import { Search } from 'lucide-react';

export interface Conversation {
  id: string;
  lastMessage?: string | null;
  lastMessageAt?: string | Date | null;
  landlord?: { id: string; fullName: string; avatarUrl?: string | null };
  tenant?: { id: string; fullName: string; avatarUrl?: string | null };
  listing?: { id: string; title: string; images?: Array<{ url: string; isCover?: boolean }> };
  unreadLandlord?: number;
  unreadTenant?: number;
}

export interface Message {
  id: string;
  content: string;
  createdAt: string | Date;
  senderId: string;
  sender?: { id: string; fullName: string; avatarUrl?: string | null };
  isOwn?: boolean;
}

export interface MessagingThreadProps {
  conversations: Conversation[];
  currentUserId: string;
  userRole: 'landlord' | 'tenant' | 'agent' | 'admin';
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  messages: Message[];
  onSendMessage: (content: string) => void | Promise<void>;
  className?: string;
}

export function MessagingThread({
  conversations,
  currentUserId,
  userRole,
  activeConversationId,
  onSelectConversation,
  messages,
  onSendMessage,
  className,
}: MessagingThreadProps) {
  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  return (
    <SpatialSection elevation={1} spacing="md" className={cn('flex', className)}>
      {/* Conversation List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-default bg-raised flex flex-col">
        <div className="p-4 border-b border-default">
          <h2 className="text-lg font-semibold text-primary">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">No conversations</div>
          ) : (
            <div className="divide-y divide-default">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={cn(
                    'transition-colors',
                    activeConversationId === conversation.id
                      ? 'bg-primary/5 border-l-4 border-l-primary'
                      : 'border-l-4 border-l-transparent hover:bg-muted/30'
                  )}
                >
                  <ConversationCard
                    conversation={conversation}
                    currentUserId={currentUserId}
                    userRole={userRole}
                    onClick={() => onSelectConversation(conversation.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thread View */}
      <div className="hidden md:flex flex-1 flex-col bg-card">
        {activeConversation ? (
          <>
            <div className="p-4 border-b border-default">
              <h3 className="font-semibold text-foreground">Conversation</h3>
              {activeConversation.listing && (
                <p className="text-sm text-muted-foreground truncate">{activeConversation.listing.title}</p>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const initials = message.sender
                  ? message.sender.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()
                  : '??';

                return (
                  <div
                    key={message.id}
                    className={cn('flex gap-2', message.isOwn ? 'justify-end' : 'justify-start')}
                  >
                    {!message.isOwn && (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-foreground flex-shrink-0">
                        {initials}
                      </div>
                    )}
                    <div
                      className={cn(
                        'max-w-[70%] rounded-2xl px-4 py-2 shadow-1',
                        message.isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted text-foreground rounded-bl-sm'
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-default bg-card p-4">
              <MessageInput onSend={onSendMessage} placeholder="Type a message..." />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </SpatialSection>
  );
}
