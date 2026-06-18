'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSend: (content: string) => void | Promise<void>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
}

export function MessageInput({
  onSend,
  disabled = false,
  placeholder = 'Type a message...',
  maxLength = 5000,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      // Limit to 5 lines (approx 120px max)
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [content]);

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = async () => {
    const trimmedContent = content.trim();
    if (!trimmedContent || isSending || disabled) return;

    setIsSending(true);
    try {
      await onSend(trimmedContent);
      setContent('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to send, Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isOverLimit = content.length > maxLength;
  const canSend = content.trim().length > 0 && !isOverLimit && !isSending && !disabled;

  return (
    <div className="border-t bg-white p-4">
      <div className="flex items-end gap-2">
        {/* Textarea */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSending}
            className={cn(
              'min-h-[44px] max-h-[120px] resize-none pr-16',
              isOverLimit && 'border-red-500 focus-visible:ring-red-500'
            )}
            rows={1}
          />

          {/* Character Counter */}
          {content.length > maxLength * 0.8 && (
            <span
              className={cn(
                'absolute bottom-2 right-2 text-xs',
                isOverLimit ? 'text-red-500' : 'text-gray-400'
              )}
            >
              {content.length}/{maxLength}
            </span>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={!canSend}
          size="icon"
          className="h-11 w-11 flex-shrink-0"
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500 mt-2">
        Press Enter to send, Shift+Enter for new line
      </p>
    </div>
  );
}
