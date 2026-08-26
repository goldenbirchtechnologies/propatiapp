'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Search, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type ConversationItem = {
  id: string;
  subject: string | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  status: string;
  listingId: string | null;
  unreadCounts: Record<string, number> | null;
};

function getUnreadFor(conv: ConversationItem, userId: string): number {
  if (!conv.unreadCounts || typeof conv.unreadCounts !== 'object') return 0;
  const key = Object.keys(conv.unreadCounts).find((k) => k === userId);
  return key ? (conv.unreadCounts[key] as number) : 0;
}

export default function AgentMessagesClient({
  initialConversations,
  userId,
}: {
  initialConversations: ConversationItem[];
  userId: string;
}) {
  const [filter, setFilter] = useState('');

  const filtered = initialConversations.filter((c) => {
    if (!filter) return true;
    const q = filter.toLowerCase();
    return (
      c.subject?.toLowerCase().includes(q) ||
      c.lastMessage?.toLowerCase().includes(q) ||
      c.id.toLowerCase().includes(q)
    );
  });

  const unreadTotal = initialConversations.reduce((sum, c) => sum + getUnreadFor(c, userId), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Messages</h1>
          <p className="text-base text-zinc-500 mt-1">
            {unreadTotal > 0
              ? `You have ${unreadTotal} unread message${unreadTotal > 1 ? 's' : ''}`
              : 'No unread messages'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search conversations..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="glass-card">
        <div className="p-6 p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-zinc-500 opacity-50" />
              <h3 className="font-headline-sm text-white text-white mb-2">No conversations</h3>
              <p className="text-sm text-zinc-500">
                {filter ? 'No matches for your search.' : 'Messages will appear here when someone contacts you.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#262626]">
              {filtered.map((c) => {
                const unread = getUnreadFor(c, userId);
                return (
                  <Link
                    key={c.id}
                    href={`#conversation-${c.id}`}
                    className={`block px-4 py-4 hover:bg-zinc-950/30 transition-colors ${unread > 0 ? 'bg-[#00ff66]/5' : ''}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${unread > 0 ? 'bg-[#00ff66]/10 text-white' : 'bg-[#171717] text-zinc-500'}`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm truncate ${unread > 0 ? 'font-bold text-white' : 'font-medium text-white'}`}>
                          {c.subject || `Conversation ${c.id}`}
                        </p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {c.lastMessage || 'No messages yet'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {unread > 0 ? (
                          <Badge className="bg-[#00ff66] text-white">{unread}</Badge>
                        ) : null}
                        <span className="flex items-center gap-1 text-xs text-zinc-500">
                          <Clock className="h-3 w-3" />
                          {c.lastMessageAt
                            ? new Date(c.lastMessageAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short' })
                            : ''}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
