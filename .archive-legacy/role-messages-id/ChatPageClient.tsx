'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useConversation, useSendMessage } from '@/hooks/useMessages';
import { MessageBubble } from '@/components/messages/message-bubble';
import { MessageInput } from '@/components/messages/message-input';
import { MessagesEmptyState } from '@/components/messages/messages-empty-state';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, ExternalLink, Building2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ChatPageClientProps {
  conversationId: string;
  userId: string;
  userName: string;
  userRole: 'landlord' | 'tenant' | 'agent' | 'admin';
}

export default function ChatPageClient({
  conversationId,
  userId,
  userName,
  userRole,
}: ChatPageClientProps) {
  const router = useRouter();
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const { data, isLoading, error, refetch } = useConversation(conversationId);
  const sendMessage = useSendMessage(conversationId);

  // The API returns { success: true, data: conversation } where conversation contains messages
  const conversation = data?.data;
  const messages = Array.isArray(conversation?.messages) ? conversation.messages : [];

  // Determine other participant
  const isLandlord = userRole === 'landlord' || conversation?.landlord?.id === userId;
  const otherParticipant = isLandlord ? conversation?.tenant : conversation?.landlord;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isNearBottom && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isNearBottom]);

  // Track scroll position to determine if user is near bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      setIsNearBottom(distanceFromBottom < 100);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Polling: Refetch every 4 seconds when page is visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    const intervalId = setInterval(() => {
      if (!document.hidden) {
        refetch();
      }
    }, 4000);

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetch]);

  const handleSendMessage = async (content: string) => {
    try {
      await sendMessage.mutateAsync({ content });
    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const handleBackClick = () => {
    router.push(`/dashboard/${userRole}/messages`);
  };

  const handleViewListing = () => {
    if (conversation?.listing?.id) {
      router.push(`/listings/${conversation.listing.id}`);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-120px)]">
        <Skeleton className="h-16 w-full mb-4" />
        <div className="flex-1 space-y-4 p-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-3/4" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={handleBackClick}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Messages
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">Failed to load conversation. Please try again.</p>
        </div>
      </div>
    );
  }

  const propertyImage = conversation.listing?.images?.find((img: any) => img.isCover)?.url ||
                       conversation.listing?.images?.[0]?.url;

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-4xl mx-auto bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackClick}
            className="md:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* Property Image */}
          {propertyImage && (
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={propertyImage}
                alt={conversation.listing?.title || 'Property'}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          {!propertyImage && conversation.listing && (
            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-5 w-5 text-gray-500" />
            </div>
          )}

          {/* Participant Info */}
          <div className="flex items-center gap-2">
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={otherParticipant?.avatarUrl || undefined}
                alt={otherParticipant?.fullName || 'User'}
              />
              <AvatarFallback className="text-xs">
                {otherParticipant ? getInitials(otherParticipant.fullName) : 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-sm">
                {otherParticipant?.fullName || 'Unknown User'}
              </h2>
              {conversation.listing && (
                <p className="text-xs text-gray-600 truncate max-w-[200px] md:max-w-none">
                  {conversation.listing.title}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* View Listing Button */}
        {conversation.listing && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewListing}
            className="hidden md:flex"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Listing
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-white"
      >
        {messages.length === 0 && (
          <MessagesEmptyState variant="conversation" />
        )}

        {messages.map((message: any) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwn={message.senderId === userId || message.sender?.id === userId}
            showAvatar={true}
          />
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />

        {/* Sending indicator */}
        {sendMessage.isPending && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Sending...</span>
          </div>
        )}
      </div>

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        disabled={sendMessage.isPending}
        placeholder={`Message ${otherParticipant?.fullName || 'user'}...`}
      />
    </div>
  );
}
