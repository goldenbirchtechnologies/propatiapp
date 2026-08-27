'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const BubbleGroupContext = React.createContext<{ isMe?: boolean } | null>(null);

function MessageGroup({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-2', className)} {...props} />;
}

function Message({
  align = 'start',
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' }) {
  return (
    <BubbleGroupContext.Provider value={{ isMe: align === 'end' }}>
      <div
        className={cn(
          'flex gap-2 group',
          align === 'end' ? 'flex-row-reverse' : 'flex-row',
          className
        )}
        {...props}
      />
    </BubbleGroupContext.Provider>
  );
}

function MessageAvatar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex-shrink-0', className)} {...props} />;
}

function MessageContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex max-w-[80%] flex-col gap-1', className)} {...props} />;
}

function MessageHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const ctx = React.useContext(BubbleGroupContext);
  return (
    <div
      className={cn(
        'text-xs text-neutral-400',
        ctx?.isMe ? 'text-right' : 'text-left',
        className
      )}
      {...props}
    />
  );
}

function MessageFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center gap-2', className)} {...props} />;
}

function Bubble({
  variant,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'muted' }) {
  const ctx = React.useContext(BubbleGroupContext);
  return (
    <div
      className={cn(
        'rounded-2xl px-4 py-2 text-sm shadow-sm',
        variant === 'muted'
          ? 'bg-neutral-700 text-neutral-200 rounded-bl-sm'
          : ctx?.isMe
            ? 'bg-emerald-500 text-white rounded-br-sm'
            : 'bg-neutral-800 text-white rounded-bl-sm',
        className
      )}
      {...props}
    />
  );
}

function BubbleContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('whitespace-pre-wrap break-words', className)} {...props} />;
}

const BubbleGroup = MessageGroup;

export {
  Bubble,
  BubbleContent,
  BubbleGroup,
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
};
