'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateConversation } from '@/hooks/useMessages';
import { Button } from '@/components/ui/button';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactLandlordButtonProps {
  listingId: string;
  listingTitle: string;
  participantId: string;
  userRole: string;
  existingConversationId?: string | null;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function ContactLandlordButton({
  listingId,
  listingTitle,
  participantId,
  userRole,
  existingConversationId,
  variant = 'default',
  size = 'default',
  className,
}: ContactLandlordButtonProps) {
  const router = useRouter();
  const { toast } = useToast();
  const createConversation = useCreateConversation();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    // If conversation exists, navigate to it
    if (existingConversationId) {
      router.push(`/dashboard/${userRole}/messages?conversationId=${existingConversationId}`);
      return;
    }

    // Create new conversation
    setIsLoading(true);
    try {
      const response = await createConversation.mutateAsync({
        listingId,
        participantId,
        subject: `Inquiry about ${listingTitle}`,
      });

      const conversationId = response.data?.id || response.id;

      if (conversationId) {
        router.push(`/dashboard/${userRole}/messages?conversationId=${conversationId}`);
      } else {
        throw new Error('Failed to create conversation');
      }
    } catch (error) {
      console.error('Failed to create conversation:', error);
      toast({
        title: 'Failed to start conversation',
        description: 'Please try again or contact support',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const buttonText = existingConversationId ? 'Continue Conversation' : 'Contact Landlord';

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <MessageSquare className="h-4 w-4 mr-2" />
      )}
      {buttonText}
    </Button>
  );
}
